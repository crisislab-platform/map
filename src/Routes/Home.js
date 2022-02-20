import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Fade from '@mui/material/Fade';

const FlexSquare = (props) => (
    <div style={{ flexGrow: 1, flexShrink: 0, position: "relative" }}>
        <Paper style={{ backgroundColor: props.color, width: "100%", paddingBottom: '100%' }} />
        <Typography variant="body1" style={{ width: '100%', position: "absolute", textAlign: 'center' }}>{props.text}</Typography>
    </div>
)

export default function Home() {
    return (
        <Fade in>
            <Box>
                <Box sx={{ padding: 3 }}>

                    {/* <img src="/crisis_lab_i_small.png" style={{height: 100, marginTop: 20}}></img> */}
                    <Box sx={{
                        paddingInline: 1,
                        paddingBlock: 3,
                        marginTop: 8,
                    }}>
                        <Typography variant="h3" sx={{
                            fontWeight: "bold",
                        }}>
                            Sensor Map
                        </Typography>
                        <Typography variant="h6" sx={{
                            marginTop: 2,
                            fontWeight: 400,
                            lineHeight: "1.4em"
                        }}>
                            See CRISiSLab's experimental EEW sensor network in action!
                        </Typography>

                    </Box>

                </Box>

                <Box sx={{ position: "absolute", bottom: 20, width: "100%", padding: 4 }}>
                    <Typography variant="h6" sx={{ marginTop: 10, marginBottom: 1 }}>
                        Base map:
                    </Typography>

                    <Box sx={{ display: "flex", gap: 9, marginInline: 2 }}>
                        <FlexSquare color="pink" text="2D" />
                        <FlexSquare color="orange" text="Satellite" />
                        <FlexSquare color="cyan" text="Terrain" />
                    </Box>

                    <Typography variant="h6" sx={{ marginTop: 3, marginBottom: 1 }}>
                        Layers:
                    </Typography>

                    <Box sx={{ display: "flex", gap: 9, marginInline: 2 }}>
                        <FlexSquare color="cyan" text="Sensors" />
                        <FlexSquare color="pink" text="GNS" />
                        <FlexSquare color="orange" text="Fault Lines" />
                    </Box>

                    <Typography variant="h6" sx={{ marginTop: "5vh", marginBottom: 1 }}>
                        A project by:
                    </Typography>

                    <img src="/crisis_lab_i_small.png" style={{ height: 100 }}></img>
                </Box>
            </Box>
        </Fade>
    )
}