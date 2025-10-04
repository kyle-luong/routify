import { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

const colorPalette = [
  '#f94144',
  '#f3722c',
  '#f9844a',
  '#f9c74f',
  '#90be6d',
  '#43aa8b',
  '#577590',
  '#277da1',
];

// helper to clear routes
function clearMapRoutes(map) {
  if (!map || !map.isStyleLoaded()) return;
  
  try {
    const style = map.getStyle();
    if (!style) return;

    const layers = style.layers || [];
    const routeLayers = layers.filter(layer => layer.id && layer.id.includes('route-'));
    
    routeLayers.forEach(layer => {
      try {
        if (map.getLayer(layer.id)) {
          map.removeLayer(layer.id);
        }
      } catch (e) {
        // Layer might already be removed
      }
    });

    const sources = style.sources || {};
    Object.keys(sources).forEach(sourceId => {
      if (sourceId.includes('route-')) {
        try {
          if (map.getSource(sourceId)) {
            map.removeSource(sourceId);
          }
        } catch (e) {
          // Source might already be removed
        }
      }
    });
  } catch (error) {
    console.error('Error clearing routes:', error);
  }
}

function MapBoxRoutes({ map, segments = [], selectedPair }) {
  const isMapLoaded = map?.isStyleLoaded?.() ?? false;
  console.log("MapBox render", { isMapLoaded, segments });

  useEffect(() => {
    if (!map || !Array.isArray(segments)) {
      return;
    }

    // Wait for map to be ready
    if (!map.isStyleLoaded()) {
      const onStyleLoad = () => {
        if (segments.length > 0) {
          console.log("not loaded yet");
          drawRoutes();
        }
      };
      map.once('style.load', onStyleLoad);
      return () => map.off('style.load', onStyleLoad);
    }

    // Always clear existing routes first
    clearMapRoutes(map);

    // Only draw routes if we have segments
    if (segments.length > 0) {
      console.log("segments exists");
      if (!map.isStyleLoaded()) {
        map.once('style.load', () => drawRoutes());
        return;
      }
      console.log("loaded");
      drawRoutes();
    }

    function drawRoutes() {
      // Routes are already cleared above

      const colorPalette = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
      let bounds = new mapboxgl.LngLatBounds();

      segments.forEach((pair, i) => {
        if (!pair[0] || !pair[1]) return;

        const origin = `${pair[0].longitude},${pair[0].latitude}`;
        const destination = `${pair[1].longitude},${pair[1].latitude}`;
        const routeId = `route-${pair[0].title}-${pair[1].title}-${i}`;

        const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${origin};${destination}?geometries=geojson&access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`;

        fetch(url)
          .then((res) => res.json())
          .then((data) => {
            if (!data.routes || data.routes.length === 0) return;

            const route = data.routes[0];
            const routeGeoJSON = {
              type: 'Feature',
              properties: {},
              geometry: route.geometry,
            };

            const isSelected =
              selectedPair &&
              selectedPair[0] &&
              selectedPair[1] &&
              selectedPair[0].title === pair[0].title &&
              selectedPair[1].title === pair[1].title;

            const color = isSelected ? '#00ff00' : colorPalette[i % colorPalette.length];
            const width = isSelected ? 6 : 4;
            const opacity = isSelected ? 1 : 0.5;

            // Check if source already exists (shouldn't after clearing, but safety check)
            if (map.getSource(routeId)) {
              map.removeLayer(routeId + '-layer');
              map.removeSource(routeId);
            }

            map.addSource(routeId, {
              type: 'geojson',
              data: routeGeoJSON,
            });

            map.addLayer({
              id: routeId + '-layer',
              type: 'line',
              source: routeId,
              layout: { 'line-join': 'round', 'line-cap': 'round' },
              paint: { 'line-color': color, 'line-width': width, 'line-opacity': opacity },
            });

            route.geometry.coordinates.forEach((coord) => bounds.extend(coord));

            if (i === segments.length - 1 && !bounds.isEmpty()) {
              map.fitBounds(bounds, { padding: 50 });
            }
          })
          .catch((err) => console.error('Error fetching route.', err));
      });
    }

    // Cleanup function
    return () => {
      clearMapRoutes(map);
    };
  }, [map, segments, selectedPair]);

  return null;
}

export default MapBoxRoutes;
