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

const MapBoxMarkers = ({ map, segments = [], singleEvents = [] }) => {
  const markersRef = useRef([]);

  useEffect(() => {
    if (!map) return;

    // Wait for map to be ready
    if (!map.isStyleLoaded()) {
      const onStyleLoad = () => {
        addMarkers();
      };
      map.once('style.load', onStyleLoad);
      return () => map.off('style.load', onStyleLoad);
    }

    addMarkers();

    function addMarkers() {
      // Clear previous markers
      clearMapMarkers(markersRef.current);
      let newMarkers = [];

      try {
        // Add markers for segments (pairs)
        if (Array.isArray(segments)) {
          segments.forEach((pair) => {
            if (pair[0] && pair[0].longitude && pair[0].latitude) {
              newMarkers.push(
                createLabeledMarker(pair[0])
                  .setLngLat([pair[0].longitude, pair[0].latitude])
                  .addTo(map)
              );
            }
            if (pair[1] && pair[1].longitude && pair[1].latitude) {
              newMarkers.push(
                createLabeledMarker(pair[1])
                  .setLngLat([pair[1].longitude, pair[1].latitude])
                  .addTo(map)
              );
            }
          });
        }

        // Add markers for single events
        if (Array.isArray(singleEvents)) {
          singleEvents.forEach((event) => {
            if (event.longitude && event.latitude) {
              newMarkers.push(
                createLabeledMarker(event)
                  .setLngLat([event.longitude, event.latitude])
                  .addTo(map)
              );

              // Center map on single event
              map.setCenter([event.longitude, event.latitude]);
              map.setZoom(16);
            }
          });
        }

        markersRef.current = newMarkers;
      } catch (error) {
        console.error('Error adding markers:', error);
      }
    }

    return () => clearMapMarkers(markersRef.current);
  }, [map, segments, singleEvents]);

  return null;
};

export default MapBoxMarkers;
