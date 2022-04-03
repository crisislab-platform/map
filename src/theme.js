import createShadows from "./shadows.js";
import { createTheme, responsiveFontSizes } from "@mui/material";

let theme = createTheme({
	palette: {
		primary: {
			main: "#1162A1",
		},
		secondary: {
			main: "#5ECAEB",
		},
		info: {
			main: "#30B7FF",
		},
		success: {
			main: "#157F1F",
		},
		warning: {
			main: "#FF7700",
		},
		error: {
			main: "#D00000",
		},
	},
	typography: {
		fontFamily: "Roboto Slab, serif",
	},
});
const shadowColour = theme.palette.primary.main;
theme = {
	...theme,
	shadows: createShadows(shadowColour),
};

theme = responsiveFontSizes(theme, { breakpoints: ["sm", "md", "lg", "xl"], factor: 4 });

export { theme };
