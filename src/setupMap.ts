import { theme } from "beryllium";
import { Map as MapboxMap, MapLayerMouseEvent, Popup } from "mapbox-gl";
import { flyTo } from "./utils";
function makeCircleColourGetter(text = false, dark = false) {
	return [
		"step",
		["get", "point_count"],
		text ? "#ffffff" : dark ? "#ed864e" : theme.palette.primary.light,
		100,
		text ? "#ffffff" : theme.palette.warning[dark ? "dark" : "light"],
		750,
		text ? "#ffffff" : theme.palette.error[dark ? "dark" : "light"],
	];
}

const typeToColor = {
	"Strong Motion Sensor": "#fc9312",
	"Short Period Seismometer": "#127ffc",
	"Broadband Seismometer": "#9712fc",
	Accelerometer: "#ed2f78",
};

const typeToBorder = {
	"Strong Motion Sensor": "#fc7905",
	"Short Period Seismometer": "#0022ff",
	"Broadband Seismometer": "#5c02d9",
	Accelerometer: "#d10258",
};

let storedGeonetData;

async function getGeonetData() {
	if (!storedGeonetData) {
		const now = new Date();

		const data = await Promise.all(
			(
				await Promise.all([
					fetch("https://api.geonet.org.nz/network/sensor?sensorType=3&endDate=9999-01-01"),
					fetch("https://api.geonet.org.nz/network/sensor?sensorType=8,9&endDate=9999-01-01"),
					fetch("https://api.geonet.org.nz/network/sensor?sensorType=1,10&endDate=9999-01-01"),
				])
			).map((a) => a.json()),
		);

		storedGeonetData = data
			.flatMap((a) => a.features)
			.filter((a) => new Date(a.properties.End) > now)
			.map((a) => {
				if (a?.geometry?.coordinates) {
					a.geometry.coordinates[0] += (Math.random() - 0.5) * 0.0005;
					a.geometry.coordinates[1] += (Math.random() - 0.5) * 0.0005;
					a.properties.color = typeToColor[a.properties.SensorType];
					a.properties.border = typeToBorder[a.properties.SensorType];
					return a;
				}
			});
	}

	return storedGeonetData;
}

export default async function setupMap(
	map: MapboxMap,
	geoJSON: any,
	onClick: (event: MapLayerMouseEvent) => void,
	popup: Popup,
	setActiveSensor: (newActiveID: number) => void,
	triggerRerender: () => void,
	onDoneLoading?: (map: MapboxMap) => void,
	enableClusters: boolean = true,
) {
	// inspect a cluster on click
	const onClusterClick = (ev: MapLayerMouseEvent) => {
		const features = map.queryRenderedFeatures(ev.point, {
			layers: ["clusters"],
		});
		const clusterId = features[0]?.properties?.cluster_id;
		map.getSource("crisislab-sensors").getClusterExpansionZoom!(clusterId, (err, zoom) => {
			if (err) return;

			flyTo(map, features[0].geometry.coordinates, zoom + 2);
		});
	};

	const onClustersMouseEnter = () => {
		map.getCanvas().style.cursor = "pointer";
	};
	const onClustersMouseLeave = () => {
		map.getCanvas().style.cursor = "";
	};

	const unclusteredMouseEnter = (ev: MapLayerMouseEvent) => {
		// Copy coordinates array.
		const coordinates = ev.features?.[0].geometry?.coordinates.slice();
		const sensorId = ev?.features?.[0]?.properties?.id;

		// Can't click geonet sensors
		map.getCanvas().style.cursor = "pointer";

		// Ensure that if the map is zoomed out such that multiple
		// copies of the feature are visible, the popup appears
		// over the copy being pointed to.
		while (Math.abs(ev.lngLat.lng - coordinates[0]) > 180) {
			coordinates[0] += ev.lngLat.lng > coordinates[0] ? 360 : -360;
		}

		// Populate the popup and set its coordinates
		// based on the feature found.
		popup.setLngLat(coordinates).addTo(map);
		setActiveSensor(sensorId);
		triggerRerender();
	};

	const unclusteredMouseLeave = () => {
		map.getCanvas().style.cursor = "";
		popup.remove();
	};

	const onClusterClickGeonet = (e) => {
		const features = map.queryRenderedFeatures(e.point, {
			layers: ["clusters-geonet"],
		});
		const clusterId = features[0].properties.cluster_id;
		map.getSource("geonet").getClusterExpansionZoom(clusterId, (err, zoom) => {
			if (err) return;

			flyTo(map, features[0].geometry.coordinates, zoom + 2);
		});
	};

	const unclusteredMouseEnterGeonet = (e) => {
		// Can't click on the geonet ones, so just a popup
		map.getCanvas().style.cursor = "help";

		// Copy coordinates array.
		const coordinates = e.features[0].geometry.coordinates.slice();
		const sensorId = e.features[0].properties.id;

		// Ensure that if the map is zoomed out such that multiple
		// copies of the feature are visible, the popup appears
		// over the copy being pointed to.
		while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
			coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
		}

		// Populate the popup and set its coordinates
		// based on the feature found.
		popup.setLngLat(coordinates).addTo(map);
		setActiveSensor(e.features[0].properties);
		triggerRerender();
	};

	const unclusteredMouseLeaveGeonet = () => {
		map.getCanvas().style.cursor = "";
		popup.remove();
	};

	async function setupLayers() {
		// Add fault lines first so they're on the bottom

		// Fault lines
		map.addSource("fault-lines-source", {
			type: "vector",
			url: "mapbox://zadeviggers.8hjwpez9",
		});

		map.addLayer({
			id: "fault-lines-render-layer",
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
				"line-width": ["interpolate", ["linear"], ["zoom"], 5, 1, 18, 6],
			},
		});
		map.addLayer({
			id: "fault-lines-hitbox-layer",
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
				"line-width": ["interpolate", ["linear"], ["zoom"], 5, 8, 18, 32],
				"line-color": "transparent",
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

		// Add geonet before our sensor so that ours are on top
		map.addSource("geonet", {
			type: "geojson",
			// Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
			// from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
			data: {
				features: await getGeonetData(),
				type: "FeatureCollection",
			},
			cluster: enableClusters,
			clusterMaxZoom: 14, // Max zoom to cluster points on
			clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
		});

		map.addLayer({
			id: "unclustered-point-geonet",
			type: "circle",
			source: "geonet",
			filter: ["!", ["has", "point_count"]],
			layout: { visibility: "none" },
			paint: {
				"circle-color": ["get", "color"],
				"circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 4, 25, 12],
				"circle-stroke-width": ["interpolate", ["linear"], ["zoom"], 10, 2, 25, 4],
				"circle-stroke-color": ["get", "border"],
			},
		});

		if (enableClusters) {
			map.addLayer(
				{
					id: "cluster-count-geonet",
					type: "symbol",
					source: "geonet",
					filter: ["has", "point_count"],
					layout: {
						"text-field": "{point_count_abbreviated}",
						"text-font": ["Roboto Slab Regular"],
						"text-size": 12,
						visibility: "none",
					},
					paint: {
						"text-color": makeCircleColourGetter(true),
					},
				},
				"unclustered-point-geonet",
			);

			map.addLayer(
				{
					id: "clusters-geonet",
					type: "circle",
					source: "geonet",
					filter: ["has", "point_count"],
					layout: { visibility: "none" },
					paint: {
						// Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
						// with three steps to implement three types of circles:
						//   * Blue, 20px circles when point count is less than 100
						//   * Yellow, 30px circles when point count is between 100 and 750
						//   * Pink, 40px circles when point count is greater than or equal to 750
						"circle-color": makeCircleColourGetter(false, true),
						"circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
					},
				},
				"cluster-count-geonet",
			);

			map.on("click", "clusters-geonet", onClusterClickGeonet);

			// When a click event occurs on a feature in
			// the unclustered-point layer, open a popup at
			// the location of the feature, with
			// description HTML from its properties.
			// map.on("click", "unclustered-point-geonet", onClick);

			map.on("mouseenter", "clusters-geonet", onClustersMouseEnter);
			map.on("mouseleave", "clusters-geonet", onClustersMouseLeave);
		}

		map.on("mouseenter", "unclustered-point-geonet", unclusteredMouseEnterGeonet);
		map.on("mouseleave", "unclustered-point-geonet", unclusteredMouseLeaveGeonet);

		// Add our sensors last so they show up first
		map.addSource("crisislab-sensors", {
			type: "geojson",
			data: geoJSON,
			cluster: enableClusters,
			clusterMaxZoom: 14, // Max zoom to cluster points on
			clusterRadius: 30, // Radius of each cluster when clustering points (defaults to 50)
		});

		map.addLayer({
			id: "unclustered-point",
			type: "circle",
			source: "crisislab-sensors",
			// @ts-expect-error Types aren't updated yet
			slot: "top",
			filter: ["!", ["has", "point_count"]],
			paint: {
				"circle-color": ["get", "color"],
				"circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 6, 25, 18],
				"circle-stroke-width": ["interpolate", ["linear"], ["zoom"], 10, 2, 25, 6],
				"circle-stroke-color": ["get", "border"],
			},
		});

		if (enableClusters) {
			map.addLayer(
				{
					id: "clusters",
					type: "circle",
					source: "crisislab-sensors",
					filter: ["has", "point_count"],
					paint: {
						// Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
						// with three steps to implement three types of circles:
						//   * Blue, 20px circles when point count is less than 100
						//   * Yellow, 30px circles when point count is between 100 and 750
						//   * Pink, 40px circles when point count is greater than or equal to 750
						"circle-color": makeCircleColourGetter(),
						"circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
					},
				},
				"unclustered-point",
			);

			map.addLayer({
				id: "cluster-count",
				type: "symbol",
				source: "crisislab-sensors",
				filter: ["has", "point_count"],
				layout: {
					"text-field": "{point_count_abbreviated}",
					"text-font": ["Roboto Slab Regular"],
					"text-size": 12,
				},
				paint: {
					"text-color": makeCircleColourGetter(true),
				},
			});
			map.on("click", "clusters", onClusterClick);

			// When a click event occurs on a feature in
			// the unclustered-point layer, open a popup at
			// the location of the feature, with
			// description HTML from its properties.

			map.on("mouseenter", "clusters", onClustersMouseEnter);
			map.on("mouseleave", "clusters", onClustersMouseLeave);
		}

		map.on("click", "unclustered-point", onClick);

		map.on("mouseenter", "unclustered-point", unclusteredMouseEnter);
		map.on("mouseleave", "unclustered-point", unclusteredMouseLeave);
	}

	const cleanup = () => {
		map.off("click", "unclustered-point", onClick);
		map.off("mouseenter", "unclustered-point", unclusteredMouseEnter);
		map.off("mouseleave", "unclustered-point", unclusteredMouseLeave);
		map.off("click", "clusters", onClusterClick);
		map.off("mouseleave", "clusters", onClustersMouseLeave);
		map.off("mouseenter", "clusters", onClustersMouseEnter);

		// map.off("click", "unclustered-point-geonet", onClickGeonet);
		map.off("mouseenter", "unclustered-point-geonet", unclusteredMouseEnterGeonet);
		map.off("mouseleave", "unclustered-point-geonet", unclusteredMouseLeaveGeonet);
		map.off("click", "clusters-geonet", onClusterClickGeonet);
		map.off("mouseleave", "clusters-geonet", onClustersMouseLeave);
		map.off("mouseenter", "clusters-geonet", onClustersMouseEnter);

		if (map.getLayer("cluster-count")) map.removeLayer("cluster-count");
		if (map.getLayer("clusters")) map.removeLayer("clusters");
		if (map.getLayer("unclustered-point")) map.removeLayer("unclustered-point");
		if (map.getSource("crisislab-sensors")) map.removeSource("crisislab-sensors");

		if (map.getLayer("cluster-count-geonet")) map.removeLayer("cluster-count-geonet");
		if (map.getLayer("clusters-geonet")) map.removeLayer("clusters-geonet");
		if (map.getLayer("unclustered-point-geonet")) map.removeLayer("unclustered-point-geonet");
		if (map.getSource("geonet")) map.removeSource("geonet");

		if (map.getLayer("fault-lines-hitbox-layer")) map.removeLayer("fault-lines-hitbox-layer");
		if (map.getLayer("fault-lines-render-layer")) map.removeLayer("fault-lines-render-layer");
		if (map.getLayer("fault-lines-labels-layer")) map.removeLayer("fault-lines-labels-layer");
		if (map.getSource("fault-lines-source")) map.removeSource("fault-lines-source");
	};

	const cleanupAndSetup = async () => {
		cleanup();
		await setupLayers();
	};

	await cleanupAndSetup();

	map.on("style.load", cleanupAndSetup);
	onDoneLoading(map);

	return () => {
		map.off("style.load", cleanupAndSetup);
		cleanup();
	};
}
