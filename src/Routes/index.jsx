import { Route, Routes as Router } from "react-router-dom";

import Home from "./Home";
import Search from "./Search";
import Sensor from "./Sensor";

export default function Routes() {
	return (
		<Router>
			<Route path="/" element={<Home />} />
			<Route path="search" element={<Search />} />
			<Route path="sensor/:id" element={<Sensor />} />
		</Router>
	);
}
