import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Fade from "@mui/material/Fade";
import ButtonBase from "@mui/material/ButtonBase";
import React from "react";
import MapContext from "../MapContext";

const FlexSquare = (props) => (
  <ButtonBase
    {...props}
    elevation={0}
    button
    style={{
      flexGrow: 1,
      flexShrink: 0,
      borderRadius: 8,
      position: "relative",
      backgroundColor: "none",
      ...props.style,
    }}
  >
    <div
      style={{
        outline: "2px solid #FFFFFF",
        outlineColor: props.selected ? "#1a73e8" : "transparent",
        transition: "outline-color 0.5s",
        padding: "2px",
        borderRadius: 8,
        width: "100%",
      }}
    >
      <Paper
        style={{
          backgroundColor: props.color,
          width: "100%",
          paddingBottom: "100%",
          borderRadius: 6,
        }}
        elevation={0}
      />
    </div>
    <Typography
      variant="body1"
      style={{
        width: "100%",
        lineHeight: "1em",
        position: "absolute",
        bottom: -1.2 - (props.lines || 0) * 0.5 + "em",
        textAlign: "center",
      }}
    >
      {props.text}
    </Typography>
  </ButtonBase>
);

export default function Home() {
  const [map] = React.useContext(MapContext);

  const [selectedStyle, setSelectedStyle] = React.useState("streets-v11");

  function setStyle(style) {
    map?.setStyle("mapbox://styles/mapbox/" + style);
    setSelectedStyle(style);
  }

  return (
    <Fade in>
      <Box>
        <Box sx={{ padding: 3 }}>
          {/* <img src="/crisis_lab_i_small.png" style={{height: 100, marginTop: 20}}></img> */}
          <Box
            sx={{
              paddingInline: 1,
              paddingBlock: 3,
              marginTop: 7,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
              }}
            >
              Sensor Map
            </Typography>
            <Typography
              variant="h6"
              sx={{
                marginTop: 2,
                fontWeight: 400,
                lineHeight: "1.4em",
              }}
            >
              See CRISiSLab's experimental EEW sensor network in action!
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{ position: "absolute", bottom: 10, width: "100%", padding: 4 }}
        >
          <Typography variant="h6" sx={{ marginTop: 10, marginBottom: 1 }}>
            Base map:
          </Typography>

          <Box sx={{ display: "flex", gap: 2, marginInline: 1 }}>
            {[
              { text: "Streets", color: "pink", id: "streets-v11" },
              { text: "Satellite", color: "blue", id: "satellite-v9" },
              {
                text: "Satellite streets",
                color: "blue",
                id: "satellite-streets-v11",
                lines: 2,
              },
              { text: "Outdoors", color: "green", id: "outdoors-v11" },
              // { text: "Light", color: "yellow", id: "light-v10" },
              { text: "Dark", color: "black", id: "dark-v10" },
            ].map((style) => (
              <FlexSquare
                key={style.id}
                selected={selectedStyle === style.id}
                onClick={() => setStyle(style.id)}
                color={style.color}
                text={style.text}
                lines={style.lines}
              />
            ))}
          </Box>

          {/* <Typography variant="h6" sx={{ marginTop: 3, marginBottom: 1 }}>
            Layers:
          </Typography>

          <Box sx={{ display: "flex", gap: 10, marginInline: 1 }}>
            {[
              { text: "EEW", color: "red", id: "eew-v1" },
              { text: "GNS", color: "red", id: "gns" },
              { text: "Fault lines", color: "red", id: "gns-2" },
            ].map((style) => (
              <FlexSquare
                key={style.id}
                // selected={window.map?.getLayer(style.id)?.visibility}
                onClick={() =>
                  map?.setLayoutProperty(
                    style.id,
                    "visibility",
                    map?.getLayoutProperty(style.id, "visibility") === "visible"
                      ? "none"
                      : "visible"
                  )
                }
                color={style.color}
                text={style.text}
              />
            ))}
          </Box> */}

          <Typography variant="h6" sx={{ marginTop: "5vh", marginBottom: 1 }}>
            A project by:
          </Typography>

          <img src="/crisis_lab_i_small.png" style={{ height: 100 }}></img>
        </Box>
      </Box>
    </Fade>
  );
}
