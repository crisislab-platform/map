import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider, responsiveFontSizes } from "@mui/material";
import { Marker } from "mapbox-gl";
import { useNavigate } from "react-router-dom";
import Search from "./Search";
import Routes from "./Routes";
import SensorsContext from "./SensorsContext";
import MapContext from "./MapContext";

const Map = React.lazy(() => import("./Map"));

const theme = responsiveFontSizes(
  createTheme({
    typography: {
      fontFamily: "Roboto Slab, serif",
    },
  }),
  { breakpoints: ["sm", "md", "lg", "xl"], factor: 4 }
);

const drawerWidth = 500;

export default function App() {
  const [sensors, setSensors] = React.useState([]);
  const [map, setMap] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    (async () => {
      const res = await fetch(`https://shakemap.benhong.me/api/v1/sensors`);
      const data = await res.json();
      setSensors(data.sensors);
    })();
  }, []);

  React.useEffect(() => {
    if (map)
      for (const sensor of sensors) {
        const markerElement = document.createElement("div");
        markerElement.setAttribute("title", `Sensor #${sensor.id}`);
        markerElement.classList.add("crisislab-sensor-marker");
        if ("online" in sensor) {
          if (sensor.online === true) {
            markerElement.classList.add("online");
          } else if (sensor.online === false) {
            markerElement.classList.add("offline");
          }
        }
        markerElement.onclick = () => {
          map?.flyTo({
            center: [sensor.longitude, sensor.latitude],
            zoom: 16,
            speed: 1.4,
            curve: 1,
          });
          navigate(`/sensor/${sensor.id}`);
        };

        let marker = new Marker({
          element: markerElement,
          anchor: "bottom",
        });
        marker.setLngLat([sensor.longitude, sensor.latitude]);
        marker.addTo(map);
      }
  }, [sensors, map]);

  return (
    <ThemeProvider theme={theme}>
      <SensorsContext.Provider value={[sensors, setSensors]}>
        <MapContext.Provider value={[map, setMap]}>
          <Box
            sx={{
              display: "flex",
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
          >
            <CssBaseline />
            <Drawer
              sx={{
                width: drawerWidth,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                  width: drawerWidth,
                  boxSizing: "border-box",
                },
              }}
              variant="permanent"
              anchor="left"
            >
              <Search />

              <Routes />
            </Drawer>

            <Box
              component="main"
              sx={{
                flexGrow: 1,
                bgcolor: "background.default",
                p: 3,
                position: "relative",
                height: "100%",
              }}
            >
              <React.Suspense
                fallback={
                  // div with text in middle
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: "#78bced",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h5" style={{ color: "white" }}>
                      Loading map...
                    </Typography>
                  </div>
                }
              >
                <Map />
              </React.Suspense>
            </Box>
          </Box>
        </MapContext.Provider>
      </SensorsContext.Provider>
    </ThemeProvider>
  );
}
