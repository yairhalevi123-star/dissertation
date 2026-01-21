import { useState } from "react";
import axios from "axios";

function DocumentUpload({ userId }) {
  const [file, setFile] = useState(null);

  // פונקציה להעלאת הקובץ לשרת
  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("document", file);

    try {
      await axios.post(`http://localhost:3000/api/upload/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("הקובץ הועלה!");
    } catch (err) {
      console.error("שגיאה בהעלאה", err);
    }
  };

  return (
    <div className="mb-3">
      <label htmlFor="file-upload" className="form-label">
        בחר קובץ להעלאה
      </label>
      <input
        type="file"
        id="file-upload"
        className="form-control"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button
        className="btn btn-primary mt-2"
        onClick={handleUpload}
        disabled={!file}
      >
        העלי מסמך
      </button>
    </div>
  );
}

export default DocumentUpload;
