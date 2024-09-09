import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
