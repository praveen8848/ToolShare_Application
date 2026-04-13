import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { FaTools, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';
import '../../App.css'; // Ensure this points to your newly updated CSS file

// Modernized Avatar Component
const NavbarAvatar = ({ name, size = 38 }) => {
  // LOGICAL FIX: Added .trim() and .filter(Boolean) to prevent crashes if a name has double spaces
  const initials = name
    ?.trim()
    .split(/\s+/)
    .map(n => n[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';
  
  // Modern SaaS color palette
  const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];
  const colorIndex = (name?.length || 0) % colors.length;

  return (
    <div
      className="d-flex align-items-center justify-content-center rounded-circle text-white shadow-sm"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: colors[colorIndex],
        fontSize: '15px',
        fontWeight: '600',
        letterSpacing: '0.5px',
        textShadow: '0px 1px 2px rgba(0,0,0,0.1)' // Added subtle text pop
      }}
    >
      {initials}
    </div>
  );
};

const NavigationBar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Navbar className="modern-navbar" expand="lg" sticky="top">
      <Container>
        {/* Brand */}
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 me-4">
          <FaTools className="brand-logo" size={26} />
          <span className="brand-text">ToolShare</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 bg-light" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          {isAuthenticated ? (
            <>
              {/* Main Navigation */}
              <Nav className="me-auto mt-3 mt-lg-0 gap-1">
                <Nav.Link as={Link} to="/browse" className={`nav-link-custom ${isActive('/browse') ? 'active' : ''}`}>
                  Browse Tools
                </Nav.Link>
                <Nav.Link as={Link} to="/my-bookings" className={`nav-link-custom ${isActive('/my-bookings') ? 'active' : ''}`}>
                  My Bookings
                </Nav.Link>
                <Nav.Link as={Link} to="/my-tools" className={`nav-link-custom ${isActive('/my-tools') ? 'active' : ''}`}>
                  My Tools
                </Nav.Link>
                <Nav.Link as={Link} to="/owner-dashboard" className={`nav-link-custom d-flex align-items-center gap-2 ${isActive('/owner-dashboard') ? 'active' : ''}`}>
                  <FaTachometerAlt className="text-secondary" /> Dashboard
                </Nav.Link>
              </Nav>

              {/* User Actions */}
              <Nav className="align-items-lg-center gap-3 mt-4 mt-lg-0 border-top border-lg-0 pt-3 pt-lg-0">
                <Link to="/profile" className="text-decoration-none d-flex align-items-center gap-2 user-profile-btn w-auto">
                  <NavbarAvatar name={user?.name || 'User'} />
                  <span className="fw-semibold text-dark pe-2" style={{ fontSize: '0.95rem' }}>
                    {user?.name || 'Account'}
                  </span>
                </Link>
                
                <Button 
                  variant="light" 
                  onClick={handleLogout} 
                  className="btn-logout d-flex align-items-center gap-2 w-auto"
                >
                  <FaSignOutAlt /> <span>Logout</span>
                </Button>
              </Nav>
            </>
          ) : (
            /* Guest Navigation */
            <Nav className="ms-auto align-items-lg-center gap-3 mt-4 mt-lg-0 border-top border-lg-0 pt-3 pt-lg-0">
              <Nav.Link as={Link} to="/login" className="nav-link-custom fw-semibold px-3">
                Log in
              </Nav.Link>
              <Button 
                as={Link} 
                to="/register" 
                variant="primary" 
                className="rounded-pill px-4 py-2 fw-semibold shadow-sm w-auto" 
              >
                Create Account
              </Button>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;