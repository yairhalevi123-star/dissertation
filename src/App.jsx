import { useState } from "react";
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
import GuestFAQ from "./components/GuestFAQ"; // ייבוא הקומפוננטה החדשה לאורחים
import "./App.css";

function AppContent() {
  // ניהול מצב המשתמש המחובר
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null,
  );

  const navigate = useNavigate();

  // פונקציית התחברות
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    navigate("/dashboard");
  };

  // פונקציית הרשמה
  const handleRegister = () => {
    navigate("/login");
  };

  // פונקציית יציאה
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="App" dir="rtl">
      {" "}
      {/* הוספת RTL לתמיכה בעברית */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4 fixed-top shadow-sm">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold">מרכז עדנה - עוזרת הריון</span>
          <div className="d-flex align-items-center">
            {user ? (
              <div className="d-flex align-items-center gap-3">
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
      {/* ריווח מה-navbar הקבוע */}
      <div style={{ paddingTop: "80px", minHeight: "100vh" }}>
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
            element={<Register onRegister={handleRegister} />}
          />
          <Route
            path="/dashboard"
            element={
              user ? <Dashboard user={user} /> : <Navigate to="/login" />
            }
          />
        </Routes>
      </div>
      {/* לוגיקה לרינדור ה-FAQ: 
          יוצג רק כאשר המשתמש *לא* מחובר.
          ברגע שיש user, הוא יראה את ה-AIChat שנמצא כבר בתוך ה-Dashboard.
      */}
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
