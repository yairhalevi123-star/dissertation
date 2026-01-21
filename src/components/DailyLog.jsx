import { useState } from "react";
import axios from "axios";

function DailyLog({ userId }) {
  const [formData, setFormData] = useState({
    weight: "",
    water_intake: "",
    mood: "",
    notes: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:3000/api/logs/${userId}`, formData);
      alert("הלוג נשמר!");
      setFormData({ weight: "", water_intake: "", mood: "", notes: "" });
    } catch (err) {
      console.error("שגיאה בשמירת הלוג", err);
    }
  };

  return (
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
              <option value="שמח">שמח</option>
              <option value="עצוב">עצוב</option>
              <option value="עייף">עייף</option>
              <option value="לחוץ">לחוץ</option>
              <option value="רגוע">רגוע</option>
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
            שמור לוג
          </button>
        </form>
      </div>
    </div>
  );
}

export default DailyLog;
