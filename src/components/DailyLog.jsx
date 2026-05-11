import { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./DailyLog.css";

function DailyLog({ userId }) {
  const [formData, setFormData] = useState({
    weight: "",
    water_intake: "",
    mood: "",
    notes: "",
  });

  const [logs, setLogs] = useState([]);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchLogs();
    }
  }, [userId]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/logs-history/${userId}`);
      setLogs(response.data || []);
    } catch (err) {
      console.error("Error fetching logs:", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/logs/${userId}`, formData);
      setFormData({ weight: "", water_intake: "", mood: "", notes: "" });
      fetchLogs();
    } catch (err) {
      console.error("Error saving log:", err);
    }
  };

  const handleAnalyze = async () => {
    try {
      setInsightsLoading(true);
      const response = await axios.post(`/api/logs-history/${userId}/analyze`);
      setInsights(response.data.insights);
    } catch (err) {
      console.error("Error analyzing logs:", err);
      setInsights(["לא הצלחתי לנתח את הנתונים כרגע. נסי שוב בעוד רגע."]);
    } finally {
      setInsightsLoading(false);
    }
  };

  // Prepare data for chart (reverse for chronological order, limit to 15 days)
  const chartData = logs
    .slice()
    .reverse()
    .slice(-15)
    .map((log) => ({
      date: new Date(log.log_date).toLocaleDateString("he-IL", {
        month: "short",
        day: "numeric",
      }),
      weight: log.weight ? parseFloat(log.weight) : null,
      water: log.water_intake ? log.water_intake / 1000 : null, // Convert to liters
      mood: log.mood,
      notes: log.notes,
      fullDate: log.log_date,
    }));

  // Recent 5 logs
  const recentLogs = logs.slice(0, 5);

  return (
    <div className="daily-log-container">
      {/* AI Insights Card */}
      {logs.length > 0 && (
        <div className="ai-insights-card">
          <div className="insights-header">
            <h3>✨ תובנות BellyStep AI</h3>
            <button
              onClick={handleAnalyze}
              disabled={insightsLoading}
              className="btn-analyze"
            >
              {insightsLoading ? "🤖 AI מנתחת..." : "📊 נתחי את השבוע שלי"}
            </button>
          </div>

          {insights && (
            <div className="insights-list">
              {insights.map((insight, idx) => (
                <div key={idx} className="insight-item">
                  <span className="insight-bullet">→</span>
                  <p>{insight}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Log Entry Form */}
      <div className="card mt-4">
        <div className="card-body">
          <h5 className="card-title">לוג יומי</h5>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="weight" className="form-label">
                משקל (ק"ג)
              </label>
              <input
                type="number"
                step="0.1"
                className="form-control"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="water_intake" className="form-label">
                צריכת מים (מ"ל)
              </label>
              <input
                type="number"
                className="form-control"
                id="water_intake"
                name="water_intake"
                value={formData.water_intake}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="mood" className="form-label">
                מצב רוח
              </label>
              <select
                className="form-select"
                id="mood"
                name="mood"
                value={formData.mood}
                onChange={handleChange}
              >
                <option value="">בחר</option>
                <option value="שמח">שמח 😊</option>
                <option value="עצוב">עצוב 😢</option>
                <option value="עייף">עייף 😴</option>
                <option value="לחוץ">לחוץ 😰</option>
                <option value="רגוע">רגוע 😌</option>
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="notes" className="form-label">
                הערות
              </label>
              <textarea
                className="form-control"
                id="notes"
                name="notes"
                rows="3"
                value={formData.notes}
                onChange={handleChange}
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary">
              💾 שמור לוג
            </button>
          </form>
        </div>
      </div>

      {/* Recent History Section */}
      {logs.length > 0 && (
        <>
          {/* Trend Chart */}
          <div className="card mt-4">
            <div className="card-body">
              <h5 className="card-title">📈 מגמות</h5>
              <div className="chart-container" dir="rtl">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      yAxisId="left"
                      label={{
                        value: "משקל",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      label={{
                        value: "מים",
                        angle: 90,
                        position: "insideRight",
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "8px",
                        border: "1px solid #ffb6c1",
                      }}
                      formatter={(value) => (value ? value.toFixed(1) : "ללא")}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="weight"
                      stroke="#ff69b4"
                      name="משקל"
                      dot={{ r: 4 }}
                      isAnimationActive={true}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="water"
                      stroke="#4db8ff"
                      name="מים"
                      dot={{ r: 4 }}
                      isAnimationActive={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Logs List */}
          <div className="card mt-4">
            <div className="card-body">
              <h5 className="card-title">📋 היסטוריה אחרונה</h5>
              <div className="recent-logs-scroll">
                {recentLogs.length > 0 ? (
                  recentLogs.map((log) => (
                    <div key={log.id} className="log-card">
                      <div className="log-date">
                        {new Date(log.log_date).toLocaleDateString("he-IL", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      {log.weight && (
                        <div className="log-item">
                          <span className="label">משקל:</span>
                          <span className="value">{log.weight} ק"ג</span>
                        </div>
                      )}
                      {log.water_intake && (
                        <div className="log-item">
                          <span className="label">מים:</span>
                          <span className="value">{log.water_intake} מ"ל</span>
                        </div>
                      )}
                      {log.mood && (
                        <div className="log-item">
                          <span className="label">מצב רוח:</span>
                          <span className="value mood">{log.mood}</span>
                        </div>
                      )}
                      {log.notes && (
                        <div className="log-item notes">
                          <span className="label">הערות:</span>
                          <span className="value">{log.notes}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted text-center">אין לוגים עדיין</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {logs.length === 0 && !loading && (
        <div className="card mt-4">
          <div className="card-body text-center py-5">
            <p className="text-muted">
              התחילי בהקלדת לוגים יומיים כדי לראות היסטוריה ותובנות 📊
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DailyLog;
