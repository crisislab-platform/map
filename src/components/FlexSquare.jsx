import { ButtonBase, Paper, Typography } from "@mui/material";

const FlexSquare = (props) => (
	<ButtonBase
		{...props}
		elevation={0}
		style={{
			flexGrow: 1,
			flexShrink: 0,
			borderRadius: 8,
			position: "relative",
			backgroundColor: "none",
			...props.style,
		}}>
		<div
			style={{
				outline: "2px solid #FFFFFF",
				outlineColor: props.selected ? "#1a73e8" : "transparent",
				transition: "outline-color 0.5s",
				padding: "2px",
				borderRadius: 8,
				width: "100%",
			}}>
			<Paper
				style={{
					backgroundColor: props.color,
					width: "100%",
					paddingBottom: "100%",
					borderRadius: 6,
				}}
				elevation={0}
			/>
		</div>
		<Typography
			variant="body1"
			style={{
				width: "100%",
				lineHeight: "1em",
				position: "absolute",
				bottom: -1.2 - (props.lines || 0) * 0.5 + "em",
				textAlign: "center",
			}}>
			{props.text}
		</Typography>
	</ButtonBase>
);

export default FlexSquare;
