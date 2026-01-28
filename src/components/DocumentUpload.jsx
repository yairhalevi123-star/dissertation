import { useState, useEffect } from "react";
import axios from "axios";

function DocumentUpload({ userId }) {
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]); // State to hold the list

  // 1. Function to fetch the files from the server
  const fetchDocuments = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/documents/${userId}`,
      );
      setDocuments(response.data); // Assuming server returns an array of file objects
    } catch (err) {
      console.error("Error fetching files", err);
    }
  };

  // 2. Fetch list automatically when component mounts
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
      alert("הקובץ הועלה!");
      setFile(null);
      fetchDocuments(); // 3. Refresh the list after a successful upload
    } catch (err) {
      console.error("שגיאה בהעלאה", err);
      alert("שגיאה בהעלאת הקובץ");
    }
  };

  const handleViewFile = (doc) => {
    // Create a proper file URL for viewing
    const fileUrl = `http://localhost:3000/api/documents/view/${doc.id}`;
    window.open(fileUrl, "_blank");
  };

  const handleDownloadFile = (doc) => {
    // Create a download link
    const downloadUrl = `http://localhost:3000/api/documents/download/${doc.id}`;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = doc.file_name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="mb-3">
      <input
        type="file"
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

      <hr />

      {/* 4. Display the uploaded files */}
      <h4>המסמכים שלי</h4>
      <ul className="list-group">
        {documents.length > 0 ? (
          documents.map((doc) => (
            <li
              key={doc.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <span>{doc.file_name}</span>
              <div>
                <button
                  onClick={() => handleViewFile(doc)}
                  className="btn btn-sm btn-outline-primary me-2"
                >
                  צפה בקובץ
                </button>
                <button
                  onClick={() => handleDownloadFile(doc)}
                  className="btn btn-sm btn-outline-secondary"
                >
                  הורד
                </button>
              </div>
            </li>
          ))
        ) : (
          <p>לא נמצאו קבצים.</p>
        )}
      </ul>
    </div>
  );
}

export default DocumentUpload;
