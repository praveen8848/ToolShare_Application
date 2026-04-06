import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { FaTools, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';

// Modernized Avatar Component
const NavbarAvatar = ({ name, size = 36 }) => {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  
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
        fontSize: '14px',
        fontWeight: '600',
        letterSpacing: '0.5px'
      }}
    >
      {initials}
    </div>
  );
};

const NavigationBar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Used to highlight the active tab

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper to check if a path is active
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>
        {`
          .modern-navbar {
            background-color: #ffffff;
            border-bottom: 1px solid #e2e8f0;
            padding: 0.75rem 0;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
          }
          
          .brand-logo {
            color: #3b82f6;
            transition: opacity 0.2s;
          }
          .brand-logo:hover { opacity: 0.9; }
          
          .brand-text {
            font-weight: 700;
            color: #0f172a;
            font-size: 1.25rem;
            letter-spacing: -0.025em;
          }

          .nav-link-custom {
            color: #64748b !important;
            font-weight: 500;
            font-size: 0.95rem;
            padding: 0.5rem 1rem !important;
            margin: 0 0.25rem;
            border-radius: 6px;
            transition: all 0.2s ease;
          }
          
          .nav-link-custom:hover {
            color: #0f172a !important;
            background-color: #f1f5f9;
          }

          /* Active tab styling */
          .nav-link-custom.active {
            color: #0f172a !important;
            background-color: #f8fafc;
            font-weight: 600;
          }

          .btn-logout {
            color: #64748b;
            border-color: #e2e8f0;
            font-weight: 500;
            padding: 0.4rem 1rem;
            transition: all 0.2s ease;
          }
          
          .btn-logout:hover {
            background-color: #fef2f2;
            color: #ef4444;
            border-color: #fecaca;
          }
          
          .user-profile-btn {
            background: transparent;
            border: 1px solid transparent;
            border-radius: 50px;
            padding: 4px 16px 4px 4px;
            transition: all 0.2s ease;
          }
          
          .user-profile-btn:hover {
            background: #f8fafc;
            border-color: #e2e8f0;
          }
        `}
      </style>

      <Navbar className="modern-navbar" expand="lg" sticky="top">
        <Container>
          {/* Brand */}
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 me-4">
            <FaTools className="brand-logo" size={24} />
            <span className="brand-text">ToolShare</span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 shadow-none" />
          
          <Navbar.Collapse id="basic-navbar-nav">
            {isAuthenticated ? (
              <>
                {/* Main Navigation */}
                <Nav className="me-auto mt-3 mt-lg-0">
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
                    <FaTachometerAlt /> Dashboard
                  </Nav.Link>
                </Nav>

                {/* User Actions */}
                <Nav className="align-items-lg-center gap-3 mt-4 mt-lg-0 border-top border-lg-0 pt-3 pt-lg-0">
                  <Link to="/profile" className="text-decoration-none d-flex align-items-center gap-2 user-profile-btn w-auto">
                    <NavbarAvatar name={user?.name || 'User'} />
                    <span className="fw-medium text-dark" style={{ fontSize: '0.95rem' }}>
                      {user?.name || 'Account'}
                    </span>
                  </Link>
                  
                  <Button 
                    variant="outline-secondary" 
                    onClick={handleLogout} 
                    className="btn-logout d-flex align-items-center gap-2 rounded-pill w-auto"
                  >
                    <FaSignOutAlt /> <span>Logout</span>
                  </Button>
                </Nav>
              </>
            ) : (
              /* Guest Navigation */
              <Nav className="ms-auto align-items-lg-center gap-2 mt-4 mt-lg-0 border-top border-lg-0 pt-3 pt-lg-0">
                <Nav.Link as={Link} to="/login" className="nav-link-custom fw-semibold px-3">
                  Log in
                </Nav.Link>
                <Button as={Link} to="/register" variant="primary" className="rounded-pill px-4 fw-semibold shadow-sm w-auto" style={{ backgroundColor: '#3b82f6', border: 'none' }}>
                  Register
                </Button>
              </Nav>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default NavigationBar;