import { useState, useEffect } from "react";
import axios from "axios";
import DocumentUpload from "./DocumentUpload";
import DailyLog from "./DailyLog";
import BabySize from "./BabySize";

function Dashboard({ user }) {
  const [status, setStatus] = useState(null);
  const [tests, setTests] = useState([]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await axios.get(`/api/user/status/${user.id}`);
        setStatus(response.data);
      } catch (error) {
        console.error("שגיאה במשיכת הנתונים", error);
      }
    };
    fetchStatus();
  }, [user.id]);

  useEffect(() => {
    axios
      .get(`/api/user/tests/${user.id}`)
      .then((res) => setTests(res.data))
      .catch((err) => console.error(err));
  }, [user.id]);

  const toggleTest = async (testId, currentStatus) => {
    try {
      await axios.patch(`/api/user/tests/${testId}`, {
        is_completed: !currentStatus,
      });
      setTests(
        tests.map((t) =>
          t.id === testId ? { ...t, is_completed: !currentStatus } : t,
        ),
      );
    } catch (err) {
      console.error("שגיאה בעדכון הבדיקה", err);
    }
  };

  // --- הגנה וחישובים ---
  if (!status) return <div className="text-center mt-5">טוען נתונים...</div>;

  // החישובים מתבצעים רק אחרי שווידאנו ש-status קיים
  const currentDays = status.currentWeek * 7 + (status.daysIntoWeek || 0);
  const daysRemaining = Math.max(0, 280 - currentDays);
  const preciseProgress = Math.min(100, (currentDays / 280) * 100);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <h1 className="text-center mb-4">שלום, {status.name}! 👋</h1>

          {/* כרטיס סטטוס שבועי */}
          <div className="card mb-4 shadow-sm">
            <div className="card-body">
              <h2 className="card-title">
                את בשבוע {status.currentWeek} + {status.daysIntoWeek} ימים
              </h2>
              <p className="card-text text-muted">
                טרימסטר: {status.trimester}
              </p>

              <div className="progress mb-3" style={{ height: "20px" }}>
                <div
                  className="progress-bar bg-success"
                  role="progressbar"
                  style={{ width: `${(status.currentWeek / 40) * 100}%` }}
                  aria-valuenow={status.currentWeek}
                  aria-valuemin="0"
                  aria-valuemax="40"
                >
                  שבוע {status.currentWeek}
                </div>
              </div>
            </div>
          </div>

          {/* כרטיס ספירה לאחור - מבוסס ימים */}
          <div className="card mb-4 text-white  shadow-sm">
            <div className="card-body text-center">
              <h3 className="mb-3">
                עוד {daysRemaining} ימים לתאריך הלידה המשוער! 👶
              </h3>
              <div className="progress" style={{ height: "12px" }}>
                <div
                  className="progress-bar progress-bar-striped progress-bar-animated bg-info"
                  role="progressbar"
                  style={{ width: `${preciseProgress}%` }}
                ></div>
              </div>
              <small className="d-block mt-2">
                השלמת {Math.round(preciseProgress)}% מהמסע שלך
              </small>
            </div>
          </div>

          <BabySize currentWeek={status.currentWeek} />

          {/* רשימת בדיקות */}
          <div className="card shadow-sm mt-4">
            <div className="card-body">
              <h3 className="card-title mb-4">הבדיקות המומלצות עבורך:</h3>
              <ul className="list-group list-group-flush">
                {tests.map((test) => (
                  <li
                    key={test.id}
                    className="list-group-item d-flex align-items-center py-3"
                  >
                    <input
                      type="checkbox"
                      className="form-check-input me-3"
                      checked={test.is_completed}
                      onChange={() => toggleTest(test.id, test.is_completed)}
                      style={{ transform: "scale(1.3)" }}
                    />
                    <span
                      style={{
                        textDecoration: test.is_completed
                          ? "line-through"
                          : "none",
                        color: test.is_completed ? "gray" : "black",
                      }}
                    >
                      <strong>{test.title}</strong> - שבוע {test.target_week}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card mt-4 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">העלאת מסמכים</h5>
              <DocumentUpload userId={user.id} />
            </div>
          </div>

          <DailyLog userId={user.id} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
