import { useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";
import { Fade } from "@mui/material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MapContext from "../MapContext";
import RPiIcon from "./RPiIcon";
import React from "react";
import SensorsContext from "../SensorsContext";
import Typography from "@mui/material/Typography";
import { getDistance } from "geolib";
import { useSearchParams } from "react-router-dom";

export default function Search() {
	const [sensors] = React.useContext(SensorsContext);
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const name = searchParams.get("name");
	const center =
		searchParams.get("center") && JSON.parse(searchParams.get("center")!);
	const bbox =
		searchParams.get("bbox") && JSON.parse(searchParams.get("bbox")!);
	const [map] = React.useContext(MapContext);

	let results;

	if (bbox) {
		// Look for sensors inside the bounding box
		results = Object.values(sensors!).filter((sensor) => {
			const { latitude, longitude } = sensor.publicLocation;
			return (
				bbox[1] <= latitude &&
				bbox[3] >= latitude &&
				bbox[0] <= longitude &&
				bbox[2] >= longitude
			);
		});
	} else {
		// Find the top 5 closest sensors to the location
		const [longitude, latitude] = center;
		// Use geolib to calculate the distance between the center and each sensor
		results = Object.values(sensors!)
			.map((sensor) => {
				const { latitude: sensorLatitude, longitude: sensorLongitude } =
					sensor.publicLocation;
				return {
					...sensor,
					distance: getDistance(
						{ latitude, longitude },
						{ latitude: sensorLatitude, longitude: sensorLongitude },
					),
				};
			})
			.sort((a, b) => a.distance - b.distance)
			.slice(0, 5);
	}

	return (
		<Fade in>
			<Box
				sx={
					{
						// p: 6,
					}
				}
			>
				<Typography
					variant="h6"
					sx={{
						fontWeight: "bold",
						marginTop: 6,
						marginLeft: 4,
					}}
				>
					{bbox ? "Sensors in" : "Sensors near"} {name}:
				</Typography>

				{results.length > 0 && (
					<List>
						{results.map((sensor) => (
							<ListItem
								button
								sx={{ paddingInline: 4 }}
								onClick={() => {
									map?.flyTo({
										center:
											sensor.publicLocation || sensor.location?.coordinates,
										zoom: 16,
										speed: 1.2,
										curve: 1,
									});
									navigate(`/sensor/${sensor.id}`);
								}}
							>
								<ListItemIcon>
									<RPiIcon fontSize="large" />
								</ListItemIcon>
								<ListItemText
									primary={sensor.type}
									secondary={`${
										bbox
											? ""
											: `${
													sensor.distance > 1000
														? `${
																Math.round(sensor.distance / 100) / 10
														  } kilometers away`
														: `${sensor.distance} meters away`
											  } • `
									}#${sensor.id} • ${sensor.online ? "Online" : "Offline"}`}
								/>
							</ListItem>
						))}
					</List>
				)}
			</Box>
		</Fade>
	);
}
