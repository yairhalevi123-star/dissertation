import { useState } from "react";

function GuestFAQ() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(null);

  const faqData = [
    {
      id: 1,
      q: "האם הליווי הדיגיטלי מחליף התייעצות עם רופא?",
      a: "בשום אופן לא. העוזר האישי מבוסס בינה מלאכותית ונועד לספק מידע, תמיכה וכלים לניהול ההריון. בכל מקרה של דחיפות רפואית, דימום, ירידת מים או כאב חריג, יש לפנות באופן מיידי למוקד רפואי או למיון נשים.",
    },
    {
      id: 2,
      q: "כיצד המערכת מתאימה את עצמה לשבוע ההריון שלי?",
      a: "המערכת שפיתחו משה ויאיר מבוססת על אלגוריתם חכם המסונכרן עם הנתונים האישיים שלך. בכל פעם שתשאלי שאלה, ה-AI מתחשב בשבוע ההריון הספציפי שלך כדי לתת מענה רלוונטי להתפתחות העובר ולשינויים הגופניים שאת חווה.",
    },
    {
      id: 3,
      q: "האם המידע והיסטוריית הצ'אט שלי נשמרים?",
      a: "הפרטיות שלך נמצאת בראש סדר העדיפויות שלנו. היסטוריית השיחה נשמרת באופן מקומי בדפדפן שלך בלבד, על מנת לאפשר רצף שיחה מבלי לחשוף את המידע הרגיש שלך לשרתים חיצוניים.",
    },
    {
      id: 4,
      q: "באילו נושאים ניתן להתייעץ עם העוזר החכם?",
      a: "העוזר מתמחה במגוון רחב של נושאי הריון ולידה: תזונה מותאמת, הקלה על תסמינים (בחילות, עייפות), הכנה רגשית ללידה, ובריאות האישה. המערכת מתוכנתת להתמקד אך ורק בנושאים אלו כדי להבטיח את איכות המידע.",
    },
    {
      id: 5,
      q: "מה קורה אם יש לי שאלה מורכבת שה-AI לא יודע לענות עליה?",
      a: "במקרים של שאלות מורכבות או כאלו הדורשות אבחון מקצועי, המערכת תמליץ לך לפנות לצוות המומחיות של מרכז עדנה. תוכלי לתאם פגישה פרונטלית עם הרופאות, התזונאיות או המלוות שלנו לקבלת מענה רפואי מוסמך.",
    },
  ];

  const toggleTab = (id) => {
    setActiveTab(activeTab === id ? null : id);
  };

  return (
    <div
      style={{ position: "fixed", bottom: "20px", left: "20px", zIndex: 1000 }}
    >
      <style>
        {`
          .faq-card { width: 350px; border-radius: 15px; border: none; overflow: hidden; position: absolute; bottom: 75px; left: 0; }
          .faq-item-btn { width: 100%; text-align: right; padding: 12px; border: none; background: white; border-bottom: 1px solid #f0f0f0; font-weight: 600; font-size: 0.9rem; display: flex; justify-content: space-between; transition: 0.3s; }
          .faq-item-btn:hover { background: #f8f9fa; }
          .faq-answer { padding: 10px 15px; background: #fff; font-size: 0.85rem; color: #555; line-height: 1.5; border-bottom: 1px solid #f0f0f0; }
          .rotate-icon { transition: transform 0.3s; }
          .is-active .rotate-icon { transform: rotate(180deg); }
        `}
      </style>

      {/* כפתור סימן השאלה הצף */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-info rounded-circle shadow-lg text-white d-flex align-items-center justify-content-center"
        style={{
          width: "60px",
          height: "60px",
          fontSize: "1.6rem",
          background: "#17a2b8",
        }}
      >
        {isOpen ? "✕" : "?"}
      </button>

      {isOpen && (
        <div className="card shadow-lg faq-card animate__animated animate__fadeInUp">
          <div
            className="card-header text-white text-center py-3"
            style={{ background: "#17a2b8" }}
          >
            <h6 className="mb-0">שאלות נפוצות 🏥</h6>
          </div>

          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {faqData.map((item) => (
              <div
                key={item.id}
                className={activeTab === item.id ? "is-active" : ""}
              >
                <button
                  className="faq-item-btn"
                  onClick={() => toggleTab(item.id)}
                >
                  <span>{item.q}</span>
                  <span className="rotate-icon">▼</span>
                </button>
                {activeTab === item.id && (
                  <div className="faq-answer animate__animated animate__fadeIn">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="card-footer bg-light text-center p-2">
            <small className="text-muted">רוצה ליווי אישי? התחברי למערכת</small>
          </div>
        </div>
      )}
    </div>
  );
}

export default GuestFAQ;
