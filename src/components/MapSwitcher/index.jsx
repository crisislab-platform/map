import { Box, ButtonBase, Typography, Paper, useTheme, Stack } from "@mui/material";
// import FlexSquare from "../FlexSquare";
import MapContext from "../../MapContext";
import { useContext, useState } from "react";
// import Styles from "./Switcher.module.css";
const FlexSquare = (props) => (
	<ButtonBase
		{...props}
		elevation={0}
		style={{
			width: 55,
			position: "inline",
			borderRadius: 12,
			margin: 4,
			position: "relative",
			backgroundColor: "none",
			...props.style,
		}}>
		<div
			style={{
				boxSizing: "border-box",
				outline: "2px solid #FFFFFF",
				outlineColor: props.selected ? "#1a73e8" : "transparent",
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
					borderRadius: 6,
					boxSizing: "border-box",
					outlineColor: props.selected ? "#FFFFFF" : "transparent",
					outline: "4px solid transparent",
					borderRadius: 10,
					outlineOffset: -4,
					transition: "outline-color 0.5s",
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

function Switcher(props) {
	const [map] = useContext(MapContext);

	const [hasFocus, setHasFocus] = useState(false);
	const [rendered, setRendered] = useState(false);
	const [selectedStyle, setSelectedStyle] = useState("streets-v11");

	const styles = [
		{ text: "Streets", color: "pink", id: "streets-v11" },
		{ text: "Satellite", color: "blue", id: "satellite-v9" },
		// {
		// 	text: "Satellite streets",
		// 	color: "blue",
		// 	id: "satellite-streets-v11",
		// 	lines: 2,
		// },
		{ text: "Outdoors", color: "green", id: "outdoors-v11" },
		// { text: "Light", color: "yellow", id: "light-v10" },
		{ text: "Dark", color: "black", id: "dark-v10" },
	];

	const selectedStyleDetails = styles.find((style) => style.id === selectedStyle);

	function setStyle(style) {
		map?.setStyle("mapbox://styles/mapbox/" + style);
		setSelectedStyle(style);
	}

	return (
		<Stack
			sx={{
				position: "absolute",
				bottom: 35,
				right: 20,
				width: "100%",
				pointerEvents: hasFocus ? "auto" : "none",
			}}
			direction="row"
			justifyContent="flex-end"
			alignItems="center"
			spacing={2}
			onMouseEnter={() => setHasFocus(true)}
			onFocus={() => setHasFocus(true)}
			onMouseLeave={() => setHasFocus(false)}>
			<Paper
				sx={{
					// width: 300,
					height: "80px",
					display: "inline-block",
					// zIndex: 999,
					backgroundColor: "white",
					borderRadius: 4,
					padding: 0.5,
					paddingBottom: 2,
					opacity: hasFocus ? 1 : 0,
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
			</Paper>

			<Paper
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
					<Typography
						variant="caption"
						style={{
							position: "absolute",
							bottom: "1px",
							textAlign: "center",
							width: "100%",
							color: "white",
						}}>
						{selectedStyleDetails.text}
					</Typography>
				</Paper>
			</Paper>
		</Stack>
	);
}

export default Switcher;
