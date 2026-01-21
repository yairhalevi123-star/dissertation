import { useState, useEffect } from "react";
// React Router imports
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import "./App.css";

function AppContent() {
  // State to manage logged-in user
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null,
  );
  // React Router navigation hook
  const navigate = useNavigate();

  // useEffect(() => {
  //   document.documentElement.dir = "rtl";
  // }, []);

  // Handle user login
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData)); // שמירה בדפדפן
    navigate("/dashboard");
  };

  // Handle user registration
  const handleRegister = () => {
    navigate("/login");
  };

  // Handle user logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="App">
      <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4 fixed-top">
        <div className="container-fluid">
          <span className="navbar-brand">Pregnancy Assistant</span>
          <div className="d-flex align-items-center">
            {/* Conditional rendering based on user login status */}
            {user ? (
              <button className="btn btn-outline-danger" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <div className="navbar-nav">
                <Link className="nav-link" to="/login">
                  Login
                </Link>
                <Link className="nav-link" to="/register">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route
          path="/register"
          element={<Register onRegister={handleRegister} />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard user={user} /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
