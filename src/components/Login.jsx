import { useState } from "react";
import axios from "axios";

function Login({ onLogin }) {
  // State variables for email, password, and message
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    // Try to log in the user by sending a POST request to the server
    try {
      const response = await axios.post("/api/login", { email, password });
      setMessage(response.data.message);
      onLogin(response.data.user);
    } catch (error) {
      setMessage(error.response?.data?.message || "שגיאה בהתחברות");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h1 className="card-title text-center">התחברות</h1>
              <form onSubmit={handleLogin}>
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
                <button type="submit" className="btn btn-primary w-100">
                  התחבר
                </button>
              </form>
              {message && (
                <div className="alert alert-info mt-3">{message}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
