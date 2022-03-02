import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import SensorsContext from '../SensorsContext';
import React from 'react';
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { useParams } from 'react-router-dom';
import { getDistance } from 'geolib';
import RPiIcon from './RPiIcon';
import { Button, Fade } from '@mui/material';

export default function Sensor() {
    const [sensors] = React.useContext(SensorsContext);
    const { id } = useParams();

    const sensor = sensors.find(sensor => sensor.id === parseInt(id));

    if (!sensor) {
        return null
    }

    return (
        <Fade in>
            <Box sx={{
                paddingInline: 0,
                paddingTop: 6,
                marginTop: 6,
            }}>
                <Box sx={{ display: "flex", paddingInline: 4 }}>
                    <RPiIcon fontSize="large" sx={{ fontSize: 100, flexGrow: 0 }} />
                    <Box sx={{ flexGrow: 1, marginLeft: 1 }}>
                        <Typography variant="h5" sx={{
                            fontWeight: "bold"
                        }}>
                            {sensor.type}
                        </Typography>
                        <Typography variant="body1">
                            {
                                "ID: " + sensor.id + " • " + (sensor.online ? "Online" : "Offline")
                            }
                        </Typography>
                        <Button variant="contained" color="primary" sx={{ marginTop: 1 }} onClick={() => window.open("https://ingest-worker.benhong.workers.dev/consume/" + sensor.id, "_blank")}>
                            Open in new tab
                        </Button>
                    </Box>
                </Box>
                <iframe
                    src={"https://ingest-worker.benhong.workers.dev/consume/" + sensor.id}
                    style={{ width: "100%", height: "calc(100vh - 220px)", marginTop: 10 }}
                    frameBorder="0"
                >
                </iframe>
            </Box>
        </Fade >
    );
}