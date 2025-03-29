import { Box, CssBaseline, Typography } from "@mui/material";
import { Map as MapboxMap, Popup } from "mapbox-gl";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { DrawerOpenContext } from "./contexts/DrawerOpenContext";
import MapContext from "./contexts/MapContext";
import SensorsContext, { Sensor } from "./contexts/SensorsContext";
import MapSwitcher from "./MapSwitcher";
import setupMap from "./setupMap";
import Sidebar from "./Sidebar/Sidebar";
import { APIOrigin, flyTo } from "./utils";

const MapComponent = React.lazy(() => import("./Map"));

function PopupComponent({ activeSensor, sensors }: { [x: string]: any }) {
	if (!activeSensor || !sensors) return null;

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

	const { id, online, type, secondary_id, status_change_timestamp } = sensors[activeSensor] as Sensor;

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
			{!online && status_change_timestamp && (
				<Typography variant="body1">
					Last online:{" "}
					{`${new Date(status_change_timestamp).toDateString()} ${new Date(
						status_change_timestamp,
					).toLocaleTimeString()}`}
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
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [popup, setPopup] = useState<Popup>();
	const [allowOnlineStatus, setAllowOnlineStatus] = useState<"all" | "online" | "offline">("all");

	const triggerRerender = () => setRerenderTrigger((a) => a + 1);

	const navigate = useNavigate();

	const filteredSensors = useMemo(() => {
		if (allowOnlineStatus === "all") return sensors;

		return Object.fromEntries(
			Object.entries(sensors).filter(([id, sensor]) => {
				if (allowOnlineStatus === "online") return sensor.online === true;

				if (allowOnlineStatus === "offline") return sensor.online === false;

				throw "Unrecognised filter value '" + allowOnlineStatus + "' when filtering sensors";
			}),
		);
	}, [sensors, allowOnlineStatus]);

	useEffect(() => {
		(async () => {
			const res = await fetch(`${APIOrigin}/api/v2/sensors`);
			const data = await res.json();
			const newSensors: Record<number, Sensor> = {};
			Object.values(data.sensors as Partial<Sensor>[]).forEach((sensor) => {
				if (sensor.public_location) {
					sensor.safeLocation = { lng: sensor.public_location[0], lat: sensor.public_location[1] };
					newSensors[sensor.id!] = sensor as Sensor;
				}
			});

			setSensors(newSensors);
		})();
	}, []);

	useEffect(() => {
		if (map && mapLoaded && Object.keys(filteredSensors).length > 0) {
			// Construct geoJSON
			const geoJSON = {
				type: "FeatureCollection",
				features: Object.values(filteredSensors).map((sensor) => ({
					type: "Feature",
					geometry: {
						type: "Point",
						coordinates: sensor.public_location,
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
					// @ts-expect-error IDK why it thinks this is broken but it's wrong
					const coordinates = e?.features?.[0]?.geometry?.coordinates?.slice();

					// Ensure that if the map is zoomed out such that
					// multiple copies of the feature are visible, the
					// popup appears over the copy being pointed to.
					while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
						coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
					}

					flyTo(map, coordinates);
					setDrawerOpen(true);
					navigate(`/sensor/${e?.features?.[0]?.properties?.id}`);
				},
				popup,
				setActiveSensor,
				triggerRerender,
				(map) => {
					// On done loading

					const sensorInURL = Number(location.href.match(/\/sensor\/([0-9]+)/)?.[1]);
					if (
						sensorInURL !== null &&
						!Number.isNaN(sensorInURL) &&
						Number.isInteger(sensorInURL) &&
						filteredSensors[sensorInURL]
					) {
						flyTo(map, filteredSensors[sensorInURL]?.public_location);
					}
				},
			).then((t) => (teardown = t));

			return teardown;
		}
	}, [mapLoaded, filteredSensors]);

	return (
		<DrawerOpenContext.Provider value={{ drawerOpen, setDrawerOpen }}>
			<SensorsContext.Provider
				value={{
					unfilteredSensors: sensors,
					sensors: filteredSensors,
					allowOnlineStatus,
					setAllowOnlineStatus,
				}}>
				<MapContext.Provider value={{ map, setMap, mapLoaded, setMapLoaded }}>
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
								<MapComponent style={{}} setPopup={setPopup} />
							</Suspense>
						</Box>
						<MapSwitcher />
						<PopupComponent activeSensor={activeSensor} sensors={sensors} />
					</Box>
				</MapContext.Provider>
			</SensorsContext.Provider>
		</DrawerOpenContext.Provider>
	);
}
