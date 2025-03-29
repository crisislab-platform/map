import { createTheme, StyledEngineProvider, ThemeProvider } from "@mui/material";
import { theme } from "beryllium";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Enable CSS variables in the theme in typescript
import type {} from "@mui/material/themeCssVarsAugmentation";

const root = createRoot(document.getElementById("root") as HTMLElement);

const themeFr = createTheme({
	// Use custom prefix for CSS variables
	cssVariables: { cssVarPrefix: "cl" },
	// Dark colours don't work well with the map or the graphing
	colorSchemes: { light: true, dark: false },

	...theme,

	components: {
		...theme.components,
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: "capitalize",
				},
			},
		},
		MuiButtonBase: {
			styleOverrides: {
				root: {
					textTransform: "capitalize",
				},
			},
		},
		MuiToggleButton: {
			styleOverrides: {
				root: {
					textTransform: "capitalize",
				},
			},
		},
		MuiTypography: {
			styleOverrides: {
				button: {
					textTransform: "capitalize",
				},
			},
		},
	},
});

root.render(
	<React.StrictMode>
		<StyledEngineProvider injectFirst>
			<ThemeProvider theme={themeFr}>
				<BrowserRouter>
					<App />
				</BrowserRouter>
			</ThemeProvider>
		</StyledEngineProvider>
	</React.StrictMode>,
);
