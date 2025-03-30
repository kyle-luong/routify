import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const colorPalette = [
  "#f94144",
  "#f3722c",
  "#f9844a",
  "#f9c74f",
  "#90be6d",
  "#43aa8b",
  "#577590",
  "#277da1"
];

const MapboxMap = ({ segments, selectedPair = [null, null] }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [markers, setMarkers] = useState([]);
  const [directionInfo, setDirectionInfo] = useState(null);

  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/standard",
      center: [-78.5108459, 38.0316188],
      zoom: 15,
    });
    mapRef.current.addControl(new mapboxgl.NavigationControl());

    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, []);

  // Helper: clear existing routes and markers.
  const clearMapRoutesAndMarkers = (map) => {
    Object.keys(map.getStyle().sources).forEach((sourceId) => {
      if (sourceId.startsWith("route")) {
        if (map.getLayer(`${sourceId}-layer`)) {
          map.removeLayer(`${sourceId}-layer`);
        }
        map.removeSource(sourceId);
      }
    });
    markers.forEach((marker) => marker.remove());
  };

  // Draw routes and markers based on segments and selectedPair.
  useEffect(() => {
    if (!mapRef.current || !segments || segments.length === 0) return;
    const map = mapRef.current;

    const drawRoutes = () => {
      clearMapRoutesAndMarkers(map);
      let newMarkers = [];
      let overallBounds = new mapboxgl.LngLatBounds();
      setDirectionInfo(null);

      // Loop through each route segment.
      segments.forEach((pair, i) => {
        const origin = `${pair[0].longitude},${pair[0].latitude}`;
        const destination = `${pair[1].longitude},${pair[1].latitude}`;
        const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${origin};${destination}?geometries=geojson&overview=full&steps=false&access_token=${mapboxgl.accessToken}`;

        fetch(url)
          .then((res) => res.json())
          .then((data) => {
            if (!data.routes || !data.routes[0]) return;
            const route = data.routes[0];
            const routeGeoJSON = {
              type: "Feature",
              geometry: route.geometry,
            };

            const sourceId = `route-${i}`;
            // Check if this segment is selected.
            const isSelected =
              selectedPair &&
              selectedPair[0] &&
              selectedPair[1] &&
              selectedPair[0].title === pair[0].title &&
              selectedPair[1].title === pair[1].title;

            // Determine styling based on selection.
            let lineColor, markerColor, lineWidth, lineOpacity;
            if (selectedPair && selectedPair[0] && selectedPair[1]) {
              if (isSelected) {
                lineColor = "#00ff00";
                markerColor = "green";
                lineWidth = 6;
                lineOpacity = 1;
                // Save direction info for selected route.
                setDirectionInfo({
                  distance: route.distance,
                  duration: route.duration,
                });
              } else {
                lineColor = "#888";
                markerColor = "gray";
                lineWidth = 4;
                lineOpacity = 0.2;
              }
            } else {
              // When no route is selected, use a bright color from the palette.
              lineColor = colorPalette[i % colorPalette.length];
              markerColor = lineColor;
              lineWidth = 6;
              lineOpacity = 1;
            }

            // Add the route as a new source and layer.
            map.addSource(sourceId, { type: "geojson", data: routeGeoJSON });
            map.addLayer({
              id: `${sourceId}-layer`,
              type: "line",
              source: sourceId,
              layout: { "line-join": "round", "line-cap": "round" },
              paint: {
                "line-color": lineColor,
                "line-width": lineWidth,
                "line-opacity": lineOpacity,
              },
            });

            // Extend overall bounds.
            route.geometry.coordinates.forEach((coord) => overallBounds.extend(coord));

            // Add markers for start and end points.
            const startMarker = new mapboxgl.Marker({ color: markerColor })
              .setLngLat([pair[0].longitude, pair[0].latitude])
              .addTo(map);
            const endMarker = new mapboxgl.Marker({ color: markerColor })
              .setLngLat([pair[1].longitude, pair[1].latitude])
              .addTo(map);
            newMarkers.push(startMarker, endMarker);

            // If this is the last segment, adjust the view.
            if (i === segments.length - 1 && !overallBounds.isEmpty()) {
              map.fitBounds(overallBounds, { padding: 50 });
            }
          })
          .catch((err) => console.error("Error fetching route:", err));
      });
      setMarkers(newMarkers);
    };

    if (!map.isStyleLoaded()) {
      map.once("styledata", drawRoutes);
    } else {
      drawRoutes();
    }
  }, [segments, selectedPair, markers]);

  return (
    <div style={{ position: "relative", height: "100%" }}>
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
      {directionInfo && (
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "10px",
            backgroundColor: "rgba(255,255,255,0.9)",
            padding: "10px",
            borderRadius: "4px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
            fontSize: "0.9rem",
            lineHeight: 1.4,
          }}
        >
          <p style={{ margin: 0 }}>
            Distance: {(directionInfo.distance / 1000).toFixed(2)} km
          </p>
          <p style={{ margin: 0 }}>
            Duration: {Math.round(directionInfo.duration / 60)} min
          </p>
        </div>
      )}
    </div>
  );
};

export default MapboxMap;