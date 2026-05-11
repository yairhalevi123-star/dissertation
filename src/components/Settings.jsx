import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Settings.css";

const Settings = ({ user }) => {
  // קבלת user כ-Prop
  // עדיפות ל-ID מה-Prop, וגיבוי מה-localStorage אם ממש חייב
  const userId = user?.id || localStorage.getItem("userId");

  const [isUserReady, setIsUserReady] = useState(false);
  const [settings, setSettings] = useState({
    pregnancy_type: "single",
    dark_mode: false,
    water_reminder_interval: 60,
  });
  const [dueDate, setDueDate] = useState("");
  const [pregnancyWeek, setPregnancyWeek] = useState(0);
  const [daysUntilDue, setDaysUntilDue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState("");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);

  useEffect(() => {
    // אם אין ID תקין, אל תנסה אפילו לטעון
    if (!userId) {
      setLoading(false);
      setIsUserReady(false);
      setMessage("User ID not found. Please log in again.");
      return;
    }

    setIsUserReady(true);
    fetchSettings();
  }, [userId]);

  // Dark mode is handled at the app root. Settings will write the
  // preference to localStorage and dispatch an event so the root can
  // apply the class globally (prevents flicker across routes).

  const fetchSettings = async () => {
    // חסימה נוספת בתוך הפונקציה
    if (!userId) return;

    try {
      setLoading(true);
      // שימוש ב-Template Literal כדי לוודא שה-URL נבנה נכון
      const response = await axios.get(`/api/settings/${userId}`);
      if (response.data) {
        setSettings(response.data);
        try {
          localStorage.setItem(
            "dark_mode",
            response.data.dark_mode ? "true" : "false",
          );
        } catch (e) {}
        try {
          window.dispatchEvent(
            new CustomEvent("dark-mode-changed", {
              detail: !!response.data.dark_mode,
            }),
          );
        } catch (e) {}
      }

      const weekResponse = await axios.get(
        `/api/settings/${userId}/pregnancy-week`,
      );
      setPregnancyWeek(weekResponse.data.pregnancy_week);
      setDaysUntilDue(weekResponse.data.days_until_due);

      if (weekResponse.data.due_date) {
        const date = new Date(weekResponse.data.due_date);
        setDueDate(date.toISOString().split("T")[0]);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      // אם השרת מחזיר 404 או 400, נעדכן את המשתמש
      setMessage("לא ניתן היה לטעון את ההגדרות. וודא שאתה מחובר.");
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "dark_mode") {
      try {
        localStorage.setItem("dark_mode", value ? "true" : "false");
      } catch (e) {}
      try {
        window.dispatchEvent(
          new CustomEvent("dark-mode-changed", { detail: !!value }),
        );
      } catch (e) {}
    }
  };

  const handleSaveSettings = async () => {
    if (!userId || userId === "null" || userId === "undefined") {
      setMessage("Cannot save: User ID not found. Please log in again.");
      return;
    }

    try {
      setSaving(true);
      await axios.patch(`/api/settings/${userId}`, settings);
      setMessage("ההגדרות נשמרו בהצלחה ✓");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage("שגיאה בשמירת ההגדרות");
    } finally {
      setSaving(false);
    }
  };

  const handleDueDateChange = async (e) => {
    if (!userId || userId === "null" || userId === "undefined") {
      setMessage("Cannot update: User ID not found. Please log in again.");
      return;
    }

    const newDate = e.target.value;
    setDueDate(newDate);

    try {
      await axios.patch(`/api/settings/${userId}/due-date`, {
        due_date: newDate,
      });

      // Recalculate pregnancy week
      const weekResponse = await axios.get(
        `/api/settings/${userId}/pregnancy-week`,
      );
      setPregnancyWeek(weekResponse.data.pregnancy_week);
      setDaysUntilDue(weekResponse.data.days_until_due);

      setMessage("תאריך הלידה עודכן בהצלחה ✓");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error updating due date:", error);
      setMessage("שגיאה בעדכון תאריך הלידה");
    }
  };

  const handleDeleteAccount = async () => {
    if (!userId || userId === "null" || userId === "undefined") {
      setMessage("Cannot delete: User ID not found. Please log in again.");
      return;
    }

    if (deleteEmail !== localStorage.getItem("userEmail")) {
      setMessage("Email does not match");
      return;
    }

    try {
      setSaving(true);
      await axios.delete(`/api/settings/${userId}/account`, {
        data: { confirmEmail: deleteEmail },
      });

      // Clear local storage and redirect
      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");
      window.location.href = "/login";
    } catch (error) {
      console.error("Error deleting account:", error);
      setMessage("Email does not match");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!userId || userId === "null" || userId === "undefined") {
      setMessage(
        "Cannot change password: User ID not found. Please log in again.",
      );
      return;
    }

    if (!passwordData.currentPassword) {
      setMessage("אנא הכנס את הסיסמה הנוכחית");
      return;
    }

    if (!passwordData.newPassword) {
      setMessage("אנא הכנס סיסמה חדשה");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("הסיסמה החדשה והאימות אינם תואמים");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage("הסיסמה החדשה חייבת להיות לפחות 6 תווים");
      return;
    }

    try {
      setChangePasswordLoading(true);
      await axios.patch(`/api/settings/${userId}/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setMessage("הסיסמה שונתה בהצלחה ✓");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error changing password:", error);
      setMessage(error.response?.data?.error || "שגיאה בשינוי הסיסמה");
    } finally {
      setChangePasswordLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="settings-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!isUserReady) {
    return (
      <div className="settings-container">
        <div className="settings-header">
          <h1>⚙️ הגדרות</h1>
          <p>נהל את הגדרות החשבון ההריון שלך</p>
        </div>
        <div
          className="message-box"
          style={{ background: "#ffebee", color: "#d32f2f" }}
        >
          {message || "User ID not found. Please log in again."}
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>⚙️ הגדרות</h1>
        <p>נהל את הגדרות החשבון ההריון שלך</p>
      </div>

      {message && <div className="message-box">{message}</div>}

      <div className="settings-grid">
        {/* Pregnancy Week Card */}
        <div className="settings-card pregnancy-card">
          <h2>🤰 שבוע ההריון</h2>
          <div className="pregnancy-info">
            <div className="week-display">
              <span className="week-number">{pregnancyWeek}</span>
              <span className="week-label">שבוע</span>
            </div>
            {daysUntilDue !== null && (
              <div className="days-remaining">
                {daysUntilDue > 0 ? (
                  <>
                    <span className="days-number">{daysUntilDue}</span>
                    <span className="days-label">ימים עד הלידה</span>
                  </>
                ) : (
                  <span className="days-label">⏰ הגיע הזמן!</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Due Date Picker */}
        <div className="settings-card">
          <h2>📅 תאריך הלידה המשוער</h2>
          <input
            type="date"
            value={dueDate}
            onChange={handleDueDateChange}
            className="date-input"
            dir="rtl"
          />
        </div>

        {/* Pregnancy Type */}
        <div className="settings-card">
          <h2>👶 סוג ההריון</h2>
          <div className="option-group">
            <label className="radio-option">
              <input
                type="radio"
                name="pregnancy_type"
                value="single"
                checked={settings.pregnancy_type === "single"}
                onChange={(e) =>
                  handleSettingChange("pregnancy_type", e.target.value)
                }
              />
              <span>הריון יחיד</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="pregnancy_type"
                value="twins"
                checked={settings.pregnancy_type === "twins"}
                onChange={(e) =>
                  handleSettingChange("pregnancy_type", e.target.value)
                }
              />
              <span>תאומים או יותר</span>
            </label>
          </div>
        </div>

        {/* Dark Mode Toggle */}
        <div className="settings-card">
          <h2>🌙 מצב כהה</h2>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="dark-mode-toggle"
              checked={settings.dark_mode}
              onChange={(e) =>
                handleSettingChange("dark_mode", e.target.checked)
              }
            />
            <label htmlFor="dark-mode-toggle" className="toggle-label">
              <span className="toggle-track"></span>
              <span className="toggle-thumb"></span>
            </label>
          </div>
          <p className="toggle-status">
            {settings.dark_mode ? "מופעל" : "כבוי"}
          </p>
        </div>

        {/* Water Reminder Interval */}
        <div className="settings-card">
          <h2>💧 תדירות התזכורות למים</h2>
          <div className="slider-container">
            <input
              type="range"
              min="15"
              max="180"
              step="15"
              value={settings.water_reminder_interval}
              onChange={(e) =>
                handleSettingChange(
                  "water_reminder_interval",
                  parseInt(e.target.value),
                )
              }
              className="slider"
            />
            <div className="slider-labels">
              <span>15 דק'</span>
              <span>90 דק'</span>
              <span>180 דק'</span>
            </div>
            <div className="slider-value">
              כל <strong>{settings.water_reminder_interval}</strong> דקות
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="settings-grid">
        <div className="settings-card">
          <h2>🔐 שינוי סיסמה</h2>
          <div className="password-form">
            <input
              type="password"
              placeholder="סיסמה נוכחית"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
              className="password-input"
              dir="rtl"
            />
            <input
              type="password"
              placeholder="סיסמה חדשה"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              className="password-input"
              dir="rtl"
            />
            <input
              type="password"
              placeholder="אימות סיסמה חדשה"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
              className="password-input"
              dir="rtl"
            />
            <button
              className="btn-change-password"
              onClick={handleChangePassword}
              disabled={changePasswordLoading}
            >
              {changePasswordLoading ? "מעדכן..." : "עדכן סיסמה"}
            </button>
          </div>
        </div>
      </div>

      {/* Save Settings Button */}
      <div className="settings-actions">
        <button
          className="btn-save"
          onClick={handleSaveSettings}
          disabled={saving}
        >
          {saving ? "שומר..." : "💾 שמור הגדרות"}
        </button>
      </div>

      {/* Delete Account Section */}
      <div className="danger-zone">
        <h2>⚠️ אזור סכנה</h2>
        <p className="danger-zone-description">
          מחיקת החשבון היא פעולה בלתי הפיכה. בביצוע פעולה זו, כל הנתונים שלך
          יימחקו לצמיתות, כולל: יומן המעקב היומי, היסטוריית בדיקות, מסמכים
          רפואיים שהועלו והגדרות אישיות.
        </p>

        <button
          className="btn-logout"
          onClick={handleLogout}
          style={{ marginBottom: "1rem" }}
        >
          👋 התנתקות
        </button>

        {!deleteConfirm ? (
          <button className="btn-delete" onClick={() => setDeleteConfirm(true)}>
            🗑️ מחק חשבון
          </button>
        ) : (
          <div className="delete-confirmation">
            <p className="delete-warning">
              כדי לאשר, אנא הקלד את כתובת הדואל שלך:
            </p>
            <input
              type="email"
              placeholder="הכנס את כתובת הדואל שלך"
              value={deleteEmail}
              onChange={(e) => setDeleteEmail(e.target.value)}
              className="delete-email-input"
              dir="rtl"
            />
            <div className="delete-actions">
              <button
                className="btn-confirm-delete"
                onClick={handleDeleteAccount}
                disabled={!deleteEmail || saving}
              >
                {saving ? "מוחק..." : "מחק חשבון למתמיד"}
              </button>
              <button
                className="btn-cancel-delete"
                onClick={() => {
                  setDeleteConfirm(false);
                  setDeleteEmail("");
                }}
              >
                ביטול
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
