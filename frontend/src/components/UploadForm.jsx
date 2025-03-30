import React, { useState } from "react";
import DragAndDrop from "./DragAndDrop";
import UniversitySearch from "./UniversitySearch";
import axios from "axios";
import "../styles/UploadForm.css";

const UploadForm = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [message, setMessage] = useState(""); 

  const handleFilesSelected = (files) => {
    setSelectedFiles(files);
  };

  const handleUniversitySelect = (university) => {
    setSelectedUniversity(university);
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0 || !selectedUniversity) {
      alert("Please upload a file and select a university before submitting.");
      return;
    }

    console.log("Files:", selectedFiles);
    console.log("University:", selectedUniversity);

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));
    formData.append("university", selectedUniversity);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setMessage("File uploaded successfully!");
      console.log("Response:", response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage("Error uploading file.");
    }
  };

  return (
    <div className="upload-form-container">
      <div className="drag-and-drop">
        <DragAndDrop onFilesSelected={handleFilesSelected} />
      </div>
      <div className="university-search-container">
        <UniversitySearch onUniversitySelect={handleUniversitySelect} />
        <button className="upload-button" onClick={handleSubmit}>
          Submit
        </button>
      </div>
      {message && <p>{message}</p>} {/* Display success or error message */}
    </div>
  );
};

export default UploadForm;