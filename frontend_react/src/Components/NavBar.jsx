import React, { useState } from 'react';
import { routeRegistry } from '../registry/registry';
import '../styles/NavBar.css';

function NavBar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const mainLinks = routeRegistry.filter(r => !r.hidden && r.category === "Main");
  const funLinks = routeRegistry.filter(r => !r.hidden && r.category === "Fun");

  return (
    <nav className="navbar-minimal">
      <div className="navbar-brand">
        <a href="/">muqing.dev</a>
      </div>
      <div className="navbar-links">
        {mainLinks.map(route => (
          <a key={route.path} href={route.path}>{route.name}</a>
        ))}

        <div className="navbar-dropdown">
          <button
            className="dropdown-trigger"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            Fun <span className="dropdown-arrow">▼</span>
          </button>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              {funLinks.map(route => (
                <a key={route.path} href={route.path}>{route.name}</a>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="navbar-social">
        <a href="https://github.com/mshe2089" target="_blank" rel="noreferrer">GitHub</a>
        <a href="https://www.linkedin.com/in/muqing-shen" target="_blank" rel="noreferrer">LinkedIn</a>
      </div>
    </nav>
  );
}

export default NavBar;