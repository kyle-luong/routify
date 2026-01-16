import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

const colorPalette = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

function clearMapRoutes(map) {
  if (!map || !map.isStyleLoaded()) return;

  try {
    const style = map.getStyle();
    if (!style) return;

    const layers = style.layers || [];
    const routeLayers = layers.filter((layer) => layer.id && layer.id.includes('route-'));

    routeLayers.forEach((layer) => {
      if (map.getLayer(layer.id)) map.removeLayer(layer.id);
    });

    const sources = style.sources || {};
    Object.keys(sources).forEach((sourceId) => {
      if (sourceId.includes('route-') && map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
    });
  } catch (error) {
    console.error('Error clearing routes:', error);
  }
}

function MapBoxRoutes({
  map,
  segments = [],
  selectedPair,
  transportMode = 'walking',
  isMapLoaded,
}) {
  useEffect(() => {
    if (!map || !isMapLoaded) return;

    clearMapRoutes(map);
    if (!Array.isArray(segments) || segments.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();

    segments.forEach((pair, i) => {
      if (!pair[0] || !pair[1]) return;

      const origin = `${pair[0].longitude},${pair[0].latitude}`;
      const destination = `${pair[1].longitude},${pair[1].latitude}`;
      const routeId = `route-${pair[0].title}-${pair[1].title}-${i}`;

      const url = `https://api.mapbox.com/directions/v5/mapbox/${transportMode}/${origin};${destination}?geometries=geojson&access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`;

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (!data.routes?.length) return;

          const route = data.routes[0];
          const routeGeoJSON = {
            type: 'Feature',
            properties: {},
            geometry: route.geometry,
          };

          const isSelected =
            selectedPair?.[0]?.title === pair[0].title &&
            selectedPair?.[1]?.title === pair[1].title;

          const color = isSelected ? '#00ff00' : colorPalette[i % colorPalette.length];
          const width = isSelected ? 6 : 4;
          const opacity = isSelected ? 1 : 0.5;

          if (map.getSource(routeId)) {
            map.removeLayer(routeId + '-layer');
            map.removeSource(routeId);
          }

          map.addSource(routeId, { type: 'geojson', data: routeGeoJSON });

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

    return () => clearMapRoutes(map);
  }, [map, segments, selectedPair, transportMode, isMapLoaded]);

  return null;
}

export default MapBoxRoutes;
