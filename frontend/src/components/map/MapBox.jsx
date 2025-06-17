import React, { useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

import MapBoxControls from './MapBoxControls';
import MapBoxMarkers from './MapBoxMarkers';
import MapBoxRoutes from './MapBoxRoutes';
import useMapBox from './useMapBox';

function MapBox({ segments, selectedPair = [null, null] }) {
  const mapContainerRef = useRef(null);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v12');

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
    // Save current view
    const center = map.current.getCenter();
    const zoom = map.current.getZoom();
    const bearing = map.current.getBearing();
    const pitch = map.current.getPitch();

    setMapStyle(newStyle);

    map.current.once('style.load', () => {
      map.current.setCenter(center);
      map.current.setZoom(zoom);
      map.current.setBearing(bearing);
      map.current.setPitch(pitch);
    });
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* controls to select style */}
      <MapBoxControls mapStyle={mapStyle} onChange={handleStyleChange} />
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      {/* routes rendered by separate components */}
      {isMapLoaded && map.current && (
        <MapBoxRoutes map={map.current} segments={segments} selectedPair={selectedPair} />
      )}

      {/* markers rendered by separate components */}
      {isMapLoaded && map.current && <MapBoxMarkers map={map.current} segments={segments} />}
    </div>
  );
}

export default MapBox;
