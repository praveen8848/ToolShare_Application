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
  FaPaperPlane
} from 'react-icons/fa';

// Restored the beautiful interactive Avatar Component
const UserAvatar = ({ name, size = 150 }) => {
  const initials = name?.split(' ')?.map(word => word[0])?.join('')?.toUpperCase()?.slice(0, 2);
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#FF8C42', '#6C63FF', '#FF6B9D', '#00C9A7', '#FFD166'
  ];
  const colorIndex = (name || '').length % colors.length;
  const backgroundColor = colors[colorIndex];
  
  return (
    <div
      className="rounded-circle d-flex align-items-center justify-content-center mx-auto shadow-lg"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: backgroundColor,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'default',
        border: '4px solid white'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
      }}
    >
      <span style={{ fontSize: `${size * 0.4}px`, color: 'white', fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>
        {initials || 'U'}
      </span>
    </div>
  );
};

const ProfilePage = () => {
  const { refreshUserProfile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false); // NEW: State for resend button
  const [profile, setProfile] = useState(null);
  
  const [liveStats, setLiveStats] = useState({
    tools: 0,
    rentals: 0,
    successRate: 0,
    calculating: true
  });

  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    address: '',
    bio: '',
    preferences: ''
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

        setLiveStats({
          tools: myTools.length || 0,
          rentals: myBookings.length || 0,
          successRate: myBookings.length === 0 ? 0 : successRate, 
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
      await loadProfileAndStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // NEW: Handler for resending verification email
  const handleResendVerification = async () => {
    setResending(true);
    try {
      await userService.resendVerification();
      toast.success('Verification email sent! Please check your terminal/inbox.');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send verification email.');
    } finally {
      setResending(false);
    }
  };

  const renderVerificationBadge = (status) => {
    switch(status) {
      case 'VERIFIED': return <Badge bg="success" className="py-2 px-3"><FaCheckCircle className="me-1"/> Verified</Badge>;
      case 'PENDING': return <Badge bg="warning" text="dark" className="py-2 px-3"><FaClock className="me-1"/> Pending</Badge>;
      case 'REJECTED': return <Badge bg="danger" className="py-2 px-3"><FaTimesCircle className="me-1"/> Rejected</Badge>;
      default: return <Badge bg="secondary" className="py-2 px-3"><FaShieldAlt className="me-1"/> Unverified</Badge>;
    }
  };

  if (loading && !profile) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted fw-medium">Loading your profile...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4 fw-bold">My Profile</h2>
      
      <Row className="g-4">
        {/* LEFT COLUMN: Avatar & Summary */}
        <Col lg={4}>
          <Card className="shadow-sm text-center border-0 mb-4">
            <Card.Body className="p-4">

              <UserAvatar 
                name={formData.name || profile?.name || 'User'} 
                size={140} 
              />
              
              <h4 className="mt-3 mb-1 fw-bold">{profile?.name}</h4>
              <p className="text-muted small mb-3">
                Member since {new Date(profile?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
              
              <hr className="my-4" />
              
              <div className="text-start">
                <div className="mb-3 d-flex align-items-center">
                  <div className="bg-light p-2 rounded me-3 text-primary"><FaEnvelope size={18} /></div>
                  <div>
                    <small className="text-muted d-block fw-semibold text-uppercase" style={{fontSize: '0.7rem'}}>Email</small>
                    <span className="fw-medium">{profile?.email}</span>
                    {profile?.emailVerified && <FaCheckCircle className="text-success ms-2" title="Verified" size={12}/>}
                  </div>
                </div>

                <div className="mb-3 d-flex align-items-center">
                  <div className="bg-light p-2 rounded me-3 text-primary"><FaPhone size={18} /></div>
                  <div>
                    <small className="text-muted d-block fw-semibold text-uppercase" style={{fontSize: '0.7rem'}}>Phone</small>
                    <span className="fw-medium">{profile?.phoneNumber || 'Not provided'}</span>
                    {profile?.phoneVerified && <FaCheckCircle className="text-success ms-2" title="Verified" size={12}/>}
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-end mb-1">
                    <strong className="d-flex align-items-center">
                      <FaInfoCircle className="me-2 text-primary" /> Trust Score
                    </strong>
                    <span className="fw-bold">{profile?.trustScore || 0}/100</span>
                  </div>
                  <div className="progress mt-2" style={{ height: '8px' }}>
                    <div 
                      className={`progress-bar ${profile?.trustScore > 75 ? 'bg-success' : profile?.trustScore > 40 ? 'bg-warning' : 'bg-danger'}`}
                      style={{ width: `${profile?.trustScore || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        {/* RIGHT COLUMN: Stats & Edit Form */}
        <Col lg={8}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-white border-bottom py-3">
              <h6 className="mb-0 fw-bold d-flex align-items-center">
                <FaChartBar className="me-2 text-primary" /> Activity Overview
              </h6>
            </Card.Header>
            <Card.Body>
              <Row className="text-center g-3">
                <Col sm={4}>
                  <div className="p-3 bg-light rounded border border-light transition-hover">
                    <h3 className="fw-bold text-primary mb-1">
                      {liveStats.calculating ? <Spinner animation="border" size="sm"/> : liveStats.tools}
                    </h3>
                    <small className="text-muted text-uppercase fw-semibold" style={{letterSpacing: '0.5px'}}>Tools Listed</small>
                  </div>
                </Col>
                <Col sm={4}>
                  <div className="p-3 bg-light rounded border border-light transition-hover">
                    <h3 className="fw-bold text-success mb-1">
                      {liveStats.calculating ? <Spinner animation="border" size="sm"/> : liveStats.rentals}
                    </h3>
                    <small className="text-muted text-uppercase fw-semibold" style={{letterSpacing: '0.5px'}}>Total Rentals</small>
                  </div>
                </Col>
                <Col sm={4}>
                  <div className="p-3 bg-light rounded border border-light transition-hover">
                    <h3 className="fw-bold text-info mb-1">
                      {liveStats.calculating ? <Spinner animation="border" size="sm"/> : `${liveStats.successRate}%`}
                    </h3>
                    <small className="text-muted text-uppercase fw-semibold" style={{letterSpacing: '0.5px'}}>Success Rate</small>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white border-bottom py-3">
              <h6 className="mb-0 fw-bold">Edit Profile Details</h6>
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="bg-light border-0"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        className="bg-light border-0"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your local address"
                    className="bg-light border-0"
                  />
                  <Form.Text className="text-muted small">
                    This is your default pickup location. It is only shared with approved borrowers.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium">Bio</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell others about yourself, your DIY projects, and what tools you love to share..."
                    className="bg-light border-0"
                  />
                  <Form.Text className="text-muted small">
                    A good bio builds trust within the local community.
                  </Form.Text>
                </Form.Group>

                <div className="d-flex gap-3 pt-2 border-top mt-4">
                  <Button
                    variant="light"
                    onClick={() => loadProfileAndStats()}
                    disabled={saving}
                    className="px-4 fw-medium"
                  >
                    Reset
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={saving}
                    className="px-4 fw-medium ms-auto d-flex align-items-center"
                  >
                    {saving ? <Spinner animation="border" size="sm" className="me-2" /> : <FaSave className="me-2" />} 
                    Save Changes
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;