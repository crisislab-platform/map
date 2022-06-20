import { Box, CssBaseline, Typography } from "@mui/material";
import React, { Suspense, useEffect, useState } from "react";

import MapContext from "./MapContext";
import MapSwitcher from "./components/MapSwitcher";
import SensorsContext from "./SensorsContext";
import Sidebar from "./Sidebar.jsx";
import { createPortal } from "react-dom";
import setupMap from "./setupMap";
import { useNavigate } from "react-router-dom";

const Map = React.lazy(() => import("./Map"));

function PopupComponent({ activeSensor, sensors }) {
	if (!document.getElementById("popup")) {
		return null;
	}

	const { geoFeatures, id, online, type, secondary_id } = sensors[activeSensor];

	let location = null;

	if (geoFeatures) {
		const streetName = geoFeatures.text;
		const locality = geoFeatures.context[1].text;
		const region = geoFeatures.context[3].text;
		location = `${streetName}, ${locality}, ${region}`;
	}

	const portal = createPortal(
		<Box>
			<Typography
				variant="h5"
				sx={{
					fontWeight: "bold",
				}}>
				{secondary_id || location}
			</Typography>
			<Typography variant="h6">{secondary_id ? location : null}</Typography>
			<Typography variant="body1">{"ID: " + id + " • " + (online ? "Online" : "Offline") + (type ? " • " + type : "")}</Typography>
		</Box>,
		document.getElementById("popup"),
	);

	console.log("popup", portal);

	return portal;
}

export default function App() {
	const [sensors, setSensors] = useState([]);
	const [map, setMap] = useState(null);
	const [mapLoaded, setMapLoaded] = useState(false);
	const [activeSensor, setActiveSensor] = useState(null);
	const [rerenderTrigger, setRerenderTrigger] = useState(0);
	const [popup, setPopup] = useState(null);

	const triggerRerender = () => setRerenderTrigger((a) => a + 1);

	const navigate = useNavigate();

	useEffect(() => {
		(async () => {
			const res = await fetch("https://internship-worker.benhong.workers.dev/api/v0/sensors");
			const data = await res.json();
			const newSensors = {};
			Object.values(data.sensors).forEach((sensor) => {
				if (sensor.location) {
					newSensors[sensor.id] = sensor;
				}
			});
			setSensors(newSensors);
		})();
	}, []);

	useEffect(() => {
		if (mapLoaded && sensors && Object.keys(sensors).length) {
			// Construct geoJSON
			const geoJSON = {
				type: "FeatureCollection",
				features: Object.values(sensors).map((sensor) => ({
					type: "Feature",
					geometry: {
						type: "Point",
						coordinates: sensor.location,
					},
					properties: {
						id: sensor.id,
						color: "online" in sensor ? (sensor.online ? "#157f1f" : "#d00000") : "#11b4da",
						border: "online" in sensor ? (sensor.online ? "#55d02e" : "#ff7a7a") : "#ffffff",
					},
				})),
			};

			return setupMap(
				map,
				geoJSON,
				(e) => {
					const coordinates = e.features[0].geometry.coordinates.slice();

					// Ensure that if the map is zoomed out such that
					// multiple copies of the feature are visible, the
					// popup appears over the copy being pointed to.
					while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
						coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
					}

					map?.flyTo({
						center: [coordinates[0], coordinates[1]],
						zoom: map?.getZoom() || 17,
						speed: 0.2,
						curve: 1,
					});

					navigate(`/sensor/${e.features[0].properties.id}`);
				},
				popup,
				setActiveSensor,
				triggerRerender,
			);
		}
	}, [mapLoaded, sensors]);

	return (
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
					<Sidebar />

					<Box
						component="main"
						sx={{
							flexGrow: 1,
							bgcolor: "background.default",
							p: 3,
							position: "relative",
							height: "100%",
						}}>
						<Suspense
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
							<Map setPopup={setPopup} />
						</Suspense>
					</Box>
					<MapSwitcher />
					<PopupComponent activeSensor={activeSensor} sensors={sensors} />
				</Box>
			</MapContext.Provider>
		</SensorsContext.Provider>
	);
}
