import { useEffect, useState, useContext } from "react";

import { useLocation, useNavigate } from "react-router-dom";
import {
	Box,
	IconButton,
	InputAdornment,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Paper,
	TextField,
	Tooltip,
	Divider,
	List,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MapContext from "./MapContext";
import SearchIcon from "@mui/icons-material/Search";
import LocationCityIcon from "@mui/icons-material/LocationCity";
const MAPBOX_TOKEN = "pk.eyJ1IjoiemFkZXZpZ2dlcnMiLCJhIjoiY2t5dGF6cGpvMWMydTJ3cGhrb2ZhOTdlZCJ9.myQ3YnPgbI-QkuBlClYfCw";

// MapBox Search
export default function SearchBar() {
	const [value, setValue] = useState("");
	const [results, setResults] = useState([]);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [hasFocus, setHasFocus] = useState(false);
	const [map, setMap] = useContext(MapContext);
	const [mouseOver, setMouseOver] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		(async () => {
			if (value) {
				const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
					value,
				)}.json?country=nz&proximity=175%2C-41&types=postcode%2Cpoi%2Caddress%2Cregion%2Cplace&language=en&access_token=${MAPBOX_TOKEN}`;
				const response = await fetch(url);
				const json = await response.json();
				if (json.features.length) {
					setResults(json.features);
					setHasFocus(true);
				} else {
					setHasFocus(false);
					setTimeout(() => setResults(json.features), 200);
				}
			}
		})();
	}, [value]);

	function reset() {
		setHasFocus(false);
		setValue("");
		setMouseOver(false);
		setTimeout(() => setResults([]), 200);
		setSelectedIndex(0);
	}

	function select(value) {
		reset();
		const searchParams = new URLSearchParams();
		searchParams.set("name", value.text);
		searchParams.set("center", JSON.stringify(value.center));
		if (value.bbox) {
			searchParams.set("bbox", JSON.stringify(value.bbox));
		}

		const zoomValues = {
			postcode: 14,
			place: 14,
			poi: 16,
			address: 16,
			region: 12,
		};

		if (value.bbox) {
			map?.fitBounds(value.bbox, {
				// padding: {
				//   top: 100,
				//   bottom: 100,
				//   left: 100,
				//   right: 100
				// },
				speed: 0.8,
				curve: 2,
			});
		} else {
			map?.flyTo({
				center: value.center,
				zoom: zoomValues[value.place_type],
				speed: 0.8,
				curve: 2,
			});
		}

		navigate(`/search?${searchParams.toString()}`);
	}

	useEffect(() => {
		function handleKey(e) {
			if (e.key === "ArrowDown") {
				setSelectedIndex(Math.min(selectedIndex + 1, results.length - 1));
			}
			if (e.key === "ArrowUp") {
				setSelectedIndex(Math.max(selectedIndex - 1, 0));
			}
			if (e.key === "Enter") {
				select(results[selectedIndex]);
			}
		}
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [selectedIndex, results]);

	return (
		<Box
			onMouseEnter={() => setHasFocus(true)}
			onFocus={() => setHasFocus(true)}
			onMouseLeave={() => setTimeout(() => setHasFocus(false), 100)}
			sx={{
				pointerEvents: results.length > 0 && value && hasFocus ? "all" : "none",
				position: "relative",
				height: 52,
			}}>
			<Paper
				elevation={0}
				sx={{
					width: "90%",
					margin: "5%",
					borderRadius: "10px",
					position: "absolute",
					zIndex: 999,
					pointerEvents: "all",
				}}>
				{/* Show back button if location is not / */}
				<Box sx={{ display: "flex", alignItems: "center", marginInline: "2%" }}>
					<Tooltip title="Back to main page">
						<IconButton
							onClick={() => {
								reset();
								if (!(results.length > 0 && value && hasFocus)) navigate("/");
							}}
							style={{
								flexGrow: 0,
								marginRight: location.pathname !== "/" || value ? -5 : -40,
								transition: "opacity 0.2s, margin-right 0.2s ease-out",
								opacity: location.pathname !== "/" || value ? 1 : 0,
							}}>
							<ArrowBackIcon fontSize="medium" />
						</IconButton>
					</Tooltip>

					<TextField
						style={{ flexGrow: 1, marginTop: 7, marginBottom: 7 }}
						size="small"
						label="Find a sensor..."
						variant="outlined"
						autoComplete="off"
						value={value}
						onChange={(e) => setValue(e.target.value)}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<SearchIcon />
								</InputAdornment>
							),
							sx: {
								"& .MuiOutlinedInput-notchedOutline": {
									display: "none",
								},
							},
						}}
					/>
				</Box>
			</Paper>

			<Paper
				elevation={10}
				sx={{
					width: "90%",
					margin: "5%",
					boxShadow: "0 2px 6px rgb(0 0 0 / 30%), 0 -1px 0 rgb(0 0 0 / 2%)",
					borderRadius: "10px",
					position: "absolute",
					zIndex: 997,
					transition: "opacity 0.2s",
					opacity: results.length > 0 && value && hasFocus ? 0 : 1,
				}}
				// onMouseEnter={() => setMouseOver(true)}
				// onMouseLeave={() => setMouseOver(false)}
				onFocus={() => setHasFocus(true)}
				onBlur={() => setTimeout(() => setHasFocus(false), 100)}>
				{/* Show back button if location is not / */}
				<TextField
					size="small"
					style={{ marginTop: 7, marginBottom: 7 }}
					variant="outlined"
					autoComplete="off"
				/>
			</Paper>
			<Paper
				elevation={10}
				sx={{
					width: "90%",
					margin: "5%",
					boxShadow: "0 2px 6px rgb(0 0 0 / 30%), 0 -1px 0 rgb(0 0 0 / 2%)",
					borderRadius: "10px",
					position: "absolute",
					zIndex: 998,
					opacity: results.length > 0 && value && hasFocus ? 1 : 0,
					transition: "opacity 0.2s",
				}}
				onFocus={() => setHasFocus(true)}
				onBlur={() => setTimeout(() => setHasFocus(false), 100)}>
				{/* Show back button if location is not / */}
				<TextField
					size="small"
					variant="outlined"
					autoComplete="off"
					style={{ marginTop: 7, marginBottom: 7 }}
				/>
				{results.length > 0 && (
					<>
						<Divider />
						<List disablePadding dense>
							{results.map((result, i) => (
								<ListItem disableGutters key={result.id}>
									<ListItemButton
										selected={selectedIndex === i}
										onClick={() => {
											select(result);
										}}
										style={{
											paddingLeft: 18,
										}}>
										<ListItemIcon>
											{["postcode", "address", "region", "place"].includes(
												result.place_type[0],
											) ? (
												<LocationCityIcon />
											) : (
												<LocationOnIcon />
											)}
										</ListItemIcon>
										<ListItemText style={{ marginLeft: -16 }} primary={result.place_name} />
									</ListItemButton>
								</ListItem>
							))}
						</List>
					</>
				)}
			</Paper>
		</Box>
	);
}
