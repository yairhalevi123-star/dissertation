import React, { useState, useEffect } from "react";
import axios from "axios";
import "./KickCounter.css";

function KickCounter({ userId }) {
  // Timer states
  const [kicks, setKicks] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Session completion states
  const [showModal, setShowModal] = useState(false);
  const [intensity, setIntensity] = useState(3);
  const [sessionNotes, setSessionNotes] = useState("");

  // AI insights states
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTracking) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  // Fetch AI insights on mount
  useEffect(() => {
    if (userId) {
      fetchInsights();
    }
  }, [userId]);

  const fetchInsights = async () => {
    try {
      setInsightsLoading(true);
      const response = await axios.get(`/api/kick-sessions/${userId}/analyze`);
      setInsights(response.data.insights);
    } catch (err) {
      console.error("Error fetching insights:", err);
      setInsights(null);
    } finally {
      setInsightsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleKick = () => {
    if (!isTracking) {
      setIsTracking(true);
      setStartTime(Date.now());
      setElapsedSeconds(0);
    }
    setKicks((prev) => prev + 1);
  };

  const handleSaveSession = async () => {
    try {
      const endTime = Date.now();
      const durationSeconds = Math.round((endTime - startTime) / 1000);

      await axios.post(`/api/kick-sessions/${userId}`, {
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        total_kicks: kicks,
        duration_seconds: durationSeconds,
        intensity,
        session_notes: sessionNotes,
      });

      // Reset states
      setKicks(0);
      setIsTracking(false);
      setStartTime(null);
      setElapsedSeconds(0);
      setShowModal(false);
      setIntensity(3);
      setSessionNotes("");

      // Fetch updated insights
      fetchInsights();
    } catch (err) {
      console.error("Error saving session:", err);
      alert("حدث خطأ في حفظ الجلسة");
    }
  };

  const handleReset = () => {
    setKicks(0);
    setIsTracking(false);
    setStartTime(null);
    setElapsedSeconds(0);
    setShowModal(false);
    setIntensity(3);
    setSessionNotes("");
  };

  const progressPercent = Math.min((kicks / 10) * 100, 100);

  return (
    <div className="kick-counter-container">
      {/* AI Insights Card */}
      {insights && (
        <div className="ai-insights-kick-card">
          <h4>✨ תובנות BellyStep AI</h4>
          <div
            className={`insights-text ${insightsLoading ? "loading-pulse" : ""}`}
          >
            {insightsLoading ? (
              <p>🤖 BellyStep מנתחת את הנתונים...</p>
            ) : (
              <p>{insights}</p>
            )}
          </div>
          <button
            className="btn-refresh-insights"
            onClick={fetchInsights}
            disabled={insightsLoading}
          >
            🔄
          </button>
        </div>
      )}

      {/* Main Counter Card */}
      <div className="kick-counter-card">
        <div className="counter-header">
          <h3>👣 מונה בעיטות</h3>
          <p className="counter-subtitle">מומלץ לספור 10 תנועות בתוך שעה</p>
        </div>

        {/* Circular Progress Bar */}
        <div className="circular-progress-container">
          <svg className="circular-progress" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" className="progress-bg" />
            <circle
              cx="50"
              cy="50"
              r="45"
              className="progress-fill"
              style={{
                strokeDasharray: `${progressPercent * 2.827} 282.7`,
              }}
            />
          </svg>
          <div className="progress-text">
            <div className="kicks-display">{kicks}</div>
            <div className="progress-label">בעיטות</div>
          </div>
        </div>

        {/* Timer Display */}
        {isTracking && (
          <div className="timer-display">
            ⏱️ זמן שחלף:{" "}
            <span className="timer-value">{formatTime(elapsedSeconds)}</span>
          </div>
        )}

        {/* Main Kick Button */}
        <button
          className={`kick-button ${isTracking ? "tracking" : ""}`}
          onClick={handleKick}
        >
          <span className="kick-button-text">בעיטה!</span>
          {isTracking && <span className="pulse"></span>}
        </button>

        {/* Action Buttons */}
        <div className="action-buttons">
          {isTracking && (
            <>
              <button
                className="btn btn-success"
                onClick={() => setShowModal(true)}
              >
                💾 שמור ועצור
              </button>
              <button className="btn btn-outline-danger" onClick={handleReset}>
                ❌ בטל
              </button>
            </>
          )}
          {!isTracking && kicks > 0 && (
            <>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setIsTracking(true);
                  setStartTime(Date.now());
                }}
              >
                ▶️ המשך
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={handleReset}
              >
                🔄 איפוס
              </button>
            </>
          )}
        </div>
      </div>

      {/* Session Completion Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-card session-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h4>סיום הסשן</h4>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="session-summary">
                <p>
                  <strong>בעיטות:</strong> {kicks}
                </p>
                <p>
                  <strong>זמן:</strong> {formatTime(elapsedSeconds)}
                </p>
              </div>

              {/* Intensity Rating */}
              <div className="form-group">
                <label>עוצמת התנועות:</label>
                <div className="intensity-hearts">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      className={`heart ${intensity >= level ? "filled" : ""}`}
                      onClick={() => setIntensity(level)}
                    >
                      ❤️
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="form-group">
                <label>הערות (אופציונלי):</label>
                <textarea
                  className="form-control"
                  placeholder="דוגמה: אחרי שתיית מים קרים..."
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  rows="2"
                />
              </div>

              {/* Save Button */}
              <button
                className="btn btn-success w-100"
                onClick={handleSaveSession}
              >
                💾 שמור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KickCounter;
