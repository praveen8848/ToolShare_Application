import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Spinner, Row, Col } from 'react-bootstrap';
import { 
  FaArrowLeft, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaTools, 
  FaUser, 
  FaStar, 
  FaShieldAlt,
  FaMapMarkerAlt,
  FaChartPie
} from 'react-icons/fa';
import NavigationBar from '../components/common/Navbar';

const OwnerProfile = () => {
  const { ownerId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOwnerProfile = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/bookings/public/owner-profile/${ownerId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          }
        });

        if (!response.ok) {
          throw new Error("Failed to load owner profile. They might have been removed.");
        }
        
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerProfile();
  }, [ownerId]);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getTrustLevel = (successRate) => {
    if (successRate >= 90) return { label: 'Excellent', color: '#10b981', icon: '🏆' };
    if (successRate >= 75) return { label: 'Very Good', color: '#34d399', icon: '⭐' };
    if (successRate >= 60) return { label: 'Good', color: '#60a5fa', icon: '👍' };
    if (successRate >= 40) return { label: 'Fair', color: '#fbbf24', icon: '👌' };
    return { label: 'New', color: '#94a3b8', icon: '🌱' };
  };

  if (loading) {
    return (
      <div className="owner-profile-wrapper">
        <NavigationBar />
        <div className="loading-container">
          <Spinner animation="border" />
          <p>Loading owner profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="owner-profile-wrapper">
        <NavigationBar />
        <Container className="py-5">
          <div className="error-container">
            <h4>⚠️ {error}</h4>
            <Button className="back-btn" onClick={() => navigate(-1)}>
              <FaArrowLeft className="me-2" /> Go Back
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  const trustLevel = getTrustLevel(profile?.successRate || 0);

  return (
    <div className="owner-profile-wrapper">
      <style>
        {`
          .owner-profile-wrapper {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            min-height: 100vh;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: #e2e8f0;
            padding-top: 76px;
            padding-bottom: 3rem;
          }
          
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: calc(100vh - 76px);
            color: #94a3b8;
          }
          
          .loading-container .spinner-border {
            color: #60a5fa !important;
            width: 3rem;
            height: 3rem;
            margin-bottom: 1rem;
          }
          
          .error-container {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 20px;
            padding: 3rem;
            text-align: center;
            color: #fca5a5;
            max-width: 500px;
            margin: 0 auto;
          }
          
          .error-container h4 {
            margin-bottom: 1.5rem;
          }
          
          .profile-card {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 24px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            overflow: hidden;
            max-width: 800px;
            margin: 0 auto;
          }
          
          .back-button {
            background: transparent;
            color: #94a3b8;
            border: 1px solid transparent;
            padding: 0.5rem 1rem;
            border-radius: 12px;
            font-weight: 500;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            margin-bottom: 1.5rem;
          }
          
          .back-button:hover {
            color: #60a5fa;
            background: rgba(59, 130, 246, 0.1);
            border-color: rgba(59, 130, 246, 0.2);
          }
          
          .back-btn {
            background: transparent;
            color: #60a5fa;
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 0.75rem 1.5rem;
            font-weight: 600;
            transition: all 0.3s ease;
          }
          
          .back-btn:hover {
            background: rgba(59, 130, 246, 0.1);
            border-color: #60a5fa;
            color: #93c5fd;
          }
          
          .avatar-section {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            padding: 1.5rem 0;
            border-bottom: 1px solid #334155;
          }
          
          .avatar-circle {
            width: 100px;
            height: 100px;
            border-radius: 24px;
            background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5rem;
            font-weight: 700;
            color: white;
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
            border: 3px solid #334155;
            flex-shrink: 0;
          }
          
          .owner-name {
            font-size: 2rem;
            font-weight: 800;
            color: #f1f5f9;
            margin-bottom: 0.25rem;
          }
          
          .member-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 20px;
            padding: 0.35rem 1rem;
            color: #94a3b8;
            font-size: 0.85rem;
          }
          
          .trust-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.9rem;
            margin-top: 0.75rem;
          }
          
          .section-title {
            color: #f1f5f9;
            font-weight: 700;
            font-size: 1.2rem;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }
          
          .stat-card {
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 20px;
            padding: 1.75rem 1.5rem;
            text-align: center;
            height: 100%;
            transition: all 0.3s ease;
          }
          
          .stat-card:hover {
            border-color: #60a5fa;
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.1);
            transform: translateY(-2px);
          }
          
          .stat-icon {
            width: 48px;
            height: 48px;
            border-radius: 14px;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(96, 165, 250, 0.2) 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
            color: #60a5fa;
            border: 1px solid #334155;
          }
          
          .stat-value {
            font-size: 2.5rem;
            font-weight: 800;
            color: #f1f5f9;
            margin-bottom: 0.25rem;
            line-height: 1.2;
          }
          
          .stat-label {
            color: #94a3b8;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 0.5rem;
          }
          
          .stat-desc {
            color: #64748b;
            font-size: 0.8rem;
          }
          
          .success-highlight {
            color: #60a5fa;
          }
          
          .info-row {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem 0;
            border-bottom: 1px solid #334155;
          }
          
          .info-row:last-child {
            border-bottom: none;
          }
          
          .info-icon {
            width: 40px;
            height: 40px;
            border-radius: 12px;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(96, 165, 250, 0.2) 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #60a5fa;
            flex-shrink: 0;
          }
          
          .info-content {
            flex: 1;
          }
          
          .info-label {
            color: #64748b;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
          }
          
          .info-value {
            color: #e2e8f0;
            font-weight: 500;
          }
          
          @media (max-width: 768px) {
            .avatar-section {
              flex-direction: column;
              text-align: center;
            }
            
            .owner-name {
              font-size: 1.5rem;
            }
          }
        `}
      </style>

      <NavigationBar />

      <Container style={{ maxWidth: '850px' }}>
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft className="me-2" /> Back to Tools
        </button>

        <Card className="profile-card">
          <Card.Body className="p-4 p-md-5">
            
            {/* Avatar & Header Section */}
            <div className="avatar-section">
              <div className="avatar-circle">
                {getInitials(profile.name)}
              </div>
              <div className="flex-grow-1">
                <h1 className="owner-name">{profile.name}</h1>
                <div className="d-flex flex-wrap align-items-center gap-3">
                  <span className="member-badge">
                    <FaCalendarAlt size={12} /> 
                    Member since {new Date(profile.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  {profile.isVerified && (
                    <span className="member-badge" style={{ color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                      <FaCheckCircle size={12} /> Verified Owner
                    </span>
                  )}
                </div>
                <div className="trust-badge" style={{ 
                  background: `${trustLevel.color}15`, 
                  color: trustLevel.color,
                  border: `1px solid ${trustLevel.color}30`
                }}>
                  {trustLevel.icon} {trustLevel.label} Trust Level
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="mt-5">
              <div className="section-title">
                <FaChartPie style={{ color: '#60a5fa' }} />
                Community Trust & Activity
              </div>
              
              <Row className="g-4">
                <Col md={6}>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FaCheckCircle size={22} />
                    </div>
                    <div className="stat-value">
                      {profile.successRate}%
                    </div>
                    <div className="stat-label">Success Rate</div>
                    <div className="stat-desc">
                      Based on completed vs. rejected rentals
                    </div>
                  </div>
                </Col>
                
                <Col md={6}>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FaTools size={22} />
                    </div>
                    <div className="stat-value">
                      {profile.totalTools}
                    </div>
                    <div className="stat-label">Active Tools</div>
                    <div className="stat-desc">
                      Tools available for the community
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Additional Info Section */}
            {profile.totalRentals !== undefined && (
              <div className="mt-5">
                <div className="section-title">
                  <FaUser style={{ color: '#60a5fa' }} />
                  Rental History
                </div>
                
                <div className="stat-card" style={{ padding: '1.25rem' }}>
                  <Row className="align-items-center">
                    <Col xs={6}>
                      <div className="info-row" style={{ padding: 0, border: 'none' }}>
                        <div className="info-icon" style={{ width: '36px', height: '36px' }}>
                          <FaCalendarAlt size={14} />
                        </div>
                        <div className="info-content">
                          <div className="info-label">Total Rentals</div>
                          <div className="info-value" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                            {profile.totalRentals || 0}
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="info-row" style={{ padding: 0, border: 'none' }}>
                        <div className="info-icon" style={{ width: '36px', height: '36px' }}>
                          <FaStar size={14} />
                        </div>
                        <div className="info-content">
                          <div className="info-label">Rating</div>
                          <div className="info-value" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fbbf24' }}>
                            {profile.averageRating?.toFixed(1) || '4.8'} ★
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            )}

            {/* Trust Note */}
            <div className="mt-5">
              <div style={{
                background: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.15)',
                borderRadius: '16px',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem'
              }}>
                <FaShieldAlt style={{ color: '#60a5fa', fontSize: '1.25rem', marginTop: '2px' }} />
                <div>
                  <h6 style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Trust & Safety
                  </h6>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 0 }}>
                    This owner's success rate is calculated based on their rental history. 
                    Higher success rates indicate reliable and trustworthy community members.
                  </p>
                </div>
              </div>
            </div>

          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default OwnerProfile;