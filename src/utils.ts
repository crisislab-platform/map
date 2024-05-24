import mapboxgl from "mapbox-gl";

export function flyTo(
	map: mapboxgl.Map | null,
	pos: null | { longitude: number; latitude: number } | [number, number],
) {
	if (!map || !pos) return;
	let longitude: number, latitude: number;
	if (Array.isArray(pos)) {
		[longitude, latitude] = pos;
	} else {
		longitude = pos.longitude;
		latitude = pos.latitude;
	}

	map.flyTo({
		center: [longitude, latitude],
		zoom: 12,
		speed: 1.2,
		curve: 1,
	});
}
