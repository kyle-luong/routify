import React from "react";
import "./Contact.css";

const Contact = () => {
  return (
    <div id="contact">
        <section className="contact-container">
            <div className="contact-header">
                <h2>Contact</h2>
                <p>Reach out for questions or if you'd like to get in touch!</p>
            </div>
            <div className="contact-form">
                <form>
                <div className="input-group">
                    <input type="text" id="name" placeholder="Your Name" required />
                </div>
                <div className="input-group">
                    <input type="email" id="email" placeholder="Your Email" required />
                </div>
                <div className="input-group">
                    <textarea id="message" placeholder="Your Message" required></textarea>
                </div>
                <button type="submit" className="submit-btn">Submit</button>
                </form>
            </div>
        </section>
    </div>
  );
};

export default Contact;