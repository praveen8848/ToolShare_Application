import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import ownerService from '../services/ownerService';       
import bookingService from '../services/bookingService';   
import { toast } from 'react-toastify';
import { 
  FaEnvelope, FaInfoCircle, FaSave, FaCheckCircle, FaShieldAlt, 
  FaChartBar, FaPaperPlane, FaCalendarAlt, FaRupeeSign, FaTools,
  FaEye, FaEdit, FaUserCircle
} from 'react-icons/fa';

const UserAvatar = ({ name, size = 150 }) => {
  const initials = name?.split(' ')?.map(word => word[0])?.join('')?.toUpperCase()?.slice(0, 2);
  const colors = ['#10B981', '#34D399', '#059669', '#047857', '#6EE7B7'];
  const colorIndex = (name || '').length % colors.length;
  
  return (
    <div style={{
      width: `${size}px`, height: `${size}px`, borderRadius: '50%',
      backgroundColor: colors[colorIndex], display: 'flex', alignItems: 'center',
      justifyContent: 'center', margin: '0 auto',
      border: '3px solid #2A2A2A'
    }}>
      <span style={{ color: '#121212', fontWeight: 700, fontSize: `${size * 0.38}px` }}>
        {initials || 'U'}
      </span>
    </div>
  );
};

const ProfilePage = () => {
  const { refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [liveStats, setLiveStats] = useState({ tools: 0, rentals: 0, successRate: 0, totalEarnings: 0, calculating: true });
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => { loadProfileAndStats(); }, []);

  const loadProfileAndStats = async () => {
    setLoading(true);
    try {
      const data = await userService.getProfile();
      setProfile(data);
      setFormData({ name: data.name || '' });
      try {
        const [myTools, myBookings] = await Promise.all([
          ownerService.getMyTools().catch(() => []),
          bookingService.getUserBookings().catch(() => [])
        ]);
        const completed = myBookings.filter(b => b.status === 'COMPLETED').length;
        const totalFinished = myBookings.filter(b => ['COMPLETED', 'REJECTED', 'CANCELLED'].includes(b.status)).length;
        const successRate = totalFinished > 0 ? Math.round((completed / totalFinished) * 100) : 100;
        const completedBookings = myBookings.filter(b => b.status === 'COMPLETED');
        setLiveStats({
          tools: myTools.length || 0,
          rentals: myBookings.length || 0,
          successRate: myBookings.length === 0 ? 0 : successRate,
          totalEarnings: completedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
          calculating: false
        });
      } catch { setLiveStats(prev => ({ ...prev, calculating: false })); }
    } catch { toast.error('Failed to load profile'); } finally { setLoading(false); }
  };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userService.updateProfile(formData);
      await refreshUserProfile();
      toast.success('Profile updated!');
      setIsEditing(false);
      await loadProfileAndStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await userService.resendVerification();
      toast.success('Verification email sent!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send verification email.');
    } finally { setResending(false); }
  };

  if (loading && !profile) {
    return (
      <div className="profile-wrapper">
        <style>{`.profile-wrapper { background: #121212; min-height: 100vh; padding-top: 76px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }`}</style>
        <Container className="py-5 text-center">
          <Spinner animation="border" style={{ color: '#34D399' }} />
          <p style={{ color: '#A3A3A3', marginTop: '1rem' }}>Loading your profile...</p>
        </Container>
      </div>
    );
  }

  return (
    <div className="profile-wrapper">
      <style>
        {`
          .profile-wrapper {
            background: #121212;
            min-height: 100vh;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: #E5E5E5;
            padding-bottom: 3rem;
            padding-top: 76px;
          }
          
          .page-header {
            padding: 0 0 1.25rem;
            border-bottom: 1px solid #2A2A2A;
            margin-bottom: 1.5rem;
          }

          .page-header h1 { font-weight: 700; color: #F5F5F5; font-size: 2rem; }
          
          .profile-card {
            background: #1E1E1E;
            border: 1px solid #2A2A2A;
            border-radius: 14px;
            overflow: hidden;
            margin-bottom: 1.25rem;
          }
          
          .info-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1rem;
          }
          
          .info-icon {
            width: 36px; height: 36px;
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
          
          .info-value { color: #E5E5E5; font-weight: 500; font-size: 0.9rem; }
          
          .trust-section {
            margin-top: 1.25rem;
            padding-top: 1.25rem;
            border-top: 1px solid #2A2A2A;
          }
          
          .trust-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.4rem;
            color: #A3A3A3;
            font-weight: 600;
            font-size: 0.85rem;
          }
          
          .trust-value { color: #34D399; font-weight: 700; font-size: 1.1rem; }
          
          .progress-bar-custom {
            height: 6px;
            background: #0A0A0A;
            border-radius: 3px;
            overflow: hidden;
            border: 1px solid #2A2A2A;
          }
          
          .progress-fill { height: 100%; border-radius: 3px; }
          .progress-fill.high { background: #10B981; }
          .progress-fill.medium { background: #F59E0B; }
          .progress-fill.low { background: #EF4444; }
          
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
          
          .stat-card {
            background: #0A0A0A;
            border: 1px solid #2A2A2A;
            border-radius: 12px;
            padding: 1rem;
            text-align: center;
          }
          
          .stat-icon {
            width: 36px; height: 36px;
            border-radius: 8px;
            background: rgba(16,185,129,0.08);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 0.5rem;
            color: #34D399;
          }
          
          .stat-value {
            color: #F5F5F5;
            font-weight: 700;
            font-size: 1.3rem;
            margin-bottom: 0.15rem;
          }
          
          .stat-label {
            color: #737373;
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          
          .form-section {
            background: #1E1E1E;
            border: 1px solid #2A2A2A;
            border-radius: 14px;
            overflow: hidden;
          }
          
          .form-header {
            padding: 1rem 1.25rem;
            border-bottom: 1px solid #2A2A2A;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          
          .form-header h6 { color: #F5F5F5; font-weight: 600; margin: 0; font-size: 0.95rem; }
          
          .form-body { padding: 1.25rem; }
          
          .form-label-custom {
            color: #A3A3A3;
            font-weight: 600;
            font-size: 0.85rem;
            margin-bottom: 0.4rem;
          }
          
          .form-control-custom {
            background: #0A0A0A;
            border: 1px solid #2A2A2A;
            color: #E5E5E5;
            border-radius: 10px;
            padding: 0.65rem 0.9rem;
            font-size: 0.9rem;
          }
          
          .form-control-custom:focus {
            border-color: #10B981;
            box-shadow: none;
            background: #0A0A0A;
            color: #E5E5E5;
          }
          
          .form-control-custom:disabled {
            background: #1E1E1E;
            color: #737373;
            opacity: 0.6;
          }
          
          .btn-mint {
            background: #10B981;
            color: #121212;
            border: 1px solid #10B981;
            border-radius: 10px;
            font-weight: 600;
            padding: 0.6rem 1.5rem;
            font-size: 0.9rem;
            transition: all 0.2s;
          }
          
          .btn-mint:hover:not(:disabled) { background: #059669; border-color: #059669; color: #121212; }
          .btn-mint:disabled { opacity: 0.5; }
          
          .btn-outline {
            background: transparent;
            color: #A3A3A3;
            border: 1px solid #2A2A2A;
            border-radius: 10px;
            font-weight: 500;
            padding: 0.55rem 1.25rem;
            font-size: 0.85rem;
            transition: all 0.2s;
          }
          
          .btn-outline:hover { border-color: #3A3A3A; color: #E5E5E5; }
          
          .btn-edit {
            background: transparent;
            color: #34D399;
            border: 1px solid rgba(16,185,129,0.2);
            border-radius: 8px;
            font-weight: 600;
            padding: 0.4rem 1rem;
            font-size: 0.85rem;
            transition: all 0.2s;
          }
          
          .btn-edit:hover { background: rgba(16,185,129,0.06); border-color: rgba(16,185,129,0.4); color: #6EE7B7; }
          
          .btn-resend {
            background: transparent;
            color: #F59E0B;
            border: 1px solid rgba(245,158,11,0.2);
            border-radius: 8px;
            font-weight: 500;
            padding: 0.4rem 0.9rem;
            font-size: 0.8rem;
            transition: all 0.2s;
          }
          
          .btn-resend:hover { background: rgba(245,158,11,0.06); border-color: rgba(245,158,11,0.4); color: #FBBF24; }
          
          .verified-icon { color: #34D399; }
          
          .view-badge {
            background: #0A0A0A;
            border: 1px solid #2A2A2A;
            border-radius: 8px;
            padding: 0.2rem 0.7rem;
            font-size: 0.7rem;
            color: #737373;
            display: flex;
            align-items: center;
            gap: 0.3rem;
          }
        `}
      </style>

      <Container className="py-4">
        <div className="page-header">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h1>My Profile</h1>
              <p style={{ color: '#A3A3A3', fontSize: '0.95rem' }}>Manage your account and track your sharing metrics.</p>
            </div>
            <div className="view-badge"><FaEye size={10} /> Private</div>
          </div>
        </div>
        
        <Row className="g-4">
          <Col lg={4}>
            <div className="profile-card">
              <div className="p-4">
                <UserAvatar name={formData.name || profile?.name || 'User'} size={120} />
                
                <h4 className="text-center mt-3 mb-1" style={{ color: '#F5F5F5', fontWeight: 700, fontSize: '1.1rem' }}>
                  {profile?.name}
                  {profile?.verified && <FaCheckCircle className="verified-icon ms-2" size={14} />}
                </h4>
                <p className="text-center" style={{ color: '#737373', fontSize: '0.8rem' }}>
                  <FaCalendarAlt className="me-1" size={11} />
                  Joined {new Date(profile?.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </p>
                
                <hr style={{ borderColor: '#2A2A2A', margin: '1.25rem 0' }} />
                
                <div className="info-item">
                  <div className="info-icon"><FaEnvelope size={14} /></div>
                  <div>
                    <div className="info-label">Email</div>
                    <div className="info-value">
                      {profile?.email}
                      {profile?.emailVerified && <FaCheckCircle className="verified-icon" size={12} title="Verified" />}
                    </div>
                  </div>
                </div>
                
                <div className="trust-section">
                  <div className="trust-header">
                    <span><FaShieldAlt size={12} className="me-1" /> Trust Score</span>
                    <span className="trust-value">{profile?.trustScore || 0}/100</span>
                  </div>
                  <div className="progress-bar-custom">
                    <div 
                      className={`progress-fill ${profile?.trustScore > 75 ? 'high' : profile?.trustScore > 40 ? 'medium' : 'low'}`}
                      style={{ width: `${profile?.trustScore || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Col>
          
          <Col lg={8}>
            <div className="profile-card">
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #2A2A2A' }}>
                <h6 style={{ color: '#F5F5F5', fontWeight: 600, margin: 0, fontSize: '0.95rem' }}>
                  <FaChartBar className="me-2" size={14} style={{ color: '#34D399' }} /> Activity Overview
                </h6>
              </div>
              <div className="p-4">
                <div className="stats-grid">
                  {[
                    { icon: <FaTools size={16} />, value: liveStats.tools, label: 'Tools Listed' },
                    { icon: <FaCalendarAlt size={16} />, value: liveStats.rentals, label: 'Total Rentals' },
                    { icon: <FaCheckCircle size={16} />, value: `${liveStats.successRate}%`, label: 'Success Rate' },
                    { icon: <FaRupeeSign size={16} />, value: `₹${liveStats.totalEarnings?.toLocaleString('en-IN') || '0'}`, label: 'Total Earnings' },
                  ].map((stat, i) => (
                    <div className="stat-card" key={i}>
                      <div className="stat-icon">{stat.icon}</div>
                      <div className="stat-value">{liveStats.calculating ? <Spinner animation="border" size="sm" /> : stat.value}</div>
                      <div className="stat-label">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-section mt-4">
              <div className="form-header">
                <h6><FaUserCircle className="me-2" size={14} style={{ color: '#34D399' }} /> Identity Settings</h6>
                {!isEditing && (
                  <Button className="btn-edit" onClick={() => setIsEditing(true)}>
                    <FaEdit className="me-2" size={12} /> Edit Name
                  </Button>
                )}
              </div>
              <div className="form-body">
                <Form onSubmit={handleSubmit}>
                  <Form.Group>
                    <Form.Label className="form-label-custom">Display Name</Form.Label>
                    <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" className="form-control-custom" disabled={!isEditing} />
                  </Form.Group>

                  {profile?.emailVerified === false && (
                    <Alert style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', color: '#F59E0B', marginTop: '1.25rem' }}>
                      <div className="d-flex align-items-center justify-content-between">
                        <span><FaInfoCircle className="me-2" size={12} /> Email not verified.</span>
                        <Button className="btn-resend" onClick={handleResendVerification} disabled={resending}>
                          {resending ? <Spinner animation="border" size="sm" /> : <><FaPaperPlane className="me-2" size={11} /> Verify Now</>}
                        </Button>
                      </div>
                    </Alert>
                  )}

                  {isEditing && (
                    <div className="d-flex gap-3 pt-4 mt-4 border-top" style={{ borderColor: '#2A2A2A' }}>
                      <Button className="btn-outline" onClick={() => { loadProfileAndStats(); setIsEditing(false); }} disabled={saving}>Cancel</Button>
                      <Button className="btn-mint ms-auto d-flex align-items-center" type="submit" disabled={saving}>
                        {saving ? <Spinner animation="border" size="sm" className="me-2" /> : <FaSave className="me-2" size={12} />}
                        {saving ? 'Saving...' : 'Save Name'}
                      </Button>
                    </div>
                  )}
                </Form>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ProfilePage;