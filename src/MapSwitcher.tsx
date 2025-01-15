import {
	Collapse,
	Paper,
	Stack,
	styled,
	ToggleButton,
	ToggleButtonGroup,
	ToggleButtonProps,
	Typography,
	useTheme,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";

import BoltIcon from "@mui/icons-material/Bolt";
import MapContext from "./contexts/MapContext";
import CrisisAlertIcon from "@mui/icons-material/CrisisAlert";
import EmergencyShareIcon from "@mui/icons-material/EmergencyShare";
import { SquareToggleButton } from "./components/SquareToggleButton";
import { SmallToggleButton } from "./components/SmallToggleButton";
import SensorsContext from "./contexts/SensorsContext";

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
	const theme = useTheme();
	const { map } = useContext(MapContext);
	const [faultLinesEnabled, setFaultLinesEnabled] = useState(false);
	const [geonetEnabled, setGeonetEnabled] = useState(false);
	const [crisislabEnabled, setCrisislabEnabled] = useState(true);
	const { allowOnlineStatus, setAllowOnlineStatus } = useContext(SensorsContext);

	function handleCrisislabFilterChange(_event, newValue) {
		if (newValue !== null) {
			setAllowOnlineStatus(newValue);
		}
	}

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
				if (map.getLayer(layer)) {
					map.setLayoutProperty(layer, "visibility", crisislabEnabled ? "visible" : "none");
				}
			}
		}
	}, [map, crisislabEnabled]);

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
					alignItems: "center",
					gap: 1,
					backgroundColor: `color-mix(rgba(255,255,255,0), ${theme.palette.background.paper})`,
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
					<SquareToggleButton
						selected={crisislabEnabled}
						onClick={() => setCrisislabEnabled((oldState) => !oldState)}
						color="primary"
						text="CRISiSLab sensors"
						Icon={CrisisAlertIcon}
					/>
					<SquareToggleButton
						selected={geonetEnabled}
						onClick={() => setGeonetEnabled((oldState) => !oldState)}
						color="geonet"
						text="Geonet sensors"
						Icon={EmergencyShareIcon}
					/>
					<SquareToggleButton
						selected={faultLinesEnabled}
						onClick={() => setFaultLinesEnabled((oldState) => !oldState)}
						color="error"
						text="Fault lines"
						Icon={BoltIcon}
					/>
				</Stack>
				<Collapse in={crisislabEnabled}>
					<ToggleButtonGroup
						size="small"
						value={allowOnlineStatus}
						exclusive
						onChange={handleCrisislabFilterChange}
						aria-label="Filter CRISiSLab sensors">
						<SmallToggleButton value="all" selected={allowOnlineStatus === "all"} size="small">
							All
						</SmallToggleButton>
						<SmallToggleButton value="online" selected={allowOnlineStatus === "online"} size="small">
							Online
						</SmallToggleButton>
						<SmallToggleButton value="offline" selected={allowOnlineStatus === "offline"} size="small">
							Offline
						</SmallToggleButton>
					</ToggleButtonGroup>
				</Collapse>
			</Paper>
		</Stack>
	);
}
