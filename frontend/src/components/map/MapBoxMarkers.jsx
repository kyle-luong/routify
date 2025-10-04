import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

function createLabeledMarker(event) {
  const element = document.createElement('div');
  element.className = 'mapboxgl-marker-label';
  element.style.backgroundColor = 'white';
  element.style.border = '1px solid #888';
  element.style.borderRadius = '6px';
  element.style.padding = '2px 6px';
  element.style.fontSize = '12px';
  element.style.fontWeight = 'bold';
  element.style.whiteSpace = 'nowrap';
  element.style.boxShadow = '0 1px 4px rgb(0,0,0,0.1)';
  element.innerText = event.title;
  return new mapboxgl.Marker({ element });
}

function clearMapMarkers(markers) {
  markers.forEach((marker) => marker.remove());
}

/**
 * Compute a small offset for duplicate coordinates.
 * Each duplicate marker shifts slightly downward in pixel space.
 */
function getOffsetLngLat(map, lng, lat, seenCount) {
  if (seenCount <= 0) return [lng, lat];
  
  const center = map.project([lng, lat]);
  const offsetY = seenCount * 7.5; // 15px downward per duplicate
  const offsetPx = { x: center.x, y: center.y + offsetY };
  const newLngLat = map.unproject([offsetPx.x, offsetPx.y]);
  return [newLngLat.lng, newLngLat.lat];
}

const MapBoxMarkers = ({ map, segments = [], singleEvents = [] }) => {
  const markersRef = useRef([]);

  useEffect(() => {
    if (!map) return;

    const addMarkers = () => {
      clearMapMarkers(markersRef.current);
      let newMarkers = [];
      let locationCount = new Map();

      const addMarkerAt = (event) => {
        if (!event.longitude || !event.latitude) return;

        const key = `${event.longitude},${event.latitude}`;
        const seen = locationCount.get(key) || 0;
        const targetLngLat = getOffsetLngLat(map, event.longitude, event.latitude, seen);

        const marker = createLabeledMarker(event)
          .setLngLat(targetLngLat)
          .addTo(map);

        newMarkers.push(marker);
        locationCount.set(key, seen + 1);
      };

      try {
        // Add markers for segments
        if (Array.isArray(segments) && segments.length > 0) {
          segments.forEach((pair) => {
            if (pair[0]) addMarkerAt(pair[0]);
          });
          const last = segments[segments.length - 1][1];
          if (last) addMarkerAt(last);
        }

        // Add markers for single events
        if (Array.isArray(singleEvents)) {
          singleEvents.forEach((event) => {
            addMarkerAt(event);

            // Center map on single event
            map.setCenter([event.longitude, event.latitude]);
            map.setZoom(16);
            map.setPitch(0);
            map.setBearing(0);
          });
        }

        markersRef.current = newMarkers;
      } catch (error) {
        console.error('Error adding markers:', error);
      }
    };

    // Wait for map to be ready
    if (!map.isStyleLoaded()) {
      const onStyleLoad = () => addMarkers();
      map.once('style.load', onStyleLoad);
      return () => map.off('style.load', onStyleLoad);
    } else {
      addMarkers();
    }

    return () => clearMapMarkers(markersRef.current);
  }, [map, segments, singleEvents]);

  return null;
};

export default MapBoxMarkers;
