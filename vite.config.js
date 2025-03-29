import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	server: {
		port: 3000,
		strictPort: true, // We have to allow each port in MapBox, otherwise the map won't load, so we need this specific one.
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					mapbox: ["mapbox-gl"],
				},
			},
		},
	},
});
