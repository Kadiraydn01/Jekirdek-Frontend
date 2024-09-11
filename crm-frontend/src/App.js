import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";
import PrivateRoute from "./components/PrivateRoute.js";
import HomePage from "./components/Homepage.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
      </Routes>
    </Router>
  );
}

export default App;
