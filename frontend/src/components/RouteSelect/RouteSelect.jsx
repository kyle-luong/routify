import React, { useState } from "react";
import "./RouteSelect.css";

const RouteSelect = ({ onSelect, isSelected }) => {
  return (
    <div className="route-select-container" onClick={onSelect}>
      <div className={`route-select-circle ${isSelected ? "filled" : "hollow"}`}></div>
    </div>
  );
};

export default RouteSelect;