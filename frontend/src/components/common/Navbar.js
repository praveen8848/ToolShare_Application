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
  const colors = ['#10b981', '#34d399', '#6ee7b7', '#059669', '#a7f3d0', '#047857', '#064e3b'];
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
        border: '2px solid #1E1E1E'
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
          /* ── Graphite + Mint Theme Variables ── */
          :root {
            --nav-bg: #121212;
            --nav-surface: #1E1E1E;
            --nav-surface-hover: #2A2A2A;
            --nav-accent: #10b981;
            --nav-accent-bright: #34d399;
            --nav-accent-10: rgba(16, 185, 129, 0.1);
            --nav-accent-15: rgba(16, 185, 129, 0.15);
            --nav-accent-20: rgba(16, 185, 129, 0.2);
            --nav-accent-30: rgba(16, 185, 129, 0.3);
            --nav-text: #E5E5E5;
            --nav-text-muted: #A3A3A3;
            --nav-text-dim: #737373;
            --nav-border: #2A2A2A;
            --nav-border-light: rgba(42, 42, 42, 0.6);
            --nav-white: #F5F5F5;
            --nav-danger: #ef4444;
            --nav-danger-bg: rgba(239, 68, 68, 0.1);
          }

          .toolshare-navbar {
            background: var(--nav-bg) !important;
            border-bottom: 1px solid var(--nav-border);
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
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #121212;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
          }
          
          .brand-text {
            font-weight: 800;
            font-size: 1.4rem;
            color: var(--nav-white);
            letter-spacing: -0.03em;
          }
          
          .nav-link-custom {
            color: var(--nav-text-muted) !important;
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
            color: var(--nav-white) !important;
            background: var(--nav-surface-hover) !important;
          }
          
          .nav-link-custom.active {
            color: var(--nav-accent-bright) !important;
            background: var(--nav-accent-15) !important;
            font-weight: 600;
          }
          
          /* List Tool Button */
          .nav-link-list-tool {
            color: var(--nav-accent-bright) !important;
            font-weight: 600;
            padding: 0.5rem 1.25rem !important;
            border-radius: 8px;
            transition: all 0.2s ease;
            font-size: 0.95rem;
            display: flex;
            align-items: center;
            gap: 8px;
            background: var(--nav-accent-15);
            border: 1px solid var(--nav-accent-30);
            margin-left: 0.25rem;
          }
          
          .nav-link-list-tool:hover {
            background: var(--nav-accent-20) !important;
            color: #6ee7b7 !important;
            border-color: rgba(16, 185, 129, 0.5);
          }
          
          .nav-icon {
            font-size: 1rem;
            opacity: 0.85;
          }
          
          .user-profile-btn {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 0.3rem 1rem 0.3rem 0.3rem;
            border-radius: 40px;
            background: var(--nav-surface);
            border: 1px solid var(--nav-border);
            transition: all 0.2s ease;
            text-decoration: none;
          }
          
          .user-profile-btn:hover {
            border-color: rgba(16, 185, 129, 0.3);
            background: var(--nav-surface-hover);
          }
          
          .username-text {
            color: var(--nav-white) !important;
          }
          
          /* ── STANDARD BUTTON: Logout ── */
          .btn-logout-mint {
            background: transparent;
            color: var(--nav-text-muted);
            border: 1px solid var(--nav-border);
            border-radius: 8px;
            padding: 0.5rem 1rem;
            font-weight: 500;
            font-size: 0.95rem;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            white-space: nowrap;
          }
          
          .btn-logout-mint:hover {
            background: var(--nav-danger-bg);
            color: var(--nav-danger);
            border-color: rgba(239, 68, 68, 0.3);
          }
          
          .btn-logout-mint:active {
            transform: scale(0.97);
          }
          
          /* ── STANDARD BUTTON: Login ── */
          .btn-login-mint {
            background: transparent;
            color: var(--nav-white);
            border: 1px solid var(--nav-border);
            border-radius: 8px;
            padding: 0.5rem 1.25rem;
            font-weight: 500;
            font-size: 0.95rem;
            transition: all 0.2s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            white-space: nowrap;
          }
          
          .btn-login-mint:hover {
            background: var(--nav-surface-hover);
            color: var(--nav-white);
            border-color: var(--nav-accent-30);
          }
          
          .btn-login-mint:active {
            transform: scale(0.97);
          }
          
          /* ── STANDARD BUTTON: Sign Up (Primary) ── */
          .btn-signup-mint {
            background: var(--nav-accent);
            color: #121212 !important;
            border: 1px solid var(--nav-accent);
            border-radius: 8px;
            padding: 0.5rem 1.5rem;
            font-weight: 600;
            font-size: 0.95rem;
            transition: all 0.2s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            white-space: nowrap;
          }
          
          .btn-signup-mint:hover {
            background: var(--nav-accent-bright);
            border-color: var(--nav-accent-bright);
            color: #121212 !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
          }
          
          .btn-signup-mint:active {
            transform: scale(0.97) translateY(0);
          }
          
          .navbar-toggler-custom {
            border: 1px solid var(--nav-border);
            padding: 0.4rem 0.6rem;
            border-radius: 8px;
            background: var(--nav-surface);
          }
          
          .navbar-toggler-custom:focus {
            box-shadow: none;
            outline: none;
            border-color: var(--nav-accent);
          }
          
          .navbar-toggler-icon {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba(229, 229, 229, 0.8)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
          }
          
          /* Divider */
          .navbar-divider {
            width: 1px;
            height: 24px;
            background: var(--nav-border);
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
            
            .btn-login-mint,
            .btn-signup-mint {
              width: 100%;
              justify-content: center;
              margin-bottom: 0.5rem;
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
                  
                  {/* STANDARD BUTTON: Logout */}
                  <Button 
                    onClick={handleLogout} 
                    className="btn-logout-mint"
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
                
                {/* STANDARD BUTTONS: Login & Sign Up */}
                <Link to="/login" className="btn-login-mint">Log in</Link>
                <Link to="/register" className="btn-signup-mint">Get Started</Link>
              </Nav>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default NavigationBar;