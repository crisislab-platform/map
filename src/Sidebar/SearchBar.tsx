import { useContext, type FormEvent as ReactFormEvent } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, IconButton, InputAdornment, TextField, Tooltip } from "@mui/material";
import SensorsContext, { Sensor } from "../SensorsContext";
import SearchIcon from "@mui/icons-material/Search";

export default function SearchBar() {
	const navigate = useNavigate();
	const [sensors] = useContext(SensorsContext);
	const [searchParams] = useSearchParams();
	const query = searchParams.get("query")?.trim();

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
			if (query.startsWith("#")) id = Number(query.slice(1));
			else id = Number(query);

			if (!Number.isNaN(id)) {
				const sensor = sensors[id];
				if (sensor !== undefined) return sensor;
			}
		} catch (err) {
			console.warn("[SEARCH] Error parsing sensor from query string: ", err);
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
		} else {
			// If we don't find a sensor, emulate default form behavior
			// and navigate to action url with query.
			// This is to stop the map having to reload
			const queryParams = new URLSearchParams(data as unknown as Record<string, string>);
			navigate(`/search?${queryParams}`);
		}
		event.preventDefault();
	}

	return (
		<Box
			component="form"
			onSubmit={handleFormSubmit}
			action="/search"
			sx={{
				p: 2,
			}}>
			<search>
				<TextField
					autoFocus
					// Select content on focus so it's easy to type a new query
					onFocus={(e) => e.target.select()}
					id="search-query-field"
					name="query"
					label="Search"
					placeholder="Enter a sensor ID, coordinates, or address"
					variant="outlined"
					fullWidth
					defaultValue={query}
					InputProps={{
						endAdornment: (
							<InputAdornment position="end">
								<Tooltip title="Submit query">
									<IconButton type="submit">
										<SearchIcon />
									</IconButton>
								</Tooltip>
							</InputAdornment>
						),
					}}
				/>
			</search>
		</Box>
	);
}
