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

function BabySize({ currentWeek }) {
  // Find the closest week in babySizes
  const weeks = Object.keys(babySizes)
    .map(Number)
    .sort((a, b) => a - b);
  const closestWeek = weeks.reduce((prev, curr) =>
    Math.abs(curr - currentWeek) < Math.abs(prev - currentWeek) ? curr : prev,
  );

  const sizeInfo = babySizes[closestWeek];

  return (
    <div className="card mb-4">
      <div className="card-body text-center">
        <h3 className="card-title">גודל התינוק שלך</h3>
        <div style={{ fontSize: "4rem", margin: "20px 0" }}>
          {sizeInfo.icon}
        </div>
        <h4>{sizeInfo.fruit}</h4>
        <p className="card-text">{sizeInfo.description}</p>
        <small className="text-muted">שבוע {closestWeek}</small>
      </div>
    </div>
  );
}

export default BabySize;
