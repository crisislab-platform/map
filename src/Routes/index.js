import {
  Routes as Router,
  Route
} from "react-router-dom";
import Search from "./Search";
import Home from "./Home";

export default function Routes() {
  return (
    <Router>
      <Route path="/" element={<Home />} />
      <Route path="search" element={<Search />} />
    </Router>
  )
}
