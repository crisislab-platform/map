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

	// inspect a cluster on click
	map.on("click", "clusters", (e) => {
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
	});

	// When a click event occurs on a feature in
	// the unclustered-point layer, open a popup at
	// the location of the feature, with
	// description HTML from its properties.
	map.on("click", "unclustered-point", onClick);

	map.on("mouseenter", "clusters", () => {
		map.getCanvas().style.cursor = "pointer";
	});
	map.on("mouseleave", "clusters", () => {
		map.getCanvas().style.cursor = "";
	});

	map.on("mouseenter", "unclustered-point", (e) => {
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
	});

	map.on("mouseleave", "unclustered-point", () => {
		map.getCanvas().style.cursor = "";
		popup.remove();
	});

	return () => {
		map.removeSource("earthquakes");
		map.removeLayer("clusters");
		map.removeLayer("unclustered-point");
		map.removeLayer("cluster-count");
	};
}
