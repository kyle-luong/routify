import React, { useState } from "react";
import DragAndDrop from "./DragAndDrop";
import UniversitySearch from "./UniversitySearch";
import "../styles/UploadForm.css";

const UploadForm = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState("");

  const handleFilesSelected = (files) => {
    setSelectedFiles(files);
  };

  const handleUniversitySelect = (university) => {
    setSelectedUniversity(university); 
  };

  const handleSubmit = () => {
    if (selectedFiles.length === 0 || !selectedUniversity) {
      alert("Please upload a file and select a university before submitting.");
      return;
    }

    console.log("Files:", selectedFiles);
    console.log("University:", selectedUniversity);

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));
    formData.append("university", selectedUniversity);

    fetch("/api/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => console.log("Success:", data))
      .catch((error) => console.error("Error:", error));
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
    </div>
  );
};

export default UploadForm;