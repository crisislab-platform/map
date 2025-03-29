import { Box, Button, Drawer, Fade, Grow, IconButton, InputAdornment, Stack, Tooltip } from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import MapIcon from "@mui/icons-material/Map";
import PermDataSettingIcon from "@mui/icons-material/PermDataSetting";
import SearchAndDataIcon from "@mui/icons-material/Troubleshoot";
import { useContext } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { DrawerOpenContext } from "../contexts/DrawerOpenContext";
import Routes from "../Routes/index";
import { setCustomAPIOrigin, useOnBigScreen } from "../utils";
import SearchBar from "./SearchBar";

import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

const desktopDrawerWidth = 500;

export default function Sidebar() {
	const location = useLocation();
	const onBigScreen = useOnBigScreen();
	const { drawerOpen, setDrawerOpen } = useContext(DrawerOpenContext);
	const onHomePage = location.pathname.trim().slice(1) == "";

	function onDrawerClose() {
		setDrawerOpen(false);
	}

	function onDrawerOpen() {
		setDrawerOpen(true);
	}

	return (
		<>
			{!onBigScreen && (
				<Button
					variant="contained"
					size="small"
					startIcon={<SearchAndDataIcon />}
					onClick={onDrawerOpen}
					sx={{
						zIndex: (theme) => theme.zIndex.drawer - 1,
						position: "fixed",
						top: (theme) => theme.spacing(1),
						left: (theme) => theme.spacing(1),
					}}>
					Search & Live data
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

				<SearchBar
					backButton={
						!onHomePage && (
							<InputAdornment position="start">
								<Grow in={!onHomePage} style={{ transformOrigin: "left" }}>
									<Tooltip title="Home" placement="bottom">
										<IconButton component={RouterLink} to="/" aria-disabled={onHomePage}>
											<ArrowBackIcon />
										</IconButton>
									</Tooltip>
								</Grow>
							</InputAdornment>
						)
					}
				/>

				<Fade in key={location.pathname}>
					<Box sx={{ height: "100%" }}>
						<Routes />
					</Box>
				</Fade>

				<Stack direction="row" gap={1} sx={{ ml: 1, mt: "auto" }}>
					<Tooltip title="Change API origin">
						<IconButton onClick={setCustomAPIOrigin} size="small">
							<PermDataSettingIcon />
						</IconButton>
					</Tooltip>
					<Tooltip title="Admin panel">
						<IconButton href="https://admin.crisislab.org.nz/auth" target="_blank" size="small">
							<AdminPanelSettingsIcon />
						</IconButton>
					</Tooltip>
				</Stack>
			</Drawer>
		</>
	);
}
