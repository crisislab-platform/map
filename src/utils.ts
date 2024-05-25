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
		zoom: 17,
		speed: 1.2,
		curve: 1,
	});
}

export function titleCase(str: string): string {
	// Credit https://stackoverflow.com/a/40111894
	return str.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());
}
