import { Fade, IconButton, Tooltip, Box, Typography } from "@mui/material";

import { OpenInNew } from "@mui/icons-material";
import RPiIcon from "./RPiIcon";
import React from "react";
import SensorsContext from "../SensorsContext";
import { useParams } from "react-router-dom";

const liveDataOrigin = "https://crisislab-data.massey.ac.nz";

export default function Sensor() {
	const [sensors] = React.useContext(SensorsContext);
	const { id: _id } = useParams<{ id: string }>();

	if (!_id) {
		return <p>I'm not sure which sensor you're looking for. Make sure to specify a sensor ID in the url.</p>;
	}

	const id = Number(_id);

	if (!sensors![id]) {
		return <p>I couldn't find that sensor ID in the list I have.</p>;
	}
	const sensor = sensors![id];

	const { online, type, secondary_id: secondaryID, status_change_timestamp } = sensor;

	const lastOnline = status_change_timestamp && new Date(status_change_timestamp);

	return (
		<Fade in>
			<Box
				sx={{
					paddingInline: 0,
					paddingTop: 6,
					// marginTop: 6,
				}}>
				<Box sx={{ display: "flex", paddingInline: 4 }}>
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
				</Box>
				<div
					style={{
						width: "100%",
						height: "calc(100vh - 230px)",
						marginTop: 10,
						paddingInline: 10,
						position: "relative",
					}}>
					<iframe
						key="live-data-embed"
						id="live-data-embed"
						src={`${liveDataOrigin}/consume/${id}?hide-hover-inspector=yes`}
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							width: "100%",
							height: "100%",
						}}
						frameBorder="0"
					/>
					<IconButton
						component={"a"}
						style={{ position: "absolute", top: -10, right: 5, color: "black" }}
						href={`${liveDataOrigin}/consume/${id}`}
						target="_blank"
						rel="noopener noreferrer">
						<OpenInNew />
					</IconButton>
				</div>
			</Box>
		</Fade>
	);
}
