import React from "react";
import "./About.css";

const About = () => {
  return (
    <div id="about" className="about-container">
      <div className="about-header">
        <h1>About</h1>
      </div>
      <div className="about-content">
        <section className="about-section">
          <h2>What is Routify?</h2>
          <p>
            Routify is an intuitive app designed to tackle the issue of getting the classes you want, only to find they are halfway across campus.
            By uploading your class schedule, Routify helps you visualize and plan your routes between classes, saving time and reducing stress.
          </p>
        </section>
        <section className="about-section">
          <h2>How it Works</h2>
          <p>
            Simply upload your class schedule as an .ics file and Routify will map your classes for each day of the week. 
            With time and distance estimates, you’ll always know if your schedule works for you.
          </p>
        </section>
        <section className="about-section">
          <h2>Why Routify?</h2>
          <p>
            As previous first-years ourselves, we know the confusion of navigating a huge new campus all too well. 
            We also know that just because your schedule works online, it doesn't always work in-person. Whether you're a
            new student or someone just looking to shave off some time from their schedule, Routify has the answer.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;