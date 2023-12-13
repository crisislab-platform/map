import { createContext } from "react";

export interface Sensor {
	id: number;
	online?: boolean;
	type?: string;
	secondary_id?: string;
	status_change_timestamp?: number;
	public_location: [number, number];
}

const SensorsContext = createContext<
	[Record<number, Sensor>, React.Dispatch<React.SetStateAction<Record<number, Sensor>>>] | []
>([]);

export default SensorsContext;
