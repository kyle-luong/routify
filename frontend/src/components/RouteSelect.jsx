import React, { useState } from "react";
import "../styles/RouteSelect.css";

const RouteSelect = ({ onSelect }) => {
  const [isSelected, setIsSelected] = useState(false);

  const handleClick = () => {
    setIsSelected(!isSelected);
    onSelect();
  };

  return (
    <div className="route-select-container" onClick={handleClick}>
      <div className={`route-select-circle ${isSelected ? "filled" : "hollow"}`}></div>
    </div>
  );
};

export default RouteSelect;