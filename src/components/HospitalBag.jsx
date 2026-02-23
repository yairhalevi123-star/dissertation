import React, { useState, useEffect } from "react";
import axios from "axios";
import "./HospitalBag.css";

const HospitalBag = ({ currentWeek, userId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItemText, setNewItemText] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("מסמכים");
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Fetch items on mount or when userId changes
  useEffect(() => {
    if (!userId) return;
    fetchItems();
  }, [userId]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/hospital-bag/${userId}`);
      setItems(response.data || []);
    } catch (error) {
      console.error("Error fetching hospital bag items:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (id) => {
    try {
      // Optimistic update
      setItems(
        items.map((item) =>
          item.id === id ? { ...item, checked: !item.checked } : item,
        ),
      );

      // API call
      await axios.patch(`/api/hospital-bag/${userId}/${id}`);
    } catch (error) {
      console.error("Error updating item:", error);
      // Revert on error
      fetchItems();
    }
  };

  const addItem = async () => {
    if (!newItemText.trim()) return;

    try {
      // Optimistic update
      const tempItem = {
        id: `temp-${Date.now()}`,
        text: newItemText,
        category: newItemCategory,
        checked: false,
      };

      setItems([...items, tempItem]);
      setNewItemText("");

      // API call
      const response = await axios.post(`/api/hospital-bag/${userId}`, {
        text: newItemText,
        category: newItemCategory,
      });

      // Replace temp item with real item from server
      setItems(
        items.map((item) => (item.id === tempItem.id ? response.data : item)),
      );
    } catch (error) {
      console.error("Error adding item:", error);
      // Revert on error
      setItems(items.filter((item) => item.id !== `temp-${Date.now()}`));
    }
  };

  const deleteItem = async (id) => {
    try {
      // Optimistic update
      setItems(items.filter((item) => item.id !== id));

      // API call
      await axios.delete(`/api/hospital-bag/${userId}/${id}`);
    } catch (error) {
      console.error("Error deleting item:", error);
      // Revert on error
      fetchItems();
    }
  };

  const progress = Math.round(
    items.length > 0
      ? (items.filter((i) => i.checked).length / items.length) * 100
      : 0,
  );

  const categories = ["מסמכים", "לאמא", "לבייבי"];

  if (loading) {
    return (
      <div className="hospital-bag-container">
        <p className="text-center py-5">טוען...</p>
      </div>
    );
  }

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
        {categories.map((cat) => {
          const categoryItems = items.filter((i) => i.category === cat);
          return (
            <div key={cat} className="bag-category">
              <h3
                className="category-title"
                onClick={() =>
                  setExpandedCategory(expandedCategory === cat ? null : cat)
                }
              >
                {cat}
                <span className="category-count">({categoryItems.length})</span>
                <span className="expand-icon">
                  {expandedCategory === cat ? "▼" : "▶"}
                </span>
              </h3>

              {expandedCategory === cat && (
                <>
                  <div className="items-list">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className={`bag-item ${item.checked ? "checked" : ""}`}
                      >
                        <div
                          className="checkbox"
                          onClick={() => toggleItem(item.id)}
                        >
                          {item.checked && "✓"}
                        </div>
                        <span className="item-text">{item.text}</span>
                        {!item.id.startsWith("temp") && (
                          <button
                            className="btn-delete"
                            onClick={() => deleteItem(item.id)}
                            title="מחק פריט"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="add-item-form">
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder={`הוסף פריט ל${cat}...`}
                        value={newItemCategory === cat ? newItemText : ""}
                        onChange={(e) => {
                          setNewItemCategory(cat);
                          setNewItemText(e.target.value);
                        }}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && newItemCategory === cat) {
                            addItem();
                          }
                        }}
                        className="input-add"
                      />
                      <button
                        onClick={() => {
                          setNewItemCategory(cat);
                          addItem();
                        }}
                        className="btn-add"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HospitalBag;
