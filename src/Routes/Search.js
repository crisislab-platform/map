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
import { useSearchParams } from 'react-router-dom';
import { getDistance } from 'geolib';
import RPiIcon from './RPiIcon';
import { Fade } from '@mui/material';

export default function Search() {
    const [sensors] = React.useContext(SensorsContext);
    const [searchParams] = useSearchParams();
    const name = searchParams.get('name');
    const center = JSON.parse(searchParams.get('center'));
    const bbox = searchParams.get('bbox') && JSON.parse(searchParams.get('bbox'));
    let results

    if (bbox) {
        // Look for sensors inside the bounding box
        results = sensors.filter(sensor => {
            const { latitude, longitude } = sensor;
            return bbox[1] <= latitude && bbox[3] >= latitude && bbox[0] <= longitude && bbox[2] >= longitude;
        })

    } else {
        // Find the top 5 closest sensors to the location
        const [longitude, latitude] = center
        // Use geolib to calculate the distance between the center and each sensor
        results = sensors.map(sensor => {
            const { latitude: sensorLatitude, longitude: sensorLongitude } = sensor;
            return {
                ...sensor,
                distance: getDistance({ latitude, longitude }, { latitude: sensorLatitude, longitude: sensorLongitude })
            }
        }).sort((a, b) => a.distance - b.distance).slice(0, 5);
    }

    console.log("Sensors:", sensors);

    return (
        <Fade in>
                <Box sx={{
                    paddingInline: 0,
                    paddingBlock: 6,
                    marginTop: 7,
                }}>
                    <Typography variant="h6" sx={{
                        fontWeight: "bold",
                        marginInline: 4
                    }}>
                        {bbox ? "Sensors in" : "Sensors near"}
                        {" "}
                        {name}
                        :
                    </Typography>

                    {results.length > 0 && (
                        <List>
                            {results.map(sensor => (
                                <ListItem button sx={{paddingInline: 4}}>
                                    <ListItemIcon>
                                        <RPiIcon fontSize="large" />
                                    </ListItemIcon>
                                    <ListItemText 
                                    primary={sensor.type} 
                                    secondary={
                                        (bbox ? "" : (sensor.distance > 1000 ? 
                                            Math.round(sensor.distance / 100) / 10 + " kilometers away" : 
                                            sensor.distance + " meters away") + " • ") + 
                                            "ID: " + sensor.id + " • " + (sensor.online ? "Online" : "Offline")
                                    } 
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
        </Fade>
    );
}