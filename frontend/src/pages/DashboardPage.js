import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toolService from '../services/toolService';
import categoryService from '../services/categoryService';
import { 
  FaSearch, FaPlus, FaCalendarAlt, FaArrowRight, FaTools, 
  FaLayerGroup, FaClipboardCheck, FaHandshake, FaUndo,
  FaRupeeSign, FaMapMarkerAlt, FaStar, FaUsers, FaLeaf
} from 'react-icons/fa';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ 
    totalTools: 0, 
    totalCategories: 0, 
    totalUsers: 0,
    totalRentals: 0,
    loading: true 
  });

  useEffect(() => {
    const fetchPlatformStats = async () => {
      try {
        const [tools, categories] = await Promise.all([
          toolService.getAllTools(), 
          categoryService.getAllCategories()
        ]);
        setStats({ 
          totalTools: tools?.length || 0, 
          totalCategories: categories?.length || 0,
          totalUsers: 5280,
          totalRentals: 12450,
          loading: false 
        });
      } catch (error) {
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
            background: #121212;
            min-height: 100vh;
            padding-top: 76px;
            padding-bottom: 4rem;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: #E5E5E5;
          }

          .welcome-banner {
            background: #1E1E1E;
            border-radius: 14px;
            border: 1px solid #2A2A2A;
            padding: 2.5rem 2rem;
            margin-bottom: 2rem;
          }

          .welcome-banner h1 {
            font-weight: 700;
            color: #F5F5F5;
          }

          .indian-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #0A0A0A;
            border: 1px solid #2A2A2A;
            border-radius: 8px;
            padding: 0.4rem 1rem;
            color: #34D399;
            font-size: 0.8rem;
            margin-bottom: 1rem;
          }

          .section-title {
            color: #A3A3A3;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-bottom: 1.25rem;
          }

          /* Stats */
          .stat-card {
            background: #1E1E1E;
            border: 1px solid #2A2A2A;
            border-radius: 14px;
            padding: 1.25rem;
            height: 100%;
          }

          .stat-card h3 {
            color: #F5F5F5;
            font-weight: 700;
          }

          .stat-growth {
            color: #34D399;
            font-size: 0.8rem;
            font-weight: 600;
          }

          /* Action Cards */
          .action-card {
            text-decoration: none;
            display: flex;
            flex-direction: column;
            height: 100%;
            background: #1E1E1E;
            border: 1px solid #2A2A2A;
            border-radius: 14px;
            padding: 1.75rem 1.5rem;
            transition: all 0.2s;
          }

          .action-card:hover {
            border-color: #3A3A3A;
            color: inherit;
          }

          .action-card h4 {
            color: #F5F5F5;
            font-weight: 600;
          }

          .icon-box {
            width: 44px;
            height: 44px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.25rem;
          }

          .icon-box.browse { 
            background: rgba(16, 185, 129, 0.1);
            color: #34D399;
            border: 1px solid rgba(16, 185, 129, 0.2);
          }

          .icon-box.list { 
            background: rgba(16, 185, 129, 0.1);
            color: #34D399;
            border: 1px solid rgba(16, 185, 129, 0.2);
          }

          .icon-box.bookings { 
            background: rgba(245, 158, 11, 0.1);
            color: #FBBF24;
            border: 1px solid rgba(245, 158, 11, 0.2);
          }

          .btn-icon-link {
            display: inline-flex;
            align-items: center;
            font-size: 0.85rem;
            font-weight: 600;
            margin-top: auto;
            gap: 6px;
            padding: 0.4rem 0;
          }

          .action-card:hover .btn-icon-link {
            gap: 10px;
          }

          /* Process Steps */
          .process-card {
            background: #1E1E1E;
            border: 1px solid #2A2A2A;
            border-radius: 14px;
            padding: 1.5rem;
          }

          .process-step {
            background: #0A0A0A;
            border: 1px solid #2A2A2A;
            border-radius: 12px;
            padding: 1.5rem 1.25rem;
            height: 100%;
          }

          .step-number {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.9rem;
            color: #121212;
            margin-bottom: 1rem;
          }

          .step-1 { background: #10B981; }
          .step-2 { background: #34D399; }
          .step-3 { background: #059669; }
          .step-4 { background: #047857; }

          /* Tool icon box in banner */
          .tool-icon-box {
            background: rgba(16, 185, 129, 0.08);
            border: 1px solid rgba(16, 185, 129, 0.15);
            border-radius: 14px;
            padding: 1.25rem;
            display: inline-block;
          }

          @media (max-width: 768px) {
            .welcome-banner {
              padding: 1.75rem 1.25rem;
            }
          }
        `}
      </style>

      <Container className="pt-4">
        
        {/* Welcome Banner */}
        <div className="welcome-banner">
          <Row className="align-items-center">
            <Col lg={8}>
              <div className="indian-badge">
                <FaLeaf size={11} />
                <span>Proudly Indian • Community Driven</span>
                <FaRupeeSign size={11} />
              </div>
              <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)' }}>
                Welcome back, {user?.name?.split(' ')[0] || 'Builder'}!
              </h1>
              <p className="mb-0" style={{ color: '#A3A3A3', fontSize: '1rem', lineHeight: '1.6', maxWidth: '85%' }}>
                Your gateway to India's largest tool-sharing community. 
                Borrow what you need, share what you have, and build a sustainable future together.
              </p>
            </Col>
            <Col lg={4} className="text-lg-end mt-4 mt-lg-0">
              <div className="tool-icon-box">
                <FaTools size={40} style={{ color: '#34D399' }} />
              </div>
            </Col>
          </Row>
        </div>

        {/* Platform Stats */}
        <h6 className="section-title">
          <FaLayerGroup className="me-2" size={10} />
          Platform Overview
        </h6>
        <Row className="mb-5 g-3">
          <Col md={3} sm={6}>
            <div className="stat-card">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <FaTools size={20} style={{ color: '#34D399' }} />
                <span className="stat-growth">↑ 12%</span>
              </div>
              <h3 className="mb-1">
                {stats.loading ? <Spinner animation="border" size="sm" /> : stats.totalTools.toLocaleString('en-IN')}
              </h3>
              <p className="mb-0" style={{ color: '#A3A3A3', fontSize: '0.85rem' }}>Active Tools</p>
            </div>
          </Col>
          <Col md={3} sm={6}>
            <div className="stat-card">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <FaLayerGroup size={20} style={{ color: '#34D399' }} />
                <span className="stat-growth">↑ 8%</span>
              </div>
              <h3 className="mb-1">
                {stats.loading ? <Spinner animation="border" size="sm" /> : stats.totalCategories}
              </h3>
              <p className="mb-0" style={{ color: '#A3A3A3', fontSize: '0.85rem' }}>Categories</p>
            </div>
          </Col>
          <Col md={3} sm={6}>
            <div className="stat-card">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <FaUsers size={20} style={{ color: '#34D399' }} />
                <span className="stat-growth">↑ 25%</span>
              </div>
              <h3 className="mb-1">
                {stats.loading ? <Spinner animation="border" size="sm" /> : stats.totalUsers.toLocaleString('en-IN')}+
              </h3>
              <p className="mb-0" style={{ color: '#A3A3A3', fontSize: '0.85rem' }}>Community Members</p>
            </div>
          </Col>
          <Col md={3} sm={6}>
            <div className="stat-card">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <FaHandshake size={20} style={{ color: '#34D399' }} />
                <span className="stat-growth">↑ 18%</span>
              </div>
              <h3 className="mb-1">
                {stats.loading ? <Spinner animation="border" size="sm" /> : stats.totalRentals.toLocaleString('en-IN')}+
              </h3>
              <p className="mb-0" style={{ color: '#A3A3A3', fontSize: '0.85rem' }}>Successful Rentals</p>
            </div>
          </Col>
        </Row>

        {/* Quick Actions */}
        <h6 className="section-title">
          <FaArrowRight className="me-2" size={10} />
          Quick Actions
        </h6>
        <Row className="mb-5 g-3">
          <Col lg={4} md={6}>
            <Link to="/browse" className="action-card">
              <div className="icon-box browse">
                <FaSearch size={18} />
              </div>
              <h4 className="mb-2">Find Tools</h4>
              <p className="mb-3" style={{ color: '#A3A3A3', lineHeight: '1.5', fontSize: '0.9rem' }}>
                Browse thousands of tools available in your neighborhood.
              </p>
              <div className="btn-icon-link" style={{ color: '#34D399' }}>
                Browse Inventory <FaArrowRight size={12} />
              </div>
            </Link>
          </Col>
          <Col lg={4} md={6}>
            <Link to="/add-tool" className="action-card">
              <div className="icon-box list">
                <FaPlus size={18} />
              </div>
              <h4 className="mb-2">List a Tool</h4>
              <p className="mb-3" style={{ color: '#A3A3A3', lineHeight: '1.5', fontSize: '0.9rem' }}>
                Put your idle tools to work and earn up to ₹5,000/month.
              </p>
              <div className="btn-icon-link" style={{ color: '#34D399' }}>
                Create Listing <FaArrowRight size={12} />
              </div>
            </Link>
          </Col>
          <Col lg={4} md={6}>
            <Link to="/my-bookings" className="action-card">
              <div className="icon-box bookings">
                <FaCalendarAlt size={18} />
              </div>
              <h4 className="mb-2">My Bookings</h4>
              <p className="mb-3" style={{ color: '#A3A3A3', lineHeight: '1.5', fontSize: '0.9rem' }}>
                Track your rentals, manage approvals, and coordinate pickups.
              </p>
              <div className="btn-icon-link" style={{ color: '#FBBF24' }}>
                View Schedule <FaArrowRight size={12} />
              </div>
            </Link>
          </Col>
        </Row>

        {/* How It Works */}
        <h6 className="section-title">
          <FaClipboardCheck className="me-2" size={10} />
          How ToolShare Works
        </h6>
        <div className="process-card mb-4">
          <Row className="g-3">
            <Col lg={3} md={6}>
              <div className="process-step">
                <div className="step-number step-1">1</div>
                <FaSearch className="mb-2" size={22} color="#34D399" />
                <h5 className="fw-bold mb-1" style={{ color: '#F5F5F5', fontSize: '1rem' }}>Discover & Request</h5>
                <p className="mb-0" style={{ color: '#A3A3A3', fontSize: '0.85rem', lineHeight: '1.5' }}>
                  Find the perfect tool nearby, check availability, and send a booking request.
                </p>
              </div>
            </Col>
            <Col lg={3} md={6}>
              <div className="process-step">
                <div className="step-number step-2">2</div>
                <FaClipboardCheck className="mb-2" size={22} color="#34D399" />
                <h5 className="fw-bold mb-1" style={{ color: '#F5F5F5', fontSize: '1rem' }}>Get Approved</h5>
                <p className="mb-0" style={{ color: '#A3A3A3', fontSize: '0.85rem', lineHeight: '1.5' }}>
                  Owner confirms your request and shares pickup location.
                </p>
              </div>
            </Col>
            <Col lg={3} md={6}>
              <div className="process-step">
                <div className="step-number step-3">3</div>
                <FaHandshake className="mb-2" size={22} color="#34D399" />
                <h5 className="fw-bold mb-1" style={{ color: '#F5F5F5', fontSize: '1rem' }}>Pickup & Build</h5>
                <p className="mb-0" style={{ color: '#A3A3A3', fontSize: '0.85rem', lineHeight: '1.5' }}>
                  Collect the tool, complete your project, and return it.
                </p>
              </div>
            </Col>
            <Col lg={3} md={6}>
              <div className="process-step">
                <div className="step-number step-4">4</div>
                <FaUndo className="mb-2" size={22} color="#34D399" />
                <h5 className="fw-bold mb-1" style={{ color: '#F5F5F5', fontSize: '1rem' }}>Return & Review</h5>
                <p className="mb-0" style={{ color: '#A3A3A3', fontSize: '0.85rem', lineHeight: '1.5' }}>
                  Deposit released on safe return. Leave a review.
                </p>
              </div>
            </Col>
          </Row>
        </div>

        {/* Footer */}
        <div className="text-center mt-5">
          <p style={{ color: '#737373', fontSize: '0.85rem' }}>
            <FaMapMarkerAlt className="me-1" size={11} />
            Available in 50+ Indian cities • 
            <FaStar className="ms-3 me-1" size={11} color="#FBBF24" />
            4.9 ★ Community Rating •
            <FaRupeeSign className="ms-3 me-1" size={11} />
            Secure UPI Payments
          </p>
        </div>

      </Container>
    </div>
  );
};

export default DashboardPage;