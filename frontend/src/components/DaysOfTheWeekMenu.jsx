import React from "react";
import "../styles/DaysOfTheWeekMenu.css";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DaysOfTheWeekMenu = ({ selectedDay, setSelectedDay }) => {
  return (
    <div className="days-menu">
      {DAYS.map((day) => (
        <button
          key={day}
          className={selectedDay === day ? "active" : ""}
          onClick={() => setSelectedDay(day)}
        >
          {day}
        </button>
      ))}
    </div>
  );
};

export default DaysOfTheWeekMenu;