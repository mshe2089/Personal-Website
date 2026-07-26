import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navigationGroups } from '../../config/routes';
import { useClock } from '../../hooks/useClock';
import { useTheme } from '../../hooks/useTheme';

function NavGroup({ name, routes, isOpen, onToggle }) {
  if (name === 'Main') {
    return routes.map((route) => (
      <Link
        key={route.path}
        to={route.path}
        className="hidden sm:inline text-primary no-underline font-medium text-sm lg:text-base hover:text-secondary transition-colors"
      >
        {route.name}
      </Link>
    ));
  }

  return (
    <div className="relative">
      <button
        className="bg-transparent border-none cursor-pointer text-primary font-medium text-sm lg:text-base flex items-center gap-xs hover:text-secondary p-0"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        {name} <span className="text-xs">▼</span>
      </button>
      {isOpen && (
        <div className="absolute top-[120%] left-1/2 -translate-x-1/2 bg-primary border border-strong min-w-[180px] shadow-lg flex flex-col z-20 animate-in fade-in zoom-in-95 duration-200">
          {routes.map((route) => (
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
  );
}

function NavBar() {
  const [activeGroup, setActiveGroup] = useState(null);
  const time = useClock();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    setActiveGroup(null);
  }, [location]);

  const formattedTime = `${time.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })} • ${time.toLocaleTimeString('en-US', { hour12: false })}`;

  return (
    <nav className="relative flex w-full max-w-full items-center justify-between gap-md px-md py-lg lg:p-lg border-b border-strong bg-secondary sticky top-0 z-[1000] shadow-sm font-sans">
      {activeGroup && (
        <button
          type="button"
          className="fixed inset-0 z-0 cursor-default bg-transparent border-0 p-0"
          aria-label="Close navigation menu"
          onClick={() => setActiveGroup(null)}
        />
      )}

      <div className="relative z-10 shrink-0 text-lg sm:text-xl font-bold tracking-tight flex items-center gap-xs sm:gap-sm">
        <Link to="/" className="text-primary no-underline hover:text-secondary font-serif">
          muqing.dev
        </Link>
        <button
          type="button"
          onClick={toggleTheme}
          className="bg-transparent border-none cursor-pointer text-lg p-0 hover:scale-110 transition-transform"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="relative z-10 min-w-0 flex items-center gap-md lg:gap-lg lg:absolute lg:left-1/2 lg:-translate-x-1/2">
        {navigationGroups.map((group) => (
          <NavGroup
            key={group.name}
            {...group}
            isOpen={activeGroup === group.name}
            onToggle={() => {
              setActiveGroup(activeGroup === group.name ? null : group.name);
            }}
          />
        ))}
      </div>

      <div className="relative z-10 hidden lg:flex items-center gap-md">
        <a
          href="https://github.com/mshe2089"
          target="_blank"
          rel="noreferrer"
          className="text-secondary no-underline text-xs uppercase tracking-wide hover:text-primary transition-colors"
        >
          GitHub
        </a>
        <a
          href="https://www.linkedin.com/in/muqing-shen-604a3b1a4/"
          target="_blank"
          rel="noreferrer"
          className="text-secondary no-underline text-xs uppercase tracking-wide hover:text-primary transition-colors"
        >
          LinkedIn
        </a>
        <div className="h-4 w-px bg-strong mx-xs" />
        <span className="text-sm lg:text-base font-medium text-primary min-w-[140px] text-right tabular-nums">
          {formattedTime}
        </span>
      </div>
    </nav>
  );
}

export default NavBar;
