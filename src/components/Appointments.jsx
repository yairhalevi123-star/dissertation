import { useState, useEffect } from "react";
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
  const [showForm, setShowForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    appointment_date: "",
    appointment_time: "",
    category: "doctor",
    location: "",
    notes: "",
  });

  // Fetch appointments on component mount
  useEffect(() => {
    fetchAppointments();
  }, [userId]);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`/api/appointments/${userId}`);
      setAppointments(response.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const formattedDate = date.toISOString().split("T")[0];
    const appointmentsOnDate = appointments.filter(
      (apt) => apt.appointment_date === formattedDate,
    );
    if (appointmentsOnDate.length > 0) {
      setSelectedAppointment(appointmentsOnDate[0]);
    } else {
      setSelectedAppointment(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedAppointment) {
        // Update existing appointment
        await axios.put(`/api/appointments/${selectedAppointment.id}`, {
          ...formData,
          appointment_date: formData.appointment_date,
        });
      } else {
        // Create new appointment
        await axios.post(`/api/appointments/${userId}`, {
          ...formData,
          appointment_date: formData.appointment_date,
        });
      }
      fetchAppointments();
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error("Error saving appointment:", error);
    }
  };

  const handleDelete = async () => {
    if (
      !selectedAppointment ||
      !window.confirm("האם אתה בטוח שברצונך למחוק את הפגישה הזו?")
    ) {
      return;
    }
    try {
      await axios.delete(`/api/appointments/${selectedAppointment.id}`);
      fetchAppointments();
      setSelectedAppointment(null);
      resetForm();
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  const handleEditClick = () => {
    if (selectedAppointment) {
      setFormData({
        title: selectedAppointment.title,
        description: selectedAppointment.description || "",
        appointment_date: selectedAppointment.appointment_date,
        appointment_time: selectedAppointment.appointment_time || "",
        category: selectedAppointment.category || "doctor",
        location: selectedAppointment.location || "",
        notes: selectedAppointment.notes || "",
      });
      setShowForm(true);
    }
  };

  const handleNewAppointmentClick = () => {
    resetForm();
    setFormData((prev) => ({
      ...prev,
      appointment_date: selectedDate.toISOString().split("T")[0],
    }));
    setSelectedAppointment(null);
    setShowForm(true);
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
  };

  const calculateDaysRemaining = (appointmentDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointment = new Date(appointmentDate);
    appointment.setHours(0, 0, 0, 0);
    const diffInTime = appointment.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffInTime / (1000 * 3600 * 24));
    return daysRemaining;
  };

  const tileContent = ({ date }) => {
    const formattedDate = date.toISOString().split("T")[0];
    const appointmentsOnDay = appointments.filter(
      (apt) => apt.appointment_date === formattedDate,
    );

    return (
      <div className="tile-content">
        {appointmentsOnDay.map((apt, idx) => (
          <div key={idx} className="appointment-indicator">
            <span className={`badge badge-${apt.category}`}>
              {apt.category.charAt(0).toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="appointments-container card shadow-sm mt-4">
      <div className="card-body">
        <div className="row">
          {/* Calendar Section */}
          <div className="col-md-6">
            <h3 className="card-title mb-4">יומן</h3>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              tileContent={tileContent}
              className="appointments-calendar"
            />
          </div>

          {/* Appointments Details Section */}
          <div className="col-md-6">
            <h3 className="card-title mb-4">פגישות</h3>

            {selectedAppointment ? (
              <div className="appointment-details card">
                <div className="card-body">
                  <h5 className="card-title">{selectedAppointment.title}</h5>
                  <p className="card-text text-muted">
                    {selectedAppointment.description}
                  </p>

                  <div className="details-group">
                    <p>
                      <strong>תאריך:</strong>{" "}
                      {new Date(
                        selectedAppointment.appointment_date,
                      ).toLocaleDateString()}
                    </p>
                    {selectedAppointment.appointment_time && (
                      <p>
                        <strong>שעה:</strong>{" "}
                        {selectedAppointment.appointment_time}
                      </p>
                    )}
                    <p>
                      <strong>קטגוריה:</strong>{" "}
                      {categoryMap[selectedAppointment.category] ||
                        selectedAppointment.category}
                    </p>
                    {selectedAppointment.location && (
                      <p>
                        <strong>מיקום:</strong> {selectedAppointment.location}
                      </p>
                    )}
                    {selectedAppointment.notes && (
                      <p>
                        <strong>הערות:</strong> {selectedAppointment.notes}
                      </p>
                    )}
                  </div>

                  {/* Days Remaining */}
                  <div className="alert alert-info mt-3">
                    <strong>
                      {calculateDaysRemaining(
                        selectedAppointment.appointment_date,
                      ) > 0
                        ? `${calculateDaysRemaining(
                            selectedAppointment.appointment_date,
                          )} ימים`
                        : "התאריך עבר"}
                    </strong>
                  </div>

                  {/* Action Buttons */}
                  <div className="button-group mt-3 d-flex gap-2">
                    <button
                      className="btn btn-primary"
                      onClick={handleEditClick}
                    >
                      ערוך
                    </button>
                    <button className="btn btn-danger" onClick={handleDelete}>
                      מחק
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-appointment text-center">
                <p className="text-muted">בחר תאריך או צור פגישה חדשה</p>
              </div>
            )}

            {/* New Appointment Button */}
            {!showForm && (
              <button
                className="btn btn-success w-100 mt-3"
                onClick={handleNewAppointmentClick}
              >
                הוסף פגישה חדשה
              </button>
            )}

            {/* Form Section */}
            {showForm && (
              <div className="appointment-form card mt-3">
                <div className="card-body">
                  <h5 className="card-title">
                    {selectedAppointment ? "עריכת פגישה" : "פגישה חדשה"}
                  </h5>
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
                      <button type="submit" className="btn btn-primary">
                        שמור פגישה
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowForm(false);
                          resetForm();
                        }}
                      >
                        ביטול
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Appointments List */}
        <div className="mt-5">
          <h4 className="mb-3">הפגישות הקרובות</h4>
          <div className="appointments-list">
            {appointments
              .filter(
                (apt) =>
                  calculateDaysRemaining(apt.appointment_date) > -1 &&
                  calculateDaysRemaining(apt.appointment_date) <= 30,
              )
              .slice(0, 5)
              .map((apt) => (
                <div key={apt.id} className="appointment-item card mb-2">
                  <div className="card-body py-2 d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">{apt.title}</h6>
                      <small className="text-muted">
                        {new Date(apt.appointment_date).toLocaleDateString()}
                        {apt.appointment_time &&
                          ` בשעה ${apt.appointment_time}`}
                      </small>
                    </div>
                    <span className={`badge badge-${apt.category}`}>
                      {calculateDaysRemaining(apt.appointment_date)} ימים
                    </span>
                  </div>
                </div>
              ))}
            {appointments.filter(
              (apt) =>
                calculateDaysRemaining(apt.appointment_date) > -1 &&
                calculateDaysRemaining(apt.appointment_date) <= 30,
            ).length === 0 && (
              <p className="text-muted text-center">
                אין פגישות קרובות ב-30 הימים הקרובים
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Appointments;
