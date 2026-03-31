import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { FaTools, FaUser, FaSignOutAlt, FaPlus } from 'react-icons/fa';

const NavigationBar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <FaTools className="me-2" />
          ToolShare
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {isAuthenticated && (
            <>
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/browse">Browse Tools</Nav.Link>
                <Nav.Link as={Link} to="/my-bookings">My Bookings</Nav.Link>
                <Nav.Link as={Link} to="/owner-dashboard">Owner Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/my-tools">My Tools</Nav.Link>
              </Nav>
              <Nav>
                <Nav.Link as={Link} to="/add-tool" className="me-2">
                  <FaPlus className="me-1" />
                  List Tool
                </Nav.Link>
                <Navbar.Text className="me-3">
                  <FaUser className="me-1" />
                  {user?.name || 'User'}
                </Navbar.Text>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>
                  <FaSignOutAlt className="me-1" />
                  Logout
                </Button>
              </Nav>
            </>
          )}
          {!isAuthenticated && (
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
              <Nav.Link as={Link} to="/register">Register</Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;