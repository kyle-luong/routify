import React from "react";
import DragAndDrop from "./DragAndDrop";
import UniversitySearch from "./UniversitySearch";

const UploadForm = () => {
    return (
        <div>
            <DragAndDrop />
            <div>
                <UniversitySearch />
                <button>this is the upload form submit button!</button>
            </div>
        </div>
    )
}

export default UploadForm;