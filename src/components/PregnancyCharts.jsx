// import React, { useState } from "react";
// import {
//   LineChart,
//   Line,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   Area,
//   ComposedChart,
// } from "recharts";
// import "./PregnancyCharts.css";

// /**
//  * PregnancyCharts Component
//  * Displays weight tracking and contraction frequency charts for pregnancy monitoring
//  */
// const PregnancyCharts = () => {
//   // State for weight tracking over pregnancy weeks
//   // Simulates a healthy weight gain progression from weeks 4-40
//   const [weightData, setWeightData] = useState([
//     { week: 4, weight: 65, targetMin: 65, targetMax: 65 },
//     { week: 8, weight: 66, targetMin: 65.5, targetMax: 66.5 },
//     { week: 12, weight: 67.5, targetMin: 66.5, targetMax: 68 },
//     { week: 16, weight: 69, targetMin: 68, targetMax: 70 },
//     { week: 20, weight: 71, targetMin: 70, targetMax: 72.5 },
//     { week: 24, weight: 73.5, targetMin: 72, targetMax: 75 },
//     { week: 28, weight: 76, targetMin: 74.5, targetMax: 77.5 },
//     { week: 32, weight: 78.5, targetMin: 77, targetMax: 80 },
//     { week: 36, weight: 81, targetMin: 79.5, targetMax: 82.5 },
//     { week: 40, weight: 83, targetMin: 81.5, targetMax: 85 },
//   ]);

//   /**
//    * Delete a weight entry by week number
//    * @param {number} weekToDelete - The week number to delete
//    */
//   const handleDeleteWeight = (weekToDelete) => {
//     setWeightData(weightData.filter((entry) => entry.week !== weekToDelete));
//   };

//   // Mock data for contraction frequency over the last 12 hours
//   // Shows increasing frequency pattern typical of early labor
//   const contractionData = [
//     { hour: "10 PM", contractions: 0 },
//     { hour: "11 PM", contractions: 1 },
//     { hour: "12 AM", contractions: 0 },
//     { hour: "1 AM", contractions: 2 },
//     { hour: "2 AM", contractions: 1 },
//     { hour: "3 AM", contractions: 3 },
//     { hour: "4 AM", contractions: 2 },
//     { hour: "5 AM", contractions: 4 },
//     { hour: "6 AM", contractions: 3 },
//     { hour: "7 AM", contractions: 5 },
//     { hour: "8 AM", contractions: 4 },
//     { hour: "9 AM", contractions: 6 },
//   ];

//   /**
//    * Custom tooltip for weight chart
//    * Displays week, actual weight, and target range
//    */
//   const WeightTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="custom-tooltip">
//           <p className="tooltip-label">שבוע {payload[0].payload.week}</p>
//           <p className="tooltip-weight">
//             משקל: {payload[0].payload.weight} ק״ג
//           </p>
//           <p className="tooltip-range">
//             יעד: {payload[0].payload.targetMin} - {payload[0].payload.targetMax}{" "}
//             ק״ג
//           </p>
//         </div>
//       );
//     }
//     return null;
//   };

//   /**
//    * Custom tooltip for contraction chart
//    * Displays hour and number of contractions
//    */
//   const ContractionTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="custom-tooltip">
//           <p className="tooltip-label">{payload[0].payload.hour}</p>
//           <p className="tooltip-contractions">
//             {payload[0].value} {payload[0].value !== 1 ? "צירים" : "ציר"}
//           </p>
//         </div>
//       );
//     }
//     return null;
//   };

//   return (
//     <div className="pregnancy-charts-container" dir="rtl">
//       <h1 className="main-title">לוח מעקב הריון</h1>

//       {/* Weight Tracker Chart */}
//       <div className="chart-section">
//         <div className="chart-header">
//           <h2 className="chart-title">מעקב משקל</h2>
//           <p className="chart-subtitle">עקבי אחר עלייה במשקל במהלך ההריון</p>
//         </div>
//         <ResponsiveContainer width="100%" height={400}>
//           <ComposedChart
//             data={weightData}
//             margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
//           >
//             <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
//             <XAxis
//               dataKey="week"
//               label={{
//                 value: "שבוע הריון",
//                 position: "insideBottom",
//                 offset: -10,
//               }}
//               stroke="#666"
//             />
//             <YAxis
//               label={{
//                 value: "משקל (ק״ג)",
//                 angle: -90,
//                 position: "insideLeft",
//               }}
//               stroke="#666"
//               domain={[60, 90]}
//             />
//             <Tooltip content={<WeightTooltip />} />
//             <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="line" />

//             {/* Shaded area for target weight range */}
//             <Area
//               type="monotone"
//               dataKey="targetMax"
//               stroke="none"
//               fill="#FFB6C1"
//               fillOpacity={0.3}
//               name="טווח יעד"
//             />
//             <Area
//               type="monotone"
//               dataKey="targetMin"
//               stroke="none"
//               fill="#FFFFFF"
//               fillOpacity={1}
//             />

//             {/* Actual weight line */}
//             <Line
//               type="monotone"
//               dataKey="weight"
//               stroke="#FF69B4"
//               strokeWidth={3}
//               dot={{ fill: "#FF69B4", r: 5 }}
//               activeDot={{ r: 7 }}
//               name="משקל בפועל"
//             />
//           </ComposedChart>
//         </ResponsiveContainer>

//         {/* Weight Data Table with Delete Buttons */}
//         <div className="weight-data-table">
//           <h3 className="table-title">רשומות משקל</h3>
//           <div className="table-container">
//             <table>
//               <thead>
//                 <tr>
//                   <th>שבוע</th>
//                   <th>משקל (ק״ג)</th>
//                   <th>טווח יעד (ק״ג)</th>
//                   <th>פעולה</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {weightData.map((entry) => (
//                   <tr key={entry.week}>
//                     <td>שבוע {entry.week}</td>
//                     <td>{entry.weight}</td>
//                     <td>
//                       {entry.targetMin} - {entry.targetMax}
//                     </td>
//                     <td>
//                       <button
//                         className="delete-btn"
//                         onClick={() => handleDeleteWeight(entry.week)}
//                         aria-label={`מחק רשומת משקל לשבוע ${entry.week}`}
//                       >
//                         🗑️ מחק
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//             {weightData.length === 0 && (
//               <p className="no-data-message">
//                 אין רשומות משקל זמינות. הוסיפי נתונים כדי להתחיל!
//               </p>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Contraction Frequency Chart */}
//       <div className="chart-section">
//         <div className="chart-header">
//           <h2 className="chart-title">תדירות צירים</h2>
//           <p className="chart-subtitle">עקבי אחר צירים ב-12 השעות האחרונות</p>
//         </div>
//         <ResponsiveContainer width="100%" height={400}>
//           <BarChart
//             data={contractionData}
//             margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
//           >
//             <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
//             <XAxis
//               dataKey="hour"
//               label={{ value: "שעה", position: "insideBottom", offset: -10 }}
//               stroke="#666"
//             />
//             <YAxis
//               label={{
//                 value: "מספר צירים",
//                 angle: -90,
//                 position: "insideLeft",
//               }}
//               stroke="#666"
//               allowDecimals={false}
//             />
//             <Tooltip content={<ContractionTooltip />} />
//             <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="rect" />
//             <Bar
//               dataKey="contractions"
//               fill="#87CEEB"
//               name="צירים לשעה"
//               radius={[8, 8, 0, 0]}
//               maxBarSize={60}
//             />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };

// export default PregnancyCharts;
import React, { useState, useMemo, useEffect } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Line,
} from "recharts";
import "./PregnancyCharts.css";

const PregnancyCharts = ({ userId }) => {
  const [initialWeight, setInitialWeight] = useState(65);
  const [userEntries, setUserEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!userId) return;

        const response = await fetch(
          `http://localhost:3000/api/weight/${userId}`,
        );
        if (!response.ok)
          throw new Error(`שגיאה בטעינת נתונים: ${response.status}`);

        const data = await response.json();

        if (data && data.length > 0) {
          setUserEntries(data);
          setInitialWeight(Number(data[0].weight) || 65);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        // השהייה קטנה כדי להבטיח שה-DOM מוכן לפני שהגרף מצטייר
        setTimeout(() => setLoading(false), 100);
      }
    };

    fetchData();
  }, [userId]);

  const chartData = useMemo(() => {
    const data = [];
    for (let w = 4; w <= 40; w++) {
      const targetMin = initialWeight + (w > 12 ? (w - 12) * 0.35 : 0);
      const targetMax = initialWeight + (w > 12 ? (w - 12) * 0.55 : 2);
      const entry = userEntries.find((e) => Number(e.week) === w);

      data.push({
        week: w,
        targetMin: Number(targetMin.toFixed(1)),
        targetMax: Number(targetMax.toFixed(1)),
        weight: entry ? Number(entry.weight) : null,
      });
    }
    return data;
  }, [initialWeight, userEntries]);

  // קומפוננטת Tooltip מותאמת אישית
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`שבוע הריון: ${label}`}</p>
          {payload[2] && (
            <p className="tooltip-weight">{`המשקל שלך: ${payload[2].value} ק"ג`}</p>
          )}
          <p className="tooltip-range">
            {`טווח מומלץ: ${payload[1].value} - ${payload[0].value} ק"ג`}
          </p>
        </div>
      );
    }
    return null;
  };

  // אם אנחנו בטעינה, נציג Spinner או הודעה, ולא נרנדר את ה-ResponsiveContainer עדיין
  if (loading) {
    return (
      <div className="pregnancy-charts-container" dir="rtl">
        <div
          className="no-data-message"
          style={{
            height: "500px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ⏳ מכין את לוח המעקב...
        </div>
      </div>
    );
  }

  return (
    <div
      className="pregnancy-charts-container"
      dir="rtl"
      style={{ minWidth: 0 }}
    >
      <h1 className="main-title">מרכז המעקב האישי שלך</h1>

      <div className="chart-section">
        <div className="chart-header">
          <h2 className="chart-title">מעקב משקל מול יעד</h2>
          <p className="chart-subtitle">
            התקדמות העלייה במשקל בהתאם למדדים האישיים שלך
          </p>
        </div>

        {/* שים לב לשימוש ב-aspect. זה מבטיח יחס גובה-רוחב תקין גם אם ה-Parent לא ברור */}
        {/* שים לב לשינוי כאן: הוספנו aspect והורדנו את height="100%" */}
        {/* 1. הסרנו את ה-height: 450px מהדיב העוטף כדי שלא יתנגש */}
        {/* הדיב העוטף מקבל רוחב מלא ומיקום יחסי */}
        <div
          className="chart-container-wrapper"
          style={{ width: "100%", position: "relative" }}
        >
          {/* 1. הוספנו debounce={50} - זה גורם לגרף לחכות 50 מילישניות לפני שהוא מחשב גודל, 
       מה שנותן לאנימציה של ה-CSS שלך זמן להסתיים.
    2. השתמשנו ב-aspect={2.5} במקום ב-height.
  */}
          <ResponsiveContainer width="100%" aspect={2.5} debounce={50}>
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis dataKey="week" />
              <YAxis
                domain={["dataMin - 5", "dataMax + 5"]}
                orientation="right"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={40} />

              <Area
                name="גבול עליון"
                dataKey="targetMax"
                fill="#FFB6C1"
                fillOpacity={0.3}
                stroke="none"
                type="monotone"
              />
              <Area
                name="גבול תחתון"
                dataKey="targetMin"
                fill="#ffffff"
                fillOpacity={1}
                stroke="none"
                type="monotone"
              />

              <Line
                name="המשקל שלך"
                dataKey="weight"
                stroke="#FF69B4"
                strokeWidth={4}
                dot={{ r: 6, fill: "#FF69B4", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 8 }}
                connectNulls
                type="monotone"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-section weight-data-table">
        <h3 className="table-title" style={{ textAlign: "center" }}>
          פירוט שקילות
        </h3>
        <div className="table-container">
          {userEntries.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>שבוע</th>
                  <th>משקל (ק"ג)</th>
                  <th>תאריך</th>
                </tr>
              </thead>
              <tbody>
                {[...userEntries].reverse().map((entry, index) => (
                  <tr key={index}>
                    <td>שבוע {entry.week}</td>
                    <td>{entry.weight}</td>
                    <td>{new Date(entry.date).toLocaleDateString("he-IL")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data-message">עדיין לא הוזנו נתונים במערכת</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PregnancyCharts;
