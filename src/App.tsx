import { Box, CssBaseline, Typography } from "@mui/material";
import React, { Suspense, useEffect, useState } from "react";
import { Map as MapboxMap, Popup } from "mapbox-gl";
import MapContext from "./MapContext";
import MapSwitcher from "./MapSwitcher";
import SensorsContext, { Sensor } from "./SensorsContext";
import Sidebar from "./Sidebar.jsx";
import { createPortal } from "react-dom";
import setupMap from "./setupMap";
import { useNavigate } from "react-router-dom";

const MapComponent = React.lazy(() => import("./Map"));

const managementAPIOrigin = "https://shakenet-manager.viggers.workers.dev";

function PopupComponent({ activeSensor, sensors }: { [x: string]: any }) {
	if (!document.getElementById("popup")) {
		return null;
	}

	// Is geonet sensor
	if (activeSensor.SensorType) {
		const { SensorType, Station, Location } = activeSensor;
		const portal = createPortal(
			<Box>
				<Typography
					variant="h5"
					sx={{
						fontWeight: "bold",
					}}>
					GeoNet Sensor
				</Typography>
				<Typography variant="h6">Type: {SensorType}</Typography>
				<Typography variant="body1">
					Station: {Station} • Start: {new Date(activeSensor.Start).toDateString()}
				</Typography>
			</Box>,
			document.getElementById("popup") as HTMLElement,
		);

		return portal;
	}

	const { publicGeoFeatures, id, online, type, secondary_id, timestamp } = sensors[activeSensor];

	let location = null;

	if (publicGeoFeatures) {
		const streetName = publicGeoFeatures.text;
		const locality = publicGeoFeatures.context[1].text;
		const region = publicGeoFeatures.context[3].text;
		location = `${streetName}, ${locality}, ${region}`;
	}

	const portal = createPortal(
		<Box>
			<Typography
				variant="h5"
				sx={{
					fontWeight: "bold",
				}}>
				{secondary_id || "#" + id}
			</Typography>
			<Typography variant="body1">{`${online ? "Online" : "Offline"}${type ? ` • ${type}` : ""}`}</Typography>
			{!online && timestamp && (
				<Typography variant="body1">
					Last online: {`${new Date(timestamp).toDateString()} ${new Date(timestamp).toLocaleTimeString()}`}
				</Typography>
			)}
		</Box>,
		document.getElementById("popup") as HTMLElement,
	);

	return portal;
}

export default function App() {
	const [sensors, setSensors] = useState<Record<number, Sensor>>({});
	const [map, setMap] = useState<MapboxMap>();
	const [mapLoaded, setMapLoaded] = useState(false);
	const [activeSensor, setActiveSensor] = useState(null);
	const [rerenderTrigger, setRerenderTrigger] = useState(0);
	const [popup, setPopup] = useState<Popup>();

	const triggerRerender = () => setRerenderTrigger((a) => a + 1);

	const navigate = useNavigate();

	useEffect(() => {
		(async () => {
			const res = await fetch(`${managementAPIOrigin}/api/v0/sensors`);
			const data = await res.json();
			const newSensors: Record<number, Sensor> = {};
			Object.values(data.sensors as Partial<Sensor>[]).forEach((sensor) => {
				if (sensor.publicLocation && sensor.publicGeoFeatures) {
					newSensors[sensor.id!] = sensor as Sensor;
				}
			});
			setSensors(newSensors);
		})();
	}, []);

	useEffect(() => {
		if (map && mapLoaded && sensors && Object.keys(sensors).length) {
			// Construct geoJSON
			const geoJSON = {
				type: "FeatureCollection",
				features: Object.values(sensors).map((sensor) => ({
					type: "Feature",
					geometry: {
						type: "Point",
						coordinates: sensor.publicLocation,
					},
					properties: {
						id: sensor.id,
						color: "online" in sensor ? (sensor.online ? "#157f1f" : "#d00000") : "#11b4da",
						border: "online" in sensor ? (sensor.online ? "#55d02e" : "#ff7a7a") : "#ffffff",
					},
				})),
			};

			let teardown = () => {};

			setupMap(
				map,
				geoJSON,
				(e) => {
					const coordinates = e?.features?.[0].geometry.coordinates.slice();

					// Ensure that if the map is zoomed out such that
					// multiple copies of the feature are visible, the
					// popup appears over the copy being pointed to.
					while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
						coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
					}

					map?.flyTo({
						center: [coordinates[0], coordinates[1]],
						zoom: Math.max(map?.getZoom(), 17),
						// speed: 0.2,
						curve: 1,
					});

					navigate(`/sensor/${e?.features?.[0]?.properties?.id}`);
				},
				popup,
				setActiveSensor,
				triggerRerender,
			).then((t) => (teardown = t));

			return teardown;
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
							<MapComponent setPopup={setPopup} />
						</Suspense>
					</Box>
					<MapSwitcher />
					<PopupComponent activeSensor={activeSensor} sensors={sensors} />
				</Box>
			</MapContext.Provider>
		</SensorsContext.Provider>
	);
}
