import { Box, Fade, Link, Stack, Typography } from "@mui/material";

export default function Home() {
	return (
		<Fade in>
			<Stack sx={{ p: 3, height: "100%" }}>
				<Box
					sx={{
						paddingInline: 1,
						// paddingBlock: 3,
						// marginTop: 6,
					}}>
					<Box sx={{ display: "flex", gap: 3, marginTop: 4 }}>
						<img src="/crisis_lab_i_small.png" style={{ height: 80, width: 120 }}></img>
						<Typography
							variant="h4"
							sx={{
								fontWeight: "bold",
								fontWeight: 400,
							}}>
							EEW Experimental Sensor Network
						</Typography>
					</Box>
					<Typography
						variant="h5"
						sx={{
							marginTop: 2,
							fontWeight: 600,
							lineHeight: "1.4em",
						}}>
						Sensor Map
					</Typography>
					<Typography
						variant="body1"
						sx={{
							marginTop: 2,
						}}>
						Public facing web interface which provides access to real-time ground motion data and sensor
						metadata.
					</Typography>
				</Box>
				<Box sx={{ m: 1, mb: 0, mt: "auto" }}>
					<Typography variant="h6" sx={{ marginTop: "5vh", marginBottom: 1 }}>
						Supported by:
					</Typography>

					<Box sx={{ display: "flex", gap: 3 }}>
						<img src="/eqc_logo.svg" />
						<img style={{ height: 50 }} src="/massey_logo.svg" />
					</Box>
				</Box>
				<Link href="https://admin.crisislab.org.nz" rel="noopener norefferer">
					Admin panel
				</Link>
			</Stack>
		</Fade>
	);
}
