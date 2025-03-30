import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    const navbarHeight = document.querySelector('.navbar').offsetHeight;
    window.scrollTo({
      top: targetElement.offsetTop - navbarHeight,
      behavior: 'smooth'
    });
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">Routify</Link>
      </div>
      <ul className="nav-links">
        <li>
          <a href="#about" onClick={(e) => handleSmoothScroll(e, 'about')}>About</a>
        </li>
        <li>
          <a href="#team" onClick={(e) => handleSmoothScroll(e, 'team')}>Team</a>
        </li>
        <li>
          <a href="#contact" onClick={(e) => handleSmoothScroll(e, 'contact')}>Contact</a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;