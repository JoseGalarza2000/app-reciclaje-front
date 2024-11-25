import { Container, Image, Offcanvas, Navbar, NavDropdown, Nav, Row, Col } from 'react-bootstrap';
import Login from './modalLoginSignUp';
import { faX, faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from 'react';
import { Link as LinkScroll } from 'react-scroll';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { clearLocalStorage } from '../utilities/localStorage.utility';
import { resetUser, UserKey } from '../redux/states/user';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { PrivateRoutes, PublicRoutes } from '../models/routes';
import { useTheme } from './themeContext';
import FixedBottomNavigation from './bottomNavigation';
import Roles from '../models/roles';

export const NavbarsHome = function () {
  const { theme } = useTheme();
  const userState = useSelector((store) => store.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const logOut = () => {
    clearLocalStorage(UserKey);
    dispatch(resetUser());
    navigate(PublicRoutes.LOGIN, { replace: true });
  };

  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const handleToggleOffcanvas = () => {
    setShowOffcanvas(!showOffcanvas);
  };

  return (
    <>
      <div className='navbar-nav sticky-top navbar-page-container'>
        <Navbar
          bg={theme === "dark" ? theme : "light"}
          data-bs-theme={theme === "dark" ? theme : "light"}
          className='navBarDesktop'
        >
          <Container>
            <Nav style={{ width: '9rem' }}>
              <Navbar.Toggle onClick={handleToggleOffcanvas} aria-controls={`offcanvasNavbar-expand-lg`} className="d-md-block d-lg-none">
                <FontAwesomeIcon icon={showOffcanvas === false ? faBars : faX} />
              </Navbar.Toggle>
              <Link to="/" className='w-100'>
                <Image
                  src="https://rafaeloxj.pythonanywhere.com/imagenes/logo_app.svg"
                  className="img-fluid svg-logo"
                  data-bs-theme={theme === "dark" ? theme : "light"}
                  style={{ width: '80%' }}
                />
              </Link>
            </Nav>
            {/*<SwitchTheme theme={theme} toggleTheme={toggleTheme}></SwitchTheme>*/}
            <Nav className="justify-content-end d-flex" >
              {!userState.id_usuario ? <Login /> :
                (
                  <NavDropdown /*menuVariant='dark'*/
                    renderMenuOnMount={true}
                    className="d-block"
                    title={
                      <>
                        <label className='me-1 name-user'>
                          {userState.nombre_corto}
                        </label>
                        <img className="img-profile" src={userState.url_foto} alt='perfil'/>
                      </>
                    }
                    id="navbarScrollingDropdown"
                    align="end"
                  >
                    <Link className="dropdown-item" to={"/"+PrivateRoutes.PROFILE}>Perfil</Link>
                    {
                      userState.rol === Roles.ORG ?
                        <>
                          <Link className="dropdown-item" to={"/"+PrivateRoutes.RECICLADORES}>Recicladores</Link>
                          <Link className="dropdown-item" to={"/"+PrivateRoutes.REGISTRO_PESOS}>Registro de pesos</Link>
                          <Link className="dropdown-item" to={"/"+PrivateRoutes.CENTROS_ACOPIO}>Centros de acopio</Link>
                        </>
                        :
                        <Link className="dropdown-item" to={"/"+PrivateRoutes.RECICLAR}>Reciclar</Link>
                    }
                    <NavDropdown.Divider />
                    <Link className="dropdown-item" onClick={logOut} style={{ color: 'red' }}>Cerrar sesión</Link>
                  </NavDropdown>
                )}
            </Nav>
          </Container>
        </Navbar>
        <Navbar
          key='lg'
          expand='lg'
          className="subNavBarDesktop d-none d-lg-flex p-0 m-0"
          bg={theme === "dark" ? theme : ""}
          data-bs-theme={theme === "dark" ? theme : ""}
        >

          <Navbar.Offcanvas
            id={`offcanvasNavbar-expand-lg`}
            aria-labelledby={`offcanvasNavbarLabel-expand-lg`}
            placement="end"
            backdrop={false}
            show={showOffcanvas}
            onHide={() => setShowOffcanvas(false)}
          >

            <Offcanvas.Body>
              <Nav className="justify-content-center flex-grow-1 pe-3 gap-4">
                <LinkScroll
                  activeClass="active"
                  to="inicio"
                  spy={true}
                  smooth={true}
                  offset={-97}
                  duration={500}
                  style={{ cursor: 'pointer' }}
                  isDynamic
                >
                  Inicio
                </LinkScroll>
                <LinkScroll
                  activeClass="active"
                  to="about"
                  spy={true}
                  smooth={true}
                  offset={-93}
                  duration={500}
                  style={{ cursor: 'pointer' }}
                  isDynamic
                >
                  Quienes somos
                </LinkScroll>
                <LinkScroll
                  activeClass="active"
                  to="info"
                  spy={true}
                  smooth={true}
                  offset={-93}
                  duration={500}
                  style={{ cursor: 'pointer' }}
                  isDynamic
                >
                  Información
                </LinkScroll>
                <LinkScroll
                  activeClass="active"
                  to="map"
                  spy={true}
                  smooth={true}
                  offset={-93}
                  duration={500}
                  style={{ cursor: 'pointer' }}
                  isDynamic
                >
                  Centros de acopio
                </LinkScroll>
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Navbar>
      </div>
      {
        /* respaldo navbar movil 6/5/2024 */
      }
      <FixedBottomNavigation></FixedBottomNavigation>
    </>
  );
}

export const NavbarPage = function ({ startElement, titleNav, endElement, fluid = false}) {
  const { theme } = useTheme();

  return (
    <div className='navbar-nav sticky-top navbar-page-container' >
      <Navbar
        bg={theme === "dark" ? theme : "light"}
        data-bs-theme={theme === "dark" ? theme : "light"}
        className='NavbarPage navBarDesktop'
        style={{ border: "none" }}
      >
        <Container fluid={fluid}>
          <Row className="w-100 m-0 align-items-center">
            <Col className='h-100 p-0'>
              {startElement}
            </Col>
            <Col className="h-100 d-flex justify-content-center p-0">
              <span style={{ fontWeight: "bold" }}>{titleNav}</span>
            </Col>
            <Col className="h-100 d-flex justify-content-end p-0">
              {endElement}
            </Col>
          </Row>
        </Container>
      </Navbar>
    </div>
  );
}