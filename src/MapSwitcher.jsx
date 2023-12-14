import { ButtonBase, Paper, Stack, Typography, useTheme } from "@mui/material";
import { useContext, useEffect, useState } from "react";

import BoltIcon from "@mui/icons-material/Bolt";
import MapContext from "./MapContext";
import CrisisAlertIcon from "@mui/icons-material/CrisisAlert";
import EmergencyShareIcon from "@mui/icons-material/EmergencyShare";

const squareSize = 50;
const labelHeight = 15;

function FlexSquare({ color, text, row, onClick, style, selected, Icon, selectedColor }) {
	const theme = useTheme();

	const backgroundColor = theme.palette[color]?.main || color;

	return (
		<ButtonBase
			onClick={onClick}
			elevation={0}
			sx={{
				width: squareSize + 4,
				height: "min-content",
				backgroundColor: "none",
				padding: "2px",
				borderRadius: theme.spacing(1),
				...style,
			}}>
			<Stack>
				<Paper
					sx={{
						backgroundColor,
						width: squareSize,
						height: squareSize,
						border: `4px solid ${selected ? theme.palette[color]?.dark || selectedColor : "transparent"}`,
						transition: "border 0.5s",
						display: "grid",
						placeItems: "center",
						borderRadius: theme.spacing(1),
					}}
					elevation={0}>
					<Icon sx={{ display: "block", color: "white" }} />
				</Paper>
				<Typography sx={{ fontSize: "8pt" }}>{text}</Typography>
			</Stack>
		</ButtonBase>
	);
}

const crisislabSensorsLayers = ["clusters", "unclustered-point", "cluster-count"];
const geonetSensorsLayers = ["unclustered-point-geonet", "cluster-count-geonet", "clusters-geonet"];

function showFaultLines(show, map) {
	map.getLayer("fault-lines-render-layer") &&
		map.setLayoutProperty("fault-lines-render-layer", "visibility", show ? "visible" : "none");
	map.getLayer("fault-lines-hitbox-layer") &&
		map.setLayoutProperty("fault-lines-hitbox-layer", "visibility", show ? "visible" : "none");
}
function showFaultLineLabels(show, map) {
	map.getLayer("fault-lines-render-layer") &&
		map.setLayoutProperty("fault-lines-labels-layer", "visibility", show ? "visible" : "none");
}

export default function Switcher() {
	const [map, , mapLoaded, setMapLoaded] = useContext(MapContext);
	const theme = useTheme();
	const [faultLinesEnabled, setFaultLinesEnabled] = useState(false);
	const [geonetEnabled, setGeonetEnabled] = useState(false);
	const [crisislabEnabled, setCrisislabEnabled] = useState(true);

	// Extra data layers (sensor locations, fault lines, etc)

	useEffect(() => {
		function onFaultLinesExpand(map) {
			showFaultLineLabels(true, map);

			map.setPaintProperty("fault-lines-render-layer", "line-width", [
				"interpolate",
				["linear"],
				["zoom"],
				5,
				4,
				18,
				16,
			]);
		}

		function onFaultLinesShrink(map) {
			showFaultLineLabels(false, map);

			map.setPaintProperty("fault-lines-render-layer", "line-width", [
				"interpolate",
				["linear"],
				["zoom"],
				5,
				1,
				18,
				6,
			]);
		}
		function updateFaultLineStyles(map) {
			if (faultLinesEnabled) {
				showFaultLines(true, map);
			} else {
				showFaultLines(false, map);
				showFaultLineLabels(false, map);
			}
		}
		if (!!map && map.loaded()) {
			updateFaultLineStyles(map);

			map.on("mouseenter", "fault-lines-hitbox-layer", () => onFaultLinesExpand(map))
				.on("mouseleave", "fault-lines-hitbox-layer", () => onFaultLinesShrink(map))
				.on("click", "fault-lines-hitbox-layer", () => onFaultLinesExpand(map));

			return () => {
				map.off("mouseenter", "fault-lines-hitbox-layer", () => onFaultLinesExpand(map))
					.off("mouseleave", "fault-lines-hitbox-layer", () => onFaultLinesShrink(map))
					.off("click", "fault-lines-hitbox-layer", () => onFaultLinesExpand(map));
			};
		}
	}, [map, faultLinesEnabled]);

	useEffect(() => {
		if (map?.loaded()) {
			for (const layer of geonetSensorsLayers) {
				if (map.getLayer(layer)) map.setLayoutProperty(layer, "visibility", geonetEnabled ? "visible" : "none");
			}
		}
	}, [map, geonetEnabled]);

	useEffect(() => {
		if (map?.loaded()) {
			for (const layer of crisislabSensorsLayers) {
				if (map.getLayer(layer))
					map.setLayoutProperty(layer, "visibility", crisislabEnabled ? "visible" : "none");
			}
		}
	}, [map, crisislabEnabled]);

	function onPopupOpen() {
		setPopupOpen(true);
	}
	function onPopupClose() {
		setPopupOpen(false);
	}


	return (
		<Stack
			sx={{
				position: "fixed",
				bottom: 35,
				right: 20,
				flex: 0,
			}}
			justifyContent="flex-end"
			alignItems="flexEnd"
			spacing={1}>
			<Paper
				sx={{
					display: "flex",
					flexDirection: "column",
					gap: 1,
					backgroundColor: theme.palette.background.paper,
					borderRadius: theme.spacing(1),
					padding: 1,
					transition: "opacity 0.2s",
					// alignItems: "flex-end",
				}}
				elevation={4}>
				<Typography variant="body1" sx={{ fontWeight: 600 }}>
					Map layers
				</Typography>
				<Stack gap={1} direction="row">
					<FlexSquare
						row="top"
						selected={crisislabEnabled}
						onClick={() => setCrisislabEnabled((oldState) => !oldState)}
						color="primary"
						text="CRISiSLab sensors"
						Icon={CrisisAlertIcon}
					/>
					<FlexSquare
						row="top"
						selected={geonetEnabled}
						onClick={() => setGeonetEnabled((oldState) => !oldState)}
						color="geonet"
						text="Geonet sensors"
						Icon={EmergencyShareIcon}
					/>
					<FlexSquare
						row="top"
						selected={faultLinesEnabled}
						onClick={() => setFaultLinesEnabled((oldState) => !oldState)}
						color="error"
						text="Fault lines"
						Icon={BoltIcon}
					/>
				</Stack>
			</Paper>
		</Stack>
	);
}
