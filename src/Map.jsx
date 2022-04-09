import "mapbox-gl/dist/mapbox-gl.css";

import mapboxgl, {
	AttributionControl,
	GeolocateControl,
	Map as MapboxMap,
	NavigationControl,
	ScaleControl,
} from "mapbox-gl";
import { useContext, useEffect, useRef } from "react";

import MapContext from "./MapContext";
import SunCalc from "suncalc";
import { useTheme } from "@mui/material";

mapboxgl.accessToken = "pk.eyJ1IjoiemFkZXZpZ2dlcnMiLCJhIjoiY2t5dGF6cGpvMWMydTJ3cGhrb2ZhOTdlZCJ9.myQ3YnPgbI-QkuBlClYfCw";

export default function MapApp(props) {
	const theme = useTheme();
	const mapContainerRef = useRef(null);
	const [map, setMap, mapLoaded, setMapLoaded] = useContext(MapContext);

	useEffect(() => {
		if (mapContainerRef.current) {
			const map = new MapboxMap({
				container: mapContainerRef.current,
				style: "mapbox://styles/mapbox/streets-v11",
				center: [174.8, -41.325],
				zoom: 4.8,
			});
			setMap(map);

			const attributionControl = new AttributionControl();
			map.addControl(attributionControl, "top-right");
			const navigationControl = new NavigationControl({
				visualizePitch: true,
				showZoom: true,
				showCompass: true,
			});
			map.addControl(navigationControl, "top-right");
			const geoLocateControl = new GeolocateControl({
				positionOptions: {
					enableHighAccuracy: true,
				},
				showUserLocation: false,
			});
			map.addControl(geoLocateControl, "top-right");

			map.addControl(
				new ScaleControl({
					maxWidth: 150,
					unit: "metric",
				}),
				"bottom-left",
			);

			function onError(e) {
				console.log("Failed to load map. Error: ", e);
			}

			function onLoad() {
				console.log("onload");
				setMapLoaded(true);

				function getSunPosition() {
					const center = map.getCenter();
					const sunPos = SunCalc.getPosition(new Date(), center.lat, center.lng);
					const sunAzimuth = 180 + (sunPos.azimuth * 180) / Math.PI;
					const sunAltitude = 90 - (sunPos.altitude * 180) / Math.PI;
					return [sunAzimuth, sunAltitude];
				}
				map.addLayer({
					id: "sky",
					type: "sky",
					paint: {
						"sky-opacity": ["interpolate", ["linear"], ["zoom"], 0, 0, 5, 0.3, 8, 1],
						// set up the sky layer for atmospheric scattering
						"sky-type": "atmosphere",
						// explicitly set the position of the sun rather than allowing the sun to be attached to the main light source
						"sky-atmosphere-sun": getSunPosition(),
						// set the intensity of the sun as a light source (0-100 with higher values corresponding to brighter skies)
						"sky-atmosphere-sun-intensity": 5,
					},
				});
				// Fault lines
				map.addSource("fault-lines-source", {
					type: "vector",
					url: "mapbox://zadeviggers.8hjwpez9",
				});
				map.addLayer({
					id: "fault-lines-layer",
					type: "line",
					source: "fault-lines-source",
					"source-layer": "New_Zealand_Active_Faults_Database_1250k",
					layout: {
						// Make the layer hidden by default.
						visibility: "none",
						"line-join": "round",
						"line-cap": "round",
					},
					paint: {
						"line-color": theme.palette.error.main,
						"line-width": ["interpolate", ["linear"], ["zoom"], 5, 2, 18, 12],
					},
				});
				map.addLayer({
					id: "fault-lines-labels-layer",
					type: "symbol",
					source: "fault-lines-source",
					"source-layer": "New_Zealand_Active_Faults_Database_1250k",
					layout: {
						visibility: "none", // Hide by default
						"text-field": ["get", "Name"],
						"text-size": 14,
						"symbol-placement": "line-center",
					},
					paint: {
						"text-color": "#000000",
						"text-halo-width": 1,
						"text-halo-color": "#ffffff",
						// Other theme - try out later
						// "text-color": theme.palette.error.main,
						// "text-halo-width": 1,
						// "text-halo-color": "#000000",
					},
				});

				return () => {
					map.removeSource("fault-lines-source");
					map.removeLayer("fault-lines-layer");
					map.removeLayer("falt-lines-labels-layer");
					map.remove();
				};
			}

			map.on("error", onError);
			map.on("load", onLoad);

			return () => {
				map.off("error", onError);
				map.off("load", onLoad);
				map.removeControl(navigationControl);
				map.removeControl(geoLocateControl);
				map.removeControl(attributionControl);
				map.remove();
			};
		}
	}, [mapContainerRef]);

	return (
		<div
			style={{
				position: "absolute",
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
				// height: "100%",
				// width: "100%",
				...props.style,
			}}
			className="map-container"
			ref={mapContainerRef}
		/>
	);
}
