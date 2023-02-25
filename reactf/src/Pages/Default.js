import logo from '../logo.svg';
import './Default.css';

function Default() {
  return (
    <div className="Default">
      <header className="Default-header">
        <img src={logo} className="Default-logo" alt="logo" />
        <p>
          I'm <code>lazy</code> so I haven't bothered removing this page yet.
        </p>
        <a
          className="Default-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React?
        </a>
      </header>
    </div>
  );
}

export default Default;
