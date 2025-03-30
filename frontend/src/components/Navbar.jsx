import React from "react";
import { Link } from "react-router-dom";  // Import Link from react-router-dom
import "../styles/Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
        <div className="logo">
          <Link to="/">Routify</Link>
        </div>
        <ul className="nav-links">
            <li><Link to="#about">Mission</Link></li>
            <li><Link to="#features">Team</Link></li>
            <li><Link to="#contact">Contact</Link></li>
        </ul>
    </nav>
  );
};

export default Navbar;