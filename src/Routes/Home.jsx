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
						{/* <Typography
							variant="h4"
							sx={{
								fontWeight: 400,
							}}>
							EEW Experimental Sensor Network
						</Typography> */}
						<Typography
							variant="h5"
							sx={{
								fontWeight: 500,
								lineHeight: "1.2em",
							}}>
							Experimental ground motion detection sensor network
						</Typography>
					</Box>
					<Typography
						variant="body1"
						sx={{
							marginTop: 2,
						}}>
						This map is the public-facing web interface of the CRISiSLab’s experimental ground motion detection sensor network consisting of Micro Electro Mechanical Senor (MEMS) based low-cost sensors. The map is capable of providing access to real-time ground motion data captured at the sensor nodes and sensor metadata.

						These sensors are deployed in people’s homes and contribute to creating a peer-to-peer sensor network capable of node-level processing of ground motion data to generate warnings for earthquakes. In addition to the  MEMS-based low-cost ground motion detection sensor layer, this map also consists of a layer of various faultlines within New Zealand as well as a layer showing the location of ground motion sensors deployed for the GeoNet.
					</Typography>
					<Typography
						variant="h6"
						sx={{
							marginTop: 2,
							fontWeight: 600,
							lineHeight: "1.4em",
						}}>
						Network status:
					</Typography>
					<Typography
						variant="body1"
						sx={{ display: "flex", alignItems: "center" }}>

						<span style={{
							backgroundColor: 'green',
							borderRadius: '50%',
							height: '1rem',
							width: '1rem',
							display: 'inline-block',
							marginBottom: '-0.1rem',
							marginRight: '5px'
						}} />
						Online: {sensors && Object.values(sensors).filter(s => s.online).length}
					</Typography>
					<Typography
						variant="body1"
						sx={{ display: "flex", alignItems: "center" }}>

						<span style={{
							backgroundColor: 'red',
							borderRadius: '50%',
							height: '1rem',
							width: '1rem',
							display: 'inline-block',
							marginBottom: '-0.1rem',
							marginRight: '5px'
						}} />
						Offline: {sensors && Object.values(sensors).filter(s => !s.online).length}
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
