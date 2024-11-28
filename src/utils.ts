import { useMediaQuery } from "@mui/material";
import { theme } from "beryllium";

function getAPIOrigin() {
	if (window.location.search.includes("use-local-server")) {
		return "http://localhost:8080";
	}

	const customOrigin = localStorage.getItem("cl-custom-api-origin");
	if (customOrigin) {
		return customOrigin;
	}

	if (import.meta.env.VITE_DEFAULT_API_ORIGIN) {
		return import.meta.env.VITE_DEFAULT_API_ORIGIN;
	}

	// Fallback to official
	return "https://crisislab-data.massey.ac.nz";
}

export function setCustomAPIOrigin() {
	const newOrigin = prompt(
		"Enter custom API origin.\n\nInclude 'https://', but not '/api' or any path. (Do include ports if needed)\n\nLeave blank to remove custom API origin.\n\nThis will probably log you out. If something breaks, clear site data then reload.",
	)
		?.trim()
		?.toLowerCase();

	// User canceled action
	if (newOrigin === null || newOrigin === undefined) return;

	if (newOrigin === "") {
		localStorage.removeItem("cl-custom-api-origin");
	} else {
		localStorage.setItem("cl-custom-api-origin", newOrigin);
	}
	location.reload();
}

export const APIOrigin = getAPIOrigin();

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
