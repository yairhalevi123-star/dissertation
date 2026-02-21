import React, { useState, useEffect } from "react";
import "./HospitalBag.css";

const HospitalBag = ({ currentWeek }) => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("hospitalBag");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            text: "תעודת זהות וכרטיס מעקב היריון",
            category: "מסמכים",
            checked: false,
          },
          {
            id: 2,
            text: "תוכנית לידה מודפסת",
            category: "מסמכים",
            checked: false,
          },
          {
            id: 3,
            text: "בקבוק מים עם פיית ספורט",
            category: "לאמא",
            checked: false,
          },
          {
            id: 4,
            text: "שפתון לחות (וזלין)",
            category: "לאמא",
            checked: false,
          },
          {
            id: 5,
            text: "בגדים נוחים לשחרור",
            category: "לאמא",
            checked: false,
          },
          {
            id: 6,
            text: "חליפה ראשונה לבייבי",
            category: "לבייבי",
            checked: false,
          },
          { id: 7, text: "חיתולי טטרה", category: "לבייבי", checked: false },
          {
            id: 8,
            text: "סלקל מותקן ברכב",
            category: "לבייבי",
            checked: false,
          },
        ];
  });

  useEffect(() => {
    localStorage.setItem("hospitalBag", JSON.stringify(items));
  }, [items]);

  const toggleItem = (id) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  const progress = Math.round(
    (items.filter((i) => i.checked).length / items.length) * 100,
  );

  return (
    <div className="hospital-bag-container">
      <div className="bag-header">
        <h2>👜 תיק הלידה שלי</h2>
        {currentWeek >= 34 && !items.every((i) => i.checked) && (
          <div className="smart-alert">
            את בשבוע {currentWeek} - זה זמן מצוין לוודא שהתיק מוכן!
          </div>
        )}
        <div className="progress-wrapper">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          <span>{progress}% ארוז</span>
        </div>
      </div>

      <div className="bag-sections">
        {["מסמכים", "לאמא", "לבייבי"].map((cat) => (
          <div key={cat} className="bag-category">
            <h3>{cat}</h3>
            {items
              .filter((i) => i.category === cat)
              .map((item) => (
                <div
                  key={item.id}
                  className={`bag-item ${item.checked ? "checked" : ""}`}
                  onClick={() => toggleItem(item.id)}
                >
                  <div className="checkbox">{item.checked && "✓"}</div>
                  <span>{item.text}</span>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HospitalBag;
