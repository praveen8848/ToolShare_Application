import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import { toast } from 'react-toastify';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaInfoCircle, FaSave, FaUser } from 'react-icons/fa'; // Added FaUser

// Avatar Component with beautiful design
const UserAvatar = ({ name, size = 150 }) => {
  // Get initials from name
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  // Generate a consistent color based on name
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#FF8C42', '#6C63FF', '#FF6B9D', '#00C9A7', '#FFD166'
  ];
  const colorIndex = name.length % colors.length;
  const backgroundColor = colors[colorIndex];
  
  return (
    <div
      className="rounded-circle d-flex align-items-center justify-content-center mx-auto shadow-lg"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: backgroundColor,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'default'
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
      <span style={{ 
        fontSize: `${size * 0.4}px`, 
        color: 'white', 
        fontWeight: 'bold',
        textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
      }}>
        {initials || 'U'}
      </span>
    </div>
  );
};

const ProfilePage = () => {
  const { user, refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    address: '',
    bio: '',
    preferences: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
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
      const updatedProfile = await userService.updateProfile(formData);
      await refreshUserProfile();
      toast.success('Profile updated successfully!');
      await loadProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading profile...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">My Profile</h2>
      
      <Row>
        <Col lg={4} className="mb-4">
          <Card className="shadow-sm text-center border-0">
            <Card.Body>
              {/* Avatar Section */}
              <UserAvatar 
                name={formData.name || profile?.name || 'User'} 
                size={150} 
              />
              
              <hr className="my-4" />
              
              <div className="text-start">
                <div className="mb-3">
                  <FaEnvelope className="me-2 text-muted" />
                  <strong>Email:</strong>
                  <p className="text-muted mb-0 mt-1">{profile?.email}</p>
                </div>
                
                <div className="mb-3">
                  <FaUser className="me-2 text-muted" />
                  <strong>Member Since:</strong>
                  <p className="text-muted mb-0 mt-1">
                    {new Date(profile?.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                <div className="mb-3">
                  <FaInfoCircle className="me-2 text-muted" />
                  <strong>Trust Score:</strong>
                  <div className="mt-1">
                    <div className="progress" style={{ height: '8px' }}>
                      <div 
                        className="progress-bar bg-success" 
                        style={{ width: `${profile?.trustScore || 0}%` }}
                      />
                    </div>
                    <small className="text-muted">{profile?.trustScore || 0}% - Good standing</small>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Edit Profile</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />
                  <Form.Text className="text-muted">
                    This will be displayed on your profile and to other users
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your address"
                  />
                  <Form.Text className="text-muted">
                    Full address will be shared after booking confirmation
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Bio</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell others about yourself, your interests, and what tools you love to share..."
                  />
                  <Form.Text className="text-muted">
                    Share a little about yourself to build trust with the community
                  </Form.Text>
                </Form.Group>

                <Alert variant="info" className="mt-3">
                  <small>Your email cannot be changed. Contact support if you need to update it.</small>
                </Alert>

                <div className="d-flex gap-2 mt-4">
                  <Button
                    variant="secondary"
                    onClick={() => loadProfile()}
                    disabled={saving}
                  >
                    Reset
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={saving}
                    className="flex-grow-1"
                  >
                    {saving ? <Spinner animation="border" size="sm" /> : <><FaSave className="me-2" /> Save Changes</>}
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