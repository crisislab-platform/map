import { Box, Fade, IconButton, Stack, Tooltip, Typography } from "@mui/material";

import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SensorsContext from "../SensorsContext";
import { useContext } from "react";

export default function Home() {
	const [sensors] = useContext(SensorsContext);

	return (
		<Fade in>
			<Stack sx={{ paddingInline: 3, paddingBlock: 2, height: "100%" }}>
				<Box
					sx={{
						paddingInline: 1,
						// paddingBlock: 3,
						// marginTop: 6,
					}}>
					<Box sx={{ display: "flex", gap: 3, marginTop: 4 }}>
						<img src="/crisis_lab_i_small.png" style={{ height: 80, width: 120 }}></img>
						<Typography
							variant="h4"
							sx={{
								fontWeight: 400,
							}}>
							EEW Experimental Sensor Network
						</Typography>
					</Box>
					<Typography
						variant="h5"
						sx={{
							marginTop: 2,
							fontWeight: 600,
							lineHeight: "1.4em",
						}}>
						Sensor Map
					</Typography>
					<Typography
						variant="body1"
						sx={{
							marginTop: 2,
						}}>
						Public facing web interface which provides access to real-time ground motion data and sensor
						metadata.
					</Typography>
					<Typography
						variant="body1"
						sx={{
							marginTop: 2,
							fontWeight: 600,
							lineHeight: "1.4em",
						}}>
						Statistics:
					</Typography>
					<Typography
						variant="body1">
						{sensors && Object.values(sensors).filter(s => s.online).length} out of {sensors && Object.values(sensors).length} sensors are online.
					</Typography>
				</Box>
				<Box sx={{ m: 1, mb: 0, mt: "auto" }}>
					<Typography variant="h6" sx={{ marginTop: "5vh", marginBottom: 1 }}>
						Supported by:
					</Typography>

					<Box sx={{ display: "flex", gap: 3 }}>
						<img src="/eqc_logo.svg" />
						<img style={{ height: 50 }} src="/massey_logo.svg" />
					</Box>
				</Box>
				<span>
					<Tooltip title="Admin panel" placement="right">
						<IconButton href="https://admin.crisislab.org.nz" rel="noopener norefferer">
							<AdminPanelSettingsIcon />
						</IconButton>
					</Tooltip>
				</span>
			</Stack>
		</Fade>
	);
}
