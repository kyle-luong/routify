import React from "react";
import "../MapboxMap/MapboxMap.css";

const DirectionInfo = ({ info }) => {
  if (!info) return null;
  return (
    <div className="direction-info">
      <p>Distance: {(info.distance / 1000).toFixed(2)} km</p>
      <p>Duration: {Math.round(info.duration / 60)} min</p>
    </div>
  );
};

export default DirectionInfo;
