import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";

import { OpenInNew } from "@mui/icons-material";
import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import RPiIcon from "../assets/RPiIcon";
import MapContext from "../contexts/MapContext";
import SensorsContext from "../contexts/SensorsContext";
import { APIOrigin, flyTo } from "../utils";

export default function Sensor() {
	const { unfilteredSensors: sensors } = useContext(SensorsContext);
	const { map } = useContext(MapContext);
	const { id: _id } = useParams<{ id: string }>();

	const id = Number(_id);
	const sensor = sensors![id];

	useEffect(() => {
		flyTo(map, sensor?.public_location);
	}, [map, id]);

	if (!_id || !sensor || Number.isNaN(id)) {
		return (
			<Typography p={2}>
				{!_id
					? `I'm not sure which sensor you're looking for sorry. Make sure to specify a sensor ID in the url.`
					: `I couldn't find sensor #${_id} in my list.`}
			</Typography>
		);
	}

	const { online, type, secondary_id: secondaryID, status_change_timestamp } = sensor;

	const lastOnline = status_change_timestamp && new Date(status_change_timestamp);

	return (
		<Stack sx={{ height: "100%" }}>
			<Stack direction="row" p={2} py={0}>
				<RPiIcon sensor={sensor} fontSize="large" sx={{ fontSize: 100, flexGrow: 0 }} />
				<Box sx={{ flexGrow: 1, marginLeft: 1 }}>
					<Typography
						variant="h5"
						style={{
							fontWeight: "bold",
							fontSize: "1.2em",
						}}>
						{secondaryID || type}
					</Typography>
					{secondaryID && (
						<Typography variant="h6" style={{ fontSize: "1.15em" }}>
							{type}
						</Typography>
					)}
					<Typography variant="body1">
						<Tooltip title="Sensor ID">
							<span>#{id}</span>
						</Tooltip>{" "}
						{secondaryID && (
							<>
								•{" "}
								<Tooltip title="Station ID">
									<span>{secondaryID}</span>
								</Tooltip>{" "}
							</>
						)}
						•{" "}
						<Tooltip title="Connection status">
							<span>{online === undefined ? "Unknown" : online ? "Online" : "Offline"}</span>
						</Tooltip>
					</Typography>
					{lastOnline && (
						<Typography variant="body1">
							{online ? "Online since:" : "Last online:"}{" "}
							{`${lastOnline.toDateString()} ${lastOnline.toLocaleTimeString()}`}
						</Typography>
					)}
				</Box>
			</Stack>
			<div
				style={{
					width: "100%",
					marginTop: 10,
					paddingInline: 10,
					position: "relative",
					flexGrow: "1",
				}}>
				<iframe
					key="live-data-embed"
					id="live-data-embed"
					src={`${APIOrigin}/consume/${id}?hide-hover-inspector=yes&sort-channels=display&disable-response-removal&time-window=15`}
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						width: "100%",
						height: "100%",
					}}
				/>
				<IconButton
					component={"a"}
					style={{ position: "absolute", top: -10, right: 5, color: "black" }}
					href={`${APIOrigin}/consume/${id}?sort-channels=display`}
					target="_blank"
					rel="noopener noreferrer">
					<OpenInNew />
				</IconButton>
			</div>
		</Stack>
	);
}
