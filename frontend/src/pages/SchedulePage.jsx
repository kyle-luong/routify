import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar.jsx";
import DaysOfTheWeekMenu from "../components/DaysOfTheWeekMenu";
import "../styles/SchedulePage.css";

const SchedulePage = () => {
  const { short_id } = useParams();
  const [events, setEvents] = useState([]);
  const [selectedPair, setSelectedPair] = useState([null, null]);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    api
      .get(`/api/view/${short_id}/`)
      .then((res) => {
        setEvents(res.data.events);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, [short_id]);

  const handleSelect = (index, role) => {
    const newPair = [...selectedPair];
    newPair[role] = events[index];
    setSelectedPair(newPair);
  };

  const filteredEvents = selectedDay
    ? events.filter((event) => event.dayOfWeek.includes(selectedDay))
    : events;

  const sortedEvents = [...filteredEvents].sort((a, b) => a.start.localeCompare(b.start));

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
              <div key={i} className="event-card">
                <h4>{event.title}</h4>
                <p>{event.location}</p>
                <p>{event.dayOfWeek.join(", ")}</p>
                <p>{event.start} – {event.end}</p>
                <div className="selection-buttons">
                  <button onClick={() => handleSelect(i, 0)}>Set as Start</button>
                  <button onClick={() => handleSelect(i, 1)}>Set as End</button>
                </div>
              </div>
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
            <p>Select two courses to see the route here.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default SchedulePage;