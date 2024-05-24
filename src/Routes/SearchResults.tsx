import { useNavigate, useSearchParams } from "react-router-dom";
import { useContext } from "react";
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";
import MapContext from "../MapContext";
import RPiIcon from "../assets/RPiIcon";
import SensorsContext from "../SensorsContext";
import { getDistance } from "geolib";

function handleQuery(_query: string): null | { latitude: number; longitude: number } {
	const query = _query.trim().toLowerCase();
	if (!query) return null;
}

export default function Search() {
	const [sensors] = useContext(SensorsContext);
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const query = searchParams.get("query");
	const [map] = useContext(MapContext);
	const pos = handleQuery(query);

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

	if (!results) return <Typography>Couldn't find any results for that query sorry.</Typography>;

	return (
		<Stack p={2}>
			<Typography
				variant="h6"
				sx={{
					fontWeight: "bold",
					marginTop: 6,
					marginLeft: 4,
				}}></Typography>

			<List>
				{results.map((sensor) => (
					<ListItemButton
						sx={{ paddingInline: 4 }}
						onClick={() => {
							map?.flyTo({
								center: sensor.public_location,
								zoom: 12,
								speed: 1.2,
								curve: 1,
							});
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
		</Stack>
	);
}
