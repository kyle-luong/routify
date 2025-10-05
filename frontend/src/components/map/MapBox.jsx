import React, { useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

import MapBoxControls from './MapBoxControls';
import MapBoxMarkers from './MapBoxMarkers';
import MapBoxRoutes from './MapBoxRoutes';
import useMapBox from './useMapBox';

function MapBox({ segments = [], singleEvents = [], selectedPair = [null, null], transportMode = 'walking' }) {
  const mapContainerRef = useRef(null);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v12');
  const pageLoadKey = useRef(Date.now()); 

  const { map, isMapLoaded } = useMapBox(
    import.meta.env.VITE_MAPBOX_TOKEN,
    mapStyle,
    mapContainerRef
  );

  const handleStyleChange = (newStyle) => {
    if (!map.current) {
      setMapStyle(newStyle);
      return;
    }

    // Save current view state
    const center = map.current.getCenter();
    const zoom = map.current.getZoom();
    const bearing = map.current.getBearing();
    const pitch = map.current.getPitch();

    // Change style
    setMapStyle(newStyle);
    map.current.setStyle(newStyle);

    // Wait for style to load, then restore view and re-add data
    map.current.once('style.load', () => {
      // Restore view
      map.current.setCenter(center);
      map.current.setZoom(zoom);
      map.current.setBearing(bearing);
      map.current.setPitch(pitch);

      // Force re-render of markers and routes by updating a key
      setStyleChangeKey((prev) => prev + 1);
    });
  };

  const [styleChangeKey, setStyleChangeKey] = useState(0);
  const segmentSig = segments.map(s => `${s[0]?.title || ''}>${s[1]?.title || ''}`).join('|');
  const fragmentKey = `${pageLoadKey.current}-${styleChangeKey}-${segmentSig}`;


  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <MapBoxControls mapStyle={mapStyle} onChange={handleStyleChange} />
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Add key prop to force re-render after style change */}
      {isMapLoaded && map.current && (
        <React.Fragment key={fragmentKey}>
          <MapBoxRoutes 
            map={map.current} 
            segments={segments} 
            selectedPair={selectedPair} 
            transportMode={transportMode}
            isMapLoaded={isMapLoaded}
          />

          <MapBoxMarkers 
            map={map.current} 
            segments={segments} 
            singleEvents={singleEvents}
            isMapLoaded={isMapLoaded}
          />
        </React.Fragment>
      )}
    </div>
  );
}

export default MapBox;
