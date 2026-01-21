import { useState } from "react";
import axios from "axios";

function DocumentUpload({ userId }) {
  const [file, setFile] = useState(null);

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
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>העלי מסמך</button>
    </div>
  );
}

export default DocumentUpload;
