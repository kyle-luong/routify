import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

function useMapBox(accessToken, initialStyle, containerRef) {
  const map = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (!accessToken || !containerRef.current) return;
    if (map.current) return;

    mapboxgl.accessToken = accessToken;
    map.current = new mapboxgl.Map({
      container: containerRef.current,
      style: initialStyle || 'mapbox://styles/mapbox/streets-v12',
      center: [-78.504299, 38.034],
      zoom: 17,
      pitch: 60,
      bearing: 24.4,
      maxPitch: 60,
      dragRotate: true,
      interactive: true,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.on('load', () => setIsMapLoaded(true));

    // Listen for style changes and restore view
    map.current.on('styledata', () => {
      // Restore view here if needed
      setIsMapLoaded(true);
    });

    map.current.on('error', (e) => {
      console.error('Map error:', e);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        setIsMapLoaded(false);
      }
    };
  }, [accessToken, containerRef]);

  useEffect(() => {
    if (map.current && initialStyle) {
      map.current.setStyle(initialStyle);
    }
  }, [initialStyle]);

  return { map, isMapLoaded };
}

export default useMapBox;
