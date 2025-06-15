import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MAP_STYLES = [
  { label: 'Streets', value: 'mapbox://styles/mapbox/streets-v12' },
  { label: 'Outdoors', value: 'mapbox://styles/mapbox/outdoors-v12' },
  { label: 'Light', value: 'mapbox://styles/mapbox/light-v11' },
  { label: 'Dark', value: 'mapbox://styles/mapbox/dark-v11' },
  { label: 'Satellite', value: 'mapbox://styles/mapbox/satellite-v9' },
  { label: 'Satellite Streets', value: 'mapbox://styles/mapbox/satellite-streets-v12' },
];

const MapBox = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapStyle, setMapStyle] = useState(MAP_STYLES[0].value);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Effect for initializing the map once
  useEffect(() => {
    if (!mapboxgl.accessToken) {
      console.error('Mapbox token is missing!');
      return;
    }
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [-78.504, 38.034],
      zoom: 17,
      pitch: 60,
      bearing: 25,
      maxPitch: 60,
    });

    map.current.addControl(new mapboxgl.NavigationControl());

    // 2. Set loaded state to true once the map is ready
    map.current.on('load', () => {
      setIsMapLoaded(true);
    });

    return () => {
      map.current.remove();
      map.current = null;
    };
  }, []); // Empty dependency array ensures this runs only once

  // Effect for updating the map style when it changes
  useEffect(() => {
    // 3. Wait for the map to be loaded before trying to change the style
    if (!isMapLoaded || !map.current) return;

    map.current.setStyle(mapStyle);

  }, [mapStyle, isMapLoaded]); // Depend on both mapStyle and the loaded state

  return (
    <div className="map-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1, fontFamily: 'sans-serif' }}>
        <select
          value={mapStyle}
          onChange={(e) => setMapStyle(e.target.value)}
          className="rounded border bg-white px-2 py-1 text-sm shadow"
        >
          {MAP_STYLES.map((style) => (
            <option key={style.value} value={style.value}>
              {style.label}
            </option>
          ))}
        </select>
      </div>
      <div ref={mapContainer} className="mapbox-map" style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default MapBox;