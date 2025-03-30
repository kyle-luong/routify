import React from "react";
import "../styles/Team.css";
import Jonathan from "../assets/jonathan_lam.jpg"
import Kyle from "../assets/kyle_luong.jpeg";
import Pratik from "../assets/pratik_shrestha.jpg";

const Team = () => {
  return (
    <div id="team" className="team-container">
      <div className="team-header">
        <h1>The Team</h1>
      </div>
      <div className="team-content">
        <div className="team-cards">
          <div className="team-card">
            <div className="team-card-image">
              <img
                src={Pratik}
                alt="Pratik Shrestha"
              />
            </div>
            <div className="team-card-info">
              <h3>Pratik Shrestha</h3>
              <p>DevOps Engineer</p>
            </div>
          </div>

          <div className="team-card">
            <div className="team-card-image">
              <img
                src={Kyle}
                alt="Kyle Luong"
              />
            </div>
            <div className="team-card-info">
              <h3>Kyle Luong</h3>
              <p>Lead Developer</p>
            </div>
          </div>

          <div className="team-card">
            <div className="team-card-image">
              <img
                src={Jonathan}
                alt="Jonathan Lam"
              />
            </div>
            <div className="team-card-info">
              <h3>Jonathan Lam</h3>
              <p>Frontend Engineer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;