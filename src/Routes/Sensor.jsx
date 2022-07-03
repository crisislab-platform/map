import { Fade, IconButton, Tooltip, Box, Typography } from "@mui/material";

import { OpenInNew } from "@mui/icons-material";
import RPiIcon from "./RPiIcon";
import React from "react";
import SensorsContext from "../SensorsContext";
import { useParams } from "react-router-dom";

export default function Sensor() {
	const [sensors] = React.useContext(SensorsContext);
	const { id } = useParams();

	if (!sensors[id]) {
		return null;
	}

	const { geoFeatures, online, type, secondary_id: secondaryID } = sensors[id];

	let location = null;

	if (geoFeatures) {
		const streetName = geoFeatures.text;
		const locality = geoFeatures.context[1].text;
		const region = geoFeatures.context[3].text;
		location = `${streetName}, ${locality}, ${region}`;
	}

	return (
		<Fade in>
			<Box
				sx={{
					paddingInline: 0,
					paddingTop: 6,
					// marginTop: 6,
				}}>
				<Box sx={{ display: "flex", paddingInline: 4 }}>
					<RPiIcon fontSize="large" sx={{ fontSize: 100, flexGrow: 0 }} />
					<Box sx={{ flexGrow: 1, marginLeft: 1 }}>
						<Typography
							variant="h5"
							style={{
								fontWeight: "bold",
								fontSize: "1.2em",
							}}>
							{location || type}
						</Typography>
						<Typography variant="h6" style={{ fontSize: "1.15em" }}>
							{location ? type : null}
						</Typography>
						<Typography variant="body1">
							<Tooltip title="Sensor ID">
								<span>#{id}</span>
							</Tooltip>{" "}
							{secondaryID && (
								<>
									•{" "}
									<Tooltip title="Station ID">
										<span>@{secondaryID}</span>
									</Tooltip>{" "}
								</>
							)}
							•{" "}
							<Tooltip title="Connection status">
								<span>{online === undefined ? "Unknown" : online ? "Online" : "Offline"}</span>
							</Tooltip>
						</Typography>
					</Box>
				</Box>
				<div
					style={{
						width: "100%",
						height: "calc(100vh - 220px)",
						marginTop: 10,
						paddingInline: 10,
						position: "relative",
					}}>
					<iframe
						src={"https://ingest.benhong.me/consume/" + id}
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							width: "100%",
							height: "100%",
						}}
						frameBorder="0"></iframe>
					<IconButton
						component={"a"}
						style={{ position: "absolute", top: -10, right: 5, color: "black" }}
						href={"https://ingest.benhong.me/consume/" + id}
						target="_blank"
						rel="noopener noreferrer">
						<OpenInNew />
					</IconButton>
				</div>
			</Box>
		</Fade>
	);
}
