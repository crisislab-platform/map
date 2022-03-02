import {
  Routes as Router,
  Route
} from "react-router-dom";
import Search from "./Search";
import Home from "./Home";
import Sensor from "./Sensor";

export default function Routes() {
  return (
    <Router>
      <Route path="/" element={<Home />} />
      <Route path="search" element={<Search />} />
      <Route path="sensor/:id" element={<Sensor />} />
    </Router>
  )
}
