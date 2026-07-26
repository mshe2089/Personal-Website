import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { visibleRoutes } from '../../config/routes';
import { useClock } from '../../hooks/useClock';
import { useTheme } from '../../hooks/useTheme';

function buildRouteTree(routes) {
  const root = { directories: {}, routes: [] };

  routes.forEach((route) => {
    if (route.path === '/') {
      root.routes.push(route);
      return;
    }

    const segments = route.path.split('/').filter(Boolean);
    const filename = segments.pop();
    let directory = root;

    segments.forEach((segment) => {
      directory.directories[segment] ??= { directories: {}, routes: [] };
      directory = directory.directories[segment];
    });

    directory.routes.push({ ...route, filename });
  });

  return root;
}

function Directory({ name, node, path, depth = 0, currentPath, onNavigate }) {
  const containsCurrentPath = currentPath.startsWith(`${path}/`);
  const [isExpanded, setIsExpanded] = useState(containsCurrentPath);

  return (
    <li>
      <button
        type="button"
        className="nav-tree-row nav-tree-directory"
        style={{ paddingLeft: `${depth * 1.1 + 0.75}rem` }}
        onClick={() => setIsExpanded((expanded) => !expanded)}
        aria-expanded={isExpanded}
      >
        <span aria-hidden="true">{isExpanded ? '▾' : '▸'}</span>
        <span>{name}/</span>
      </button>

      {isExpanded && (
        <ul className="m-0 list-none p-0">
          {Object.entries(node.directories).map(([directoryName, directory]) => (
            <Directory
              key={directoryName}
              name={directoryName}
              node={directory}
              path={`${path}/${directoryName}`}
              depth={depth + 1}
              currentPath={currentPath}
              onNavigate={onNavigate}
            />
          ))}
          {node.routes.map((route) => (
            <RouteEntry
              key={route.path}
              route={route}
              depth={depth + 1}
              currentPath={currentPath}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function RouteEntry({ route, depth = 0, currentPath, onNavigate }) {
  const filename = route.path === '/' ? 'home' : route.filename;
  const isActive = currentPath === route.path;

  return (
    <li>
      <Link
        to={route.path}
        onClick={onNavigate}
        className={`nav-tree-row nav-tree-file ${isActive ? 'is-active' : ''}`}
        style={{ paddingLeft: `${depth * 1.1 + 0.75}rem` }}
        aria-current={isActive ? 'page' : undefined}
      >
        <span aria-hidden="true">└</span>
        <span>{filename}</span>
      </Link>
    </li>
  );
}

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const routeTree = useMemo(() => buildRouteTree(visibleRoutes), []);
  const location = useLocation();
  const time = useClock();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  const formattedTime = time.toLocaleString('en-AU', {
    dateStyle: 'medium',
    timeStyle: 'short',
    hour12: false,
  });

  return (
    <>
      <button
        type="button"
        className="nav-trigger"
        onClick={() => setIsOpen(true)}
        aria-label="Open site directory"
        aria-expanded={isOpen}
      >
        <span className="nav-trigger-surface" aria-hidden="true">
          <span className="nav-trigger-icon">☰</span>
          <span className="nav-trigger-arrow">›</span>
        </span>
      </button>

      <button
        type="button"
        className={`nav-backdrop ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen(false)}
        aria-label="Close site directory"
        tabIndex={isOpen ? 0 : -1}
      />

      <nav className={`nav-drawer ${isOpen ? 'is-open' : ''}`} aria-label="Site directory">
        <header className="flex items-start justify-between gap-md border-b border-default p-md">
          <div>
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="text-lg text-primary no-underline font-semibold"
            >
              muqing.dev
            </Link>
          </div>
          <button
            type="button"
            className="nav-icon-button text-xl leading-none"
            onClick={() => setIsOpen(false)}
            aria-label="Close site directory"
          >
            ×
          </button>
        </header>

        <div className="flex-1 overflow-y-auto py-sm">
          <p className="m-0 px-md pb-xs text-sm font-medium text-secondary">site/</p>
          <ul className="m-0 list-none p-0">
            {routeTree.routes.map((route) => (
              <RouteEntry
                key={route.path}
                route={route}
                currentPath={location.pathname}
                onNavigate={() => setIsOpen(false)}
              />
            ))}
            {Object.entries(routeTree.directories).map(([name, node]) => (
              <Directory
                key={name}
                name={name}
                node={node}
                path={`/${name}`}
                currentPath={location.pathname}
                onNavigate={() => setIsOpen(false)}
              />
            ))}
          </ul>
        </div>

        <footer className="border-t border-default p-md text-xs text-secondary">
          <div className="mb-sm flex items-center justify-between">
            <span>{formattedTime}</span>
            <button
              type="button"
              onClick={toggleTheme}
              className="nav-icon-button text-sm"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? '☀️ light' : '🌙 dark'}
            </button>
          </div>
          <div className="flex gap-md">
            <a href="https://github.com/mshe2089" target="_blank" rel="noreferrer">
              github
            </a>
            <a
              href="https://www.linkedin.com/in/muqing-shen-604a3b1a4/"
              target="_blank"
              rel="noreferrer"
            >
              linkedin
            </a>
          </div>
        </footer>
      </nav>
    </>
  );
}

export default NavBar;
