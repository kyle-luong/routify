import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const handleLinkClick = (e, target) => {
    if (!isHomePage) {
      e.preventDefault();
      window.location.href = "/";
      
      window.addEventListener('load', () => {
        document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
      });
    }
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">Routify</Link>
      </div>
      <ul className="nav-links">
        <li>
          <a href="#about" onClick={(e) => handleLinkClick(e, 'about')}>About</a>
        </li>
        <li>
          <a href="#team" onClick={(e) => handleLinkClick(e, 'team')}>Team</a>
        </li>
        <li>
          <a href="#contact" onClick={(e) => handleLinkClick(e, 'contact')}>Contact</a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;