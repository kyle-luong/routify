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

const MapBoxMarkers = ({ map, segments }) => {
  const markersRef = useRef([]);

  useEffect(() => {
    if (!map || !Array.isArray(segments)) return;

    // Remove previous markers
    clearMapMarkers(markersRef.current);
    let newMarkers = [];

    segments.forEach((pair) => {
      if (pair[0]) {
        const lngLat = pair[0].location || [pair[0].longitude, pair[0].latitude];
        newMarkers.push(
          createLabeledMarker(pair[0]).setLngLat([pair[0].longitude, pair[0].latitude]).addTo(map)
        );
      }
      if (pair[1]) {
        const lngLat = pair[1].location || [pair[1].longitude, pair[1].latitude];
        newMarkers.push(
          createLabeledMarker(pair[1]).setLngLat([pair[1].longitude, pair[1].latitude]).addTo(map)
        );
      }
    });

    markersRef.current = newMarkers;
    return () => clearMapMarkers(markersRef.current);
  }, [map, segments]);

  return null;
};

export default MapBoxMarkers;
