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

  useEffect(() => {
    if (!userId) return;
    fetchAppointments();
    fetchTests();
  }, [userId]);

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
    if (dayApts.length === 0) return null;

    return (
      <div className="tile-content">
        <div className="appointment-dot"></div>
        {dayApts.length > 1 && (
          <span className="appointment-count">{dayApts.length}</span>
        )}
      </div>
    );
  };

  // next upcoming appointment
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const _nextAppointment = appointments
    .map((a) => ({ ...a, _date: new Date(a.appointment_date) }))
    .filter((a) => a._date >= today)
    .sort((a, b) => a._date - b._date)[0];

  return (
    <>
      <div className="appointments-container card shadow-sm mt-4">
        <div className="card-body">
          {/* Horizontal Calendar/Diary Header */}
          <div className="calendar-diary-header">
            <h3 className="calendar-diary-title">📅 יומן פגישות</h3>
            <button
              className="btn btn-outline-primary calendar-open-btn"
              onClick={() => setShowCalendarModal(true)}
            >
              פתח יומן
            </button>
          </div>

          {/* Horizontal Timeline */}
          <div className="horizontal-timeline">
            {appointments.length > 0 ? (
              appointments
                .sort(
                  (a, b) =>
                    new Date(a.appointment_date) - new Date(b.appointment_date),
                )
                .map((apt, index) => (
                  <div key={apt.id} className="timeline-step">
                    <div className="timeline-connector">
                      {index < appointments.length - 1 && (
                        <div className="timeline-line"></div>
                      )}
                    </div>
                    <div className="timeline-content">
                      <div className="step-number">{index + 1}</div>
                      <div className="appointment-card">
                        <h6 className="appointment-title">{apt.title}</h6>
                        <div className="appointment-details">
                          <small className="text-muted">
                            {new Date(
                              apt.appointment_date,
                            ).toLocaleDateString()}
                            {apt.appointment_time &&
                              ` בשעה ${apt.appointment_time}`}
                          </small>
                          {apt.location && (
                            <div className="appointment-location">
                              {apt.location}
                            </div>
                          )}
                          <span
                            className={`badge badge-${apt.category} timeline-badge`}
                          >
                            {calculateDaysRemaining(apt.appointment_date)} ימים
                          </span>
                        </div>
                        <div className="appointment-actions">
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
                ))
            ) : (
              <div className="no-appointments">
                <p className="text-muted">אין פגישות מתוכננות</p>
                <button
                  className="btn primary-action"
                  onClick={() => openModal()}
                >
                  + הוסף פגישה ראשונה
                </button>
              </div>
            )}
          </div>

          {/* Recommended Tests Section */}
          <div className="recommended-tests-section">
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
        </div>
      </div>

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
                }}
                value={selectedDate}
                tileContent={tileContent}
                className="appointments-calendar-large"
              />
            </div>

            {/* Appointment Details Section */}
            {selectedAppointment && (
              <div className="calendar-appointment-details">
                <h5 className="details-title">פרטי הפגישה</h5>
                <div className="appointment-detail-card">
                  <div className="detail-row">
                    <span className="detail-label">כותרת:</span>
                    <span className="detail-value">
                      {selectedAppointment.title}
                    </span>
                  </div>
                  {selectedAppointment.appointment_time && (
                    <div className="detail-row">
                      <span className="detail-label">שעה:</span>
                      <span className="detail-value">
                        {selectedAppointment.appointment_time}
                      </span>
                    </div>
                  )}
                  {selectedAppointment.location && (
                    <div className="detail-row">
                      <span className="detail-label">מקום:</span>
                      <span className="detail-value">
                        {selectedAppointment.location}
                      </span>
                    </div>
                  )}
                  {selectedAppointment.description && (
                    <div className="detail-row">
                      <span className="detail-label">תיאור:</span>
                      <span className="detail-value">
                        {selectedAppointment.description}
                      </span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="detail-label">קטגוריה:</span>
                    <span className="detail-value">
                      {categoryMap[selectedAppointment.category] ||
                        selectedAppointment.category}
                    </span>
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-outline-primary mt-3 w-100"
                  onClick={() => {
                    handleEdit(selectedAppointment);
                    setShowCalendarModal(false);
                  }}
                >
                  ערוך פגישה
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <div>
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
                      dir="rtl"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">תיאור</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      dir="rtl"
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
                      className="form-select"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      {Object.entries(categoryMap).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value}
                        </option>
                      ))}
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
                      dir="rtl"
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
                      dir="rtl"
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
    </>
  );
}

export default Appointments;
