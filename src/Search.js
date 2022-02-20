import SearchIcon from "@mui/icons-material/Search";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import * as React from "react";
import Divider from "@mui/material/Divider";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";
import styles from "./Search.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";

const MAPBOX_TOKEN = "pk.eyJ1IjoiemFkZXZpZ2dlcnMiLCJhIjoiY2t5dGF6cGpvMWMydTJ3cGhrb2ZhOTdlZCJ9.myQ3YnPgbI-QkuBlClYfCw"

// MapBox Search
export default function SearchBar() {
  const [value, setValue] = React.useState("");
  const [results, setResults] = React.useState([]);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [hasFocus, setHasFocus] = React.useState(false);
  const [mouseOver, setMouseOver] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {

    (async () => {
      if (value) {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          value,
        )}.json?country=nz&proximity=175%2C-41&types=postcode%2Cpoi%2Caddress%2Cregion%2Cplace&language=en&access_token=${MAPBOX_TOKEN}`;
        const response = await fetch(url);
        const json = await response.json();
        setResults(json.features);
      }
    })();
  }, [value]);

  function reset() {
    setHasFocus(false);
    setValue("");
    setMouseOver(false);
    setResults([]);
    setSelectedIndex(0);
  }

  function select(value) {
    reset()
    const searchParams = new URLSearchParams();
    searchParams.set("name", value.text);
    searchParams.set("center", JSON.stringify(value.center));
    if (value.bbox) {
      searchParams.set("bbox", JSON.stringify(value.bbox));
    }
    navigate("/search?" + searchParams.toString());

  }


  React.useEffect(() => {
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

  console.log(location)


  return (
    <Paper
      elevation={10}
      sx={{
        width: "90%",
        margin: "5%",
        boxShadow:
          "0 2px 6px rgb(0 0 0 / 30%), 0 -1px 0 rgb(0 0 0 / 2%)",
        borderRadius: "10px",
        position: "absolute",
        zIndex: 999
      }}
      // onMouseEnter={() => setMouseOver(true)}
      // onMouseLeave={() => setMouseOver(false)}
      onFocus={() => setHasFocus(true)}
      onBlur={() => !(results.length > 0 && value) && setHasFocus(false)}
      className={styles.box}
    >
      {/* Show back button if location is not / */}
      <Box sx={{ display: "flex", alignItems: "center", marginInline: "2%" }}>
        <IconButton
          onClick={() => {
            reset()
            if (!(results.length > 0 && value && hasFocus))
              navigate("/")
          }}
          style={{ flexGrow: 0, marginRight: -5, transition: "opacity 0.2s", opacity: (location.pathname !== "/" || (results.length > 0 && value) || hasFocus) ? 1 : 0 }}
        >
          <ArrowBack fontSize="medium" />
        </IconButton>

        <TextField
          style={{ flexGrow: 1 }}
          size="medium"
          label="Find a sensor..."
          variant="outlined"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
            disableUnderline: true
          }}
        />
      </Box>
      {results.length > 0 && value && hasFocus && (
        <>
          <Divider />
          <List disablePadding dense className={styles.list}>
            {results.map((result, i) => (
              <ListItem disableGutters>
                <ListItemButton
                  selected={selectedIndex === i}
                  disablePadding
                  onClick={() => {
                    select(result);
                  }}>
                  <ListItemIcon>
                    {[
                      "postcode",
                      "address",
                      "region",
                      "place",
                    ].includes(result.place_type[0]) ? (
                      <LocationCityIcon />
                    ) : (
                      <LocationOnIcon />
                    )}
                  </ListItemIcon>
                  <ListItemText primary={result.place_name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Paper>
  );
}
