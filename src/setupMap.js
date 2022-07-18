import { theme } from "beryllium";

function makeCircleColourGetter(text = false) {
	return [
		"step",
		["get", "point_count"],
		text ? "#ffffff" : theme.palette.primary.light,
		100,
		text ? "#ffffff" : theme.palette.warning.light,
		750,
		text ? "#ffffff" : theme.palette.error.light,
	];
}

export default function setupMap(map, geoJSON, onClick, popup, setActiveSensor, triggerRerender) {
	// inspect a cluster on click
	const onClusterClick = (e) => {
		const features = map.queryRenderedFeatures(e.point, {
			layers: ["clusters"],
		});
		const clusterId = features[0].properties.cluster_id;
		map.getSource("earthquakes").getClusterExpansionZoom(clusterId, (err, zoom) => {
			if (err) return;

			map.flyTo({
				center: features[0].geometry.coordinates,
				zoom: zoom + 2,
				duration: 1000,
			});
		});
	};

	const onClustersMouseEnter = () => {
		map.getCanvas().style.cursor = "pointer";
	};
	const onClustersMouseLeave = () => {
		map.getCanvas().style.cursor = "";
	};

	const unclusteredMouseEnter = (e) => {
		map.getCanvas().style.cursor = "pointer";
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
		setActiveSensor(sensorId);
		triggerRerender();
	};

	const unclusteredMouseLeave = () => {
		map.getCanvas().style.cursor = "";
		popup.remove();
	};

	function setupLayers() {
		map.addSource("earthquakes", {
			type: "geojson",
			// Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
			// from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
			data: geoJSON,
			cluster: true,
			clusterMaxZoom: 14, // Max zoom to cluster points on
			clusterRadius: 30, // Radius of each cluster when clustering points (defaults to 50)
		});

		map.addLayer({
			id: "clusters",
			type: "circle",
			source: "earthquakes",
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
		});

		map.addLayer({
			id: "unclustered-point",
			type: "circle",
			source: "earthquakes",
			filter: ["!", ["has", "point_count"]],
			paint: {
				"circle-color": ["get", "color"],
				"circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 6, 25, 18],
				"circle-stroke-width": ["interpolate", ["linear"], ["zoom"], 10, 2, 25, 6],
				"circle-stroke-color": ["get", "border"],
			},
		});

		map.addLayer(
			{
				id: "cluster-count",
				type: "symbol",
				source: "earthquakes",
				filter: ["has", "point_count"],
				layout: {
					"text-field": "{point_count_abbreviated}",
					"text-font": ["Roboto Slab Regular"],
					"text-size": 12,
				},
				paint: {
					"text-color": makeCircleColourGetter(true),
				},
			},
			"unclustered-point",
		);
		map.on("click", "clusters", onClusterClick);

		// When a click event occurs on a feature in
		// the unclustered-point layer, open a popup at
		// the location of the feature, with
		// description HTML from its properties.
		map.on("click", "unclustered-point", onClick);

		map.on("mouseenter", "clusters", onClustersMouseEnter);
		map.on("mouseleave", "clusters", onClustersMouseLeave);
		map.on("mouseenter", "unclustered-point", unclusteredMouseEnter);
		map.on("mouseleave", "unclustered-point", unclusteredMouseLeave);

		map.addSource("geonet-sensors-source", {
			type: "vector",
			url: "mapbox://zadeviggers.ckyti0ozu2wkk20rvo89kd6ur-6jsd8",
		});
		map.addLayer({
			id: "geonet-sensors-layer",
			source: "geonet-sensors-source",
			"source-layer": "stations",
			type: "circle",
			layout: { visibility: "none" },
			paint: {
				"circle-color": theme.palette.geonet.main,
				"circle-radius": 2,
			},
		});

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
	}

	const cleanup = () => {
		map.off("click", "unclustered-point", onClick);
		map.off("mouseenter", "unclustered-point", unclusteredMouseEnter);
		map.off("mouseleave", "unclustered-point", unclusteredMouseLeave);
		map.off("mouseleave", "clusters", onClustersMouseLeave);
		map.off("mouseenter", "clusters", onClustersMouseEnter);

		if (map.getLayer("cluster-count")) map.removeLayer("cluster-count");
		if (map.getLayer("clusters")) map.removeLayer("clusters");
		if (map.getLayer("unclustered-point")) map.removeLayer("unclustered-point");
		if (map.getSource("earthquakes")) map.removeSource("earthquakes");

		if (map.getLayer("geonet-sensors-layer")) map.removeLayer("geonet-sensors-layer");
		if (map.getSource("geonet-sensors-source")) map.removeSource("geonet-sensors-source");

		if (map.getLayer("fault-lines-hitbox-layer")) map.removeLayer("fault-lines-hitbox-layer");
		if (map.getLayer("fault-lines-render-layer")) map.removeLayer("fault-lines-render-layer");
		if (map.getLayer("falt-lines-labels-layer")) map.removeLayer("falt-lines-labels-layer");
		if (map.getSource("fault-lines-source")) map.removeSource("fault-lines-source");
	};
	const onStyleLoad = () => {
		cleanup();
		setupLayers();
	};
	map.on("style.load", onStyleLoad);

	setupLayers();

	return () => {
		map.off("style.load", onStyleLoad);
		cleanup();
	};
}
