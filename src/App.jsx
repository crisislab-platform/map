import * as React from "react";

import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Drawer from "@mui/material/Drawer";
import MapContext from "./MapContext";
import Routes from "./Routes";
import Search from "./Search";
import SensorsContext from "./SensorsContext";
import { ThemeProvider } from "@mui/material";
import Typography from "@mui/material/Typography";
import setupGeoJSON from "./setupGeoJSON";
import { theme } from "./theme.js";
import { useNavigate } from "react-router-dom";

const Map = React.lazy(() => import("./Map"));

const drawerWidth = 500;

export default function App() {
	const [sensors, setSensors] = React.useState([]);
	const [map, setMap] = React.useState(null);
	const [mapLoaded, setMapLoaded] = React.useState(false);
	const navigate = useNavigate();

	React.useEffect(() => {
		(async () => {
			const res = await fetch("https://internship-worker.benhong.workers.dev/v0/sensors");
			const data = await res.json();
			const newSensors = {};
			Object.values(data.sensors).forEach((sensor) => {
				if (sensor.latitude && sensor.longitude) {
					newSensors[sensor.id] = sensor;
				}
			});
			setSensors(newSensors);
		})();
	}, []);

	// React.useEffect(() => {
	//   if (map)
	//     for (const sensor of Object.values(sensors)) {
	//       const markerElement = document.createElement("div");
	//       markerElement.setAttribute("title", `Sensor #${sensor.id}`);
	//       markerElement.classList.add("crisislab-sensor-marker");
	//       if ("online" in sensor) {
	//         if (sensor.online === true) {
	//           markerElement.classList.add("online");
	//         } else if (sensor.online === false) {
	//           markerElement.classList.add("offline");
	//         }
	//       }
	//       markerElement.onclick = () => {
	//         map?.flyTo({
	//           center: [sensor.longitude, sensor.latitude],
	//           zoom: 16,
	//           speed: 1.4,
	//           curve: 1,
	//         });
	//         navigate(`/sensor/${sensor.id}`);
	//       };

	//       let marker = new Marker({
	//         element: markerElement,
	//         anchor: "bottom",
	//       });
	//       marker.setLngLat([sensor.longitude, sensor.latitude]);
	//       marker.addTo(map);
	//     }
	// }, [sensors, map]);

	React.useEffect(() => {
		if (mapLoaded && sensors && Object.keys(sensors).length) {
			// Construct geoJSON
			const geoJSON = {
				type: "FeatureCollection",
				features: Object.values(sensors).map((sensor) => ({
					type: "Feature",
					geometry: {
						type: "Point",
						coordinates: [sensor.longitude, sensor.latitude],
					},
					properties: {
						id: sensor.id,
						color: "online" in sensor ? (sensor.online ? "#157f1f" : "#d00000") : "#11b4da",
						border: "online" in sensor ? (sensor.online ? "#55d02e" : "#ff7a7a") : "#ffffff",
					},
				})),
			};

			return setupGeoJSON(map, geoJSON, (e) => {
				const coordinates = e.features[0].geometry.coordinates.slice();

				// Ensure that if the map is zoomed out such that
				// multiple copies of the feature are visible, the
				// popup appears over the copy being pointed to.
				while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
					coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
				}

				map?.flyTo({
					center: [coordinates[0], coordinates[1]],
					zoom: 17,
					speed: 1.4,
					curve: 1,
				});

				navigate(`/sensor/${e.features[0].properties.id}`);
			});
		}
	}, [mapLoaded, sensors]);

	return (
		<ThemeProvider theme={theme}>
			<SensorsContext.Provider value={[sensors, setSensors]}>
				<MapContext.Provider value={[map, setMap, mapLoaded, setMapLoaded]}>
					<Box
						sx={{
							display: "flex",
							position: "absolute",
							top: 0,
							bottom: 0,
							left: 0,
							right: 0,
						}}>
						<CssBaseline />
						<Drawer
							sx={{
								width: drawerWidth,
								flexShrink: 0,
								"& .MuiDrawer-paper": {
									width: drawerWidth,
									boxSizing: "border-box",
								},
							}}
							variant="permanent"
							anchor="left">
							<Search />

							<Routes />
						</Drawer>

						<Box
							component="main"
							sx={{
								flexGrow: 1,
								bgcolor: "background.default",
								p: 3,
								position: "relative",
								height: "100%",
							}}>
							<React.Suspense
								fallback={
									// div with text in middle
									<div
										style={{
											position: "absolute",
											top: 0,
											bottom: 0,
											left: 0,
											right: 0,
											backgroundColor: "#78bced",
											display: "flex",
											justifyContent: "center",
											alignItems: "center",
										}}>
										<Typography variant="h5" style={{ color: "white" }}>
											Loading map...
										</Typography>
									</div>
								}>
								<Map />
							</React.Suspense>
						</Box>
					</Box>
				</MapContext.Provider>
			</SensorsContext.Provider>
		</ThemeProvider>
	);
}
