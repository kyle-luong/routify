import React from "react";
import "../styles/MapboxMap.css";

const MapStyleSelector = ({ mapStyle, onStyleChange }) => {
  return (
    <div className="map-style-selector">
      <select value={mapStyle} onChange={onStyleChange}>
        <option value="mapbox://styles/mapbox/streets-v11">Streets</option>
        <option value="mapbox://styles/mapbox/outdoors-v11">Outdoors</option>
        <option value="mapbox://styles/mapbox/standard">Standard</option>
        <option value="mapbox://styles/mapbox/dark-v10">Dark</option>
        <option value="mapbox://styles/mapbox/satellite-v9">Satellite</option>
      </select>
    </div>
  );
};

export default MapStyleSelector;
