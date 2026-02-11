import { useState, useEffect } from "react";
import axios from "axios";

function DocumentUpload({ userId }) {
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/documents/${userId}`,
      );
      setDocuments(response.data);
    } catch (err) {
      console.error("שגיאה במשיכת קבצים", err);
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

  return (
    <div className="mb-3" dir="rtl">
      {" "}
      {/* Forces Right-to-Left direction */}
      {/* Custom File Input to solve the "No file chosen" English text */}
      <div className="input-group mb-2">
        <label
          className="input-group-text btn btn-outline-secondary"
          htmlFor="inputGroupFile01"
        >
          בחרי קובץ
        </label>
        <input
          type="file"
          className="form-control"
          id="inputGroupFile01"
          style={{ display: "none" }} // Hide the default browser input
          onChange={(e) => setFile(e.target.files[0])}
        />
        <div className="form-control bg-light">
          {file ? file.name : "לא נבחר קובץ"}
        </div>
      </div>
      <button
        className="btn btn-primary w-100 mt-2"
        onClick={handleUpload}
        disabled={!file}
      >
        העלי מסמך עכשיו
      </button>
      <hr />
      <h4 className="mb-3">המסמכים שלי</h4>
      <ul className="list-group">
        {documents.length > 0 ? (
          documents.map((doc) => (
            <li
              key={doc.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <span className="text-truncate" style={{ maxWidth: "200px" }}>
                {doc.file_name}
              </span>
              <div>
                <button
                  onClick={() =>
                    window.open(
                      `http://localhost:3000/api/documents/view/${doc.id}`,
                      "_blank",
                    )
                  }
                  className="btn btn-sm btn-outline-primary ms-2"
                >
                  צפייה
                </button>
                <button
                  onClick={() => {
                    /* download logic */
                  }}
                  className="btn btn-sm btn-outline-secondary"
                >
                  הורדה
                </button>
              </div>
            </li>
          ))
        ) : (
          <li className="list-group-item text-center text-muted">
            עדיין לא הועלו קבצים
          </li>
        )}
      </ul>
    </div>
  );
}

export default DocumentUpload;
