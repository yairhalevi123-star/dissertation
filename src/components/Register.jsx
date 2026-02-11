import { useState } from "react";
import axios from "axios";

function Register({ onRegister }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [lastPeriodDate, setLastPeriodDate] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/register", {
        name,
        email,
        password,
        last_period_date: lastPeriodDate,
      });
      // Clear AI chat history for new register
      localStorage.removeItem("chat_history");
      setMessage("הרשמה בוצעה בהצלחה! התחברי בבקשה.");
      onRegister();
    } catch (error) {
      setMessage(error.response?.data || "שגיאה בהרשמה");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h1 className="card-title text-center">הרשמה</h1>
              <form onSubmit={handleRegister}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    שם:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    דוא"ל:
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    סיסמה:
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="lastPeriodDate" className="form-label">
                    תאריך מחזור אחרון:
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="lastPeriodDate"
                    value={lastPeriodDate}
                    onChange={(e) => setLastPeriodDate(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-success w-100">
                  הרשמה
                </button>
              </form>
              {message && (
                <div className="alert alert-success mt-3">{message}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
