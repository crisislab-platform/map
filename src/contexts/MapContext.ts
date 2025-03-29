import { Map as MapboxMap } from "mapbox-gl";
import { createContext } from "react";

const MapContext = createContext<{
	map: MapboxMap;
	setMap: (old: MapboxMap) => MapboxMap | void;
	mapLoaded: boolean;
	setMapLoaded: (old: boolean) => boolean | void;
}>({ map: null, setMap: () => {}, mapLoaded: false, setMapLoaded: () => {} });

export default MapContext;
