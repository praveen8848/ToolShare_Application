import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
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
  FaUndo,
  FaStore,
  FaStar,
  FaShieldAlt,
  FaClock,
  FaRegSmile,
  FaChartLine
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
          @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&display=swap');
          
          .dashboard-wrapper {
            background: linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);
            min-height: 100vh;
            padding-bottom: 5rem;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            position: relative;
          }
          
          .dashboard-wrapper::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
                              radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.03) 0%, transparent 50%);
            pointer-events: none;
            z-index: 0;
          }
          
          .dashboard-wrapper > * {
            position: relative;
            z-index: 1;
          }
          
          .hero-section {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            border-radius: 32px;
            position: relative;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }
          
          .hero-section::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -20%;
            width: 80%;
            height: 200%;
            background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
          }
          
          .hero-section::after {
            content: '';
            position: absolute;
            bottom: -30%;
            left: -10%;
            width: 60%;
            height: 150%;
            background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
          }
          
          .hero-greeting {
            font-size: 3.5rem;
            font-weight: 800;
            letter-spacing: -0.02em;
            background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 1rem;
          }
          
          .stat-card {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 24px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
            position: relative;
            padding: 1.5rem;
          }
          
          .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6, #10b981);
          }
          
          .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.1);
            background: rgba(255, 255, 255, 0.95);
          }
          
          .stat-icon-wrapper {
            width: 56px;
            height: 56px;
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
          }
          
          .stat-card:hover .stat-icon-wrapper {
            transform: scale(1.05) rotate(5deg);
          }
          
          .action-card {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 24px;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            text-decoration: none;
            display: flex;
            flex-direction: column;
            height: 100%;
            position: relative;
            overflow: hidden;
            padding: 1.5rem;
          }
          
          .action-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
            opacity: 0;
            transition: opacity 0.4s ease;
          }
          
          .action-card:hover {
            transform: translateY(-8px);
            background: rgba(255, 255, 255, 0.95);
            border-color: rgba(59, 130, 246, 0.3);
            box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15);
          }
          
          .action-card:hover::before {
            opacity: 1;
          }
          
          .action-icon {
            width: 64px;
            height: 64px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.5rem;
            transition: all 0.3s ease;
            position: relative;
          }
          
          .action-card:hover .action-icon {
            transform: scale(1.05);
          }
          
          .action-icon.search { background: linear-gradient(135deg, #eff6ff, #dbeafe); color: #3b82f6; }
          .action-icon.add { background: linear-gradient(135deg, #f0fdf4, #dcfce7); color: #10b981; }
          .action-icon.calendar { background: linear-gradient(135deg, #fef3c7, #fde68a); color: #f59e0b; }
          
          .action-title {
            font-size: 1.35rem;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 0.75rem;
          }
          
          .action-description {
            color: #64748b;
            font-size: 0.9rem;
            line-height: 1.5;
            margin-bottom: 1.5rem;
          }
          
          .action-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
            font-size: 0.875rem;
            transition: all 0.3s ease;
            margin-top: auto;
          }
          
          .action-card:hover .action-link {
            gap: 12px;
          }
          
          .process-section {
            background: white;
            border-radius: 32px;
            padding: 2rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
            border: 1px solid #eef2ff;
          }
          
          .process-step-card {
            position: relative;
            padding: 1.75rem;
            border-radius: 20px;
            background: linear-gradient(135deg, #fafbff 0%, #ffffff 100%);
            transition: all 0.3s ease;
            border: 1px solid #eef2ff;
            height: 100%;
          }
          
          .process-step-card:hover {
            transform: translateY(-4px);
            border-color: #c7d2fe;
            box-shadow: 0 12px 24px -12px rgba(0, 0, 0, 0.1);
          }
          
          .step-badge {
            position: absolute;
            top: -12px;
            left: 24px;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 0.875rem;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }
          
          .step-icon-wrapper {
            width: 56px;
            height: 56px;
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.25rem;
            margin-top: 0.5rem;
          }
          
          .section-header {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            margin-bottom: 1.5rem;
          }
          
          .section-title {
            font-size: 1.5rem;
            font-weight: 700;
            letter-spacing: -0.01em;
            color: #0f172a;
            position: relative;
            display: inline-block;
          }
          
          .section-title::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 0;
            width: 40px;
            height: 3px;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6);
            border-radius: 2px;
          }
          
          .btn-outline-premium {
            background: transparent;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            font-weight: 500;
            color: #64748b;
            transition: all 0.2s ease;
            cursor: pointer;
          }
          
          .btn-outline-premium:hover {
            background: #f8fafc;
            border-color: #cbd5e1;
            color: #0f172a;
          }
          
          .spinner-premium {
            width: 1.5rem;
            height: 1.5rem;
            border: 2px solid #e2e8f0;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
          }
          
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          @media (max-width: 768px) {
            .hero-greeting {
              font-size: 2rem;
            }
            
            .action-title {
              font-size: 1.2rem;
            }
            
            .process-section {
              padding: 1.25rem;
            }
          }
        `}
      </style>

      <Container className="pt-5">
        {/* Hero Section */}
        <div className="hero-section p-4 p-md-5 mb-5">
          <div className="position-relative" style={{ zIndex: 2 }}>
            <div className="row align-items-center">
              <div className="col-lg-8">
                <div className="mb-3">
                  <span className="badge bg-white bg-opacity-10 text-white px-3 py-2 rounded-pill mb-3" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    <FaStar className="me-1" size={12} /> Welcome Back
                  </span>
                </div>
                <h1 className="hero-greeting">
                  Hello, {user?.name?.split(' ')[0] || 'Builder'}.
                </h1>
                <p className="text-white-50 mb-4" style={{ fontSize: '1.1rem', lineHeight: '1.6', maxWidth: '85%' }}>
                  Ready to share your tools or find what you need? ToolShare is your trusted platform for community-powered tool lending.
                </p>
                <div className="d-flex gap-3 flex-wrap">
                  <div className="d-flex align-items-center text-white-50 small">
                    <FaShieldAlt className="me-2" /> Secure Transactions
                  </div>
                  <div className="d-flex align-items-center text-white-50 small">
                    <FaClock className="me-2" /> 24/7 Support
                  </div>
                  <div className="d-flex align-items-center text-white-50 small">
                    <FaRegSmile className="me-2" /> 1000+ Happy Borrowers
                  </div>
                </div>
              </div>
              <div className="col-lg-4 d-none d-lg-block">
                <div className="text-center">
                  <FaChartLine size={80} className="text-white-50 opacity-25" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="section-header">
          <h3 className="section-title">Platform Insights</h3>
          <button className="btn-outline-premium" onClick={() => window.location.href = '/browse'}>
            View Marketplace →
          </button>
        </div>
        
        <div className="row mb-5 g-4">
          <div className="col-md-6 col-lg-4">
            <div className="stat-card">
              <div className="d-flex align-items-start justify-content-between mb-3">
                <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)' }}>
                  <FaTools size={24} color="#3b82f6" />
                </div>
                <FaChartLine size={20} color="#10b981" className="opacity-50" />
              </div>
              <p className="text-muted mb-1 small fw-semibold text-uppercase">Total Tools Listed</p>
              <h2 className="display-5 fw-bold mb-0" style={{ color: '#0f172a' }}>
                {stats.loading ? <div className="spinner-premium"></div> : stats.totalTools}
              </h2>
              <div className="mt-2">
                <span className="badge bg-success bg-opacity-10 text-success px-2 py-1 rounded-pill" style={{ fontSize: '0.7rem' }}>
                  +12% this month
                </span>
              </div>
            </div>
          </div>
          
          <div className="col-md-6 col-lg-4">
            <div className="stat-card">
              <div className="d-flex align-items-start justify-content-between mb-3">
                <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}>
                  <FaLayerGroup size={24} color="#10b981" />
                </div>
                <FaStore size={20} color="#8b5cf6" className="opacity-50" />
              </div>
              <p className="text-muted mb-1 small fw-semibold text-uppercase">Categories Available</p>
              <h2 className="display-5 fw-bold mb-0" style={{ color: '#0f172a' }}>
                {stats.loading ? <div className="spinner-premium"></div> : stats.totalCategories}
              </h2>
              <div className="mt-2">
                <span className="badge bg-info bg-opacity-10 text-info px-2 py-1 rounded-pill" style={{ fontSize: '0.7rem' }}>
                  Wide Selection
                </span>
              </div>
            </div>
          </div>
          
          <div className="col-lg-4 d-none d-lg-block">
            <div className="stat-card">
              <div className="d-flex align-items-start justify-content-between mb-3">
                <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #fff7ed, #ffedd5)' }}>
                  <FaStar size={24} color="#f59e0b" />
                </div>
                <FaRegSmile size={20} color="#10b981" className="opacity-50" />
              </div>
              <p className="text-muted mb-1 small fw-semibold text-uppercase">Community Rating</p>
              <h2 className="display-5 fw-bold mb-0" style={{ color: '#0f172a' }}>4.92</h2>
              <div className="mt-2">
                <span className="badge bg-warning bg-opacity-10 text-warning px-2 py-1 rounded-pill" style={{ fontSize: '0.7rem' }}>
                  ⭐ Excellent
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="section-header">
          <h3 className="section-title">Quick Actions</h3>
          <button className="btn-outline-premium" onClick={() => window.location.href = '/my-bookings'}>
            View All Actions →
          </button>
        </div>
        
        <div className="row mb-5 g-4">
          <div className="col-md-4">
            <Link to="/browse" className="action-card">
              <div className="action-icon search">
                <FaSearch size={26} />
              </div>
              <h5 className="action-title">Discover Tools</h5>
              <p className="action-description">
                Browse through our curated collection of tools from trusted local owners.
              </p>
              <div className="action-link" style={{ color: '#3b82f6' }}>
                Explore now <FaArrowRight size={12} />
              </div>
            </Link>
          </div>
          
          <div className="col-md-4">
            <Link to="/add-tool" className="action-card">
              <div className="action-icon add">
                <FaPlus size={26} />
              </div>
              <h5 className="action-title">Share Your Tools</h5>
              <p className="action-description">
                Turn your idle tools into income. List them in minutes and start earning.
              </p>
              <div className="action-link" style={{ color: '#10b981' }}>
                Start earning <FaArrowRight size={12} />
              </div>
            </Link>
          </div>
          
          <div className="col-md-4">
            <Link to="/my-bookings" className="action-card">
              <div className="action-icon calendar">
                <FaCalendarAlt size={26} />
              </div>
              <h5 className="action-title">Manage Rentals</h5>
              <p className="action-description">
                Track your bookings, view upcoming rentals, and manage your schedule.
              </p>
              <div className="action-link" style={{ color: '#f59e0b' }}>
                View calendar <FaArrowRight size={12} />
              </div>
            </Link>
          </div>
        </div>

        {/* How It Works */}
        <div className="section-header">
          <h3 className="section-title">How ToolShare Works</h3>
          <button className="btn-outline-premium" onClick={() => window.location.href = '/about'}>
            Learn More →
          </button>
        </div>
        
        <div className="process-section">
          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <div className="process-step-card">
                <div className="step-badge">1</div>
                <div className="step-icon-wrapper" style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)' }}>
                  <FaSearch size={28} color="#3b82f6" />
                </div>
                <h6 className="fw-bold mb-2" style={{ color: '#0f172a' }}>Find & Request</h6>
                <p className="text-muted small mb-0">
                  Search for the tool you need, select your dates, and submit a booking request.
                </p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="process-step-card">
                <div className="step-badge">2</div>
                <div className="step-icon-wrapper" style={{ background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)' }}>
                  <FaClipboardCheck size={28} color="#8b5cf6" />
                </div>
                <h6 className="fw-bold mb-2" style={{ color: '#0f172a' }}>Get Approved</h6>
                <p className="text-muted small mb-0">
                  Owner reviews your request. Once approved, receive pickup details instantly.
                </p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="process-step-card">
                <div className="step-badge">3</div>
                <div className="step-icon-wrapper" style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' }}>
                  <FaHandshake size={28} color="#10b981" />
                </div>
                <h6 className="fw-bold mb-2" style={{ color: '#0f172a' }}>Pickup & Build</h6>
                <p className="text-muted small mb-0">
                  Pick up the tool, complete your project, and return it on time.
                </p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="process-step-card">
                <div className="step-badge">4</div>
                <div className="step-icon-wrapper" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
                  <FaUndo size={28} color="#f59e0b" />
                </div>
                <h6 className="fw-bold mb-2" style={{ color: '#0f172a' }}>Return & Review</h6>
                <p className="text-muted small mb-0">
                  Return the tool, get your deposit back, and leave a review for the community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default DashboardPage;