import {
	ButtonBase,
	ClickAwayListener,
	Paper,
	Stack,
	Tooltip,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";

import BoltIcon from "@mui/icons-material/Bolt";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import MapContext from "../../MapContext";
import MapIcon from "@mui/icons-material/Map";
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";
import StraightIcon from "@mui/icons-material/Straight";
import CrisisAlertIcon from "@mui/icons-material/CrisisAlert";
import EmergencyShareIcon from "@mui/icons-material/EmergencyShare";
import AirIcon from "@mui/icons-material/Air";

const styles = [
	{ text: "Streets", color: "primary", id: "streets-v11", Icon: StraightIcon },
	{ text: "Satellite", color: "secondary", id: "satellite-v9", Icon: SatelliteAltIcon },
	{ text: "Outdoors", color: "success", id: "outdoors-v11", Icon: MapIcon },
];

const squareSize = 50;

function FlexSquare({ color, text, row, onClick, style, selected, Icon, selectedColor }) {
	const theme = useTheme();

	const backgroundColor = theme.palette[color]?.main || color;

	return (
		<Tooltip title={text} placement={row === "top" ? "top" : "bottom"}>
			<ButtonBase
				onClick={onClick}
				elevation={0}
				sx={{
					width: squareSize,
					height: squareSize,
					borderRadius: theme.spacing(1),
					backgroundColor: "none",
					...style,
				}}>
				<Paper
					sx={{
						backgroundColor,
						width: squareSize,
						height: squareSize,
						border: `4px solid ${selected ? theme.palette[color]?.dark || selectedColor : "transparent"}`,
						transition: "border 0.5s",
						display: "grid",
						placeItems: "center",
					}}
					elevation={0}>
					<Icon sx={{ display: "block", color: "white" }} />
				</Paper>
			</ButtonBase>
		</Tooltip>
	);
}

const crisislabSensorsLayers = ["clusters", "unclustered-point", "cluster-count"];

export default function Switcher() {
	const [map] = useContext(MapContext);
	const theme = useTheme();
	const onBigScreen = useMediaQuery((theme) => theme.breakpoints.up("lg"));
	const [popupOpen, setPopupOpen] = useState(false);
	const [selectedStyle, setSelectedStyle] = useState("streets-v11");
	const [faultLinesEnabled, setFaultLinesEnabled] = useState(false);
	const [geonetEnabled, setGeonetEnabled] = useState(false);
	const [airEnabled, setAirEnabled] = useState(false);
	const [crisislabEnabled, setCrisislabEnabled] = useState(true);

	function showFaultLines(show) {
		map.getLayer("fault-lines-render-layer") &&
			map.setLayoutProperty("fault-lines-render-layer", "visibility", show ? "visible" : "none");
		map.getLayer("fault-lines-hitbox-layer") &&
			map.setLayoutProperty("fault-lines-hitbox-layer", "visibility", show ? "visible" : "none");
	}
	function showFaultLineLabels(show) {
		map.getLayer("fault-lines-render-layer") &&
			map.setLayoutProperty("fault-lines-labels-layer", "visibility", show ? "visible" : "none");
	}

	function onFaultLinesExpand() {
		showFaultLineLabels(true);

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
	function onFaultLinesShrink() {
		showFaultLineLabels(false);

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

	function updateFaultLineStyles() {
		if (map && map.loaded) {
			if (faultLinesEnabled) {
				showFaultLines(true);
			} else {
				showFaultLines(false);
				showFaultLineLabels(false);
			}
		}
	}

	useEffect(() => {
		if (map && map.loaded) {
			updateFaultLineStyles();

			map.on("mouseenter", "fault-lines-hitbox-layer", onFaultLinesExpand)
				.on("mouseleave", "fault-lines-hitbox-layer", onFaultLinesShrink)
				.on("click", "fault-lines-hitbox-layer", onFaultLinesExpand)
				.on("style.load", updateFaultLineStyles);

			return () => {
				map.off("mouseenter", "fault-lines-hitbox-layer", onFaultLinesExpand)
					.off("mouseleave", "fault-lines-hitbox-layer", onFaultLinesShrink)
					.off("click", "fault-lines-hitbox-layer", onFaultLinesExpand)
					.off("style.load", updateFaultLineStyles);
			};
		}
	}, [map, faultLinesEnabled]);

	useEffect(() => {
		if (map && map.loaded && map.getLayer("unclustered-point-geonet")) {
			map.setLayoutProperty("unclustered-point-geonet", "visibility", geonetEnabled ? "visible" : "none");
			map.setLayoutProperty("cluster-count-geonet", "visibility", geonetEnabled ? "visible" : "none");
			map.setLayoutProperty("clusters-geonet", "visibility", geonetEnabled ? "visible" : "none");
		}
	}, [map, geonetEnabled]);

	useEffect(() => {
		if (map && map.loaded && map.getLayer("air-sensors")) {
			map.setLayoutProperty("air-sensors", "visibility", airEnabled ? "visible" : "none");
		}
	}, [map, airEnabled]);

	useEffect(() => {
		if (map && map.loaded) {
			for (const layer of crisislabSensorsLayers) {
				if (map.getLayer(layer))
					map.setLayoutProperty(layer, "visibility", crisislabEnabled ? "visible" : "none");
			}
		}
	}, [map, crisislabEnabled]);

	const selectedStyleDetails = styles.find((style) => style.id === selectedStyle);

	function setStyle(style) {
		if (selectedStyle !== style && map && map.loaded) {
			map?.setStyle("mapbox://styles/mapbox/" + style);
			setSelectedStyle(style);
		}
	}

	function onPopupOpen() {
		setPopupOpen(true);
	}
	function onPopupClose() {
		setPopupOpen(false);
	}

	return (
		<ClickAwayListener onClickAway={onPopupClose}>
			<Stack
				sx={{
					position: "fixed",
					bottom: 35,
					right: 20,
					pointerEvents: popupOpen ? "auto" : "none",
					flex: 0,
				}}
				justifyContent="flex-end"
				alignItems="flexEnd"
				spacing={2}
				onMouseEnter={onPopupOpen}
				onMouseLeave={onPopupClose}
				onFocus={onPopupOpen}
				onBlur={onPopupClose}>
				<Paper
					sx={{
						display: "flex",
						flexDirection: "column",
						gap: 1,
						backgroundColor: theme.palette.background.paper,
						borderRadius: theme.spacing(1),
						padding: 1,
						opacity: popupOpen ? 1 : 0,
						transition: "opacity 0.2s",
						alignItems: "flex-end",
					}}
					elevation={4}>
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
						<FlexSquare
							row="top"
							selected={airEnabled}
							onClick={() => setAirEnabled((oldState) => !oldState)}
							color="#AA44AA"
							selectedColor="#882288"
							text="Air Quality"
							Icon={AirIcon}
						/>
					</Stack>
					<Stack gap={1} direction="row">
						{styles.map((style) => (
							<FlexSquare
								key={style.id}
								selected={selectedStyle === style.id}
								onClick={() => setStyle(style.id)}
								color={style.color}
								text={style.text}
								lines={style.lines}
								Icon={style.Icon}
							/>
						))}
					</Stack>
				</Paper>
				<div>
					<Paper
						onClick={() => {
							setPopupOpen((wasOpen) => !wasOpen);
						}}
						elevation={4}
						sx={{
							borderRadius: theme.spacing(1),
							boxSizing: "border-box",
							outline: "2px solid #FFFFFF",
							width: "76px",
							height: "76px",
							marginLeft: "auto",
						}}>
						<Paper
							sx={{
								backgroundColor: theme.palette[selectedStyleDetails.color].main,
								transition: "background-color 0.5s",
								width: "76px",
								height: "76px",
								borderRadius: theme.spacing(1),
								position: "relative",
								boxShadow: "rgb(0 0 0 / 73%) 0px -40px 30px -30px inset",
								pointerEvents: "auto",
							}}>
							<Stack
								direction={onBigScreen ? "row" : "column"}
								alignItems="center"
								justifyContent="center"
								gap={0.3}
								sx={{
									position: "absolute",
									bottom: 4,
									left: -1,
									textAlign: "center",
									width: "100%",
									color: "white",
								}}>
								<LayersOutlinedIcon
									sx={{
										fontSize: "1.5em",
									}}
								/>
								<Typography variant="caption">Layers</Typography>
							</Stack>
						</Paper>
					</Paper>
				</div>
			</Stack>
		</ClickAwayListener>
	);
}
