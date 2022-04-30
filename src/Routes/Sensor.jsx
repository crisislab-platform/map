import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import SensorsContext from "../SensorsContext";
import React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { useParams } from "react-router-dom";
import { getDistance } from "geolib";
import RPiIcon from "./RPiIcon";
import { Button, Fade, IconButton } from "@mui/material";
import { OpenInNew } from "@mui/icons-material";

export default function Sensor() {
	const [sensors] = React.useContext(SensorsContext);
	const { id } = useParams();

	if (!sensors[id]) {
		return null;
	}

	const { geoFeatures, online, type } = sensors[id];

	let location = null;

	if (geoFeatures) {
		const streetName = geoFeatures[0].text;
		const locality = geoFeatures[2].text;
		const region = geoFeatures[3].text;
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
						<Typography variant="body1">{"ID: " + id + " • " + (online ? "Online" : "Offline")}</Typography>
						{/* <Button
							variant="contained"
							color="primary"
							sx={{ marginTop: 1 }}
							onClick={() =>
								window.open("https://ingest-worker.benhong.workers.dev/consume/" + id, "_blank")
							}>
							Open in new tab
						</Button> */}
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
						src={"https://ingest-worker.benhong.workers.dev/consume/" + id}
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
						href={"https://ingest-worker.benhong.workers.dev/consume/" + id}
						target="_blank"
						rel="noopener noreferrer"
						// onClick={() =>
						// 	window.open("https://ingest-worker.benhong.workers.dev/consume/" + id, "_blank")
						// }
					>
						<OpenInNew />
					</IconButton>
				</div>
			</Box>
		</Fade>
	);
}
