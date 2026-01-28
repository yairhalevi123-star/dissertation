import React, { useState, useEffect } from "react";
import axios from "axios";

function KickCounter({ userId }) {
  const [kicks, setKicks] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  const handleKick = async () => {
    let currentSessionId = sessionId;

    if (!isTracking) {
      setIsTracking(true);
      setStartTime(Date.now());

      // Create a new session first
      try {
        const sessionResponse = await axios.post(
          `http://localhost:3000/api/kick-sessions/${userId}`,
          {
            session_date: new Date().toISOString().split("T")[0],
          },
        );
        currentSessionId = sessionResponse.data.session_id;
        setSessionId(currentSessionId);
      } catch (err) {
        console.error("Error creating kick session", err);
        return;
      }
    }

    const newKickCount = kicks + 1;
    setKicks(newKickCount);

    // Save kick to database
    try {
      await axios.post(`http://localhost:3000/api/kicks/${userId}`, {
        session_id: currentSessionId,
        kick_count: newKickCount,
      });
    } catch (err) {
      console.error("Error saving kick", err);
    }
  };

  const resetCounter = async () => {
    if (sessionId) {
      try {
        // Save final session
        const duration = Math.floor((Date.now() - startTime) / 1000);
        await axios.post(`http://localhost:3000/api/kick-sessions/${userId}`, {
          session_id: sessionId,
          total_kicks: kicks,
          duration_seconds: duration,
          session_date: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Error saving session", err);
      }
    }

    setKicks(0);
    setIsTracking(false);
    setStartTime(null);
    setSessionId(null);
  };

  return (
    <div className="card shadow-sm p-4 text-center mt-4">
      <h3>מונה בעיטות 👣</h3>
      <p className="text-muted">מומלץ לספור 10 תנועות בתוך שעה-שעתיים</p>

      <div className="display-1 my-3">{kicks}</div>

      <button
        className="btn btn-primary btn-lg rounded-circle mb-3"
        style={{ width: "120px", height: "120px" }}
        onClick={handleKick}
      >
        בעיטה!
      </button>

      <div>
        {isTracking && (
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={resetCounter}
          >
            איפוס וחיסכון
          </button>
        )}
        {!isTracking && kicks > 0 && (
          <p className="text-success mt-2">✓ נשמר בהצלחה!</p>
        )}
      </div>
    </div>
  );
}

export default KickCounter;
