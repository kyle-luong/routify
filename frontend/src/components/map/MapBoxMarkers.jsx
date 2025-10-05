import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

let noHome = 1;

function createLabeledMarker(event) {
  const element = document.createElement('div');
  element.className = 'mapboxgl-marker-label';

  if (event.title === 'Home') {
    element.textContent = '🏠';
    element.style.fontSize = '22px';
    element.style.lineHeight = '1';
    element.style.userSelect = 'none';
    element.style.filter = 'drop-shadow(0 1px 2px rgba(0,0,0,0.35))';
    noHome = 0;
    return new mapboxgl.Marker({ element, anchor: 'bottom' });
  }

  element.style.backgroundColor = 'white';
  element.style.border = '1px solid #888';
  element.style.borderRadius = '6px';
  element.style.padding = '2px 6px';
  element.style.fontSize = '12px';
  element.style.fontWeight = 'bold';
  element.style.whiteSpace = 'nowrap';
  element.style.boxShadow = '0 1px 4px rgb(0,0,0,0.1)';
  element.innerText = (event.idx + noHome) + '. '+ event.title;

  return new mapboxgl.Marker({ element });
}

function clearMapMarkers(markers) {
  markers.forEach(marker => marker.remove());
}

function getOffsetLngLat(map, lng, lat, seenCount) {
  if (seenCount <= 0) return [lng, lat];
  
  const center = map.project([lng, lat]);
  const offsetY = seenCount * 7.5;
  const offsetPx = { x: center.x, y: center.y + offsetY };
  const newLngLat = map.unproject([offsetPx.x, offsetPx.y]);
  return [newLngLat.lng, newLngLat.lat];
}

const MapBoxMarkers = ({ map, segments = [], singleEvents = [], isMapLoaded }) => {
  const markersRef = useRef([]);

  useEffect(() => {
    if (!map || !isMapLoaded) return;

    clearMapMarkers(markersRef.current);
    const newMarkers = [];
    const locationCount = new Map();

    const addMarkerAt = (event) => {
      if (!event.longitude || !event.latitude) return;
      const key = `${event.longitude},${event.latitude}`;
      const seen = locationCount.get(key) || 0;
      const targetLngLat = getOffsetLngLat(map, event.longitude, event.latitude, seen);

      const marker = createLabeledMarker(event).setLngLat(targetLngLat).addTo(map);
      newMarkers.push(marker);
      locationCount.set(key, seen + 1);
    };

    try {
      // Segment markers
      if (segments.length > 0) {
        segments.forEach((pair, i) => {
          if (pair[0]) {
            pair[0].idx = i;
            addMarkerAt(pair[0]);
          }
        });
        const last = segments[segments.length - 1][1];
        last.idx = segments.length;
        if (last) addMarkerAt(last);
      }

      // Single events
      if (singleEvents.length > 0) {
        singleEvents.forEach((event) => {
          addMarkerAt(event);
          map.setCenter([event.longitude, event.latitude]);
          map.setZoom(16);
          map.setPitch(0);
          map.setBearing(0);
        });
      }

      markersRef.current = newMarkers;
    } catch (err) {
      console.error('Error adding markers:', err);
    }

    return () => clearMapMarkers(markersRef.current);
  }, [map, segments, singleEvents, isMapLoaded]);

  return null;
};

export default MapBoxMarkers;
