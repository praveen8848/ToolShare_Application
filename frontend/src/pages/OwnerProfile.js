import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Spinner, Row, Col } from 'react-bootstrap';
import { 
  FaArrowLeft, FaCalendarAlt, FaCheckCircle, FaTools, 
  FaUser, FaStar, FaShieldAlt, FaChartPie
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
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error("Failed to load owner profile.");
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
    if (successRate >= 90) return { label: 'Excellent', color: '#10B981', icon: '🏆' };
    if (successRate >= 75) return { label: 'Very Good', color: '#34D399', icon: '⭐' };
    if (successRate >= 60) return { label: 'Good', color: '#34D399', icon: '👍' };
    if (successRate >= 40) return { label: 'Fair', color: '#F59E0B', icon: '👌' };
    return { label: 'New', color: '#A3A3A3', icon: '🌱' };
  };

  if (loading) {
    return (
      <div className="owner-profile-wrapper">
        <style>{`.owner-profile-wrapper { background: #121212; min-height: 100vh; padding-top: 76px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }`}</style>
        <NavigationBar />
        <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 76px)', color: '#A3A3A3' }}>
          <Spinner animation="border" style={{ color: '#34D399', width: '3rem', height: '3rem', marginBottom: '1rem' }} />
          <p>Loading owner profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="owner-profile-wrapper">
        <style>{`.owner-profile-wrapper { background: #121212; min-height: 100vh; padding-top: 76px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }`}</style>
        <NavigationBar />
        <Container className="py-5">
          <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '14px', padding: '2.5rem', textAlign: 'center', color: '#FCA5A5', maxWidth: '440px', margin: '0 auto' }}>
            <h4 style={{ marginBottom: '1rem' }}>⚠️ {error}</h4>
            <Button style={{ background: '#10B981', color: '#121212', border: 'none', borderRadius: '10px', padding: '0.6rem 1.5rem', fontWeight: 600 }} onClick={() => navigate(-1)}>
              <FaArrowLeft className="me-2" size={12} /> Go Back
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
            background: #121212;
            min-height: 100vh;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: #E5E5E5;
            padding-top: 76px;
            padding-bottom: 3rem;
          }
          
          .profile-card {
            background: #1E1E1E;
            border: 1px solid #2A2A2A;
            border-radius: 14px;
            overflow: hidden;
            max-width: 800px;
            margin: 0 auto;
          }
          
          .back-btn {
            background: transparent;
            color: #A3A3A3;
            border: 1px solid #2A2A2A;
            padding: 0.4rem 0.9rem;
            border-radius: 8px;
            font-weight: 500;
            font-size: 0.85rem;
            display: inline-flex;
            align-items: center;
            margin-bottom: 1.25rem;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .back-btn:hover { border-color: #3A3A3A; color: #E5E5E5; }
          
          .avatar-section {
            display: flex;
            align-items: center;
            gap: 1.25rem;
            padding-bottom: 1.25rem;
            border-bottom: 1px solid #2A2A2A;
          }
          
          .avatar-circle {
            width: 88px; height: 88px;
            border-radius: 16px;
            background: #10B981;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            font-weight: 700;
            color: #121212;
            border: 1px solid #10B981;
            flex-shrink: 0;
          }
          
          .owner-name {
            font-size: 1.5rem;
            font-weight: 700;
            color: #F5F5F5;
            margin-bottom: 0.15rem;
          }
          
          .member-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            background: #0A0A0A;
            border: 1px solid #2A2A2A;
            border-radius: 8px;
            padding: 0.25rem 0.75rem;
            color: #A3A3A3;
            font-size: 0.8rem;
          }
          
          .trust-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            padding: 0.35rem 0.75rem;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.8rem;
            margin-top: 0.5rem;
          }
          
          .section-title {
            color: #F5F5F5;
            font-weight: 600;
            font-size: 1rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .section-title svg { color: #34D399; }
          
          .stat-card {
            background: #0A0A0A;
            border: 1px solid #2A2A2A;
            border-radius: 12px;
            padding: 1.25rem;
            text-align: center;
            height: 100%;
          }
          
          .stat-icon {
            width: 40px; height: 40px;
            border-radius: 10px;
            background: rgba(16,185,129,0.08);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 0.75rem;
            color: #34D399;
            border: 1px solid rgba(16,185,129,0.15);
          }
          
          .stat-value {
            font-size: 2rem;
            font-weight: 700;
            color: #F5F5F5;
            margin-bottom: 0.15rem;
          }
          
          .stat-label {
            color: #A3A3A3;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-bottom: 0.25rem;
          }
          
          .stat-desc { color: #737373; font-size: 0.75rem; }
          
          .info-row {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }
          
          .info-icon {
            width: 34px; height: 34px;
            border-radius: 8px;
            background: rgba(16,185,129,0.08);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #34D399;
            flex-shrink: 0;
          }
          
          .info-label {
            color: #737373;
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-bottom: 1px;
          }
          
          .info-value { color: #E5E5E5; font-weight: 500; }
          
          .trust-note {
            background: rgba(16,185,129,0.04);
            border: 1px solid rgba(16,185,129,0.1);
            border-radius: 12px;
            padding: 1rem 1.25rem;
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
          }
          
          .trust-note svg { color: #34D399; margin-top: 2px; flex-shrink: 0; }
          
          .trust-note h6 { color: #F5F5F5; font-weight: 600; margin-bottom: 0.35rem; }
          .trust-note p { color: #A3A3A3; font-size: 0.85rem; margin-bottom: 0; }

          @media (max-width: 768px) {
            .avatar-section { flex-direction: column; text-align: center; }
            .owner-name { font-size: 1.3rem; }
          }
        `}
      </style>

      <NavigationBar />

      <Container style={{ maxWidth: '800px' }}>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft className="me-2" size={14} /> Back to Tools
        </button>

        <div className="profile-card">
          <div className="p-4">
            
            <div className="avatar-section">
              <div className="avatar-circle">{getInitials(profile.name)}</div>
              <div className="flex-grow-1">
                <h1 className="owner-name">{profile.name}</h1>
                <div className="d-flex flex-wrap align-items-center gap-2">
                  <span className="member-badge">
                    <FaCalendarAlt size={11} /> 
                    Member since {new Date(profile.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  {profile.isVerified && (
                    <span className="member-badge" style={{ color: '#34D399', borderColor: 'rgba(16,185,129,0.2)' }}>
                      <FaCheckCircle size={11} /> Verified
                    </span>
                  )}
                </div>
                <div className="trust-badge" style={{ background: `${trustLevel.color}12`, color: trustLevel.color, border: `1px solid ${trustLevel.color}25` }}>
                  {trustLevel.icon} {trustLevel.label} Trust Level
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="section-title"><FaChartPie size={16} /> Community Trust & Activity</div>
              <Row className="g-3">
                <Col md={6}>
                  <div className="stat-card">
                    <div className="stat-icon"><FaCheckCircle size={18} /></div>
                    <div className="stat-value">{profile.successRate}%</div>
                    <div className="stat-label">Success Rate</div>
                    <div className="stat-desc">Completed vs. rejected rentals</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="stat-card">
                    <div className="stat-icon"><FaTools size={18} /></div>
                    <div className="stat-value">{profile.totalTools}</div>
                    <div className="stat-label">Active Tools</div>
                    <div className="stat-desc">Available for the community</div>
                  </div>
                </Col>
              </Row>
            </div>

            {profile.totalRentals !== undefined && (
              <div className="mt-4">
                <div className="section-title"><FaUser size={16} /> Rental History</div>
                <div className="stat-card" style={{ textAlign: 'left' }}>
                  <Row>
                    <Col xs={6}>
                      <div className="info-row">
                        <div className="info-icon"><FaCalendarAlt size={12} /></div>
                        <div>
                          <div className="info-label">Total Rentals</div>
                          <div className="info-value" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{profile.totalRentals || 0}</div>
                        </div>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="info-row">
                        <div className="info-icon"><FaStar size={12} /></div>
                        <div>
                          <div className="info-label">Rating</div>
                          <div className="info-value" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FBBF24' }}>{profile.averageRating?.toFixed(1) || '4.8'} ★</div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            )}

            <div className="mt-4">
              <div className="trust-note">
                <FaShieldAlt size={16} />
                <div>
                  <h6>Trust & Safety</h6>
                  <p>This owner's success rate is based on their rental history. Higher rates indicate reliable community members.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </Container>
    </div>
  );
};

export default OwnerProfile;