import { Collapse, Paper, Stack, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";

import { Bolt as BoltIcon } from "@mui/icons-material";
import { Map } from "mapbox-gl";
import { CRISiSLabIcon } from "./assets/CRISiSLabIcon";
import { GNSIcon } from "./assets/GNSIcon";
import { SmallToggleButton } from "./components/SmallToggleButton";
import MapContext from "./contexts/MapContext";
import SensorsContext from "./contexts/SensorsContext";

// Fix types for buttons
declare module "@mui/material/ToggleButton" {
	interface ButtonPropsColorOverrides {
		geonet: true;
	}
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
		function onFaultLinesExpand(map: Map) {
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

		function onFaultLinesShrink(map: Map) {
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
		function updateFaultLineStyles(map: Map) {
			if (faultLinesEnabled) {
				showFaultLines(true, map);
			} else {
				showFaultLines(false, map);
				showFaultLineLabels(false, map);
			}
		}
		function setupFaultlineHandlers(map: Map) {
			map.on("mouseenter", "fault-lines-hitbox-layer", () => onFaultLinesExpand(map))
				.on("mouseleave", "fault-lines-hitbox-layer", () => onFaultLinesShrink(map))
				.on("click", "fault-lines-hitbox-layer", () => onFaultLinesExpand(map));
		}
		function cleanupFaultlineHandlers(map: Map) {
			map.off("mouseenter", "fault-lines-hitbox-layer", () => onFaultLinesExpand(map))
				.off("mouseleave", "fault-lines-hitbox-layer", () => onFaultLinesShrink(map))
				.off("click", "fault-lines-hitbox-layer", () => onFaultLinesExpand(map));
		}

		const onLoad = ({ target: map }) => {
			updateFaultLineStyles(map);
		};
		if (map?.loaded()) {
			updateFaultLineStyles(map);
			setupFaultlineHandlers(map);
		} else {
			map?.on("load", onLoad);
		}
		return () => {
			if (!map) return;
			cleanupFaultlineHandlers(map);
			map.off("load", onLoad);
		};
	}, [map, faultLinesEnabled]);

	useEffect(() => {
		function updateFaultLineStyles(map: Map) {
			for (const layer of geonetSensorsLayers) {
				if (map.getLayer(layer)) map.setLayoutProperty(layer, "visibility", geonetEnabled ? "visible" : "none");
			}
		}
		const onLoad = ({ target: map }) => updateFaultLineStyles(map);
		if (map?.loaded()) {
			updateFaultLineStyles(map);
		} else {
			map?.on("load", onLoad);
		}

		return () => {
			map?.off("load", onLoad);
		};
	}, [map, geonetEnabled]);

	useEffect(() => {
		function updateCrisislabStyles(map: Map) {
			for (const layer of crisislabSensorsLayers) {
				if (map.getLayer(layer)) {
					map.setLayoutProperty(layer, "visibility", crisislabEnabled ? "visible" : "none");
				}
			}
		}
		const onLoad = ({ target: map }) => updateCrisislabStyles(map);
		if (map?.loaded()) {
			updateCrisislabStyles(map);
		} else {
			map?.on("load", onLoad);
		}
		return () => {
			map?.off("load", onLoad);
		};
	}, [map, crisislabEnabled]);

	function toggleCrisislab() {
		setCrisislabEnabled((oldState) => !oldState);
	}
	function toggleGeonet() {
		setGeonetEnabled((oldState) => !oldState);
	}
	function toggleFaultLines() {
		setFaultLinesEnabled((oldState) => !oldState);
	}

	return (
		<Stack
			sx={{
				position: "fixed",
				bottom: "35px",
				right: 10,
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
					backgroundColor: (theme) => theme.vars.palette.background.paper,
					borderRadius: 1,
					padding: 1,
					transition: "opacity 0.2s",
					// alignItems: "flex-end",
				}}
				elevation={4}>
				<Typography variant="body1" sx={{ fontWeight: 600 }}>
					Map layers
				</Typography>
				<Stack gap={1} direction="row">
					<Tooltip title="CRISiSLab sensors" placement="top">
						<ToggleButton
							value="crisislab"
							selected={crisislabEnabled}
							onChange={toggleCrisislab}
							color="primary">
							<CRISiSLabIcon />
						</ToggleButton>
					</Tooltip>{" "}
					<Tooltip title="GeoNet sensors" placement="top">
						<ToggleButton
							value="geonet"
							selected={geonetEnabled}
							onChange={toggleGeonet}
							// @ts-expect-error shush
							color="geonet">
							<GNSIcon />
						</ToggleButton>
					</Tooltip>
					<Tooltip title="Fault lines" placement="top">
						<ToggleButton
							value="fault-lines"
							selected={faultLinesEnabled}
							onChange={toggleFaultLines}
							color="error">
							<BoltIcon />
						</ToggleButton>
					</Tooltip>
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
