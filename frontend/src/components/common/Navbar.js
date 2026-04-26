import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { 
  FaTools, 
  FaSignOutAlt, 
  FaTachometerAlt, 
  FaSearch, 
  FaCalendarAlt, 
  FaBoxes,
  FaPlus
} from 'react-icons/fa';

const NavbarAvatar = ({ name, size = 36 }) => {
  const initials = name?.trim().split(/\s+/).map(n => n[0]).filter(Boolean).join('').toUpperCase().slice(0, 2) || 'U';
  const colors = ['#3b82f6', '#10b981', '#60a5fa', '#34d399', '#8b5cf6', '#f59e0b', '#ec4899'];
  const colorIndex = (name?.length || 0) % colors.length;

  return (
    <div
      className="d-flex align-items-center justify-content-center rounded-circle text-white"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: `linear-gradient(135deg, ${colors[colorIndex]} 0%, ${colors[colorIndex]}cc 100%)`,
        fontSize: '13px',
        fontWeight: '700',
        letterSpacing: '0.5px',
        border: '2px solid #1e293b'
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
    <>
      <style>
        {`
          .toolshare-navbar {
            background: #0f172a !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
            padding: 0.8rem 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            width: 100%;
            z-index: 1030;
          }

          .navbar-locked-container {
            max-width: 1320px !important;
            margin: 0 auto;
          }
          
          .navbar-brand-custom {
            display: flex;
            align-items: center;
            gap: 12px;
            text-decoration: none;
          }
          
          .brand-icon-wrapper {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
          }
          
          .brand-text {
            font-weight: 800;
            font-size: 1.4rem;
            color: #f8fafc;
            letter-spacing: -0.03em;
          }
          
          .nav-link-custom {
            color: #94a3b8 !important;
            font-weight: 500;
            padding: 0.5rem 1rem !important;
            border-radius: 8px;
            transition: all 0.2s ease;
            font-size: 0.95rem;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .nav-link-custom:hover {
            color: #e2e8f0 !important;
            background: rgba(30, 41, 59, 0.5) !important;
          }
          
          .nav-link-custom.active {
            color: #60a5fa !important;
            background: rgba(59, 130, 246, 0.1) !important;
            font-weight: 600;
          }
          
          /* List Tool Button - Special Styling */
          .nav-link-list-tool {
            color: #34d399 !important;
            font-weight: 600;
            padding: 0.5rem 1.25rem !important;
            border-radius: 8px;
            transition: all 0.2s ease;
            font-size: 0.95rem;
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.2);
            margin-left: 0.25rem;
          }
          
          .nav-link-list-tool:hover {
            background: rgba(16, 185, 129, 0.2) !important;
            color: #6ee7b7 !important;
            border-color: rgba(16, 185, 129, 0.4);
          }
          
          .nav-icon {
            font-size: 1rem;
            opacity: 0.8;
          }
          
          .user-profile-btn {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 0.3rem 1rem 0.3rem 0.3rem;
            border-radius: 40px;
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(51, 65, 85, 0.5);
            transition: all 0.2s ease;
            text-decoration: none;
          }
          
          .user-profile-btn:hover {
            border-color: rgba(96, 165, 250, 0.3);
            background: rgba(30, 41, 59, 0.8);
          }
          
          .username-text {
            color: #f8fafc !important;
          }
          
          .btn-logout-dark {
            background: transparent;
            color: #94a3b8;
            border: 1px solid transparent;
            border-radius: 8px;
            padding: 0.5rem 1rem;
            font-weight: 500;
            font-size: 0.95rem;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .btn-logout-dark:hover {
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
          }
          
          .btn-login-dark {
            color: #f8fafc;
            font-weight: 500;
            padding: 0.5rem 1.25rem;
            border-radius: 8px;
            transition: all 0.2s ease;
            text-decoration: none;
          }
          
          .btn-login-dark:hover {
            background: rgba(255, 255, 255, 0.05);
            color: #ffffff;
          }
          
          .btn-signup-dark {
            background: #3b82f6;
            color: white;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            padding: 0.5rem 1.5rem;
            font-weight: 600;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1);
            transition: all 0.2s ease;
            text-decoration: none;
          }
          
          .btn-signup-dark:hover {
            background: #2563eb;
            transform: translateY(-1px);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
            color: white;
          }
          
          .navbar-toggler-custom {
            border: 1px solid rgba(51, 65, 85, 0.5);
            padding: 0.4rem 0.6rem;
            border-radius: 8px;
            background: rgba(30, 41, 59, 0.5);
          }
          
          .navbar-toggler-custom:focus {
            box-shadow: none;
            outline: none;
            border-color: #60a5fa;
          }
          
          .navbar-toggler-icon {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba(248, 250, 252, 0.8)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
          }
          
          /* Divider */
          .navbar-divider {
            width: 1px;
            height: 24px;
            background: rgba(51, 65, 85, 0.8);
          }
          
          /* Responsive */
          @media (max-width: 991px) {
            .nav-link-list-tool {
              margin-left: 0;
              margin-top: 0.5rem;
              justify-content: center;
            }
            
            .navbar-divider {
              display: none;
            }
          }
        `}
      </style>

      <Navbar className="toolshare-navbar" expand="lg">
        <Container fluid className="navbar-locked-container px-4">
          
          {/* Brand */}
          <Navbar.Brand 
            as={Link} 
            to={isAuthenticated ? "/dashboard" : "/"} 
            className="navbar-brand-custom"
          >
            <div className="brand-icon-wrapper">
              <FaTools size={18} />
            </div>
            <span className="brand-text">ToolShare</span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" className="navbar-toggler-custom" />
          
          <Navbar.Collapse id="basic-navbar-nav">
            {isAuthenticated ? (
              <>
                <Nav className="ms-auto me-3 align-items-lg-center gap-1">
                  <Nav.Link as={Link} to="/browse" className={`nav-link-custom ${isActive('/browse') ? 'active' : ''}`}>
                    <FaSearch className="nav-icon" /> Browse
                  </Nav.Link>
                  
                  {/* NEW: List Tool Button */}
                  <Nav.Link as={Link} to="/add-tool" className="nav-link-list-tool">
                    <FaPlus className="nav-icon" /> List Tool
                  </Nav.Link>
                  
                  <Nav.Link as={Link} to="/my-bookings" className={`nav-link-custom ${isActive('/my-bookings') ? 'active' : ''}`}>
                    <FaCalendarAlt className="nav-icon" /> Bookings
                  </Nav.Link>
                  <Nav.Link as={Link} to="/my-tools" className={`nav-link-custom ${isActive('/my-tools') ? 'active' : ''}`}>
                    <FaBoxes className="nav-icon" /> My Tools
                  </Nav.Link>
                  <Nav.Link as={Link} to="/owner-dashboard" className={`nav-link-custom ${isActive('/owner-dashboard') ? 'active' : ''}`}>
                    <FaTachometerAlt className="nav-icon" /> Dashboard
                  </Nav.Link>
                </Nav>

                <Nav className="align-items-lg-center gap-3">
                  <Link to="/profile" className="user-profile-btn">
                    <NavbarAvatar name={user?.name || 'User'} />
                    <span className="fw-semibold username-text pe-2" style={{ fontSize: '0.9rem' }}>
                      {user?.name?.split(' ')[0] || 'Account'}
                    </span>
                  </Link>
                  
                  <div className="navbar-divider d-none d-lg-block"></div>
                  
                  {/* UPDATED: Logout with text instead of just icon */}
                  <Button 
                    variant="link" 
                    onClick={handleLogout} 
                    className="btn-logout-dark text-decoration-none"
                  >
                    <FaSignOutAlt size={16} />
                    <span>Logout</span>
                  </Button>
                </Nav>
              </>
            ) : (
              <Nav className="ms-auto align-items-lg-center gap-3">
                <Nav.Link as={Link} to="/browse" className="nav-link-custom d-none d-lg-flex">
                  <FaSearch className="nav-icon" /> Browse Tools
                </Nav.Link>
                
                <div className="navbar-divider d-none d-lg-block"></div>
                
                <Link to="/login" className="btn-login-dark">Log in</Link>
                <Link to="/register" className="btn-signup-dark">Get Started</Link>
              </Nav>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default NavigationBar;