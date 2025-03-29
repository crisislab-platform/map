import { Box, Stack, Typography } from "@mui/material";

import { Sensors as SensorsIcon, SensorsOff as SensorsOffIcon } from "@mui/icons-material";
import { useContext, useEffect } from "react";
import MapContext from "../contexts/MapContext";
import SensorsContext from "../contexts/SensorsContext";
import { CENTER_OF_NZ, SHOW_ALL_OF_NZ_ZOOM } from "../Map";
import { flyTo } from "../utils";

export default function Home() {
	const { unfilteredSensors: sensors } = useContext(SensorsContext);
	const { map } = useContext(MapContext);

	useEffect(() => {
		flyTo(map, CENTER_OF_NZ, SHOW_ALL_OF_NZ_ZOOM);
	}, [map]);

	return (
		<Stack sx={{ px: 2, height: "100%", pt: 2 }}>
			<Box sx={{ display: "flex", gap: 3 }}>
				<img src="/crisis_lab_i_small.png" alt="CRISiSLab logo" style={{ height: 80, width: 120 }} />
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
				<SensorsIcon color="success" sx={{ mr: 1 }} />
				Online:{" "}
				{Object.values(sensors).length > 0 ? Object.values(sensors).filter((s) => s.online).length : "--"}
			</Typography>
			<Typography variant="body1" sx={{ display: "flex", alignItems: "center" }}>
				<SensorsOffIcon color="error" sx={{ mr: 1 }} />
				Offline:{" "}
				{Object.values(sensors).length > 0 ? Object.values(sensors).filter((s) => !s.online).length : "--"}
			</Typography>
			<Box sx={{ mt: "auto", mb: 2 }}>
				<Typography variant="h6" sx={{ marginTop: "5vh", pb: 4, textAlign: "center" }}>
					Supported By
				</Typography>

				<Box sx={{ display: "flex", justifyContent: "space-evenly", flexWrap: "wrap", gap: 2 }}>
					<img
						style={{ height: 50 }}
						alt="Natural Hazards Commission logo"
						title="Toka Tū Ake - Natural Hazards Commission"
						src="/nhc-logo.svg"
					/>
					<img style={{ height: 50 }} alt="Massey logo" title="Massey University" src="/massey_logo.svg" />
					{/* <img
						style={{ height: 50 }}
						alt="Resilience to Nature's Challenges logo"
						title="Resilience to Nature's Challenges"
						src="/resilience-to-nature-challenges-logo-brown.svg"
					/> */}
				</Box>
			</Box>
		</Stack>
	);
}
