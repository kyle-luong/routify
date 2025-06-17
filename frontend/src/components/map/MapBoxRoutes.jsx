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
  Object.keys(map.getStyle().sources).forEach((sourceId) => {
    if (sourceId.startsWith('route')) {
      if (map.getLayer(sourceId + '-layer')) {
        map.removeLayer(sourceId + '-layer');
      }
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
    }
  });
}

function MapBoxRoutes({ map, segments = [], selectedPair }) {

  useEffect(() => {
    if (!map || !segments || segments.length === 0) return;

    if (!map.isStyleLoaded()) {
      map.once('style.load', () => drawRoutes());
      return;
    }
    drawRoutes();

    function drawRoutes() {
      clearMapRoutes(map);
      let newMarkers = [];

      let bounds = new mapboxgl.LngLatBounds();

      segments.forEach((pair, i) => {
        if (!pair[0] || !pair[1]) return;

        const origin = `${pair[0].longitude},${pair[0].latitude}`;
        const destination = `${pair[1].longitude},${pair[1].latitude}`;
        const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${origin};${destination}?geometries=geojson&overview=full&steps=false&access_token=${mapboxgl.accessToken}`;

        fetch(url)
          .then((res) => res.json())
          .then((data) => {
            if (!data.routes || !data.routes[0]) return;

            const route = data.routes[0];
            const routeGeoJSON = {
              type: 'Feature',
              geometry: route.geometry,
            };

            const routeId = `route-${i}`;

            // Determine if this segment is selected.
            const isSelected =
              selectedPair &&
              selectedPair[0] &&
              selectedPair[1] &&
              selectedPair[0].title === pair[0].title &&
              selectedPair[1].title === pair[1].title;

            const color = isSelected ? '#00ff00' : colorPalette[i % colorPalette.length];
            const width = isSelected ? 6 : 4;
            const opacity = isSelected ? 1 : 0.5;

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
  }, [map, segments, selectedPair]);

  return null;
}

export default MapBoxRoutes;
