import "./index.css";

import App from "./App";
import { BrowserRouter } from "react-router-dom";
import React from "react";
import { createRoot } from "react-dom/client";
import { StyledEngineProvider } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material";
import { theme } from "beryllium";

const root = createRoot(document.getElementById("root") as HTMLElement);

root.render(
	<React.StrictMode>
		<StyledEngineProvider injectFirst>
			<ThemeProvider theme={theme}>
				<BrowserRouter>
					<App />
				</BrowserRouter>
			</ThemeProvider>
		</StyledEngineProvider>
	</React.StrictMode>,
);
