import { createContext } from "react";

export interface Sensor {
	id: number;
	online?: boolean;
	type?: string;
	secondary_id?: string;
	timestamp?: number;
	publicLocation: [number, number];
}

const SensorsContext = createContext<
	[Record<number, Sensor>, React.Dispatch<React.SetStateAction<Record<number, Sensor>>>] | []
>([]);

export default SensorsContext;
