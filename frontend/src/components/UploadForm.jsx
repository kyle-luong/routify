import React from "react";
import DragAndDrop from "./DragAndDrop";
import UniversitySearch from "./UniversitySearch";
import "../styles/UploadForm.css";

const UploadForm = () => {
    return (
        <div className="upload-form-container">
            <div className="drag-and-drop">
                <DragAndDrop />
            </div>
            <div className="university-search-container">
                <UniversitySearch />
                <button className="upload-button">Submit</button>
            </div>
        </div>
    );
}

export default UploadForm;