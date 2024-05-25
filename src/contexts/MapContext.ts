import { createContext } from "react";
import { Map as MapboxMap } from "mapbox-gl";

const MapContext = createContext<{
	map: MapboxMap;
	setMap: React.Dispatch<React.SetStateAction<MapboxMap>>;
	mapLoaded: boolean;
	setMapLoaded: React.Dispatch<React.SetStateAction<boolean>>;
}>({ map: null, setMap: () => {}, mapLoaded: false, setMapLoaded: () => {} });

export default MapContext;
