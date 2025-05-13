import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./MapboxMap.css";
import MapStyleSelector from "../MapStyleSelector/MapStyleSelector";
import DirectionInfo from "../DirectionInfo/DirectionInfo";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const colorPalette = [
  "#f94144",
  "#f3722c",
  "#f9844a",
  "#f9c74f",
  "#90be6d",
  "#43aa8b",
  "#577590",
  "#277da1",
];

const MapboxMap = ({ segments, selectedPair = [null, null] }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [markers, setMarkers] = useState([]);
  const [directionInfo, setDirectionInfo] = useState(null);
  const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/standard");

  // Initialize the map on component mount.
  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: [-78.504, 38.034],
      zoom: 17,
      pitch: 60,
      bearing: 25,
      maxPitch: 60,
      dragRotate: true,
      interactive: true,
    });
    mapRef.current.addControl(new mapboxgl.NavigationControl());

    // When style loads, redraw the routes.
    mapRef.current.on("style.load", () => {
      if (segments && segments.length > 0) {
        drawRoutes();
      }
    });

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
        if (map.getSource(sourceId)) {
          map.removeSource(sourceId);
        }
      }
    });
    markers.forEach((marker) => marker.remove());
  };

  // Function to draw routes and markers.
  const drawRoutes = () => {
    if (!mapRef.current || !segments || segments.length === 0) return;
    const map = mapRef.current;
    clearMapRoutesAndMarkers(map);
    let newMarkers = [];
    let overallBounds = new mapboxgl.LngLatBounds();
    setDirectionInfo(null);

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
          // Determine if this segment is selected.
          const isSelected =
            selectedPair &&
            selectedPair[0] &&
            selectedPair[1] &&
            selectedPair[0].title === pair[0].title &&
            selectedPair[1].title === pair[1].title;

          // Determine styling based on selection.
          let lineColor, lineWidth, lineOpacity;
          if (selectedPair && selectedPair[0] && selectedPair[1]) {
            if (isSelected) {
              lineColor = "#00ff00";
              lineWidth = 6;
              lineOpacity = 1;
              // Save route info for display.
              setDirectionInfo({
                distance: route.distance,
                duration: route.duration,
              });
            } else {
              lineColor = "#888";
              lineWidth = 4;
              lineOpacity = 0.2;
            }
          } else {
            lineColor = colorPalette[i % colorPalette.length];
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
          route.geometry.coordinates.forEach((coord) =>
            overallBounds.extend(coord)
          );

          // Create custom labeled marker element.
          const createLabeledMarker = (event) => {
            const el = document.createElement("div");
            el.className = "mapbox-marker-label";
            el.innerText = event.title;
            return new mapboxgl.Marker({ element: el });
          };

          const startMarker = createLabeledMarker(pair[0])
            .setLngLat([pair[0].longitude, pair[0].latitude])
            .addTo(map);
          const endMarker = createLabeledMarker(pair[1])
            .setLngLat([pair[1].longitude, pair[1].latitude])
            .addTo(map);
          newMarkers.push(startMarker, endMarker);

          // Fit the map bounds after drawing the last segment.
          if (i === segments.length - 1 && !overallBounds.isEmpty()) {
            map.fitBounds(overallBounds, { padding: 50 });
          }
        })
        .catch((err) => console.error("Error fetching route:", err));
    });
    setMarkers(newMarkers);
  };

  // Redraw routes when segments, selectedPair, or mapStyle change.
  useEffect(() => {
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) {
      mapRef.current.once("style.load", drawRoutes);
    } else {
      drawRoutes();
    }
  }, [segments, selectedPair, mapStyle]);

  const handleStyleChange = (e) => {
    const newStyle = e.target.value;
    setMapStyle(newStyle);
    if (mapRef.current) {
      mapRef.current.setStyle(newStyle);
    }
  };

  return (
    <div className="map-container">
      <MapStyleSelector mapStyle={mapStyle} onStyleChange={handleStyleChange} />
      {segments.length === 0 && (
        <div className="no-routes-overlay">
          <p>Please select a day to view routes.</p>
        </div>
      )}
      <div ref={mapContainerRef} className="mapbox-map" />
      <DirectionInfo info={directionInfo} />
    </div>
  );
};

export default MapboxMap;
