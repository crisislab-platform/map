import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";

import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SensorsContext from "../SensorsContext";
import { useContext } from "react";

export default function Home() {
	const [sensors] = useContext(SensorsContext);

	return (
		<Stack sx={{ px: 2, height: "100%" }}>
			<Box sx={{ display: "flex", gap: 3 }}>
				<img src="/crisis_lab_i_small.png" alt="CRISiSLab logo" style={{ height: 80, width: 120 }} />
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
					paddingTop: 4,
				}}>
				This interactive map shows CRISiSLab’s experimental ground motion detection network of Micro Electro
				Mechanical Sensor (MEMS) based low-cost sensors. It provides access to real-time ground motion data
				captured at each sensor. These sensors are deployed in people’s homes and make up our peer-to-peer
				sensor network capable of processing ground motion data at the sensor to generate earthquake warnings.
				This map also has layers showing faultlines in New Zealand and GeoNet ground motion sensors.
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
			<Typography variant="body1" sx={{ display: "flex", alignItems: "center" }}>
				<span
					style={{
						backgroundColor: "green",
						borderRadius: "50%",
						height: "1rem",
						width: "1rem",
						display: "inline-block",
						marginBottom: "-0.1rem",
						marginRight: "5px",
					}}
				/>
				Online: {sensors && Object.values(sensors).filter((s) => s.online).length}
			</Typography>
			<Typography variant="body1" sx={{ display: "flex", alignItems: "center" }}>
				<span
					style={{
						backgroundColor: "red",
						borderRadius: "50%",
						height: "1rem",
						width: "1rem",
						display: "inline-block",
						marginBottom: "-0.1rem",
						marginRight: "5px",
					}}
				/>
				Offline: {sensors && Object.values(sensors).filter((s) => !s.online).length}
			</Typography>
			<Box sx={{ mt: "auto" }}>
				<Typography variant="h6" sx={{ marginTop: "5vh", mb: 2, textAlign: "center" }}>
					Supported By
				</Typography>

				<Box sx={{ display: "flex", justifyContent: "space-evenly" }}>
					<img style={{ height: 40 }} alt="EQC logo" title="EQC Toka Tū Ake" src="/new_eqc.svg" />
					<img style={{ height: 40 }} alt="Massey logo" title="Massey University" src="/massey_logo.svg" />
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
	);
}
