// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const WeightTracker = ({ userId }) => {
//   const [weightData, setWeightData] = useState([]);
//   const [newWeight, setNewWeight] = useState("");

//   useEffect(() => {
//     fetchWeightData();
//   }, [userId]);

//   const fetchWeightData = async () => {
//     try {
//       const response = await axios.get(
//         `http://localhost:3000/api/weight/${userId}`,
//       );
//       setWeightData(response.data);
//     } catch (err) {
//       console.error("Error fetching weight data", err);
//     }
//   };

//   const handleAddWeight = async () => {
//     if (!newWeight) return;

//     try {
//       await axios.post(`http://localhost:3000/api/weight/${userId}`, {
//         weight: parseFloat(newWeight),
//         date: new Date().toISOString(),
//       });
//       setNewWeight("");
//       fetchWeightData();
//     } catch (err) {
//       console.error("Error saving weight", err);
//     }
//   };

//   // Simple chart using HTML/CSS
//   const maxWeight = Math.max(...weightData.map((d) => d.weight || 0), 70);
//   const minWeight = Math.min(...weightData.map((d) => d.weight || 0), 50);
//   const range = maxWeight - minWeight || 10;

//   return (
//     <div className="card shadow-sm p-4 mt-4 text-center">
//       <h3> מעקב משקל שבועי ⚖️</h3>

//       <div className="mb-3">
//         <div className="input-group">
//           <input
//             type="number"
//             step="0.1"
//             className="form-control"
//             placeholder="הוסף משקל (ק״ג)"
//             value={newWeight}
//             onChange={(e) => setNewWeight(e.target.value)}
//           />
//           <button
//             className="btn btn-outline-primary"
//             onClick={handleAddWeight}
//             type="button"
//           >
//             הוסף
//           </button>
//         </div>
//       </div>

//       <div style={{ width: "100%", height: 300, position: "relative" }}>
//         {weightData.length > 0 ? (
//           <div style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}>
//             {weightData.map((data, idx) => (
//               <div key={idx} style={{ flex: 1, textAlign: "center" }}>
//                 <div
//                   style={{
//                     height: `${((data.weight - minWeight) / range) * 250}px`,
//                     backgroundColor: "#82ca9d",
//                     borderRadius: "5px 5px 0 0",
//                     marginBottom: "5px",
//                   }}
//                 />
//                 <small>{data.weight} ק"ג</small>
//                 <br />
//                 <small className="text-muted">
//                   {new Date(data.date).toLocaleDateString("he-IL")}
//                 </small>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p className="text-center text-muted">אין נתוני משקל עדיין</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default WeightTracker;
import React, { useState, useEffect } from "react";
import axios from "axios";

const WeightTracker = ({ userId }) => {
  const [weightData, setWeightData] = useState([]);
  const [newWeight, setNewWeight] = useState("");

  useEffect(() => {
    fetchWeightData();
  }, [userId]);

  const fetchWeightData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/weight/${userId}`,
      );
      setWeightData(response.data);
    } catch (err) {
      console.error("Error fetching weight data", err);
    }
  };

  const handleAddWeight = async () => {
    if (!newWeight) return;

    try {
      await axios.post(`http://localhost:3000/api/weight/${userId}`, {
        weight: parseFloat(newWeight),
        date: new Date().toISOString(),
      });
      setNewWeight("");
      fetchWeightData();
    } catch (err) {
      console.error("Error saving weight", err);
    }
  };

  const maxWeight = Math.max(...weightData.map((d) => d.weight || 0), 70);
  const minWeight = Math.min(...weightData.map((d) => d.weight || 0), 50);
  const range = maxWeight - minWeight || 10;

  return (
    <div className="card shadow-sm p-4 mt-4 text-center">
      <h3> מעקב משקל שבועי ⚖️</h3>

      <div className="mb-4">
        <div className="input-group">
          <input
            type="number"
            step="0.1"
            className="form-control"
            placeholder="הוסף משקל (ק״ג)"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
          />
          <button
            className="btn btn-outline-primary"
            onClick={handleAddWeight}
            type="button"
          >
            הוסף
          </button>
        </div>
      </div>

      {/* המכולה החיצונית - מגבילה את הרוחב ומאפשרת גלילה */}
      <div
        style={{
          width: "100%",
          overflowX: "auto",
          overflowY: "hidden",
          borderBottom: "1px solid #eee",
          paddingBottom: "15px",
        }}
      >
        {weightData.length > 0 ? (
          /* המכולה הפנימית - מתרחבת לפי כמות האיברים */
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "15px",
              minWidth: "max-content", // מבטיח שה-div יתרחב מעבר לרוחב המסך במידת הצורך
              padding: "10px",
            }}
          >
            {weightData.map((data, idx) => (
              <div
                key={idx}
                style={{ width: "65px", textAlign: "center", flexShrink: 0 }}
              >
                <div
                  style={{
                    height: `${((data.weight - minWeight) / range) * 200}px`, // הקטנתי מעט כדי שייכנס יפה
                    minHeight: "5px", // שיהיה פס קטן גם למשקל מינימלי
                    backgroundColor: "#82ca9d",
                    borderRadius: "5px 5px 0 0",
                    marginBottom: "5px",
                    transition: "height 0.3s ease", // אנימציה נחמדה כשיש שינוי
                  }}
                />
                <small style={{ fontWeight: "bold", display: "block" }}>
                  {data.weight}
                </small>
                <small
                  className="text-muted"
                  style={{ fontSize: "0.7rem", whiteSpace: "nowrap" }}
                >
                  {new Date(data.date).toLocaleDateString("he-IL", {
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </small>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted">אין נתוני משקל עדיין</p>
        )}
      </div>
    </div>
  );
};

export default WeightTracker;
