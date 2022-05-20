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

const styles = [
	{ text: "Streets", colour: "primary", id: "streets", Icon: StraightIcon },
	{ text: "Satellite", colour: "secondary", id: "satellite", Icon: SatelliteAltIcon },
	{ text: "Outdoors", colour: "success", id: "outdoors", Icon: MapIcon },
];

const squareSize = 50;

function FlexSquare(props) {
	const theme = useTheme();

	const colour = theme.palette[props.colour].main;

	return (
		<Tooltip title={props.text} placement="top">
			<ButtonBase
				onClick={props.onClick}
				elevation={0}
				sx={{
					width: squareSize,
					height: squareSize,
					borderRadius: theme.spacing(1),
					backgroundColor: "none",
					...props.style,
				}}>
				<Paper
					sx={{
						backgroundColor: colour,
						width: squareSize,
						height: squareSize,
						border: `4px solid ${props.selected ? theme.palette[props.colour].dark : "transparent"}`,
						transition: "border 0.5s",
						display: "grid",
						placeItems: "center",
					}}
					elevation={0}>
					<props.Icon sx={{ display: "block", color: "white" }} />
				</Paper>
			</ButtonBase>
		</Tooltip>
	);
}

export default function Switcher() {
	const [map] = useContext(MapContext);
	const theme = useTheme();
	const onBigScreen = useMediaQuery((theme) => theme.breakpoints.up("lg"));
	const [popupOpen, setPopupOpen] = useState(false);
	const [selectedStyle, setSelectedStyle] = useState("streets-v11");
	const [faultLinesEnabled, setFaultLinesEnabled] = useState(false);

	function setStyle(style) {
		map?.setStyle("mapbox://styles/mapbox/" + style);
		setSelectedStyle(style);
	}

	function showFaultLines(show) {
		if (map && map.loaded && map.getLayer("fault-lines-layer")) {
			map.setLayoutProperty("fault-lines-layer", "visibility", show ? "visible" : "none");
		}
	}
	function showFaultLineLabels(show) {
		if (map && map.loaded && map.getLayer("fault-lines-labels-layer")) {
			map.setLayoutProperty("fault-lines-labels-layer", "visibility", show ? "visible" : "none");
		}
	}

	if (faultLinesEnabled) {
		showFaultLines(true);
	} else {
		showFaultLines(false);
		showFaultLineLabels(false);
	}
	function onFaultLinesShow() {
		showFaultLineLabels(true);
		if (map && map.loaded) {
			map.setPaintProperty("fault-lines-layer", "line-width", [
				"interpolate",
				["linear"],
				["zoom"],
				5,
				4,
				18,
				16,
			]);
		}
	}
	function onFaultLinesHide() {
		showFaultLineLabels(false);
		if (map && map.loaded) {
			map.setPaintProperty("fault-lines-layer", "line-width", [
				"interpolate",
				["linear"],
				["zoom"],
				5,
				2,
				18,
				12,
			]);
		}
	}

	function onFaultLinesClick() {
		if (map && map.loaded && map.getLayer("fault-lines-labels-layer")) {
			if (map.getLayoutProperty("fault-lines-labels-layer", "visibility") === "visible") {
				onFaultLinesShow();
			} else {
				onFaultLinesHide();
			}
		}
	}

	function setupFaultLines() {
		if (map && map.loaded) {
			map.on("mouseenter", "fault-lines-layer", onFaultLinesShow);
			map.on("mouseleave", "fault-lines-layer", onFaultLinesHide);
			map.on("click", "fault-lines-layer", onFaultLinesClick);
			return () => {
				map.off("mouseenter", "fault-lines-layer", onFaultLinesShow);
				map.off("mouseleave", "fault-lines-layer", onFaultLinesHide);
				map.off("click", "fault-lines-layer", onFaultLinesClick);
			};
		}
	}

	useEffect(() => {
		const faultLinesCleanup = setupFaultLines();
		map;
		return () => {
			if (faultLinesCleanup) {
				faultLinesCleanup();
			}
		};
	}, [map, faultLinesEnabled, selectedStyle]);

	const selectedStyleDetails = styles.find((style) => style.id === selectedStyle);

	function setStyle(style) {
		map?.setStyle("mapbox://styles/mapbox/" + style);
		setSelectedStyle(style);
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
				}}
				direction={onBigScreen ? "row" : "column"}
				justifyContent="flex-end"
				alignItems="center"
				spacing={2}
				onMouseEnter={onPopupOpen}
				onMouseLeave={onPopupClose}
				onFocus={onPopupOpen}
				onBlur={onPopupClose}>
				<Paper
					sx={{
						display: "flex",
						flexDirection: onBigScreen ? "row" : "column",
						gap: 1,
						backgroundColor: theme.palette.background.paper,
						borderRadius: theme.spacing(1),
						padding: 1,
						opacity: popupOpen ? 1 : 0,
						transition: "opacity 0.2s",
					}}
					elevation={4}>
					{styles.map((style) => (
						<FlexSquare
							key={style.id}
							selected={selectedStyle === style.id}
							onClick={() => setStyle(style.id)}
							colour={style.colour}
							text={style.text}
							lines={style.lines}
							Icon={style.Icon}
						/>
					))}
					<FlexSquare
						selected={faultLinesEnabled}
						onClick={() => setFaultLinesEnabled((oldState) => !oldState)}
						colour="error"
						text="Fault lines"
						Icon={BoltIcon}
					/>
				</Paper>

				<Paper
					onClick={() => {
						setPopupOpen((wasOpen) => !wasOpen);
					}}
					elevation={4}
					sx={{
						borderRadius: theme.spacing(1),
						boxSizing: "border-box",
						outline: "2px solid #FFFFFF",
					}}>
					<Paper
						sx={{
							backgroundColor: theme.palette[selectedStyleDetails.colour].main,
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
			</Stack>
		</ClickAwayListener>
	);
}
