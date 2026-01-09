import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

const MapContext = createContext(null);

export function MapProvider({ children }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v12');
  const initializingRef = useRef(false);

  const initializeMap = useCallback(
    (container) => {
      if (!container || initializingRef.current) return;
      if (mapRef.current) {
        // Map already exists, just move it to new container
        containerRef.current = container;
        return;
      }

      initializingRef.current = true;

      const token = import.meta.env.VITE_MAPBOX_TOKEN;
      if (!token) {
        console.error('Mapbox token not found');
        initializingRef.current = false;
        return;
      }

      mapboxgl.accessToken = token;

      try {
        mapRef.current = new mapboxgl.Map({
          container,
          style: mapStyle,
          center: [-78.504299, 38.034],
          zoom: 15,
          pitch: 45,
          bearing: 0,
          maxPitch: 60,
          dragRotate: true,
          interactive: true,
        });

        mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        mapRef.current.on('load', () => {
          setIsMapReady(true);
          initializingRef.current = false;
        });

        mapRef.current.on('error', (e) => {
          console.error('Map error:', e);
          initializingRef.current = false;
        });

        containerRef.current = container;
      } catch (error) {
        console.error('Failed to initialize map:', error);
        initializingRef.current = false;
      }
    },
    [mapStyle]
  );

  const changeStyle = useCallback((newStyle) => {
    if (!mapRef.current || !newStyle) return;

    const center = mapRef.current.getCenter();
    const zoom = mapRef.current.getZoom();
    const bearing = mapRef.current.getBearing();
    const pitch = mapRef.current.getPitch();

    setMapStyle(newStyle);
    mapRef.current.setStyle(newStyle);

    mapRef.current.once('style.load', () => {
      mapRef.current.setCenter(center);
      mapRef.current.setZoom(zoom);
      mapRef.current.setBearing(bearing);
      mapRef.current.setPitch(pitch);
    });
  }, []);

  const moveMapToContainer = useCallback((container) => {
    if (!mapRef.current || !container) return;

    // Resize map to fit new container
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });

    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setIsMapReady(false);
      }
    };
  }, []);

  const value = {
    map: mapRef.current,
    mapRef,
    isMapReady,
    mapStyle,
    initializeMap,
    changeStyle,
    moveMapToContainer,
  };

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

export function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
}

export default MapContext;
