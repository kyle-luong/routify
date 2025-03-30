import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar.jsx";
import DaysOfTheWeekMenu from "../components/DaysOfTheWeekMenu";
import RouteSelect from "../components/RouteSelect";
import "../styles/SchedulePage.css";
import MapboxMap from "../components/MapboxMap.jsx";

const SchedulePage = () => {
  const { short_id } = useParams();
  const [events, setEvents] = useState([]);
  const [selectedPair, setSelectedPair] = useState([null, null]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    api
      .get(`/api/view/${short_id}/`)
      .then((res) => {
        const filtered = res.data.events.filter(event => event.latitude && event.longitude);
        setEvents(filtered);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, [short_id]);

  const filteredEvents = selectedDay
    ? events.filter((event) => event.dayOfWeek.includes(selectedDay))
    : events;

  const sortedEvents = [...filteredEvents].sort((a, b) => a.start.localeCompare(b.start));

  const handleRouteSelect = (index) => {
    if (selectedIndex === index) {
      // Deselect
      setSelectedIndex(null);
      setSelectedPair([null, null]);
    } else {
      // Select new segment
      setSelectedIndex(index);
      setSelectedPair([sortedEvents[index], sortedEvents[index + 1]]);
    }
  };

  return (
    <>
      <Navbar />
      <DaysOfTheWeekMenu selectedDay={selectedDay} setSelectedDay={setSelectedDay} />
      <div className="schedule-page">
        <div className="event-list">
          <h2>Your Schedule</h2>
          {sortedEvents.length === 0 ? (
            <p>No events found for {selectedDay || "selected day"}.</p>
          ) : (
            sortedEvents.map((event, i) => (
              <React.Fragment key={i}>
                <div className="event-card">
                  <h4>{event.title}</h4>
                  <p>{event.location}</p>
                  <p>{event.dayOfWeek.join(", ")}</p>
                  <p>{event.start} – {event.end}</p>
                </div>

                {i < sortedEvents.length - 1 && (
                  <RouteSelect
                    isSelected={selectedIndex === i}
                    onSelect={() => handleRouteSelect(i)}
                  />
                )}
              </React.Fragment>
            ))
          )}
        </div>

        <div className="map-preview">
          <h3>Selected Route</h3>
          {selectedPair[0] && selectedPair[1] ? (
            <p>
              From <strong>{selectedPair[0].title}</strong> to{" "}
              <strong>{selectedPair[1].title}</strong>
            </p>
          ) : (
            <p>Showing all routes by default. Click a segment to view details.</p>
          )}
          <MapboxMap
            segments={
              selectedPair[0] && selectedPair[1]
                ? [[selectedPair[0], selectedPair[1]]]
                : sortedEvents
                    .map((e, i, arr) =>
                      i < arr.length - 1 ? [arr[i], arr[i + 1]] : null
                    )
                    .filter(Boolean)
            }
          />
        </div>
      </div>
    </>
  );
};

export default SchedulePage;