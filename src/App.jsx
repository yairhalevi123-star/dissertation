import React, { useState, useRef, useEffect } from "react";
import {
  BrowserRouter as Router, // הוספנו "as Router" כדי שיהיה שם קצר ואחיד
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
import AIChat from "./components/AIChat";
import "./App.css";

// Apply saved dark-mode immediately to avoid flicker before React mounts
try {
  if (
    typeof window !== "undefined" &&
    localStorage.getItem("dark_mode") === "true"
  ) {
    document.documentElement.classList.add("dark-theme");
  } else {
    document.documentElement.classList.remove("dark-theme");
  }
} catch (e) {
  // ignore if accessing localStorage fails in some environments
}

function AppContent() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null,
  );
  const [status, setStatus] = useState(
    JSON.parse(localStorage.getItem("userStatus")) || null,
  );
  const navigate = useNavigate();
  const aiChatRef = useRef(null);

  useEffect(() => {
    const handleDarkMode = (e) => {
      const detail = typeof e?.detail !== "undefined" ? e.detail : null;
      const dark =
        detail !== null ? detail : localStorage.getItem("dark_mode") === "true";
      if (dark) document.documentElement.classList.add("dark-theme");
      else document.documentElement.classList.remove("dark-theme");
    };

    // listen for dispatches from settings and for cross-tab storage changes
    window.addEventListener("dark-mode-changed", handleDarkMode);
    const handleStorage = (ev) => {
      if (ev.key === "dark_mode") handleDarkMode();
    };
    window.addEventListener("storage", handleStorage);

    // apply initial value
    handleDarkMode();

    return () => {
      window.removeEventListener("dark-mode-changed", handleDarkMode);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    navigate("/dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("chat_history");
    localStorage.removeItem("userStatus");
    navigate("/login");
  };

  return (
    <div className="App" dir="rtl">
      <style>
        {`
          html { scroll-behavior: smooth; }
          [id] { scroll-margin-top: 100px; } 
          body { background-color: #fcf6f9; }
        `}
      </style>

      {/* תפריט עליון - יוצג רק כשאין משתמש מחובר */}
      {!user && (
        <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4 fixed-top shadow-sm">
          <div className="container-fluid">
            <div className="pregnancy-logo">
              <span className="logo">🤰</span>
              <span className="navbar-brand fw-bold">מרכז הריון</span>
            </div>
            <div className="navbar-nav flex-row gap-3">
              <Link className="nav-link" to="/login">
                התחברות
              </Link>
              <Link className="nav-link" to="/register">
                הרשמה
              </Link>
            </div>
          </div>
        </nav>
      )}

      {/* תוכן ראשי */}
      <div style={{ paddingTop: user ? "0px" : "90px", minHeight: "100vh" }}>
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
          {/* שים לב לשינוי כאן: הוספנו /* כדי שנוכל לנווט בתוך הדאשבורד */}
          <Route
            path="/dashboard/*"
            element={
              user ? (
                <Dashboard user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </div>

      {user && status && (
        <AIChat ref={aiChatRef} userStatus={status} userId={user.id} />
      )}

      {!user && <GuestFAQ />}
    </div>
  );
}

// הפונקציה המרכזית שמשתמשת ב-Router
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
