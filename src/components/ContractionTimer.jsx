import React, { useState, useEffect } from "react";
import axios from "axios";

function ContractionTimer({ userId }) {
  const [contractions, setContractions] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [currentDuration, setCurrentDuration] = useState(0);

  // Update display time while contraction is active
  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        setCurrentDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  const handlePress = async () => {
    const now = Date.now();
    if (!isActive) {
      // Start contraction
      setStartTime(now);
      setIsActive(true);
    } else {
      // End contraction
      const duration = Math.floor((now - startTime) / 1000);
      const interval =
        contractions.length > 0
          ? Math.floor((startTime - contractions[0].rawStart) / 60000)
          : 0;

      const newContraction = {
        start: new Date(startTime).toLocaleTimeString("he-IL"),
        duration: duration,
        interval: interval,
        rawStart: startTime,
      };

      const updatedContractions = [newContraction, ...contractions];
      setContractions(updatedContractions);

      // Save to database
      try {
        await axios.post(`http://localhost:3000/api/contractions/${userId}`, {
          start_time: new Date(startTime).toISOString(),
          duration_seconds: duration,
          interval_minutes: interval,
        });
      } catch (err) {
        console.error("Error saving contraction", err);
      }

      setIsActive(false);
      setCurrentDuration(0);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="card shadow-sm p-4 mt-4 bg-light">
      <h3 className="text-center">תזמון צירים ⏱️</h3>

      {isActive && (
        <div className="alert alert-info text-center mb-3">
          <h4>{formatTime(currentDuration)}</h4>
          <small>משך הציר הנוכחי</small>
        </div>
      )}

      <button
        className={`btn btn-lg w-100 py-4 ${
          isActive ? "btn-danger" : "btn-success"
        }`}
        onClick={handlePress}
      >
        {isActive ? "הציר הסתיים (לחיצה לסיום)" : "הציר התחיל (לחיצה להתחלה)"}
      </button>

      {contractions.length > 0 && (
        <div className="mt-4">
          <h5>רישום צירים:</h5>
          <ul className="list-group">
            {contractions.map((c, i) => (
              <li key={i} className="list-group-item">
                <div className="d-flex justify-content-between align-items-center">
                  <span>
                    <strong>#{contractions.length - i}</strong>
                  </span>
                  <span>שעה: {c.start}</span>
                  <span>משך: {formatTime(c.duration)}</span>
                  {c.interval > 0 && (
                    <span className="badge bg-primary">
                      מרווח: {c.interval} דק׳
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {contractions.length >= 3 && (
            <div className="alert alert-warning mt-3">
              <strong>הערה:</strong> אם הצירים קבועים ותכופים, בואו לבדיקה בבית
              החולים
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ContractionTimer;
