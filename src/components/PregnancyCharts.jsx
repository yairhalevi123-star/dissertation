import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts';
import './PregnancyCharts.css';

/**
 * PregnancyCharts Component
 * Displays weight tracking and contraction frequency charts for pregnancy monitoring
 */
const PregnancyCharts = () => {
  // State for weight tracking over pregnancy weeks
  // Simulates a healthy weight gain progression from weeks 4-40
  const [weightData, setWeightData] = useState([
    { week: 4, weight: 65, targetMin: 65, targetMax: 65 },
    { week: 8, weight: 66, targetMin: 65.5, targetMax: 66.5 },
    { week: 12, weight: 67.5, targetMin: 66.5, targetMax: 68 },
    { week: 16, weight: 69, targetMin: 68, targetMax: 70 },
    { week: 20, weight: 71, targetMin: 70, targetMax: 72.5 },
    { week: 24, weight: 73.5, targetMin: 72, targetMax: 75 },
    { week: 28, weight: 76, targetMin: 74.5, targetMax: 77.5 },
    { week: 32, weight: 78.5, targetMin: 77, targetMax: 80 },
    { week: 36, weight: 81, targetMin: 79.5, targetMax: 82.5 },
    { week: 40, weight: 83, targetMin: 81.5, targetMax: 85 },
  ]);

  /**
   * Delete a weight entry by week number
   * @param {number} weekToDelete - The week number to delete
   */
  const handleDeleteWeight = (weekToDelete) => {
    setWeightData(weightData.filter(entry => entry.week !== weekToDelete));
  };

  // Mock data for contraction frequency over the last 12 hours
  // Shows increasing frequency pattern typical of early labor
  const contractionData = [
    { hour: '10 PM', contractions: 0 },
    { hour: '11 PM', contractions: 1 },
    { hour: '12 AM', contractions: 0 },
    { hour: '1 AM', contractions: 2 },
    { hour: '2 AM', contractions: 1 },
    { hour: '3 AM', contractions: 3 },
    { hour: '4 AM', contractions: 2 },
    { hour: '5 AM', contractions: 4 },
    { hour: '6 AM', contractions: 3 },
    { hour: '7 AM', contractions: 5 },
    { hour: '8 AM', contractions: 4 },
    { hour: '9 AM', contractions: 6 },
  ];

  /**
   * Custom tooltip for weight chart
   * Displays week, actual weight, and target range
   */
  const WeightTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">שבוע {payload[0].payload.week}</p>
          <p className="tooltip-weight">משקל: {payload[0].payload.weight} ק״ג</p>
          <p className="tooltip-range">
            יעד: {payload[0].payload.targetMin} - {payload[0].payload.targetMax} ק״ג
          </p>
        </div>
      );
    }
    return null;
  };

  /**
   * Custom tooltip for contraction chart
   * Displays hour and number of contractions
   */
  const ContractionTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{payload[0].payload.hour}</p>
          <p className="tooltip-contractions">
            {payload[0].value} {payload[0].value !== 1 ? 'צירים' : 'ציר'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="pregnancy-charts-container" dir="rtl">
      <h1 className="main-title">לוח מעקב הריון</h1>

      {/* Weight Tracker Chart */}
      <div className="chart-section">
        <div className="chart-header">
          <h2 className="chart-title">מעקב משקל</h2>
          <p className="chart-subtitle">עקבי אחר עלייה במשקל במהלך ההריון</p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            data={weightData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="week"
              label={{ value: 'שבוע הריון', position: 'insideBottom', offset: -10 }}
              stroke="#666"
            />
            <YAxis
              label={{ value: 'משקל (ק״ג)', angle: -90, position: 'insideLeft' }}
              stroke="#666"
              domain={[60, 90]}
            />
            <Tooltip content={<WeightTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />

            {/* Shaded area for target weight range */}
            <Area
              type="monotone"
              dataKey="targetMax"
              stroke="none"
              fill="#FFB6C1"
              fillOpacity={0.3}
              name="טווח יעד"
            />
            <Area
              type="monotone"
              dataKey="targetMin"
              stroke="none"
              fill="#FFFFFF"
              fillOpacity={1}
            />

            {/* Actual weight line */}
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#FF69B4"
              strokeWidth={3}
              dot={{ fill: '#FF69B4', r: 5 }}
              activeDot={{ r: 7 }}
              name="משקל בפועל"
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Weight Data Table with Delete Buttons */}
        <div className="weight-data-table">
          <h3 className="table-title">רשומות משקל</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>שבוע</th>
                  <th>משקל (ק״ג)</th>
                  <th>טווח יעד (ק״ג)</th>
                  <th>פעולה</th>
                </tr>
              </thead>
              <tbody>
                {weightData.map((entry) => (
                  <tr key={entry.week}>
                    <td>שבוע {entry.week}</td>
                    <td>{entry.weight}</td>
                    <td>{entry.targetMin} - {entry.targetMax}</td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteWeight(entry.week)}
                        aria-label={`מחק רשומת משקל לשבוע ${entry.week}`}
                      >
                        🗑️ מחק
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {weightData.length === 0 && (
              <p className="no-data-message">אין רשומות משקל זמינות. הוסיפי נתונים כדי להתחיל!</p>
            )}
          </div>
        </div>
      </div>

      {/* Contraction Frequency Chart */}
      <div className="chart-section">
        <div className="chart-header">
          <h2 className="chart-title">תדירות צירים</h2>
          <p className="chart-subtitle">עקבי אחר צירים ב-12 השעות האחרונות</p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={contractionData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="hour"
              label={{ value: 'שעה', position: 'insideBottom', offset: -10 }}
              stroke="#666"
            />
            <YAxis
              label={{ value: 'מספר צירים', angle: -90, position: 'insideLeft' }}
              stroke="#666"
              allowDecimals={false}
            />
            <Tooltip content={<ContractionTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="rect"
            />
            <Bar
              dataKey="contractions"
              fill="#87CEEB"
              name="צירים לשעה"
              radius={[8, 8, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PregnancyCharts;
