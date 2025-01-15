import { ButtonBase, Icon, PaletteColor, Paper, Stack, Theme, Typography, useTheme } from "@mui/material";

const squareSize = 50;

interface SquareToggleButtonProps {
	color: keyof Theme["palette"];
	text: string;
	onClick: () => void;
	style?: Record<string, any>;
	selected: boolean;
	Icon: typeof Icon;
}

export function SquareToggleButton({ color, text, onClick, style, selected, Icon }: SquareToggleButtonProps) {
	const theme = useTheme();

	const backgroundColour = (theme.palette[color] as PaletteColor)?.main ?? color;

	return (
		<ButtonBase
			onClick={onClick}
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
						backgroundColor: selected ? backgroundColour : "transparent",
						width: squareSize,
						height: squareSize,
						border: `4px solid ${backgroundColour}`,
						transition: "border 0.5s",
						display: "grid",
						placeItems: "center",
						borderRadius: theme.spacing(1),
					}}
					elevation={0}>
					<Icon
						sx={{
							display: "block",
							color: selected ? "white" : backgroundColour,
						}}
					/>
				</Paper>
				<Typography sx={{ fontSize: "8pt" }}>{text}</Typography>
			</Stack>
		</ButtonBase>
	);
}
