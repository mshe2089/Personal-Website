import { routeRegistry } from '../registry/registry';
import '../styles/NavBar.css';

function NavBar() {
  return (
    <nav className="navbar-minimal">
      <div className="navbar-brand">
        <a href="/">muqing.dev</a>
      </div>
      <div className="navbar-links">
        {routeRegistry.filter(r => !r.hidden).map(route => (
          <a key={route.path} href={route.path}>{route.name}</a>
        ))}
      </div>
      <div className="navbar-social">
        <a href="https://github.com/mshe2089" target="_blank" rel="noreferrer">GitHub</a>
        <a href="https://www.linkedin.com/in/muqing-shen" target="_blank" rel="noreferrer">LinkedIn</a>
      </div>
    </nav>
  );
}

export default NavBar;