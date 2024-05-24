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

// 5km is the max distance for sensors to show up in the search results
const MAX_METERS_AWAY_FROM_POS = 15 * 1000;

type Coordinate = { latitude: number; longitude: number; weight?: number };

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

			if (!Number.isNaN(longitude) && !Number.isNaN(latitude)) return [{ longitude, latitude }];
		}

		// If all else fails, try doing a geocoding lookup
		const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
			query,
		)}.json?country=nz&proximity=174.8,-41.325&types=region,postcode,district,place,locality,neighborhood,address,poi&limit=10&language=en&access_token=${MAPBOX_TOKEN}`;
		const response = await fetch(url);
		const json = await response.json();
		console.info("Geocoding response: ", json);

		// Nasty data validation
		if (Array.isArray(json?.features) && json.features.length > 0) {
			const filteredCoords = json.features
				.filter((feature) => Array.isArray(feature?.center) && feature.center.length == 2)
				.map((feature) => ({
					longitude: feature.center[0],
					latitude: feature.center[1],
					weight: feature.relevance ?? 1,
				}));

			if (filteredCoords.length > 0) return filteredCoords;
		}
	} catch (err) {
		console.warn("Error parsing search query: ", err);
		return null;
	}

	return null;
}

export default function Search() {
	const [sensors] = useContext(SensorsContext);
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const query = searchParams.get("query");
	const [map] = useContext(MapContext);
	const [coords, setCoords] = useState<null | Coordinate[]>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!query) return;
		const controller = new AbortController();
		setLoading(true);

		handleQuery(query, controller.signal).then((coords) => {
			setCoords(coords);
			setLoading(false);
		});

		return () => {
			controller.abort();
			setLoading(false);
			console.warn("Loading aborted!");
		};
	}, [query, setLoading]);

	const results = useMemo(() => {
		if (!coords) return [];

		// Find the mid-point of all the returned points
		let center: Coordinate | false = getCenter(coords);
		if (!center) {
			console.warn("Search issue: getCenter returned false somehow");
			return [];
		}
		console.info("Center ", center);

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
		console.info("Sensors in radius: ", sensorsInRadius);

		const distances = sensorsInRadius.map((sensor) => {
			// Store the average distance to all the points for each sensor
			// let totalDistance = 0;
			// let closestDistance = Infinity;
			// for (const coord of allCoords) {
			// 	const distance = getDistance(coord, sensor.safeLocation);
			// 	// This means that lower weights increase the distance, thereby making this
			// 	// a less good option
			// 	totalDistance += distance / coord.weight;
			// 	if (distance < closestDistance) closestDistance = distance;
			// }
			// const averageDistanceToPoints = totalDistance / allCoords.length;

			const centerDistance = getDistance(center, sensor.safeLocation);

			// const averageDistance = (centerDistance + averageDistanceToPoints + closestDistance) / 3;

			return {
				...sensor,
				distance: centerDistance,
			};
		});
		console.info("Distances: ", distances);

		// Sort by the computed distances
		const sorted = distances.toSorted((a, b) => a.distance - b.distance);
		console.info("Sorted: ", sorted);

		// We want at least 3
		const selection = sorted.slice(0, 6);
		console.info("Selection: ", selection);

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
					: `Sensors near ${query}:`}
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
									primary={sensor.type}
									secondary={`${
										sensor.distance > 1000
											? `${Math.round(sensor.distance / 100) / 10} kilometers away`
											: `${sensor.distance} meters away`
									} • ${sensor.secondary_id || "#" + sensor.id} • ${
										sensor.online ? "Online" : "Offline"
									}`}
								/>
							</ListItemButton>
						))}
					</List>
				)
			)}
		</Stack>
	);
}
