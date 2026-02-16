import React, { useState } from "react";
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
import GuestFAQ from "./components/GuestFAQ";
import "./App.css";

function AppContent() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null,
  );
  const navigate = useNavigate();

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    navigate("/dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("chat_history");
    navigate("/login");
  };

  return (
    <div className="App" dir="rtl">
      {/* CSS Fixes for Smooth Scrolling and Navbar Offset */}
      <style>
        {`
          html { scroll-behavior: smooth; }
          /* This stops the scroll 100px before the element so the navbar doesn't cover the title */
          [id] { scroll-margin-top: 100px; } 
        `}
      </style>

      <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4 fixed-top shadow-sm">
        <div className="container-fluid">
          <div className="pregnancy-logo">
            <span className="logo">🤰</span>
            <span className="navbar-brand fw-bold">מרכז הריון</span>
          </div>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            {user && (
              <ul className="navbar-nav mx-auto gap-4">
                <li className="nav-item">
                  <a className="nav-link" href="#baby-size">
                    גודל התינוק
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#recommended-tests">
                    הבדיקות המומלצות
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#appointments">
                    הפגישות
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#documents">
                    מסמכים
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#daily-log">
                    לוג יומי
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#kick-counter">
                    מונה בעיטות
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#pregnancy-charts">
                    גרפים - משקל וצירים
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#weight-tracker">
                    מעקב משקל
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#contractions">
                    תזמון צירים
                  </a>
                </li>
              </ul>
            )}
          </div>

          <div className="d-flex align-items-center gap-3">
            {user ? (
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted">שלום, {user.name}</span>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={handleLogout}
                >
                  התנתקות
                </button>
              </div>
            ) : (
              <div className="navbar-nav flex-row gap-3">
                <Link className="nav-link" to="/login">
                  התחברות
                </Link>
                <Link className="nav-link" to="/register">
                  הרשמה
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div style={{ paddingTop: "90px", minHeight: "100vh" }}>
        <Routes>
          <Route
            path="/"
            element={
              user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
            }
          />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route
            path="/register"
            element={<Register onRegister={() => navigate("/login")} />}
          />
          <Route
            path="/dashboard"
            element={
              user ? <Dashboard user={user} /> : <Navigate to="/login" />
            }
          />
        </Routes>
      </div>

      {!user && <GuestFAQ />}
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
