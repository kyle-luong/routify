import React from "react";

const MAP_STYLES = [
  { label: "Streets", value: "mapbox://styles/mapbox/streets-v12" },
  { label: "Outdoors", value: "mapbox://styles/mapbox/outdoors-v12" },
  { label: "Light", value: "mapbox://styles/mapbox/light-v11" },
  { label: "Dark", value: "mapbox://styles/mapbox/dark-v11" },
  { label: "Satellite", value: "mapbox://styles/mapbox/satellite-v9" },
  { label: "Satellite Streets", value: "mapbox://styles/mapbox/satellite-streets-v12" },
];

function MapBoxControls({ mapStyle, onChange }) {
  return (
    <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1 }}>
      <select
        value={mapStyle}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border bg-white px-2 py-1 text-sm shadow">
        {MAP_STYLES.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default MapBoxControls;
