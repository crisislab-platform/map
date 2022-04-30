import { Drawer, IconButton, Stack, Tooltip, useMediaQuery } from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import { Box, Typography } from "@mui/material";
import Routes from "./Routes/index.jsx";
import Search from "./Search.jsx";
import { useState } from "react";

const desktopDrawerWidth = 500;

export default function Sidebar() {
	const onBigScreen = useMediaQuery((theme) => theme.breakpoints.up("md"));
	const [drawerOpen, setDrawerOpen] = useState(false);

	function onDrawerClose() {
		setDrawerOpen(false);
	}

	return (
		<>
			{!onBigScreen && (
				<Tooltip title="Open sidebar" placement="right">
					<IconButton
						onClick={() => setDrawerOpen((oldState) => !oldState)}
						sx={{
							zIndex: (theme) => theme.zIndex.drawer - 1,
							position: "fixed",
							top: (theme) => theme.spacing(1),
							left: (theme) => theme.spacing(1),
						}}>
						<MenuIcon stroke="white" fill="black" />
					</IconButton>
				</Tooltip>
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
					<Stack p={1}>
						<Tooltip title="Close sidebar" placement="left">
							<IconButton onClick={onDrawerClose} sx={{ ml: "auto" }}>
								<CloseIcon />
							</IconButton>
						</Tooltip>
					</Stack>
				)}
				{/* <img
					src="/crisis_lab_i_small.png"
					style={{ height: 100, width: 150, marginTop: 20, marginLeft: 20 }}></img> */}
				{/* <Box sx={{ display: "flex", gap: 3, marginTop: 3, marginInline: 4 }}>
					<img src="/crisis_lab_i_small.png" style={{ height: 80, width: 120 }}></img>
					<Typography
						variant="h4"
						sx={{
							fontWeight: "bold",
							fontWeight: 400,
						}}>
						EEW Experimental Sensor Network
					</Typography>
				</Box> */}
				<Search />
				<Routes />
			</Drawer>
		</>
	);
}
