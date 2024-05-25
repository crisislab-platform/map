import { createContext } from "react";

export interface Sensor {
	id: number;
	online?: boolean;
	type?: string;
	secondary_id?: string;
	status_change_timestamp?: number;
	public_location: [number, number];
	safeLocation: { longitude: number; latitude: number };
}

const SensorsContext = createContext<{
	sensors: Record<number, Sensor>;
	setSensors: React.Dispatch<React.SetStateAction<Record<number, Sensor>>>;
}>({ sensors: {}, setSensors: () => {} });

export default SensorsContext;
