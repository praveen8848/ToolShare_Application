import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import ownerService from '../services/ownerService';       
import bookingService from '../services/bookingService';   
import { toast } from 'react-toastify';
import { 
  FaEnvelope, 
  FaPhone, 
  FaInfoCircle, 
  FaSave, 
  FaCheckCircle, 
  FaShieldAlt, 
  FaChartBar,
  FaTimesCircle,
  FaClock,
  FaPaperPlane,
  FaUser,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaRupeeSign,
  FaStar,
  FaTools,
  FaEye,
  FaEyeSlash,
  FaGlobe,
  FaLock,
  FaEdit,
  FaUserCircle
} from 'react-icons/fa';

// Enhanced Avatar Component with Dark Theme
const UserAvatar = ({ name, size = 150 }) => {
  const initials = name?.split(' ')?.map(word => word[0])?.join('')?.toUpperCase()?.slice(0, 2);
  const colors = [
    '#3b82f6', '#10b981', '#60a5fa', '#34d399', '#8b5cf6',
    '#f59e0b', '#ec4899', '#06b6d4', '#f97316', '#6366f1',
    '#14b8a6', '#a855f7', '#ef4444', '#0ea5e9', '#84cc16'
  ];
  const colorIndex = (name || '').length % colors.length;
  const backgroundColor = colors[colorIndex];
  
  return (
    <div
      className="avatar-container"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: backgroundColor,
      }}
    >
      <span className="avatar-text" style={{ fontSize: `${size * 0.4}px` }}>
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
  
  const [liveStats, setLiveStats] = useState({
    tools: 0,
    rentals: 0,
    successRate: 0,
    totalEarnings: 0,
    averageRating: 0,
    calculating: true
  });

  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    address: '',
    bio: '',
    preferences: ''
  });

  // Visibility settings (to be implemented later)
  const [visibilitySettings, setVisibilitySettings] = useState({
    showEmail: true,
    showPhone: true,
    showAddress: false,
    showStats: true,
    profilePublic: true
  });

  useEffect(() => {
    loadProfileAndStats();
  }, []);

  const loadProfileAndStats = async () => {
    setLoading(true);
    try {
      const data = await userService.getProfile();
      setProfile(data);
      setFormData({
        name: data.name || '',
        phoneNumber: data.phoneNumber || '',
        address: data.address || '',
        bio: data.bio || '',
        preferences: data.preferences || ''
      });

      try {
        const [myTools, myBookings] = await Promise.all([
          ownerService.getMyTools().catch(() => []),
          bookingService.getUserBookings().catch(() => [])
        ]);

        const completed = myBookings.filter(b => b.status === 'COMPLETED').length;
        const totalFinished = myBookings.filter(b => ['COMPLETED', 'REJECTED', 'CANCELLED'].includes(b.status)).length;
        const successRate = totalFinished > 0 ? Math.round((completed / totalFinished) * 100) : 100;
        
        const completedBookings = myBookings.filter(b => b.status === 'COMPLETED');
        const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        
        const avgRating = 4.8; // Placeholder - calculate from actual ratings later

        setLiveStats({
          tools: myTools.length || 0,
          rentals: myBookings.length || 0,
          successRate: myBookings.length === 0 ? 0 : successRate,
          totalEarnings: totalEarnings,
          averageRating: avgRating,
          calculating: false
        });
      } catch (statError) {
        console.error("Failed to calculate live stats", statError);
        setLiveStats(prev => ({ ...prev, calculating: false }));
      }

    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userService.updateProfile(formData);
      await refreshUserProfile();
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      await loadProfileAndStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await userService.resendVerification();
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send verification email.');
    } finally {
      setResending(false);
    }
  };

  const toggleVisibility = (key) => {
    setVisibilitySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast.info(`${key} visibility updated (feature coming soon)`);
  };

  const renderVerificationBadge = (status) => {
    switch(status) {
      case 'VERIFIED': 
        return <Badge className="badge-verified"><FaCheckCircle className="me-1"/> Verified</Badge>;
      case 'PENDING': 
        return <Badge className="badge-pending"><FaClock className="me-1"/> Pending</Badge>;
      case 'REJECTED': 
        return <Badge className="badge-rejected"><FaTimesCircle className="me-1"/> Rejected</Badge>;
      default: 
        return <Badge className="badge-unverified"><FaShieldAlt className="me-1"/> Unverified</Badge>;
    }
  };

  if (loading && !profile) {
    return (
      <div className="profile-wrapper">
        <Container className="py-5 text-center">
          <div className="loading-state">
            <Spinner animation="border" />
            <p>Loading your profile...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="profile-wrapper">
      <style>
        {`
          .profile-wrapper {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            min-height: 100vh;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: #e2e8f0;
            padding-bottom: 3rem;
            padding-top: 76px;
          }
          
          .page-header {
            padding: 0 0 1.5rem;
            border-bottom: 1px solid #334155;
            margin-bottom: 2rem;
          }
          
          .gradient-text {
            background: linear-gradient(135deg, #60a5fa 0%, #34d399 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .profile-card {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            margin-bottom: 1.5rem;
          }
          
          .avatar-container {
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            cursor: default;
            border: 4px solid #334155;
          }
          
          .avatar-container:hover {
            transform: scale(1.05);
            box-shadow: 0 12px 32px rgba(59, 130, 246, 0.2);
          }
          
          .avatar-text {
            color: white;
            font-weight: bold;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
          }
          
          .info-item {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            margin-bottom: 1.25rem;
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
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .info-value {
            color: #e2e8f0;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .visibility-toggle {
            cursor: pointer;
            color: #64748b;
            transition: color 0.2s;
            margin-left: 4px;
          }
          
          .visibility-toggle:hover {
            color: #60a5fa;
          }
          
          .trust-score-container {
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid #334155;
          }
          
          .trust-score-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
          }
          
          .trust-score-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #cbd5e1;
            font-weight: 600;
          }
          
          .trust-score-value {
            color: #60a5fa;
            font-weight: 700;
            font-size: 1.25rem;
          }
          
          .progress-bar-custom {
            height: 8px;
            background: #0f172a;
            border-radius: 4px;
            overflow: hidden;
            border: 1px solid #334155;
          }
          
          .progress-fill {
            height: 100%;
            border-radius: 4px;
            transition: width 0.3s ease;
          }
          
          .progress-fill.high {
            background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
          }
          
          .progress-fill.medium {
            background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
          }
          
          .progress-fill.low {
            background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
          }
          
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
          
          .stat-card {
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 16px;
            padding: 1.25rem;
            text-align: center;
            transition: all 0.3s ease;
          }
          
          .stat-card:hover {
            border-color: #60a5fa;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
            transform: translateY(-2px);
          }
          
          .stat-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 0.75rem;
            border: 1px solid #334155;
          }
          
          .stat-value {
            color: #f1f5f9;
            font-weight: 700;
            font-size: 1.5rem;
            margin-bottom: 0.25rem;
          }
          
          .stat-label {
            color: #64748b;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .form-section {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 24px;
            overflow: hidden;
          }
          
          .form-header {
            padding: 1.25rem 1.5rem;
            border-bottom: 1px solid #334155;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          
          .form-header h6 {
            color: #f1f5f9;
            font-weight: 700;
            margin: 0;
          }
          
          .form-body {
            padding: 1.5rem;
          }
          
          .form-label-custom {
            color: #cbd5e1;
            font-weight: 600;
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
          }
          
          .form-control-custom {
            background: #0f172a;
            border: 1px solid #334155;
            color: #e2e8f0;
            border-radius: 12px;
            padding: 0.75rem 1rem;
            font-size: 0.95rem;
          }
          
          .form-control-custom:focus {
            border-color: #60a5fa;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
            background: #0f172a;
            color: #e2e8f0;
            outline: none;
          }
          
          .form-control-custom::placeholder {
            color: #64748b;
          }
          
          .form-control-custom:disabled {
            background: #1e293b;
            color: #64748b;
            opacity: 0.7;
          }
          
          .form-text-custom {
            color: #64748b;
            font-size: 0.85rem;
          }
          
          .btn-save {
            background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            padding: 0.75rem 2rem;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }
          
          .btn-save:hover {
            background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
          }
          
          .btn-save:disabled {
            opacity: 0.6;
            transform: none;
            box-shadow: none;
          }
          
          .btn-edit {
            background: transparent;
            color: #60a5fa;
            border: 1px solid #334155;
            border-radius: 10px;
            font-weight: 600;
            padding: 0.5rem 1.25rem;
            transition: all 0.3s ease;
          }
          
          .btn-edit:hover {
            background: rgba(59, 130, 246, 0.1);
            border-color: #60a5fa;
            color: #93c5fd;
          }
          
          .btn-reset {
            background: transparent;
            color: #94a3b8;
            border: 1px solid #334155;
            border-radius: 12px;
            font-weight: 600;
            padding: 0.75rem 2rem;
            transition: all 0.3s ease;
          }
          
          .btn-reset:hover {
            background: #1e293b;
            border-color: #60a5fa;
            color: #e2e8f0;
          }
          
          .btn-resend {
            background: transparent;
            color: #fbbf24;
            border: 1px solid rgba(245, 158, 11, 0.3);
            border-radius: 10px;
            padding: 0.5rem 1rem;
            font-size: 0.85rem;
            font-weight: 500;
            transition: all 0.2s ease;
          }
          
          .btn-resend:hover {
            background: rgba(245, 158, 11, 0.1);
            border-color: #f59e0b;
            color: #fbbf24;
          }
          
          .badge-verified {
            background: rgba(16, 185, 129, 0.15);
            color: #34d399;
            border: 1px solid rgba(16, 185, 129, 0.3);
            padding: 0.5rem 1rem;
            border-radius: 10px;
            font-weight: 500;
          }
          
          .badge-pending {
            background: rgba(245, 158, 11, 0.15);
            color: #fbbf24;
            border: 1px solid rgba(245, 158, 11, 0.3);
            padding: 0.5rem 1rem;
            border-radius: 10px;
            font-weight: 500;
          }
          
          .badge-rejected {
            background: rgba(239, 68, 68, 0.15);
            color: #f87171;
            border: 1px solid rgba(239, 68, 68, 0.3);
            padding: 0.5rem 1rem;
            border-radius: 10px;
            font-weight: 500;
          }
          
          .badge-unverified {
            background: rgba(100, 116, 139, 0.15);
            color: #94a3b8;
            border: 1px solid rgba(100, 116, 139, 0.3);
            padding: 0.5rem 1rem;
            border-radius: 10px;
            font-weight: 500;
          }
          
          .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            color: #94a3b8;
            padding-top: 76px;
          }
          
          .loading-state .spinner-border {
            color: #60a5fa !important;
            width: 3rem;
            height: 3rem;
            margin-bottom: 1rem;
          }
          
          .verified-icon {
            color: #34d399;
          }
          
          .member-since {
            color: #64748b;
            font-size: 0.85rem;
            margin-top: 0.5rem;
          }
          
          .visibility-section {
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid #334155;
          }
          
          .visibility-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.5rem 0;
          }
          
          .visibility-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #cbd5e1;
            font-size: 0.9rem;
          }
          
          .view-only-badge {
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 20px;
            padding: 0.25rem 0.75rem;
            font-size: 0.7rem;
            color: #64748b;
          }
        `}
      </style>

      <Container className="py-4">
        
        {/* Page Header */}
        <div className="page-header">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h1 className="fw-extrabold mb-2" style={{ fontSize: '2.5rem' }}>
                <span className="gradient-text">My Profile</span>
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                Manage your personal information, privacy settings, and view your activity
              </p>
            </div>
            <div className="view-only-badge">
              <FaEye className="me-1" size={10} />
              Public View (Coming Soon)
            </div>
          </div>
        </div>
        
        <Row className="g-4">
          {/* LEFT COLUMN: Avatar & Summary */}
          <Col lg={4}>
            <div className="profile-card">
              <Card.Body className="p-4">
                <div className="position-relative">
                  <UserAvatar 
                    name={formData.name || profile?.name || 'User'} 
                    size={140} 
                  />
                </div>
                
                <h4 className="text-center mt-3 mb-1" style={{ color: '#f1f5f9', fontWeight: 700 }}>
                  {profile?.name}
                  {profile?.verified && <FaCheckCircle className="verified-icon ms-2" size={16} />}
                </h4>
                <p className="member-since text-center">
                  <FaCalendarAlt className="me-1" size={12} />
                  Member since {new Date(profile?.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </p>
                
                <hr style={{ borderColor: '#334155', margin: '1.5rem 0' }} />
                
                <div>
                  <div className="info-item">
                    <div className="info-icon">
                      <FaEnvelope size={16} />
                    </div>
                    <div className="info-content">
                      <div className="info-label">
                        Email
                        <span 
                          className="visibility-toggle"
                          onClick={() => toggleVisibility('showEmail')}
                          title={visibilitySettings.showEmail ? 'Visible to public' : 'Hidden from public'}
                        >
                          {visibilitySettings.showEmail ? <FaGlobe size={10} /> : <FaLock size={10} />}
                        </span>
                      </div>
                      <div className="info-value">
                        {profile?.email}
                        {profile?.emailVerified && <FaCheckCircle className="verified-icon" size={14} title="Verified" />}
                      </div>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon">
                      <FaPhone size={16} />
                    </div>
                    <div className="info-content">
                      <div className="info-label">
                        Phone
                        <span 
                          className="visibility-toggle"
                          onClick={() => toggleVisibility('showPhone')}
                          title={visibilitySettings.showPhone ? 'Visible to public' : 'Hidden from public'}
                        >
                          {visibilitySettings.showPhone ? <FaGlobe size={10} /> : <FaLock size={10} />}
                        </span>
                      </div>
                      <div className="info-value">
                        {profile?.phoneNumber || 'Not provided'}
                        {profile?.phoneVerified && <FaCheckCircle className="verified-icon" size={14} title="Verified" />}
                      </div>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-icon">
                      <FaMapMarkerAlt size={16} />
                    </div>
                    <div className="info-content">
                      <div className="info-label">
                        Address
                        <span 
                          className="visibility-toggle"
                          onClick={() => toggleVisibility('showAddress')}
                          title={visibilitySettings.showAddress ? 'Visible to public' : 'Hidden from public'}
                        >
                          {visibilitySettings.showAddress ? <FaGlobe size={10} /> : <FaLock size={10} />}
                        </span>
                      </div>
                      <div className="info-value" style={{ fontSize: '0.9rem' }}>
                        {profile?.address || 'Not provided'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="trust-score-container">
                  <div className="trust-score-header">
                    <span className="trust-score-label">
                      <FaShieldAlt size={14} />
                      Trust Score
                    </span>
                    <span className="trust-score-value">{profile?.trustScore || 0}/100</span>
                  </div>
                  <div className="progress-bar-custom">
                    <div 
                      className={`progress-fill ${profile?.trustScore > 75 ? 'high' : profile?.trustScore > 40 ? 'medium' : 'low'}`}
                      style={{ width: `${profile?.trustScore || 0}%` }}
                    />
                  </div>
                </div>
              </Card.Body>
            </div>
          </Col>
          
          {/* RIGHT COLUMN: Stats & Edit Form */}
          <Col lg={8}>
            {/* Stats Overview */}
            <div className="profile-card">
              <Card.Header style={{ 
                background: 'transparent', 
                borderBottom: '1px solid #334155',
                padding: '1.25rem 1.5rem'
              }}>
                <div className="d-flex align-items-center justify-content-between">
                  <h6 style={{ color: '#f1f5f9', fontWeight: 700, margin: 0 }}>
                    <FaChartBar className="me-2" style={{ color: '#60a5fa' }} />
                    Activity Overview
                  </h6>
                  <span 
                    className="visibility-toggle"
                    onClick={() => toggleVisibility('showStats')}
                    title={visibilitySettings.showStats ? 'Visible to public' : 'Hidden from public'}
                  >
                    {visibilitySettings.showStats ? <FaGlobe size={12} /> : <FaLock size={12} />}
                  </span>
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FaTools style={{ color: '#60a5fa' }} size={18} />
                    </div>
                    <div className="stat-value">
                      {liveStats.calculating ? <Spinner animation="border" size="sm" /> : liveStats.tools}
                    </div>
                    <div className="stat-label">Tools Listed</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FaCalendarAlt style={{ color: '#34d399' }} size={18} />
                    </div>
                    <div className="stat-value">
                      {liveStats.calculating ? <Spinner animation="border" size="sm" /> : liveStats.rentals}
                    </div>
                    <div className="stat-label">Total Rentals</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FaCheckCircle style={{ color: '#fbbf24' }} size={18} />
                    </div>
                    <div className="stat-value">
                      {liveStats.calculating ? <Spinner animation="border" size="sm" /> : `${liveStats.successRate}%`}
                    </div>
                    <div className="stat-label">Success Rate</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FaRupeeSign style={{ color: '#ec4899' }} size={18} />
                    </div>
                    <div className="stat-value">
                      {liveStats.calculating ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <>₹{liveStats.totalEarnings?.toLocaleString('en-IN') || '0'}</>
                      )}
                    </div>
                    <div className="stat-label">Total Earnings</div>
                  </div>
                </div>
              </Card.Body>
            </div>

            {/* Edit Profile Form */}
            <div className="form-section">
              <div className="form-header">
                <h6>
                  <FaUserCircle className="me-2" style={{ color: '#60a5fa' }} />
                  Profile Details
                </h6>
                {!isEditing && (
                  <Button 
                    className="btn-edit"
                    onClick={() => setIsEditing(true)}
                  >
                    <FaEdit className="me-2" size={14} />
                    Edit Profile
                  </Button>
                )}
              </div>
              <div className="form-body">
                <Form onSubmit={handleSubmit}>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="form-label-custom">Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                          className="form-control-custom"
                          disabled={!isEditing}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="form-label-custom">Phone Number</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                          className="form-control-custom"
                          disabled={!isEditing}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mt-3">
                    <Form.Label className="form-label-custom">Address</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your local address"
                      className="form-control-custom"
                      disabled={!isEditing}
                    />
                    <Form.Text className="form-text-custom">
                      This is your default pickup location. It is only shared with approved borrowers.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mt-3">
                    <Form.Label className="form-label-custom">Bio</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell others about yourself, your DIY projects, and what tools you love to share..."
                      className="form-control-custom"
                      disabled={!isEditing}
                    />
                    <Form.Text className="form-text-custom">
                      A good bio builds trust within the local community.
                    </Form.Text>
                  </Form.Group>

                  {/* Verification Section */}
                  {profile?.emailVerified === false && (
                    <Alert style={{
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: '12px',
                      color: '#fbbf24',
                      marginTop: '1.5rem'
                    }}>
                      <div className="d-flex align-items-center justify-content-between">
                        <span>
                          <FaInfoCircle className="me-2" />
                          Your email is not verified. Verify to unlock all features.
                        </span>
                        <Button 
                          className="btn-resend"
                          onClick={handleResendVerification}
                          disabled={resending}
                        >
                          {resending ? (
                            <Spinner animation="border" size="sm" className="me-2" />
                          ) : (
                            <FaPaperPlane className="me-2" size={12} />
                          )}
                          {resending ? 'Sending...' : 'Resend Email'}
                        </Button>
                      </div>
                    </Alert>
                  )}

                  {isEditing && (
                    <div className="d-flex gap-3 pt-4 mt-2 border-top" style={{ borderColor: '#334155' }}>
                      <Button
                        className="btn-reset"
                        onClick={() => {
                          loadProfileAndStats();
                          setIsEditing(false);
                        }}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="btn-save ms-auto d-flex align-items-center"
                        type="submit"
                        disabled={saving}
                      >
                        {saving ? (
                          <Spinner animation="border" size="sm" className="me-2" />
                        ) : (
                          <FaSave className="me-2" />
                        )} 
                        {saving ? 'Saving...' : 'Save Changes'}
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