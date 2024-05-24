import { useNavigate, useSearchParams } from "react-router-dom";
import { useContext, useEffect } from "react";
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";
import MapContext from "../MapContext";
import RPiIcon from "../assets/RPiIcon";
import SensorsContext from "../SensorsContext";
import { getDistance } from "geolib";

function handleQuery(_query: string): null | { latitude: number; longitude: number } {
	const query = _query.trim().toLowerCase();

	if (!query) return null;

	try {
		// Try parse longitude & latitude
		// Longitude and latitude are usually seperated by a comma and a space,
		// but sometimes it's one or the other
		let segments = query.split(", ");
		if (segments.length != 2) segments = query.split(" ");
		if (segments.length != 2) segments = query.split(",");

		if (segments.length == 2) {
			const longitude = Number.parseFloat(segments[0]);
			const latitude = Number.parseFloat(segments[1]);

			if (!Number.isNaN(longitude) && !Number.isNaN(latitude)) return { longitude, latitude };
		}
	} catch (err) {
		console.warn("Error parsing search query: ", err);
		return null;
	}
}

export default function Search() {
	const [sensors] = useContext(SensorsContext);
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const query = searchParams.get("query");
	const [map] = useContext(MapContext);
	const pos = handleQuery(query);

	useEffect(() => {
		map?.flyTo({});
	}, [pos, map]);

	const results = pos
		? Object.values(sensors!)
				.map((sensor) => {
					return {
						...sensor,
						distance: getDistance(pos, {
							latitude: sensor.public_location[0],
							longitude: sensor.public_location[1],
						}),
					};
				})
				.sort((a, b) => a.distance - b.distance)
				.slice(0, 5)
		: [];

	useEffect(() => {
		if (results.length == 1) {
			navigate(`/sensor/${results[0].id}`);
		}
	}, [results, navigate]);

	return (
		<Stack p={2} py={0}>
			<Typography>{results.length == 0 ? `I couldn't find any sensors near '${query}' sorry.` : ""}</Typography>

			{results.length > 0 && (
				<List>
					{results.map((sensor) => (
						<ListItemButton
							sx={{ paddingInline: 4 }}
							onClick={() => {
								navigate(`/sensor/${sensor.id}`);
							}}>
							<ListItemIcon>
								<RPiIcon sensor={sensor} fontSize="large" />
							</ListItemIcon>
							<ListItemText
								primary={sensor.type}
								secondary={`${
									/*bbox
									? ""
									: `${
											sensor.distance > 1000
												? `${Math.round(sensor.distance / 100) / 10} kilometers away`
												: `${sensor.distance} meters away`
									  } • `*/ ""
								}${sensor.secondary_id || "#" + sensor.id} • ${sensor.online ? "Online" : "Offline"}`}
							/>
						</ListItemButton>
					))}
				</List>
			)}
		</Stack>
	);
}
