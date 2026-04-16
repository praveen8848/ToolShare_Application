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
          totalUsers: 5280, // You can fetch this from actual API
          totalRentals: 12450, // You can fetch this from actual API
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
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes glow {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }

          .dashboard-wrapper {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            min-height: 100vh;
            padding-bottom: 4rem;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: #e2e8f0;
          }
          
          .animate-1 { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-2 { opacity: 0; animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards; }
          .animate-3 { opacity: 0; animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; }
          .animate-4 { opacity: 0; animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards; }

          .modern-card {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 20px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
          }
          
          .modern-card:hover {
            border-color: #60a5fa;
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
          }
          
          .action-card {
            text-decoration: none;
            display: flex;
            flex-direction: column;
            height: 100%;
            position: relative;
            overflow: hidden;
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 20px;
            padding: 2rem 1.5rem;
            transition: all 0.3s ease;
          }
          
          .action-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: transparent;
            transition: all 0.3s ease;
          }
          
          .action-card.browse:hover::before { 
            background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%); 
          }
          .action-card.list:hover::before { 
            background: linear-gradient(135deg, #10b981 0%, #34d399 100%); 
          }
          .action-card.bookings:hover::before { 
            background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); 
          }

          .action-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            border-color: #60a5fa;
          }
          
          .icon-box {
            width: 56px;
            height: 56px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.5rem;
            transition: all 0.3s ease;
          }
          
          .action-card:hover .icon-box {
            transform: scale(1.05);
          }
          
          .icon-box.browse { 
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(96, 165, 250, 0.2) 100%);
            color: #60a5fa;
            border: 1px solid rgba(59, 130, 246, 0.3);
          }
          
          .icon-box.list { 
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(52, 211, 153, 0.2) 100%);
            color: #34d399;
            border: 1px solid rgba(16, 185, 129, 0.3);
          }
          
          .icon-box.bookings { 
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(251, 191, 36, 0.2) 100%);
            color: #fbbf24;
            border: 1px solid rgba(245, 158, 11, 0.3);
          }
          
          .icon-box.stats { 
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            color: #60a5fa;
            border: 1px solid #334155;
          }

          .welcome-banner {
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            border-radius: 24px;
            color: white;
            position: relative;
            overflow: hidden;
            border: 1px solid #334155;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            padding: 3rem 2.5rem;
            margin-bottom: 2.5rem;
          }
          
          .welcome-banner::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -10%;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
          }
          
          .welcome-banner::after {
            content: '';
            position: absolute;
            bottom: -30%;
            left: -5%;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            animation: glow 4s ease-in-out infinite;
          }
          
          .btn-icon-link {
            display: inline-flex;
            align-items: center;
            font-size: 0.9rem;
            font-weight: 600;
            margin-top: auto;
            transition: all 0.3s ease;
            gap: 6px;
            padding: 0.5rem 0;
          }
          
          .action-card:hover .btn-icon-link {
            gap: 12px;
          }
          
          .process-step {
            position: relative;
            padding: 2rem 1.5rem;
            border-radius: 16px;
            background: #0f172a;
            border: 1px solid #334155;
            transition: all 0.3s ease;
            height: 100%;
          }
          
          .process-step:hover {
            background: #1e293b;
            border-color: #60a5fa;
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
            transform: translateY(-4px);
          }
          
          .step-number {
            position: absolute;
            top: -15px;
            left: 20px;
            width: 36px;
            height: 36px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1rem;
            color: white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }
          
          .stat-card {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 20px;
            padding: 1.5rem;
            transition: all 0.3s ease;
            height: 100%;
          }
          
          .stat-card:hover {
            border-color: #60a5fa;
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.1);
            transform: translateY(-2px);
          }
          
          .gradient-text {
            background: linear-gradient(135deg, #60a5fa 0%, #34d399 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .section-title {
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            font-size: 0.8rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
          }
          
          .indian-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            border: 1px solid #334155;
            border-radius: 100px;
            padding: 0.5rem 1.25rem;
            color: #60a5fa;
            font-size: 0.85rem;
            margin-bottom: 1.5rem;
          }
        `}
      </style>

      <Container className="pt-4">
        
        {/* Welcome Banner */}
        <div className="welcome-banner animate-1">
          <Row className="align-items-center position-relative" style={{ zIndex: 1 }}>
            <Col lg={8}>
              <div className="indian-badge">
                <FaLeaf size={12} />
                <span>Proudly Indian • Community Driven</span>
                <FaRupeeSign size={12} className="ms-1" />
              </div>
              <h1 className="fw-extrabold mb-3" style={{ 
                fontSize: 'clamp(2rem, 5vw, 2.8rem)', 
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Welcome back, {user?.name?.split(' ')[0] || 'Builder'}!
              </h1>
              <p className="mb-0" style={{ 
                fontSize: '1.1rem', 
                lineHeight: '1.7', 
                maxWidth: '90%',
                color: '#94a3b8'
              }}>
                Your gateway to India's largest tool-sharing community. 
                Borrow what you need, share what you have, and build a sustainable future together.
              </p>
            </Col>
            <Col lg={4} className="text-lg-end mt-4 mt-lg-0">
              <div className="d-inline-block p-4 rounded-4" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <FaTools size={48} style={{ color: '#60a5fa' }} />
              </div>
            </Col>
          </Row>
        </div>

        {/* Platform Stats */}
        <div className="animate-2">
          <h6 className="section-title">
            <FaLayerGroup className="me-2" size={12} />
            Platform Overview
          </h6>
          <Row className="mb-5 g-4">
            <Col md={3} sm={6}>
              <div className="stat-card">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <FaTools size={24} style={{ color: '#60a5fa' }} />
                  <span style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>↑ 12%</span>
                </div>
                <h3 className="fw-bold mb-1" style={{ color: '#f1f5f9' }}>
                  {stats.loading ? <Spinner animation="border" size="sm" /> : stats.totalTools.toLocaleString('en-IN')}
                </h3>
                <p className="mb-0" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Active Tools</p>
              </div>
            </Col>
            <Col md={3} sm={6}>
              <div className="stat-card">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <FaLayerGroup size={24} style={{ color: '#8b5cf6' }} />
                  <span style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>↑ 8%</span>
                </div>
                <h3 className="fw-bold mb-1" style={{ color: '#f1f5f9' }}>
                  {stats.loading ? <Spinner animation="border" size="sm" /> : stats.totalCategories}
                </h3>
                <p className="mb-0" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Categories</p>
              </div>
            </Col>
            <Col md={3} sm={6}>
              <div className="stat-card">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <FaUsers size={24} style={{ color: '#f59e0b' }} />
                  <span style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>↑ 25%</span>
                </div>
                <h3 className="fw-bold mb-1" style={{ color: '#f1f5f9' }}>
                  {stats.loading ? <Spinner animation="border" size="sm" /> : stats.totalUsers.toLocaleString('en-IN')}+
                </h3>
                <p className="mb-0" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Community Members</p>
              </div>
            </Col>
            <Col md={3} sm={6}>
              <div className="stat-card">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <FaHandshake size={24} style={{ color: '#ec4899' }} />
                  <span style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>↑ 18%</span>
                </div>
                <h3 className="fw-bold mb-1" style={{ color: '#f1f5f9' }}>
                  {stats.loading ? <Spinner animation="border" size="sm" /> : stats.totalRentals.toLocaleString('en-IN')}+
                </h3>
                <p className="mb-0" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Successful Rentals</p>
              </div>
            </Col>
          </Row>
        </div>

        {/* Quick Actions */}
        <div className="animate-3">
          <h6 className="section-title">
            <FaArrowRight className="me-2" size={12} />
            Quick Actions
          </h6>
          <Row className="mb-5 g-4">
            <Col lg={4} md={6}>
              <Link to="/browse" className="action-card browse">
                <div className="icon-box browse">
                  <FaSearch size={22} />
                </div>
                <h4 className="fw-bold mb-3" style={{ color: '#f1f5f9' }}>Find Tools</h4>
                <p className="mb-4" style={{ color: '#94a3b8', lineHeight: '1.6' }}>
                  Browse thousands of tools available in your neighborhood. Filter by category, price, and distance.
                </p>
                <div className="btn-icon-link" style={{ color: '#60a5fa' }}>
                  Browse Inventory <FaArrowRight size={14} />
                </div>
              </Link>
            </Col>
            <Col lg={4} md={6}>
              <Link to="/add-tool" className="action-card list">
                <div className="icon-box list">
                  <FaPlus size={22} />
                </div>
                <h4 className="fw-bold mb-3" style={{ color: '#f1f5f9' }}>List a Tool</h4>
                <p className="mb-4" style={{ color: '#94a3b8', lineHeight: '1.6' }}>
                  Put your idle tools to work and earn up to ₹5,000/month. Set your own rates and availability.
                </p>
                <div className="btn-icon-link" style={{ color: '#34d399' }}>
                  Create Listing <FaArrowRight size={14} />
                </div>
              </Link>
            </Col>
            <Col lg={4} md={6}>
              <Link to="/my-bookings" className="action-card bookings">
                <div className="icon-box bookings">
                  <FaCalendarAlt size={22} />
                </div>
                <h4 className="fw-bold mb-3" style={{ color: '#f1f5f9' }}>My Bookings</h4>
                <p className="mb-4" style={{ color: '#94a3b8', lineHeight: '1.6' }}>
                  Track your rentals, manage approvals, and coordinate pickups all in one place.
                </p>
                <div className="btn-icon-link" style={{ color: '#fbbf24' }}>
                  View Schedule <FaArrowRight size={14} />
                </div>
              </Link>
            </Col>
          </Row>
        </div>

        {/* How It Works */}
        <div className="animate-4">
          <h6 className="section-title">
            <FaClipboardCheck className="me-2" size={12} />
            How ToolShare Works
          </h6>
          <div className="modern-card p-4 p-xl-5 mb-4">
            <Row className="g-4 mt-2">
              <Col lg={3} md={6}>
                <div className="process-step">
                  <div className="step-number" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)' }}>1</div>
                  <FaSearch className="mb-3 mt-2" size={28} color="#60a5fa" />
                  <h5 className="fw-bold mb-2" style={{ color: '#f1f5f9' }}>Discover & Request</h5>
                  <p className="mb-0" style={{ color: '#94a3b8', lineHeight: '1.6', fontSize: '0.9rem' }}>
                    Find the perfect tool nearby, check availability, and send a booking request.
                  </p>
                </div>
              </Col>
              <Col lg={3} md={6}>
                <div className="process-step">
                  <div className="step-number" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)' }}>2</div>
                  <FaClipboardCheck className="mb-3 mt-2" size={28} color="#a78bfa" />
                  <h5 className="fw-bold mb-2" style={{ color: '#f1f5f9' }}>Get Approved</h5>
                  <p className="mb-0" style={{ color: '#94a3b8', lineHeight: '1.6', fontSize: '0.9rem' }}>
                    Owner confirms your request and shares pickup location and contact details.
                  </p>
                </div>
              </Col>
              <Col lg={3} md={6}>
                <div className="process-step">
                  <div className="step-number" style={{ background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' }}>3</div>
                  <FaHandshake className="mb-3 mt-2" size={28} color="#34d399" />
                  <h5 className="fw-bold mb-2" style={{ color: '#f1f5f9' }}>Pickup & Build</h5>
                  <p className="mb-0" style={{ color: '#94a3b8', lineHeight: '1.6', fontSize: '0.9rem' }}>
                    Collect the tool, complete your project, and return it in the same condition.
                  </p>
                </div>
              </Col>
              <Col lg={3} md={6}>
                <div className="process-step">
                  <div className="step-number" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' }}>4</div>
                  <FaUndo className="mb-3 mt-2" size={28} color="#fbbf24" />
                  <h5 className="fw-bold mb-2" style={{ color: '#f1f5f9' }}>Return & Review</h5>
                  <p className="mb-0" style={{ color: '#94a3b8', lineHeight: '1.6', fontSize: '0.9rem' }}>
                    Deposit is released upon safe return. Leave a review to help the community.
                  </p>
                </div>
              </Col>
            </Row>
          </div>
        </div>

        {/* Indian Context Footer */}
        <div className="text-center mt-5 animate-4">
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            <FaMapMarkerAlt className="me-1" size={12} />
            Available in 50+ Indian cities • 
            <FaStar className="ms-3 me-1" size={12} color="#fbbf24" />
            4.9 ★ Community Rating •
            <FaRupeeSign className="ms-3 me-1" size={12} />
            Secure UPI Payments
          </p>
        </div>

      </Container>
    </div>
  );
};

export default DashboardPage;