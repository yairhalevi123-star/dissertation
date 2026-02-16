import React, { useState, useEffect } from "react";
import axios from "axios";

import DocumentUpload from "./DocumentUpload";
import DailyLog from "./DailyLog";
import BabySize from "./BabySize";
import KickCounter from "./KickCounter";
import WeightTracker from "./WeightTracker";
import ContractionTimer from "./ContractionTimer";
import AIChat from "./AIChat";
import Appointments from "./Appointments";
import PregnancyCharts from "./PregnancyCharts";
import NotificationSettings from "./NotificationSettings";

function Dashboard({ user }) {
  const [status, setStatus] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Added error state

  useEffect(() => {
    // Safety Guard: Don't fetch if user or user.id is missing
    if (!user || !user.id) {
      setError("User information missing");
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
        setTests(testsRes.data || []); // Fallback to empty array
      } catch (err) {
        console.error("Fetch error:", err);
        setError("שגיאה בחיבור לשרת. בדקי שה-Backend פועל.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]); // Run when user object changes

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

  if (!status)
    return <div className="text-center mt-5">לא נמצאו נתונים עבור המשתמש.</div>;

  return (
    <div className="container mt-5" dir="rtl">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <h1 className="text-center mb-4">
            שלום, {status.name || "אורחת"}! 👋
          </h1>

          {/* Progress Card */}
          <div className="card mb-4 shadow-sm border-0">
            <div className="card-body">
              <h2 className="card-title h4">
                את בשבוע {status.currentWeek} + {status.daysIntoWeek} ימים
              </h2>
              <div
                className="progress mb-3"
                style={{ height: "20px", borderRadius: "10px" }}
              >
                <div
                  className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                  role="progressbar"
                  style={{
                    width: `${Math.min((status.currentWeek / 40) * 100, 100)}%`,
                  }}
                >
                  שבוע {status.currentWeek}
                </div>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div id="baby-size" className="mb-4">
            <BabySize currentWeek={status.currentWeek} />
          </div>
          <div id="ai-chat" className="mb-4">
            <AIChat userStatus={status} userId={user.id} />
          </div>
          <div id="notification-settings" className="mb-4">
            <NotificationSettings userId={user.id} />
          </div>
          <div id="appointments" className="mb-4">
            <Appointments userId={user.id} />
          </div>

          {/* Tests List */}
          <div className="card shadow-sm mb-4 border-0" id="recommended-tests">
            <div className="card-body">
              <h3 className="card-title h5 mb-4">הבדיקות המומלצות עבורך:</h3>
              <ul className="list-group list-group-flush">
                {tests.length > 0 ? (
                  tests.map((test) => (
                    <li
                      key={test.id}
                      className="list-group-item d-flex align-items-center border-0 px-0"
                    >
                      <input
                        type="checkbox"
                        className="form-check-input ms-3"
                        checked={test.is_completed}
                        onChange={() => toggleTest(test.id, test.is_completed)}
                        style={{
                          width: "20px",
                          height: "20px",
                          cursor: "pointer",
                        }}
                      />
                      <span
                        style={{
                          textDecoration: test.is_completed
                            ? "line-through"
                            : "none",
                          color: test.is_completed ? "#adb5bd" : "#212529",
                        }}
                      >
                        <strong>{test.title}</strong> — שבוע {test.target_week}
                      </span>
                    </li>
                  ))
                ) : (
                  <p className="text-muted">אין בדיקות מתוכננות כרגע.</p>
                )}
              </ul>
            </div>
          </div>

          <div id="documents" className="mb-4">
            <DocumentUpload userId={user.id} />
          </div>
          <div id="daily-log" className="mb-4">
            <DailyLog userId={user.id} />
          </div>
          <div id="kick-counter" className="mb-4">
            <KickCounter userId={user.id} />
          </div>

          {/* PregnancyCharts - Combined Weight & Contraction Charts */}
          <div id="pregnancy-charts" className="mb-4">
            <div className="card shadow-sm border-0">
              <div className="card-body p-0">
                <PregnancyCharts />
              </div>
            </div>
          </div>

          {/* Original Individual Components */}
          <div className="row">
            <div className="col-lg-6 mb-4" id="weight-tracker">
              <WeightTracker userId={user.id} />
            </div>
            <div className="col-lg-6 mb-4" id="contractions">
              <ContractionTimer userId={user.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
