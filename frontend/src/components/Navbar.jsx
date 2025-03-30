import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">Routify</Link>
      </div>
      <ul className="nav-links">
        <li>
          <Link to={isHomePage ? "#about" : "/#about"}>About</Link>
        </li>
        <li>
          <Link to={isHomePage ? "#team" : "/#team"}>Team</Link>
        </li>
        <li>
          <Link to={isHomePage ? "#contact" : "/#contact"}>Contact</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;