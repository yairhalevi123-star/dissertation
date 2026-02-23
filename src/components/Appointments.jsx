import React, { useState, useEffect } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Appointments.css";

function Appointments({ userId }) {
  const categoryMap = {
    doctor: "ביקור אצל רופא",
    ultrasound: "אולטרסונוגרפיה",
    lab_test: "בדיקות מעבדה",
    checkup: "בדיקה שוטפת",
    other: "אחר",
  };

  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [tests, setTests] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    appointment_date: "",
    appointment_time: "",
    category: "doctor",
    location: "",
    notes: "",
  });

  useEffect(() => {
    if (!userId) return;
    fetchAppointments();
    fetchTests();
  }, [userId]);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(`/api/appointments/${userId}`);
      setAppointments(res.data || []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  const fetchTests = async () => {
    try {
      const res = await axios.get(`/api/user/tests/${userId}`);
      setTests(res.data || []);
    } catch (err) {
      console.error("Error fetching tests:", err);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const formatted = date.toISOString().split("T")[0];
    const dayApts = appointments.filter(
      (a) => a.appointment_date === formatted,
    );
    setSelectedAppointment(dayApts[0] || null);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      appointment_date: "",
      appointment_time: "",
      category: "doctor",
      location: "",
      notes: "",
    });
    setSelectedAppointment(null);
  };

  const openModal = (prefill = null) => {
    if (prefill) {
      resetForm();
      setFormData((prev) => ({
        ...prev,
        title: prefill,
        appointment_date: selectedDate.toISOString().split("T")[0],
      }));
    }
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleEdit = (apt) => {
    setSelectedAppointment(apt);
    setFormData({
      title: apt.title || "",
      description: apt.description || "",
      appointment_date: apt.appointment_date || "",
      appointment_time: apt.appointment_time || "",
      category: apt.category || "doctor",
      location: apt.location || "",
      notes: apt.notes || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (aptId) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את הפגישה הזו?")) return;
    try {
      await axios.delete(`/api/appointments/${aptId}`);
      fetchAppointments();
    } catch (err) {
      console.error("Error deleting appointment:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedAppointment && selectedAppointment.id) {
        await axios.put(
          `/api/appointments/${selectedAppointment.id}`,
          formData,
        );
      } else {
        await axios.post(`/api/appointments/${userId}`, formData);
      }
      setShowModal(false);
      resetForm();
      fetchAppointments();
    } catch (err) {
      console.error("Error saving appointment:", err);
    }
  };

  const calculateDaysRemaining = (appointmentDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointment = new Date(appointmentDate);
    appointment.setHours(0, 0, 0, 0);
    const diff = appointment.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const tileContent = ({ date }) => {
    const formatted = date.toISOString().split("T")[0];
    const dayApts = appointments.filter(
      (a) => a.appointment_date === formatted,
    );
    return (
      <div className="tile-content">
        {dayApts.map((apt, i) => (
          <div key={i} className="appointment-indicator">
            <span className={`badge badge-${apt.category}`}>
              {apt.category.charAt(0).toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // next upcoming appointment
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextAppointment = appointments
    .map((a) => ({ ...a, _date: new Date(a.appointment_date) }))
    .filter((a) => a._date >= today)
    .sort((a, b) => a._date - b._date)[0];

  return (
    <div className="appointments-container card shadow-sm mt-4">
      <div className="card-body">
        <div className="appointments-dashboard-grid">
          <main className="main-col">
            <div className="hero-card rounded-2xl shadow-sm mb-4">
              {nextAppointment ? (
                <div className="hero-content">
                  <h4 className="hero-title">{nextAppointment.title}</h4>
                  <p className="text-muted">
                    {new Date(
                      nextAppointment.appointment_date,
                    ).toLocaleDateString()}{" "}
                    {nextAppointment.appointment_time &&
                      `בשעה ${nextAppointment.appointment_time}`}
                  </p>
                  {nextAppointment.location && (
                    <p className="hero-location">{nextAppointment.location}</p>
                  )}
                  <div className="hero-badge">
                    {calculateDaysRemaining(nextAppointment.appointment_date)}{" "}
                    ימים
                  </div>
                </div>
              ) : (
                <div className="hero-empty text-muted">אין פגישות קרובות</div>
              )}
            </div>

            <section>
              <h4 className="mb-3">ציר זמן פגישות</h4>
              <div className="appointments-list timeline">
                {appointments
                  .sort(
                    (a, b) =>
                      new Date(a.appointment_date) -
                      new Date(b.appointment_date),
                  )
                  .map((apt) => (
                    <div key={apt.id} className="appointment-item card mb-2">
                      <div className="card-body py-2 d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">{apt.title}</h6>
                          <small className="text-muted">
                            {new Date(
                              apt.appointment_date,
                            ).toLocaleDateString()}
                            {apt.appointment_time &&
                              ` בשעה ${apt.appointment_time}`}
                          </small>
                          {apt.location && (
                            <div className="text-muted">{apt.location}</div>
                          )}
                        </div>
                        <div className="d-flex flex-column align-items-end">
                          <span className={`badge badge-${apt.category}`}>
                            {calculateDaysRemaining(apt.appointment_date)} ימים
                          </span>
                          <div className="mt-2">
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleEdit(apt)}
                            >
                              ערוך
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(apt.id)}
                            >
                              מחק
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="mt-4">
                <h5 className="mb-3">בדיקות מומלצות</h5>
                <div className="recommended-tests">
                  {tests && tests.length > 0 ? (
                    tests.map((test) => (
                      <div
                        key={test.id}
                        className="test-item d-flex justify-content-between align-items-center mb-2"
                      >
                        <div>
                          <div className="test-title">{test.title}</div>
                          <small className="text-muted">
                            שבוע יעד: {test.target_week}
                          </small>
                        </div>
                        <div>
                          <button
                            className="btn btn-sm book-now"
                            onClick={() => openModal(test.title)}
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">אין בדיקות מומלצות כרגע</p>
                  )}
                </div>

                <div className="mt-3">
                  <button
                    className="btn primary-action w-100"
                    onClick={() => openModal()}
                  >
                    + הוסף פגישה
                  </button>
                </div>
              </div>
            </section>
          </main>

          <aside className="sidebar-col">
            <div className="sidebar-card rounded-2xl shadow-sm">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => setShowCalendarModal(true)}
              >
                📅 פתח יומן גדול
              </button>
            </div>
          </aside>

          {/* Large Calendar Modal */}
          {showCalendarModal && (
            <div
              className="calendar-modal-overlay"
              onClick={() => setShowCalendarModal(false)}
            >
              <div
                className="calendar-modal-card"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="calendar-modal-header">
                  <h4>בחרי תאריך</h4>
                  <button
                    className="close-btn"
                    onClick={() => setShowCalendarModal(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="calendar-modal-body">
                  <Calendar
                    onChange={(date) => {
                      handleDateChange(date);
                      setShowCalendarModal(false);
                    }}
                    value={selectedDate}
                    tileContent={tileContent}
                    className="appointments-calendar-large"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div
              className="modal-card rounded-2xl shadow-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  {selectedAppointment ? "ערוך פגישה" : "פגישה חדשה"}
                </h5>
                <button
                  className="close-btn"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">כותרת *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">תאריך *</label>
                    <input
                      type="date"
                      className="form-control"
                      name="appointment_date"
                      value={formData.appointment_date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">שעה</label>
                    <input
                      type="time"
                      className="form-control"
                      name="appointment_time"
                      value={formData.appointment_time}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">קטגוריה</label>
                    <select
                      className="form-control"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      <option value="doctor">ביקור אצל רופא</option>
                      <option value="ultrasound">אולטרסונוגרפיה</option>
                      <option value="lab_test">בדיקות מעבדה</option>
                      <option value="checkup">בדיקה שוטפת</option>
                      <option value="other">אחר</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">מיקום</label>
                    <input
                      type="text"
                      className="form-control"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="בית חולים, מרפאה וכו'"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">תיאור</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="2"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">הערות</label>
                    <textarea
                      className="form-control"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="2"
                    />
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn primary-action">
                      שמור פגישה
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                    >
                      ביטול
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Appointments;
