import "mapbox-gl/dist/mapbox-gl.css";

import mapboxgl, { GeolocateControl, Map as MapboxMap, NavigationControl, Popup, ScaleControl } from "mapbox-gl";
import { useContext, useEffect, useRef } from "react";

import MapContext from "./MapContext";
import { useTheme } from "@mui/material";

mapboxgl.accessToken = "pk.eyJ1IjoiemFkZXZpZ2dlcnMiLCJhIjoiY2t5dGF6cGpvMWMydTJ3cGhrb2ZhOTdlZCJ9.myQ3YnPgbI-QkuBlClYfCw";

export default function MapApp(props: { setPopup: (popup: Popup) => void; style: any }) {
	const theme = useTheme();
	const mapContainerRef = useRef(null);
	const [map, setMap, mapLoaded, setMapLoaded] = useContext(MapContext);

	useEffect(() => {
		if (mapContainerRef.current) {
			const map = new MapboxMap({
				container: mapContainerRef.current,
				center: [174.8, -41.325],
				zoom: 4.8,
			});
			setMap!(map);

			const popup = new Popup({
				closeButton: false,
				closeOnClick: false,
				maxWidth: "400px",
			});

			popup.setHTML('<div id="popup"></div>');

			props.setPopup(popup);

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

			function onError(err: any) {
				console.error("Failed to load map. Error: ", err);
			}

			function onMapStylesLoad() {
				// @ts-ignore
				window.map = map;

				setMapLoaded(true);

				return () => {
					map.remove();
				};
			}

			map.on("error", onError);
			// `style.load` fires when the map style has loaded
			// Using this instead of normal `load` means that we can reload the layers
			// that get removed when the map style changes, because `load` only
			// fires on the very first map load.
			map.on("style.load", onMapStylesLoad);

			return () => {
				map.off("error", onError);
				map.off("style.load", onMapStylesLoad);
				map.removeControl(navigationControl);
				map.removeControl(geoLocateControl);
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
