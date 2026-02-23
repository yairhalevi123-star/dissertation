import { useState, useEffect } from "react";
import axios from "axios";
import { FileText, Trash2, Eye, Download } from "lucide-react";
import "./DocumentUpload.css";

function DocumentUpload({ userId }) {
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:3000/api/documents/${userId}`,
      );
      setDocuments(response.data);
    } catch (err) {
      console.error("שגיאה במשיכת קבצים", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchDocuments();
  }, [userId]);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("document", file);

    try {
      await axios.post(`http://localhost:3000/api/upload/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("הקובץ הועלה בהצלחה!");
      setFile(null);
      fetchDocuments();
    } catch (err) {
      console.error("שגיאה בהעלאה", err);
      alert("שגיאה בהעלאת הקובץ");
    }
  };

  const handleDelete = async (docId, fileName) => {
    const confirmed = window.confirm(
      `האם אתה בטוח שברצונך למחוק את המסמך "${fileName}"?`,
    );
    if (!confirmed) return;

    try {
      await axios.delete(
        `http://localhost:3000/api/documents/${userId}/${docId}`,
      );
      alert("המסמך נמחק בהצלחה!");
      fetchDocuments();
    } catch (err) {
      console.error("שגיאה במחיקה", err);
      alert("שגיאה במחיקת המסמך");
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("he-IL", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="document-manager" dir="rtl">
      <style>
        {`
          [dir="rtl"] .input-group { flex-direction: row-reverse; }
          [dir="rtl"] .input-group-text { border-radius: 0.375rem 1rem 1rem 0.375rem; }
          [dir="rtl"] .input-group > .form-control { border-radius: 1rem 0.375rem 0.375rem 1rem; }
        `}
      </style>

      {/* Upload Section */}
      <div className="upload-section rounded-2xl shadow-sm mb-6">
        <div className="upload-content">
          <h3 className="mb-4 text-right">📄 המסמכים שלי</h3>

          {/* File Input */}
          <div className="upload-input-wrapper mb-3">
            <div className="input-group">
              <label
                className="input-group-text btn btn-outline-secondary"
                htmlFor="fileInput"
              >
                בחרי קובץ
              </label>
              <input
                type="file"
                className="form-control"
                id="fileInput"
                style={{ display: "none" }}
                onChange={(e) => setFile(e.target.files[0])}
              />
              <div className="form-control bg-light">
                {file ? file.name : "לא נבחר קובץ"}
              </div>
            </div>
          </div>

          {/* Upload Button */}
          <button
            className="btn btn-upload w-100 rounded-2xl py-2"
            onClick={handleUpload}
            disabled={!file}
          >
            📤 העלי מסמך עכשיו
          </button>
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="text-center py-5">
          <p className="text-muted">טוען מסמכים...</p>
        </div>
      ) : documents.length > 0 ? (
        <div className="documents-grid">
          {documents.map((doc) => (
            <div key={doc.id} className="document-card rounded-2xl shadow-sm">
              <div className="card-content">
                {/* File Icon */}
                <div className="file-icon-wrapper">
                  <FileText size={24} className="file-icon" />
                </div>

                {/* File Info */}
                <div className="file-info">
                  <h5 className="file-name">{doc.file_name}</h5>
                  <p className="file-date">{formatDate(doc.uploaded_at)}</p>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                  <button
                    onClick={() =>
                      window.open(
                        `http://localhost:3000/api/documents/view/${doc.id}`,
                        "_blank",
                      )
                    }
                    className="icon-btn view-btn"
                    title="צפייה"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = `http://localhost:3000/api/documents/download/${doc.id}`;
                      link.download = doc.file_name;
                      link.click();
                    }}
                    className="icon-btn download-btn"
                    title="הורדה"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id, doc.file_name)}
                    className="icon-btn delete-btn"
                    title="מחק"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="empty-state rounded-2xl">
          <div className="empty-icon">📁</div>
          <h4>אין מסמכים שהועלו עדיין</h4>
          <p>הועלי את המסמכים החשובים שלך כאן</p>
        </div>
      )}
    </div>
  );
}

export default DocumentUpload;
