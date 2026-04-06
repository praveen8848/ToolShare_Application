import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { FaSearch, FaPlus, FaCalendarAlt, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-wrapper">
      <style>
        {`
          .dashboard-wrapper {
            background-color: #f8fafc; /* Very light slate background */
            min-height: 100vh;
            padding-bottom: 3rem;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
          }
          
          /* Typography */
          .text-slate-900 { color: #0f172a; }
          .text-slate-500 { color: #64748b; }
          .font-weight-600 { font-weight: 600; }
          .letter-spacing-tight { letter-spacing: -0.025em; }

          /* Modern Cards */
          .modern-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
            transition: all 0.2s ease;
          }
          
          /* Interactive Action Cards */
          .action-card {
            text-decoration: none;
            display: flex;
            flex-direction: column;
            height: 100%;
          }
          .action-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.025);
            border-color: #cbd5e1;
          }
          
          /* Icon Containers */
          .icon-box {
            width: 48px;
            height: 48px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.25rem;
          }
          .icon-box.search { background-color: #eff6ff; color: #3b82f6; }
          .icon-box.add { background-color: #f0fdf4; color: #16a34a; }
          .icon-box.calendar { background-color: #f8fafc; color: #475569; }

          /* Mission Banner */
          .mission-banner {
            background: linear-gradient(to right, #0f172a, #1e293b);
            border-radius: 16px;
            color: white;
            position: relative;
            overflow: hidden;
          }
          
          /* Clean Buttons */
          .btn-icon-link {
            display: inline-flex;
            align-items: center;
            font-size: 0.875rem;
            font-weight: 600;
            margin-top: auto;
            transition: gap 0.2s;
            gap: 4px;
          }
          .action-card:hover .btn-icon-link { gap: 8px; }
          .link-primary-custom { color: #3b82f6; }
          .link-success-custom { color: #16a34a; }
          .link-neutral-custom { color: #475569; }
        `}
      </style>

      <Container className="pt-5">
        
        {/* Welcome & Mission Banner */}
        <div className="mission-banner p-4 p-md-5 mb-5 shadow-sm">
          <Row className="align-items-center">
            <Col lg={8}>
              <h1 className="fw-bold mb-3" style={{ fontSize: '2.5rem', letterSpacing: '-0.025em' }}>
                Welcome back, {user?.name || 'User'}.
              </h1>
              <p className="mb-0" style={{ fontSize: '1.1rem', color: '#cbd5e1', lineHeight: '1.6', maxWidth: '90%' }}>
                ToolShare connects people who have tools with those who need them. Share your idle tools, earn money, and help build a sustainable community.
              </p>
            </Col>
          </Row>
        </div>

        {/* Top Level Stats */}
        <h5 className="text-slate-900 fw-bold mb-3 letter-spacing-tight">Overview</h5>
        <Row className="mb-5 g-4">
          <Col md={6}>
            <div className="modern-card p-4">
              <p className="text-slate-500 fw-semibold text-uppercase mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Total Tools Listed</p>
              <h2 className="text-slate-900 fw-bold mb-0">0</h2>
            </div>
          </Col>
          <Col md={6}>
            <div className="modern-card p-4">
              <p className="text-slate-500 fw-semibold text-uppercase mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Active Bookings</p>
              <h2 className="text-slate-900 fw-bold mb-0">0</h2>
            </div>
          </Col>
        </Row>

        {/* Quick Actions */}
        <h5 className="text-slate-900 fw-bold mb-3 letter-spacing-tight">Quick Actions</h5>
        <Row className="mb-5 g-4">
          <Col md={4}>
            <Link to="/browse" className="modern-card action-card p-4">
              <div className="icon-box search">
                <FaSearch size={20} />
              </div>
              <h5 className="text-slate-900 font-weight-600 mb-2">Find Tools</h5>
              <p className="text-slate-500 small mb-4">
                Browse available tools from your local community.
              </p>
              <div className="btn-icon-link link-primary-custom mt-auto">
                Browse inventory <FaArrowRight size={12} />
              </div>
            </Link>
          </Col>
          
          <Col md={4}>
            <Link to="/add-tool" className="modern-card action-card p-4">
              <div className="icon-box add">
                <FaPlus size={20} />
              </div>
              <h5 className="text-slate-900 font-weight-600 mb-2">List a Tool</h5>
              <p className="text-slate-500 small mb-4">
                Put your idle tools to work and start earning.
              </p>
              <div className="btn-icon-link link-success-custom mt-auto">
                Create listing <FaArrowRight size={12} />
              </div>
            </Link>
          </Col>
          
          <Col md={4}>
            <Link to="/my-bookings" className="modern-card action-card p-4">
              <div className="icon-box calendar">
                <FaCalendarAlt size={20} />
              </div>
              <h5 className="text-slate-900 font-weight-600 mb-2">My Bookings</h5>
              <p className="text-slate-500 small mb-4">
                Manage your upcoming rentals and history.
              </p>
              <div className="btn-icon-link link-neutral-custom mt-auto">
                View schedule <FaArrowRight size={12} />
              </div>
            </Link>
          </Col>
        </Row>

        {/* Recent Activity */}
        <h5 className="text-slate-900 fw-bold mb-3 letter-spacing-tight">Recent Activity</h5>
        <div className="modern-card p-5 text-center">
          <div className="d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#94a3b8' }}>
            <FaCalendarAlt size={24} />
          </div>
          <h6 className="text-slate-900 font-weight-600 mb-1">No activity yet</h6>
          <p className="text-slate-500 small mb-0">When you list or rent tools, your history will appear here.</p>
        </div>

      </Container>
    </div>
  );
};

export default DashboardPage;