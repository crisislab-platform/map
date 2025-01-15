import { useNavigate, useSearchParams } from "react-router-dom";
import { useContext, useEffect, useMemo, useState } from "react";
import {
	Box,
	IconButton,
	LinearProgress,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Stack,
	Tooltip,
	Typography,
} from "@mui/material";
import MapContext from "../contexts/MapContext";
import RPiIcon from "../assets/RPiIcon";
import SensorsContext, { Sensor } from "../contexts/SensorsContext";
import { getBounds, getCenter, getDistance, isPointWithinRadius } from "geolib";
import { flyTo, titleCase } from "../utils";
import PinDropIcon from "@mui/icons-material/PinDrop";
import { DrawerOpenContext } from "../contexts/DrawerOpenContext";
import { LngLatBounds } from "mapbox-gl";

// The max distance for sensors to show up in the search results, in meters
const MAX_METERS_AWAY_FROM_POS = 50 * 1000;

type Coordinate = { lat: number; lng: number; weight?: number; featureName: string };

const geocodingCache = new Map<string, any>();

async function handleQuery(_query: string, signal?: AbortSignal): Promise<null | Coordinate[]> {
	const query = _query.trim().toLowerCase();

	if (!query) return null;

	try {
		// Try parse longitude & latitude
		// Longitude and latitude are usually separated by a comma and a space,
		// but sometimes it's one or the other
		let segments = query.split(", ");
		if (segments.length != 2) segments = query.split(" ");
		if (segments.length != 2) segments = query.split(",");

		if (segments.length == 2) {
			const longitude = Number(segments[0]);
			const latitude = Number(segments[1]);

			if (!Number.isNaN(longitude) && !Number.isNaN(latitude))
				return [{ lng: longitude, lat: latitude, featureName: "coordinates" }];
		}

		// If all else fails, try doing a geocoding lookup

		// Little cache to avoid hitting the API too much for re-searching the same thing
		let json: any;
		if (geocodingCache.has(query)) {
			console.info("[SEARCH] Geocoding request hit cache!");
			json = geocodingCache.get(query);
		} else {
			console.info("[SEARCH] Geocoding request missed cache");
			const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
				query,
			)}.json?country=nz&proximity=174.8,-41.325&types=region,postcode,place,neighborhood,address,poi&limit=3&language=en&access_token=${
				import.meta.env.VITE_MAPBOX_TOKEN
			}`;
			const response = await fetch(url);
			json = await response.json();
			geocodingCache.set(query, json);
		}
		console.info("[SEARCH] Geocoding response: ", json);

		// Nasty data validation
		if (Array.isArray(json?.features) && json.features.length > 0) {
			const filteredCoords: Coordinate[] = json.features
				.filter((feature) => Array.isArray(feature?.center) && feature.center.length == 2)
				.map((feature) => ({
					longitude: feature.center[0],
					latitude: feature.center[1],
					weight: feature.relevance ?? 1,
					featureName: feature.text,
				}));

			if (filteredCoords.length > 0) return filteredCoords;
		}
	} catch (err) {
		console.warn("[SEARCH] Error parsing query: ", err);
		return null;
	}

	return null;
}

export default function SearchResults() {
	const { setDrawerOpen } = useContext(DrawerOpenContext);
	const { sensors } = useContext(SensorsContext);
	const [searchParams] = useSearchParams();
	const query = searchParams.get("query")?.trim();
	// This timestamp is updated every time the form is submitted,
	// so we can use that to know when to re-calculate the zoom position
	const tsToTriggerReZoom = searchParams.get("ts");
	const navigate = useNavigate();
	const { map } = useContext(MapContext);
	const [coords, setCoords] = useState<null | Coordinate[]>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!query) {
			setLoading(false);
			return;
		}

		const controller = new AbortController();
		setLoading(true);

		handleQuery(query, controller.signal).then((coords) => {
			setCoords(coords);
			setLoading(false);
		});

		return () => {
			controller.abort();
			setLoading(false);
			console.warn("[SEARCH] Geocoding data loading aborted!");
		};
	}, [query, setLoading]);

	const results: {
		sensors: (Sensor & Record<string, any>)[];
		center: Coordinate | null;
		bounds: ReturnType<typeof getBounds> | null;
	} = useMemo(() => {
		const EMPTY_RESULT = { sensors: [], center: null, bounds: null };
		if (!coords || coords.length == 0) return EMPTY_RESULT;

		// Find the mid-point of all the returned points
		const _center = getCenter(coords);
		if (!_center) {
			console.warn("[SEARCH] getCenter returned false somehow");
			return EMPTY_RESULT;
		}
		const center: Coordinate = {
			lng: _center.longitude,
			lat: _center.latitude,
			featureName: titleCase(`${query} center`),
		};

		// Points can be near the center, or near any of the points
		const allCoords = [...coords, center];

		const sensorsInRadius = Object.values(sensors!).filter((sensor) => {
			// Take all sensors that are within the radius of any of the points
			for (const coord of allCoords) {
				if (isPointWithinRadius(sensor.safeLocation, coord, MAX_METERS_AWAY_FROM_POS)) {
					return true;
				}
			}
			return false;
		});

		const rawDistances = sensorsInRadius.map((sensor) => {
			// Store the average distance to all the points for each sensor
			let totalDistance = 0;
			let closestDistance = Infinity;
			let closestFeatureName: string | null = null;
			for (const coord of allCoords) {
				// This means that lower weights increase the distance, thereby making this
				// a less good option
				const distance = getDistance(coord, sensor.safeLocation) / coord.weight;
				totalDistance += distance / coord.weight;
				if (distance < closestDistance) {
					closestDistance = distance;
					closestFeatureName = coord.featureName;
				}
			}
			const averageDistanceToFeatures = totalDistance / allCoords.length;

			const centerDistance = getDistance(center, sensor.safeLocation);

			const grandAverageDistance = (closestDistance + averageDistanceToFeatures + centerDistance) / 3;

			return {
				...sensor,
				centerDistance,
				closestDistance,
				averageDistanceToFeatures,
				grandAverageDistance,
				closestFeatureName,
			};
		});

		const averageDistanceToCenter =
			rawDistances.reduce((acc, curr) => acc + curr.centerDistance, 0) / rawDistances.length;
		console.info("[SEARCH] Center ", center, " average distance: ", averageDistanceToCenter);
		// When they're close to the center on average, use that,
		// otherwise, use their individual distances to features
		let distanceMetric: keyof (typeof rawDistances)[number];
		if (averageDistanceToCenter <= MAX_METERS_AWAY_FROM_POS) {
			distanceMetric = "centerDistance";
			// } else if (averageAverageDistanceToFeatures <= DISTANCE_METRIC_FEATURES_THRESHOLD) {
			// 	distanceMetric = "closestDistance";
		} else {
			distanceMetric = "grandAverageDistance";
		}
		console.info("[SEARCH] Using distance metric " + distanceMetric);

		const distances = rawDistances.map((distance) => ({ ...distance, distance: distance[distanceMetric] }));
		console.info("[SEARCH] Distances ", distances);
		// Sort by the computed distances
		const sorted = distances.toSorted((a, b) => a.distance - b.distance);

		// We want at least 3
		// TODO: In future, find a good metric to select the number of results with
		const selection = sorted.slice(0, 6);

		const bounds = getBounds(selection.map((s) => s.safeLocation));

		return { sensors: selection, center, bounds };
	}, [coords, sensors]);

	useEffect(() => {
		if (results.bounds) {
			try {
				// @ts-expect-error TS is wrong I'm right
				map.fitBounds(results.bounds, { padding: 50 });
			} catch (err) {
				console.error(`map.fitBounds(...) threw an error! Falling back to map.flyTo(...)`);
				flyTo(map, results?.center);
			}
		} else {
			flyTo(map, results?.center);
		}
	}, [results, tsToTriggerReZoom]);

	function makeHandleShowOnMap(sensor: Sensor) {
		return () => {
			flyTo(map, sensor.safeLocation);
			setDrawerOpen(false);
		};
	}

	return (
		<Stack>
			<Typography fontSize="12pt" p={2}>
				{loading
					? `Loading search results for '${query}'... Please wait`
					: results.sensors.length == 0
					? `I couldn't find any sensors near '${query}' sorry.`
					: `Sensors near ${titleCase(query)}:`}
			</Typography>

			{loading ? (
				<LinearProgress />
			) : (
				results.sensors.length > 0 && (
					<List>
						{results.sensors.map((sensor) => (
							<ListItem
								disablePadding
								key={sensor.id + sensor.closestFeatureName}
								secondaryAction={
									<Tooltip title="Show on map" placement="right">
										<IconButton edge="end" onClick={makeHandleShowOnMap(sensor)}>
											<PinDropIcon />
										</IconButton>
									</Tooltip>
								}>
								<ListItemButton
									sx={{ px: 2 }}
									onClick={() => {
										navigate(`/sensor/${sensor.id}`);
									}}>
									<ListItemIcon>
										<RPiIcon sensor={sensor} fontSize="large" />
									</ListItemIcon>
									<ListItemText
										primary={
											sensor.secondary_id
												? `${sensor.secondary_id} (#${sensor.id})`
												: `#${sensor.id}`
										}
										secondary={`${
											sensor.closestDistance > 1000
												? `${Math.round(sensor.closestDistance / 100) / 10} kilometres`
												: `${sensor.closestDistance} meters`
										} away from ${sensor.closestFeatureName} • ${
											sensor.online ? "Online" : "Offline"
										}`}
									/>
								</ListItemButton>
							</ListItem>
						))}
					</List>
				)
			)}
		</Stack>
	);
}
