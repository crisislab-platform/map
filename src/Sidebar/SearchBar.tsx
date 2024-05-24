import { useContext, type FormEvent as ReactFormEvent } from "react";

import { useNavigate } from "react-router-dom";
import { Box, TextField } from "@mui/material";
import SensorsContext, { Sensor } from "../SensorsContext";

export default function SearchBar() {
	const navigate = useNavigate();
	const [sensors] = useContext(SensorsContext);

	// This should be memoized, but this component won't run much,
	// and the new react compiler will do it automatically soon enough
	const secondaryIDMap = Object.values(sensors).reduce<Map<string, Sensor>>((accumulator, current) => {
		const secondaryID = current.secondary_id?.trim().toLowerCase();
		if (!secondaryID) return accumulator;

		accumulator.set(secondaryID, current);
		return accumulator;
	}, new Map());

	function findSensorFromQueryString(_query: string): Sensor | null {
		const query = _query.trim().toLowerCase();
		try {
			let secondaryIDSensor = secondaryIDMap.get(query);
			if (secondaryIDSensor !== undefined) return secondaryIDSensor;

			let id: number;
			if (query.startsWith("#")) id = Number.parseInt(query.slice(1));
			else id = Number.parseInt(query);

			if (!Number.isNaN(id)) {
				const sensor = sensors[id];
				if (sensor !== undefined) return sensor;
			}
		} catch (err) {
			console.warn("Search error: ", err);
		}
		return null;
	}

	function handleFormSubmit(event: ReactFormEvent) {
		const formElement = event.target as HTMLFormElement;
		const data = new FormData(formElement);
		const query = data.get("query")?.toString();
		if (query == null) return;

		const matchingSensor = findSensorFromQueryString(query);
		if (matchingSensor) {
			navigate(`/sensor/${matchingSensor.id}`);
			event.preventDefault();
			formElement.query.value = "";
		}

		// If we don't find a sensor, fall through to default submit behaviour
	}

	return (
		<Box
			component="form"
			onSubmit={handleFormSubmit}
			action="/search"
			sx={{
				p: 2,
			}}>
			<TextField
				autoFocus
				id="search-query-field"
				name="query"
				label="Search"
				placeholder="Enter a sensor ID, coordinates, or address"
				variant="outlined"
				fullWidth
			/>
		</Box>
	);
}
