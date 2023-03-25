import { createContext } from "react";
import { Map as MapboxMap } from "mapbox-gl";

const MapContext = createContext<
	| [
			MapboxMap,
			React.Dispatch<React.SetStateAction<MapboxMap>>,
			boolean,
			React.Dispatch<React.SetStateAction<boolean>>,
	  ]
	| []
>([]);

export default MapContext;
