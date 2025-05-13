import React, { useEffect, useState } from "react";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { MdClear } from "react-icons/md";
import "./DragAndDrop.css";

const DragAndDrop = ({ onFilesSelected, width = "100%", height = "200px" }) => {
  const [files, setFiles] = useState([]);

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
  };

  const handleFileInput = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  useEffect(() => {
    if (onFilesSelected) {
      onFilesSelected(files); // Pass files up to parent
    }
  }, [files, onFilesSelected]);

  return (
    <section className="drag-drop" style={{ width, height }}>
      <div
        className={`document-uploader ${files.length > 0 ? "upload-box active" : "upload-box"}`}
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
      >
        <input type="file" multiple onChange={handleFileInput} style={{ display: "none" }} id="fileInput" />
        <label htmlFor="fileInput" className="upload-info">
          <AiOutlineCloudUpload />
          <div>
            <p>Drag and drop your files here or click to upload</p>
            <p>Supported files: .ICS</p>
          </div>
        </label>

        {files.length > 0 && (
          <div className="file-list">
            <div className="file-list__container">
              {files.map((file, index) => (
                <div className="file-item" key={index}>
                  <div className="file-info">
                    <p>{file.name}</p>
                  </div>
                  <div className="file-actions">
                    <MdClear onClick={() => handleRemoveFile(index)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default DragAndDrop;