import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

let noHome = 1;

function createLabeledMarker(event, labelNumber = null) {
  const element = document.createElement('div');
  element.className = 'mapboxgl-marker-label';

  if (event.title === 'Home') {
    element.textContent = '🏠';
    element.style.fontSize = '22px';
    element.style.lineHeight = '1';
    element.style.userSelect = 'none';
    element.style.filter = 'drop-shadow(0 1px 2px rgba(0,0,0,0.35))';
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
  // Determine label number: prefer provided labelNumber (1-based),
  // otherwise fall back to event.idx + 1 for backwards compatibility.
  const idxNum = labelNumber != null ? Number(labelNumber) : (Number(event.idx) || 0) + 1;
  element.innerText = `${idxNum}. ${event.title}`;

  return new mapboxgl.Marker({ element });
}

function clearMapMarkers(markers) {
  markers.forEach((marker) => marker.remove());
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

    if (
      segments.some((pair) => pair[0]?.title === 'Home' || pair[1]?.title === 'Home') ||
      singleEvents.some((event) => event.title === 'Home')
    ) {
      noHome = 0;
    } else {
      noHome = 1;
    }

    const addedKeys = new Set();

    // Build stable label mapping for class events (exclude Home) so labels
    // remain consistent even when a starting point is added/removed.
    const labelMap = new Map();
    const seenLabelKeys = new Set();
    const allCandidates = [];

    // Collect events from segments
    if (segments.length > 0) {
      segments.forEach((pair) => {
        if (pair[0]) allCandidates.push(pair[0]);
      });
      const last = segments[segments.length - 1][1];
      if (last) allCandidates.push(last);
    }

    // Include singleEvents
    if (singleEvents && singleEvents.length > 0) {
      singleEvents.forEach((ev) => allCandidates.push(ev));
    }

    // Deduplicate and filter out Home markers
    const stableList = [];
    allCandidates.forEach((ev) => {
      if (!ev) return;
      if (ev.title === 'Home') return;
      const k = `${ev.title || ''}::${ev.start_date || ev.start || ''}::${ev.longitude || ''}::${ev.latitude || ''}`;
      if (seenLabelKeys.has(k)) return;
      seenLabelKeys.add(k);
      stableList.push(ev);
    });

    // Sort by date then title for deterministic ordering
    stableList.sort((a, b) => {
      const da = (a.start_date || a.start || '') + '::' + (a.title || '');
      const db = (b.start_date || b.start || '') + '::' + (b.title || '');
      return da < db ? -1 : da > db ? 1 : 0;
    });

    stableList.forEach((ev, i) => {
      const k = `${ev.title || ''}::${ev.start_date || ev.start || ''}::${ev.longitude || ''}::${ev.latitude || ''}`;
      labelMap.set(k, i + 1); // 1-based labels
    });

    const addMarkerAt = (event) => {
      if (!event.longitude || !event.latitude) return;
      const key = `${event.longitude},${event.latitude}`;
      // Avoid adding duplicate markers for the same event/location
      const dedupeKey = `${key}:${event.title || ''}`;
      if (addedKeys.has(dedupeKey)) return;

      const seen = locationCount.get(key) || 0;
      // If a marker already exists at this exact coordinate and title, skip
      if (seen > 0 && addedKeys.has(key)) return;

      const targetLngLat = getOffsetLngLat(map, event.longitude, event.latitude, seen);

      // Determine stable label number if available
      const labelKey = `${event.title || ''}::${event.start_date || event.start || ''}::${event.longitude || ''}::${event.latitude || ''}`;
      const labelNumber = labelMap.get(labelKey) || null;

      const marker = createLabeledMarker(event, labelNumber).setLngLat(targetLngLat).addTo(map);
      newMarkers.push(marker);
      locationCount.set(key, seen + 1);
      addedKeys.add(dedupeKey);
      addedKeys.add(key);
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
