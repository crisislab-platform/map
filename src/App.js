import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material';
import Search from "./Search";
import Routes from './Routes';
import SensorsContext from './SensorsContext';

const Map = React.lazy(() => import("./Map"));

const theme = responsiveFontSizes(createTheme({
  typography: {
    fontFamily: 'Roboto Slab, serif',
  },
}), { breakpoints: ['sm', 'md', 'lg', 'xl'], factor: 4 });

const drawerWidth = 500;

export default function App() {
  const [selectedLocation, setSelectedLocation] = React.useState(null);
  const [sensors, setSensors] = React.useState([]);
  const [activeSensor, setActiveSensor] = React.useState(null);
  const [possibleSensors, setPossibleSensors] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      const res = await fetch(
        `https://shakemap.benhong.me/api/v1/sensors`,
      );
      const data = await res.json();
      setSensors(data.sensors);
    })();
  }, []);

  function onLocationSelected(location) {
    console.log("Selected location:", location);
    setSelectedLocation(location);

    if (location.bbox) {
      // Look for sensors inside the bounding box
      const sensorsInBbox = sensors.filter(sensor => {
        const { latitude, longitude } = sensor;
        return location.bbox[1] <= latitude && location.bbox[3] >= latitude && location.bbox[0] <= longitude && location.bbox[2] >= longitude;
      })

      if (sensorsInBbox.length === 1) {
        setActiveSensor(sensorsInBbox[0]);
      } else if (sensorsInBbox.length > 1) {
        setPossibleSensors(sensorsInBbox);
      } else {
        setPossibleSensors(false);
      }
    } else {
      // Find the top 5 closest sensors to the location
      const [longitude, latitude] = location.center
      const closestSensors = sensors.sort((a, b) => {
        const aDist = Math.sqrt(Math.pow(a.latitude - latitude, 2) + Math.pow(a.longitude - longitude, 2));
        const bDist = Math.sqrt(Math.pow(b.latitude - latitude, 2) + Math.pow(b.longitude - longitude, 2));
        return aDist - bDist;
      }
      ).slice(0, 5);

      if (closestSensors.length === 1) {
        setActiveSensor(closestSensors[0]);
      } else if (closestSensors.length > 1) {
        setPossibleSensors(closestSensors);
      } else {
        setActiveSensor(null);
      }
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <SensorsContext.Provider value={[sensors, setSensors]}>
        <Box sx={{
          display: 'flex',
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        }}>
          <CssBaseline />
          <Drawer
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
              },
            }}
            variant="permanent"
            anchor="left"
          >

            <Search onSelect={onLocationSelected} />

            <Routes />

          </Drawer>

          <Box
            component="main"
            sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, position: 'relative', height: "100%" }}
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
              }>
              <Map />
            </React.Suspense>
          </Box>
        </Box>
      </SensorsContext.Provider>
    </ThemeProvider>
  );
}
