import { ButtonBase, ClickAwayListener, Paper, Stack, Typography, useMediaQuery } from "@mui/material";
import { useContext, useEffect, useState } from "react";

import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import MapContext from "../../MapContext";

function FlexSquare(props) {
	return (
		<ButtonBase
			onClick={props.onClick}
			elevation={0}
			style={{
				width: 55,
				borderRadius: 12,
				margin: 4,
				position: "relative",
				backgroundColor: "none",
				...props.style,
			}}>
			<div
				style={{
					boxSizing: "border-box",
					outline: `2px solid ${props.selected ? "#1a73e8" : "transparent"}`,
					transition: "outline-color 0.5s",
					padding: "2px",
					borderRadius: 12,
					outlineOffset: -4,
					width: "100%",
				}}>
				<Paper
					style={{
						backgroundColor: props.color,
						width: "100%",
						paddingBottom: "100%",
						boxSizing: "border-box",
						outline: `4px solid ${props.selected ? "#FFFFFF" : "transparent"}`,
						borderRadius: 10,
						outlineOffset: -4,
						transition: "outline 0.5s",
					}}
					elevation={0}
				/>
			</div>
			<Typography
				variant="caption"
				style={{
					width: "100%",
					lineHeight: "1em",
					position: "absolute",
					bottom: -1 - (props.lines || 0) * 0.5 + "em",
					textAlign: "center",
				}}>
				{props.text}
			</Typography>
		</ButtonBase>
	);
}

export default function Switcher() {
	const [map] = useContext(MapContext);
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
	function onMouseEnter() {
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
	function onMouseLeave() {
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

	useEffect(() => {
		if (map && map.loaded) {
			map.on("mouseenter", "fault-lines-layer", onMouseEnter);
			map.on("mouseleave", "fault-lines-layer", onMouseLeave);

			return () => {
				map.off("mouseenter", "fault-lines-layer", onMouseEnter);
				map.off("mouseleave", "fault-lines-layer", onMouseLeave);
			};
		}
	}, [map, faultLinesEnabled, selectedStyle]);

	const styles = [
		{ text: "Streets", color: "pink", id: "streets-v11" },
		{ text: "Satellite", color: "blue", id: "satellite-v9" },
		{ text: "Outdoors", color: "green", id: "outdoors-v11" },
		{ text: "Dark", color: "black", id: "dark-v10" },
	];

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
						// height: "80px",
						display: "flex",
						flexDirection: onBigScreen ? "row" : "column",
						gap: onBigScreen ? 1 : 2,
						backgroundColor: "white",
						borderRadius: 3,
						padding: 0.5,
						paddingBottom: 2,
						opacity: popupOpen ? 1 : 0,
						transition: "opacity 0.2s",
					}}
					elevation={4}>
					{styles.map((style) => (
						<FlexSquare
							key={style.id}
							selected={selectedStyle === style.id}
							onClick={() => setStyle(style.id)}
							color={style.color}
							text={style.text}
							lines={style.lines}
						/>
					))}
					<FlexSquare
						selected={faultLinesEnabled}
						onClick={() => setFaultLinesEnabled((oldState) => !oldState)}
						color="red"
						text="Fault lines"
					/>
				</Paper>

				<Paper
					onClick={() => {
						setPopupOpen((wasOpen) => !wasOpen);
					}}
					elevation={4}
					style={{
						borderRadius: 10,
						boxSizing: "border-box",
						outline: "2px solid #FFFFFF",
					}}>
					<Paper
						style={{
							backgroundColor: selectedStyleDetails.color,
							transition: "background-color 0.5s",
							width: "76px",
							height: "76px",
							borderRadius: 10,
							position: "relative",
							boxShadow: "rgb(0 0 0 / 73%) 0px -40px 30px -30px inset",
							pointerEvents: "auto",
						}}>
						<Stack
							direction="row"
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
								style={{
									fontSize: "1.5em",
									// position: "relative",
									// top: "0.3em",
									// lineHeight: "50px",
									// display: "inline-block",
								}}
							/>
							<Typography variant="caption" style={{}}>
								Layers
							</Typography>
						</Stack>
					</Paper>
				</Paper>
			</Stack>
		</ClickAwayListener>
	);
}
