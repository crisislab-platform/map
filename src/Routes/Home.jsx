import { Box, Fade, Link, Stack, Typography } from "@mui/material";

export default function Home() {
	return (
		<Fade in>
			<Stack sx={{ p: 3, height: "100%" }}>
				{/* <img src="/crisis_lab_i_small.png" style={{height: 100, marginTop: 20}}></img> */}
				<Box
					sx={{
						paddingInline: 1,
						paddingBlock: 3,
						marginTop: 7,
					}}>
					<Typography
						variant="h3"
						sx={{
							fontWeight: "bold",
						}}>
						Sensor Map
					</Typography>
					<Typography
						variant="h6"
						sx={{
							marginTop: 2,
							fontWeight: 400,
							lineHeight: "1.4em",
						}}>
						See CRISiSLab's experimental EEW sensor network in action!
					</Typography>
				</Box>
				<Box sx={{ m: 1, mb: 0, mt: "auto" }}>
					<Typography variant="h6" sx={{ marginTop: "5vh", marginBottom: 1 }}>
						A project by:
					</Typography>

					<img src="/crisis_lab_i_small.png" style={{ height: 100 }}></img>
				</Box>
				<Link href="https://admin.crisislab.org.nz" rel="noopener norefferer">
					Admin panel
				</Link>
			</Stack>
		</Fade>
	);
}
