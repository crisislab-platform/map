import { createContext } from "react";

export interface Sensor {
	id: number;
	online?: boolean;
	type?: string;
	secondary_id?: string;
	status_change_timestamp?: number;
	public_location: [number, number];
	safeLocation: { lng: number; lat: number };
}

const SensorsContext = createContext<{
	unfilteredSensors: Record<number, Sensor>;
	sensors: Record<number, Sensor>;
	allowOnlineStatus: "all" | "online" | "offline";
	setAllowOnlineStatus: React.Dispatch<React.SetStateAction<"all" | "online" | "offline">>;
}>({ unfilteredSensors: {}, sensors: {}, allowOnlineStatus: "online", setAllowOnlineStatus: () => {} });

export default SensorsContext;
