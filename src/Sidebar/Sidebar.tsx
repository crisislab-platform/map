import { Box, Button, Collapse, Fade, Link, Slide } from "@mui/material";
import { Drawer, IconButton, Stack, Tooltip, useMediaQuery } from "@mui/material";

import MapIcon from "@mui/icons-material/Map";
import SearchIcon from "@mui/icons-material/TravelExplore";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Routes from "../Routes/index";
import SearchBar from "./SearchBar";
import { forwardRef, useState } from "react";
import { theme } from "beryllium";
import { useLocation, Link as RouterLink } from "react-router-dom";

const desktopDrawerWidth = 500;

const HomeLink = forwardRef<HTMLAnchorElement, { onHomePage: boolean }>(({ onHomePage }, ref) => {
	return (
		<Link
			ref={ref}
			sx={{
				ml: 2,
				py: 0.5,
				"&::before": {
					content: `"← "`,
				},
			}}
			component={RouterLink}
			to="/"
			aria-disabled={onHomePage}>
			Home
		</Link>
	);
});

export default function Sidebar() {
	const location = useLocation();
	const onBigScreen = useMediaQuery<typeof theme>((theme) => theme.breakpoints.up("md"));
	const [drawerOpen, setDrawerOpen] = useState(false);

	const onHomePage = location.pathname == "/";

	function onDrawerClose() {
		setDrawerOpen(false);
	}

	return (
		<>
			{!onBigScreen && (
				<Button
					variant="contained"
					size="small"
					startIcon={<SearchIcon />}
					onClick={() => setDrawerOpen((oldState) => !oldState)}
					sx={{
						zIndex: (theme) => theme.zIndex.drawer - 1,
						position: "fixed",
						top: (theme) => theme.spacing(1),
						left: (theme) => theme.spacing(1),
					}}>
					Search
				</Button>
			)}
			<Drawer
				open={onBigScreen ? true : drawerOpen}
				onClose={onDrawerClose}
				sx={{
					width: onBigScreen ? desktopDrawerWidth : "100vw",
					flexShrink: 0,
					"& .MuiDrawer-paper": {
						width: onBigScreen ? desktopDrawerWidth : "100vw",
						boxSizing: "border-box",
					},
				}}
				variant={onBigScreen ? "permanent" : "temporary"}
				anchor="left">
				{!onBigScreen && (
					<Stack pt={1} pr={1} direction="row" alignItems="center">
						<Slide in={!onHomePage} direction="right">
							<HomeLink onHomePage={onHomePage} />
						</Slide>

						<Button
							startIcon={<MapIcon />}
							endIcon={<ArrowForwardIcon />}
							onClick={onDrawerClose}
							sx={{
								ml: "auto",
							}}>
							Show map
						</Button>
					</Stack>
				)}
				{onBigScreen && (
					<Collapse in={!onHomePage}>
						<HomeLink onHomePage={onHomePage} />
					</Collapse>
				)}
				<SearchBar />

				<Fade in key={location.pathname}>
					<Box sx={{ height: "100%" }}>
						<Routes />
					</Box>
				</Fade>
			</Drawer>
		</>
	);
}
