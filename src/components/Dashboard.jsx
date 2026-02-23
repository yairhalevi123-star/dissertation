import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import {
  Home,
  Activity,
  Briefcase,
  Calendar,
  Settings,
  ClipboardList,
} from "lucide-react";

import DocumentUpload from "./DocumentUpload";
import DailyLog from "./DailyLog";
import BabySize from "./BabySize";
import KickCounter from "./KickCounter";
import WeightTracker from "./WeightTracker";
import ContractionTimer from "./ContractionTimer";
import AIChat from "./AIChat";
import Appointments from "./Appointments";
import PregnancyCharts from "./PregnancyCharts";
import HospitalBag from "./HospitalBag";
import NotificationSettings from "./NotificationSettings";

function Dashboard({ user, onLogout }) {
  const [status, setStatus] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const aiChatRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (!user || !user.id) {
      setError("מידע משתמש חסר");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [statusRes, testsRes] = await Promise.all([
          axios.get(`/api/user/status/${user.id}`),
          axios.get(`/api/user/tests/${user.id}`),
        ]);
        setStatus(statusRes.data);
        localStorage.setItem("userStatus", JSON.stringify(statusRes.data));
        setTests(testsRes.data || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("שגיאה בחיבור לשרת.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const checkFoodSafety = async (foodName) => {
    if (aiChatRef.current && aiChatRef.current.checkFoodSafety) {
      aiChatRef.current.checkFoodSafety(foodName);
    }
  };

  const toggleTest = async (testId, currentStatus) => {
    try {
      await axios.patch(`/api/user/tests/${testId}`, {
        is_completed: !currentStatus,
      });
      setTests((prev) =>
        prev.map((t) =>
          t.id === testId ? { ...t, is_completed: !currentStatus } : t,
        ),
      );
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  if (loading)
    return (
      <div className="text-center mt-5 p-5">
        <h3>טוען...</h3>
      </div>
    );
  if (error)
    return <div className="alert alert-danger m-5 text-center">{error}</div>;

  // פונקציית עזר לבדיקה איזה נתיב פעיל ב-Sidebar
  const isActive = (path) => location.pathname === path;

  return (
    <div className="dashboard-wrapper" dir="rtl">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>BellyStep ✨</h2>
        </div>
        <nav className="sidebar-nav">
          <Link
            to="/dashboard"
            className={`nav-item ${isActive("/dashboard") ? "active" : ""}`}
          >
            <Home size={20} /> דף הבית
          </Link>
          <Link
            to="/dashboard/medical"
            className={`nav-item ${isActive("/dashboard/medical") ? "active" : ""}`}
          >
            <ClipboardList size={20} /> בדיקות ומסמכים
          </Link>
          <Link
            to="/dashboard/trackers"
            className={`nav-item ${isActive("/dashboard/trackers") ? "active" : ""}`}
          >
            <Activity size={20} /> מעקב וגרפים
          </Link>
          <Link
            to="/dashboard/prep"
            className={`nav-item ${isActive("/dashboard/prep") ? "active" : ""}`}
          >
            <Briefcase size={20} /> הכנה ללידה
          </Link>
          <Link
            to="/dashboard/settings"
            className={`nav-item ${isActive("/dashboard/settings") ? "active" : ""}`}
          >
            <Settings size={20} /> הגדרות
          </Link>

          <button
            onClick={onLogout}
            className="nav-item logout-btn mt-auto"
            style={{
              border: "none",
              background: "none",
              textAlign: "right",
              width: "100%",
            }}
          >
            יציאה
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-bar">
          <div>
            <h1>שלום, {status?.name || "אורחת"}! 👋</h1>
            <p className="text-muted mb-0">שמחים לראות אותך שוב</p>
          </div>
          <div className="week-badge">
            שבוע {status?.currentWeek} + {status?.daysIntoWeek} ימים
          </div>
        </header>

        {/* Progress Bar הקבוע בראש כל הדפים */}
        <div className="card mb-4 shadow-sm border-0 progress-card-top">
          <div className="card-body py-2">
            <div
              className="progress"
              style={{ height: "10px", borderRadius: "10px" }}
            >
              <div
                className="progress-bar"
                style={{
                  width: `${Math.min((status?.currentWeek / 40) * 100, 100)}%`,
                  backgroundColor: "#ff69b4",
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* חלוקת התוכן לפי נתיבים */}
        <Routes>
          {/* --- דף הבית --- */}
          <Route
            path="/"
            element={
              <div className="content-grid">
                <div className="grid-full-width">
                  <div className="food-safety-quick-access p-4 bg-white rounded-4 shadow-sm text-center">
                    <h4 className="mb-3" style={{ color: "#ff69b4" }}>
                      🍕 מותר לי לאכול את זה?
                    </h4>
                    <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
                      {["סושי", "ביצה רכה", "קפה", "טונה"].map((food) => (
                        <button
                          key={food}
                          className="btn btn-outline-secondary rounded-pill px-3"
                          onClick={() => checkFoodSafety(food)}
                        >
                          {food}
                        </button>
                      ))}
                    </div>
                    <div
                      className="input-group mx-auto"
                      style={{ maxWidth: "400px" }}
                    >
                      <input
                        id="food-search"
                        type="text"
                        className="form-control rounded-start-pill"
                        placeholder="חפשי מאכל..."
                      />
                      <button
                        className="btn btn-primary rounded-end-pill px-4"
                        onClick={() => {
                          const val =
                            document.getElementById("food-search").value;
                          if (val) checkFoodSafety(val);
                        }}
                      >
                        בדקי
                      </button>
                    </div>
                  </div>
                </div>
                <div className="grid-item">
                  <BabySize currentWeek={status?.currentWeek} />
                </div>
                <div className="grid-item">
                  <DailyLog userId={user.id} />
                </div>
                <div className="grid-item">
                  <KickCounter userId={user.id} />
                </div>
              </div>
            }
          />

          {/* --- דף רפואי --- */}
          <Route
            path="/medical"
            element={
              <div className="content-grid">
                <div className="grid-item">
                  <Appointments userId={user.id} />
                </div>
                <div className="grid-item">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body">
                      <h3 className="h5 mb-3">בדיקות מומלצות</h3>
                      <ul className="list-group list-group-flush">
                        {tests.map((test) => (
                          <li
                            key={test.id}
                            className="list-group-item d-flex align-items-center border-0 px-0 py-2"
                          >
                            <input
                              type="checkbox"
                              className="form-check-input ms-2"
                              checked={test.is_completed}
                              onChange={() =>
                                toggleTest(test.id, test.is_completed)
                              }
                            />
                            <span
                              style={{
                                textDecoration: test.is_completed
                                  ? "line-through"
                                  : "none",
                                fontSize: "0.9rem",
                              }}
                            >
                              {test.title} (שבוע {test.target_week})
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="grid-item">
                  <DocumentUpload userId={user.id} />
                </div>
              </div>
            }
          />

          {/* --- דף מעקבים וגרפים --- */}
          <Route
            path="/trackers"
            element={
              <div className="content-grid">
                <div className="grid-full-width">
                  <PregnancyCharts userId={user.id} />
                </div>
                <div className="grid-item">
                  <WeightTracker userId={user.id} />
                </div>
                <div className="grid-item">
                  <ContractionTimer userId={user.id} />
                </div>
              </div>
            }
          />

          {/* --- דף הכנה ללידה --- */}
          <Route
            path="/prep"
            element={
              <div className="content-grid">
                <div className="grid-item">
                  <HospitalBag
                    currentWeek={status?.currentWeek}
                    userId={user.id}
                  />
                </div>
              </div>
            }
          />

          {/* --- דף הגדרות --- */}
          <Route
            path="/settings"
            element={
              <div className="content-grid">
                <div className="grid-item">
                  <NotificationSettings userId={user.id} />
                </div>
              </div>
            }
          />
        </Routes>

        <AIChat ref={aiChatRef} userStatus={status} userId={user.id} />
      </main>
    </div>
  );
}

export default Dashboard;
