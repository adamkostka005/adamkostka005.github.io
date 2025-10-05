import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import RD from "./pages/RD";

function App() {
  return (
    <Router basename="/">
      <nav>
        <Link to="/">Domů</Link> | <Link to="/rd">Model domu</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rd" element={<RD />} />
      </Routes>
    </Router>
  );
}

export default App;