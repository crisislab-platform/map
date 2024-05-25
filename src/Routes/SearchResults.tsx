import { useNavigate, useSearchParams } from "react-router-dom";
import { useContext, useEffect, useMemo, useState } from "react";
import {
	Box,
	LinearProgress,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Stack,
	Typography,
} from "@mui/material";
import MapContext from "../MapContext";
import RPiIcon from "../assets/RPiIcon";
import SensorsContext from "../SensorsContext";
import { getCenter, getDistance, isPointWithinRadius } from "geolib";
import { MAPBOX_TOKEN } from "../Map";
import { titleCase } from "../utils";

// 5km is the max distance for sensors to show up in the search results
const MAX_METERS_AWAY_FROM_POS = 15 * 1000;

type Coordinate = { latitude: number; longitude: number; weight?: number; featureName: string };

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
			const longitude = Number.parseFloat(segments[0]);
			const latitude = Number.parseFloat(segments[1]);

			if (!Number.isNaN(longitude) && !Number.isNaN(latitude))
				return [{ longitude, latitude, featureName: "coordinates" }];
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
			)}.json?country=nz&proximity=174.8,-41.325&types=region,postcode,district,place,locality,neighborhood,address,poi&limit=10&language=en&access_token=${MAPBOX_TOKEN}`;
			const response = await fetch(url);
			json = await response.json();
			geocodingCache.set(query, json);
		}
		// console.info("Geocoding response: ", json);

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

export default function Search() {
	const [sensors] = useContext(SensorsContext);
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const query = searchParams.get("query")?.trim();
	const [map] = useContext(MapContext);
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

	const results = useMemo(() => {
		if (!coords || coords.length == 0) return [];

		// Find the mid-point of all the returned points
		const _center = getCenter(coords);
		if (!_center) {
			console.warn("[SEARCH] getCenter returned false somehow");
			return [];
		}
		const center: Coordinate = { ..._center, featureName: titleCase(`${query} center`) };

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
			// let totalDistance = 0;
			let closestDistance = Infinity;
			let closestFeatureName: string | null = null;
			for (const coord of allCoords) {
				const distance = getDistance(coord, sensor.safeLocation);
				// This means that lower weights increase the distance, thereby making this
				// a less good option
				// totalDistance += distance / coord.weight;
				if (distance < closestDistance) {
					closestDistance = distance;
					closestFeatureName = coord.featureName;
				}
			}
			// const averageDistanceToPoints = totalDistance / allCoords.length;

			const centerDistance = getDistance(center, sensor.safeLocation);

			// const averageDistance = (centerDistance + averageDistanceToPoints + closestDistance) / 3;

			return {
				...sensor,
				centerDistance,
				closestDistance,
				// averageDistance,
				closestFeatureName,
			};
		});

		const averageDistanceToCenter =
			rawDistances.reduce((acc, curr) => acc + curr.centerDistance, 0) / rawDistances.length;

		// When they're close to the center on average, use that,
		// otherwise, use their individual distances to features
		const distanceMetric: keyof (typeof rawDistances)[number] =
			averageDistanceToCenter < MAX_METERS_AWAY_FROM_POS ? "centerDistance" : "closestDistance";
		console.info("[SEARCH] Using distance metric " + distanceMetric);

		const distances = rawDistances.map((distance) => ({ ...distance, distance: distance[distanceMetric] }));

		// Sort by the computed distances
		const sorted = distances.toSorted((a, b) => a.distance - b.distance);

		// We want at least 3
		// TODO: In future, find a good metric to select the number of results with
		const selection = sorted.slice(0, 6);

		return selection;
	}, [coords]);

	useEffect(() => {
		if (results.length == 1) {
			navigate(`/sensor/${results[0].id}`);
		}
	}, [results, navigate]);

	return (
		<Stack>
			<Typography fontSize="12pt" p={2}>
				{loading
					? `Loading search results for '${query}'... Please wait`
					: results.length == 0
					? `I couldn't find any sensors near '${query}' sorry.`
					: `Sensors near ${titleCase(query)}:`}
			</Typography>

			{loading ? (
				<LinearProgress />
			) : (
				results.length > 0 && (
					<List>
						{results.map((sensor) => (
							<ListItemButton
								onClick={() => {
									navigate(`/sensor/${sensor.id}`);
								}}>
								<ListItemIcon>
									<RPiIcon sensor={sensor} fontSize="large" />
								</ListItemIcon>
								<ListItemText
									primary={
										sensor.secondary_id ? `${sensor.secondary_id} (#${sensor.id})` : `#${sensor.id}`
									}
									secondary={`${
										sensor.closestDistance > 1000
											? `${Math.round(sensor.closestDistance / 100) / 10} kilometers`
											: `${sensor.closestDistance} meters`
									} away from ${sensor.closestFeatureName} • ${sensor.online ? "Online" : "Offline"}`}
								/>
							</ListItemButton>
						))}
					</List>
				)
			)}
		</Stack>
	);
}
