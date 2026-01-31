import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { routeRegistry } from '../../config/routes';
import { useClock } from '../../hooks/useClock';
import { useTheme } from '../../hooks/useTheme';

function NavBar() {
  const [activeDropdown, setActiveDropdown] = useState(null); // 'fun' | 'thoughts' | null
  const time = useClock();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  // Format: "Sat, Jan 31 • 17:18:00"
  const formattedTime = time.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }) + ' • ' + time.toLocaleTimeString('en-US', {
    hour12: false
  });

  const mainLinks = routeRegistry.filter(r => !r.hidden && r.category === "Main");
  const funLinks = routeRegistry.filter(r => !r.hidden && r.category === "Fun");
  const thoughtLinks = routeRegistry.filter(r => !r.hidden && r.category === "Thoughts");
  const labsLinks = routeRegistry.filter(r => !r.hidden && r.category === "Labs");

  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const closeDropdown = () => setActiveDropdown(null);

  // Close dropdown on route change
  useEffect(() => {
    closeDropdown();
  }, [location]);

  return (
    <nav className="relative flex items-center justify-between p-lg border-b border-strong bg-secondary sticky top-0 z-[1000] shadow-sm font-sans">
      {/* Click-outside backdrop */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={closeDropdown}
        ></div>
      )}

      {/* Brand & Theme */}
      <div className="relative z-10 text-xl font-bold tracking-tight flex items-center gap-sm">
        <Link to="/" className="text-primary no-underline hover:text-secondary" onClick={closeDropdown}>
          muqing.dev
        </Link>
        <button
          onClick={toggleTheme}
          className="bg-transparent border-none cursor-pointer text-lg p-0 hover:scale-110 transition-transform"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode (Tokyo Night)"}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Center Links */}
      <div className="relative z-10 flex items-center gap-lg lg:absolute lg:left-1/2 lg:-translate-x-1/2">
        {mainLinks.map(route => (
          <Link
            key={route.path}
            to={route.path}
            className="text-primary no-underline font-medium text-sm lg:text-base hover:text-secondary transition-colors"
          >
            {route.name}
          </Link>
        ))}

        {/* Labs Dropdown */}
        <div className="relative">
          <button
            className="bg-transparent border-none cursor-pointer text-primary font-medium text-sm lg:text-base flex items-center gap-xs hover:text-secondary p-0"
            onClick={() => toggleDropdown('labs')}
          >
            Labs <span className="text-xs">▼</span>
          </button>
          {activeDropdown === 'labs' && (
            <div className="absolute top-[120%] left-1/2 -translate-x-1/2 bg-primary border border-strong min-w-[180px] shadow-lg flex flex-col z-20 animate-in fade-in zoom-in-95 duration-200">
              {labsLinks.map(route => (
                <Link
                  key={route.path}
                  to={route.path}
                  className="text-primary no-underline p-md text-sm hover:bg-tertiary block border-b border-strong last:border-none transition-colors"
                >
                  {route.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Thoughts Dropdown */}
        <div className="relative">
          <button
            className="bg-transparent border-none cursor-pointer text-primary font-medium text-sm lg:text-base flex items-center gap-xs hover:text-secondary p-0"
            onClick={() => toggleDropdown('thoughts')}
          >
            Thoughts <span className="text-xs">▼</span>
          </button>
          {activeDropdown === 'thoughts' && (
            <div className="absolute top-[120%] left-1/2 -translate-x-1/2 bg-primary border border-strong min-w-[220px] shadow-lg flex flex-col z-20 animate-in fade-in zoom-in-95 duration-200">
              {thoughtLinks.map(route => (
                <Link
                  key={route.path}
                  to={route.path}
                  className="text-primary no-underline p-md text-sm hover:bg-tertiary block border-b border-strong last:border-none transition-colors"
                >
                  {route.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Fun Dropdown */}
        <div className="relative">
          <button
            className="bg-transparent border-none cursor-pointer text-primary font-medium text-sm lg:text-base flex items-center gap-xs hover:text-secondary p-0"
            onClick={() => toggleDropdown('fun')}
          >
            Fun <span className="text-xs">▼</span>
          </button>
          {activeDropdown === 'fun' && (
            <div className="absolute top-[120%] left-1/2 -translate-x-1/2 bg-primary border border-strong min-w-[180px] shadow-lg flex flex-col z-20 animate-in fade-in zoom-in-95 duration-200">
              {funLinks.map(route => (
                <Link
                  key={route.path}
                  to={route.path}
                  className="text-primary no-underline p-md text-sm hover:bg-tertiary block border-b border-strong last:border-none transition-colors"
                >
                  {route.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Info */}
      <div className="relative z-10 hidden lg:flex items-center gap-md">
        <a href="https://github.com/mshe2089" target="_blank" rel="noreferrer" className="text-secondary no-underline text-xs uppercase tracking-wide hover:text-primary transition-colors">GitHub</a>
        <a href="https://www.linkedin.com/in/muqing-shen" target="_blank" rel="noreferrer" className="text-secondary no-underline text-xs uppercase tracking-wide hover:text-primary transition-colors">LinkedIn</a>
        <div className="h-5 w-px bg-gray-300 mx-xs"></div>
        <span className="text-sm lg:text-base font-medium text-primary min-w-[140px] text-right tabular-nums">{formattedTime}</span>
      </div>
    </nav>
  );
}

export default NavBar;