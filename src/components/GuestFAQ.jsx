import { useState } from "react";

function GuestFAQ() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(null);

  const faqData = [
    {
      id: 1,
      q: "מהו מרכז עדנה?",
      a: "מרכז עדנה הוא בית רפואי חדשני לנשים, המציע מעטפת טיפולית הוליסטית 360 מעלות. אנו מספקים מגוון רחב של שירותים רפואיים ומשלימים תחת קורת גג אחת.",
    },
    {
      id: 2,
      q: "מה מייחד את מרכז עדנה?",
      a: "הגישה ההוליסטית שלנו משלבת רפואה קונבנציונלית עם טיפולים משלימים, צוות נשי מקצועי, וליווי מקיף מההריון ועד אחרי הלידה.",
    },
    {
      id: 3,
      q: "האם אתם מטפלים בהריון בסיכון?",
      a: "כן, יש לנו רופאה גניקולוגית המתמחה בהריון בסיכון ומספקת מעקב וטיפול מקצועי ומותאם אישית.",
    },
    {
      id: 4,
      q: "למה צריך ליווי בזמן ההריון?",
      a: "ליווי מקצועי מבטיח את בריאות האם והתינוק, מספק תמיכה רגשית ומענה מהיר לכל שאלה רפואית שעולה.",
    },
    {
      id: 5,
      q: "האם מקבלים החזרים מהקופות?",
      a: "אנו מלווים אותך בתהליך קבלת ההחזרים מחברות הביטוח וקופות החולים כדי למצות את מלוא זכויותייך בקלות.",
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
            <h6 className="mb-0">שאלות נפוצות - מרכז עדנה 🏥</h6>
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
