import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toolService from '../services/toolService';
import categoryService from '../services/categoryService';
import { 
  FaSearch, 
  FaPlus, 
  FaCalendarAlt, 
  FaArrowRight, 
  FaTools, 
  FaLayerGroup, 
  FaClipboardCheck, 
  FaHandshake, 
  FaUndo 
} from 'react-icons/fa';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTools: 0,
    totalCategories: 0,
    loading: true
  });

  useEffect(() => {
    const fetchPlatformStats = async () => {
      try {
        // Fetching global platform data for the overview
        const [tools, categories] = await Promise.all([
          toolService.getAllTools(),
          categoryService.getAllCategories()
        ]);
        
        setStats({
          totalTools: tools?.length || 0,
          totalCategories: categories?.length || 0,
          loading: false
        });
      } catch (error) {
        console.error('Failed to fetch platform statistics:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchPlatformStats();
  }, []);

  return (
    <div className="dashboard-wrapper">
      <style>
        {`
          .dashboard-wrapper {
            background-color: #f8fafc; /* Very light slate background */
            min-height: 100vh;
            padding-bottom: 4rem;
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
          .icon-box.stats { background-color: #fffbeb; color: #d97706; }

          /* Mission Banner */
          .mission-banner {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            border-radius: 16px;
            color: white;
            position: relative;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.5);
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

          /* How it Works Timeline */
          .process-step {
            position: relative;
            padding: 1.5rem;
            border-radius: 12px;
            background: #f8fafc;
            border: 1px solid transparent;
            transition: all 0.3s ease;
            height: 100%;
          }
          .process-step:hover {
            background: #ffffff;
            border-color: #e2e8f0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            transform: translateY(-2px);
          }
          .step-number {
            position: absolute;
            top: -12px;
            left: 20px;
            background: #0f172a;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.85rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .step-icon {
            color: #3b82f6;
            margin-bottom: 1rem;
            margin-top: 0.5rem;
          }
        `}
      </style>

      <Container className="pt-5">
        
        {/* Welcome & Mission Banner */}
        <div className="mission-banner p-4 p-md-5 mb-5">
          <Row className="align-items-center">
            <Col lg={8}>
              <h1 className="fw-bold mb-3" style={{ fontSize: '2.5rem', letterSpacing: '-0.025em' }}>
                Welcome back, {user?.name || 'Builder'}.
              </h1>
              <p className="mb-0" style={{ fontSize: '1.1rem', color: '#cbd5e1', lineHeight: '1.6', maxWidth: '90%' }}>
                ToolShare connects people who have tools with those who need them. Share your idle tools, earn money, and help build a sustainable community.
              </p>
            </Col>
          </Row>
        </div>

        {/* Top Level Stats */}
        <h5 className="text-slate-900 fw-bold mb-3 letter-spacing-tight">Platform Overview</h5>
        <Row className="mb-5 g-4">
          <Col md={6}>
            <div className="modern-card p-4 d-flex align-items-center">
              <div className="icon-box stats mb-0 me-4">
                <FaTools size={22} />
              </div>
              <div>
                <p className="text-slate-500 fw-semibold text-uppercase mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Total Tools Listed</p>
                <h2 className="text-slate-900 fw-bold mb-0">
                  {stats.loading ? <Spinner animation="border" size="sm" /> : stats.totalTools}
                </h2>
              </div>
            </div>
          </Col>
          <Col md={6}>
            <div className="modern-card p-4 d-flex align-items-center">
              <div className="icon-box search mb-0 me-4">
                <FaLayerGroup size={22} />
              </div>
              <div>
                <p className="text-slate-500 fw-semibold text-uppercase mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Active Categories</p>
                <h2 className="text-slate-900 fw-bold mb-0">
                  {stats.loading ? <Spinner animation="border" size="sm" /> : stats.totalCategories}
                </h2>
              </div>
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

        {/* Dynamic How it Works Section */}
        <h5 className="text-slate-900 fw-bold mb-3 letter-spacing-tight">How ToolShare Works</h5>
        <div className="modern-card p-4 mb-5">
          <Row className="g-4 mt-2">
            
            <Col lg={3} md={6}>
              <div className="process-step">
                <div className="step-number">1</div>
                <FaSearch className="step-icon" size={28} />
                <h6 className="fw-bold text-slate-900">Request & Book</h6>
                <p className="text-slate-500 small mb-0">
                  Find the perfect tool for your project, select your dates, and send a booking request to the owner.
                </p>
              </div>
            </Col>

            <Col lg={3} md={6}>
              <div className="process-step">
                <div className="step-number">2</div>
                <FaClipboardCheck className="step-icon" size={28} style={{ color: '#8b5cf6' }} />
                <h6 className="fw-bold text-slate-900">Owner Approval</h6>
                <p className="text-slate-500 small mb-0">
                  The owner reviews your request. Once confirmed, they provide secure pickup instructions and contact details.
                </p>
              </div>
            </Col>

            <Col lg={3} md={6}>
              <div className="process-step">
                <div className="step-number">3</div>
                <FaHandshake className="step-icon" size={28} style={{ color: '#10b981' }} />
                <h6 className="fw-bold text-slate-900">Pickup & Build</h6>
                <p className="text-slate-500 small mb-0">
                  Pick up the tool at the scheduled time. Complete your DIY project safely and efficiently.
                </p>
              </div>
            </Col>

            <Col lg={3} md={6}>
              <div className="process-step">
                <div className="step-number">4</div>
                <FaUndo className="step-icon" size={28} style={{ color: '#f59e0b' }} />
                <h6 className="fw-bold text-slate-900">Return & Refund</h6>
                <p className="text-slate-500 small mb-0">
                  Return the item cleanly. The owner confirms the return on their dashboard, automatically releasing your security deposit.
                </p>
              </div>
            </Col>

          </Row>
        </div>

      </Container>
    </div>
  );
};

export default DashboardPage;