import { useState, useEffect } from "react";
import axios from "axios";
import DocumentUpload from "./DocumentUpload";

const babySizes = {
  4: {
    fruit: "גרגיר פרג",
    icon: "🌱",
    description: "העובר קטן מאוד, ממש בהתחלה.",
  },
  8: {
    fruit: "פטל",
    icon: "🍓",
    description: "הידיים והרגליים הקטנות מתחילות להיווצר.",
  },
  12: {
    fruit: "לימון",
    icon: "🍋",
    description: "העובר כבר נראה כמו תינוק קטן וזז המון.",
  },
  16: {
    fruit: "אבוקדו",
    icon: "🥑",
    description: "הוא כבר יכול להחזיק ידיים!",
  },
  20: {
    fruit: "בננה",
    icon: "🍌",
    description: "חצי דרך! הוא שומע את הקול שלך.",
  },
  24: { fruit: "תירס", icon: "🌽", description: "הריאות מתחילות להתפתח." },
  30: {
    fruit: "מלון",
    icon: "🍈",
    description: "הוא מתחיל לצבור שומן ולהתחמם.",
  },
  40: { fruit: "אבטיח", icon: "🍉", description: "מוכנים ליציאה!" },
};

function Dashboard({ user }) {
  const [status, setStatus] = useState(null);
  const [tests, setTests] = useState([]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // שים לב: אנחנו משתמשים ב-user.id (ה-UUID) כדי לקבל את הסטטוס
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
      // שליחת PATCH לשרת שכתבנו קודם
      await axios.patch(`/api/user/tests/${testId}`, {
        is_completed: !currentStatus,
      });

      // עדכון ה-State המקומי כדי שהמשתמשת תראה את ה-V מיד
      setTests(
        tests.map((t) =>
          t.id === testId ? { ...t, is_completed: !currentStatus } : t,
        ),
      );
    } catch (err) {
      console.error("שגיאה בעדכון הבדיקה", err);
    }
  };

  // פונקציית עזר למציאת הפרי הקרוב ביותר לשבוע הנוכחי
  const getBabySize = (week) => {
    const weeks = Object.keys(babySizes).map(Number).reverse();
    const currentWeekInfo = weeks.find((w) => week >= w) || 4;
    return babySizes[currentWeekInfo];
  };

  if (!status) return <div className="text-center mt-5">טוען נתונים...</div>;

  const babyInfo = getBabySize(status.currentWeek);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <h1 className="text-center mb-4">שלום, {status.name}! 👋</h1>

          <div className="card mb-4">
            <div className="card-body">
              <h2 className="card-title">
                את בשבוע {status.currentWeek} + {status.daysIntoWeek} ימים
              </h2>
              <p className="card-text">טרימסטר: {status.trimester}</p>

              <div className="progress mb-3">
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${(status.currentWeek / 40) * 100}%` }}
                  aria-valuenow={status.currentWeek}
                  aria-valuemin="0"
                  aria-valuemax="40"
                ></div>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body text-center">
              <h3 className="card-title">גודל התינוק שלך</h3>
              <div style={{ fontSize: "4rem", margin: "20px 0" }}>
                {babyInfo.icon}
              </div>
              <h4>העובר שלך בגודל של {babyInfo.fruit}</h4>
              <p className="card-text">{babyInfo.description}</p>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h3 className="card-title">הבדיקות המומלצות עבורך:</h3>
              <ul className="list-group">
                {tests.map((test) => (
                  <li
                    key={test.id}
                    className="list-group-item d-flex align-items-center"
                  >
                    <input
                      type="checkbox"
                      className="form-check-input me-3"
                      checked={test.is_completed}
                      onChange={() => toggleTest(test.id, test.is_completed)}
                    />
                    <span
                      style={{
                        textDecoration: test.is_completed
                          ? "line-through"
                          : "none",
                      }}
                    >
                      {test.title} - שבוע {test.target_week}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="card mt-4">
            <div className="card-body">
              <h5 className="card-title">העלאת מסמכים</h5>
              <DocumentUpload userId={user.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
