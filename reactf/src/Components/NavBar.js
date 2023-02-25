import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope, faFile } from '@fortawesome/free-solid-svg-icons'

import './NavBar.css';

function NavBar() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand href="/">Daniel's site</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="ms-auto">

          <Nav className="me-auto flex-nowrap">
            <Nav.Link href="/landing">Landing</Nav.Link>
            <Nav.Link href="#link">Placeholder</Nav.Link>
            <NavDropdown title="Stuff" id="basic-nav-dropdown">
              <NavDropdown.Item href="/tools/satsolver">Truth table generator</NavDropdown.Item>
              <NavDropdown.Item href="/tools/usydmarks">USYD wam calculator</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.3">Placeholder</NavDropdown.Item>
            </NavDropdown>
          </Nav>

          <Nav className="mr-auto flex-nowrap">
            <Button variant="dark" id="resume" href="https://drive.google.com/file/d/1IgSfBXA30KY47Plsf-KUgIv-vGc_ovrB/view?usp=sharing">Resume <FontAwesomeIcon icon={faFile}/></Button>
            <Button variant="dark" id="email" href="mailto:danielshen88@outlook.com">Email me  <FontAwesomeIcon icon={faEnvelope}/></Button>
            <Button variant="dark" id="github" href="https://github.com/mshe2089"><FontAwesomeIcon icon={faGithub}/></Button>
            <Button variant="dark" id="linkedin" href="https://www.linkedin.com/in/muqing-shen-604a3b1a4/"><FontAwesomeIcon icon={faLinkedin}/></Button>
          </Nav>

        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;