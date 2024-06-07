import { useMediaQuery } from "@mui/material";
import mapboxgl from "mapbox-gl";
import { theme } from "beryllium";

export function flyTo(
	map: mapboxgl.Map | null,
	pos: null | { lng: number; lat: number } | [number, number],
	zoom = 17,
) {
	if (!map || !pos) return;
	let longitude: number, latitude: number;
	if (Array.isArray(pos)) {
		[longitude, latitude] = pos;
	} else {
		longitude = pos.lng;
		latitude = pos.lat;
	}

	map.flyTo({
		center: [longitude, latitude],
		zoom,
		duration: 3000,
		curve: 1,
	});
}

export function titleCase(str: string): string {
	// Credit https://stackoverflow.com/a/40111894
	return str.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());
}

export function useOnBigScreen() {
	return useMediaQuery<typeof theme>((theme) => theme.breakpoints.up("md"));
}
