import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Image } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaInfoCircle, FaCamera, FaSave } from 'react-icons/fa';

const ProfilePage = () => {
  const { user, refreshUserProfile } = useAuth(); // Get refreshUserProfile
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

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
      if (data.profileImageUrl) {
        setPreviewUrl(data.profileImageUrl);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadPicture = async () => {
    if (!selectedFile) return;
    
    try {
      const result = await userService.uploadProfilePicture(selectedFile);
      toast.success('Profile picture updated!');
      setPreviewUrl(result.imageUrl);
      setSelectedFile(null);
      await refreshUserProfile(); // Refresh user from backend
      loadProfile(); // Reload profile data
    } catch (error) {
      toast.error('Failed to upload picture');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedProfile = await userService.updateProfile(formData);
      await refreshUserProfile(); // Refresh user from backend
      toast.success('Profile updated successfully!');
      loadProfile(); // Reload profile data
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
          <Card className="shadow-sm text-center">
            <Card.Body>
              <div className="position-relative d-inline-block mb-3">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    roundedCircle
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto"
                    style={{ width: '150px', height: '150px' }}
                  >
                    <FaUser size={60} className="text-muted" />
                  </div>
                )}
                <label
                  htmlFor="profile-picture-input"
                  className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-2"
                  style={{ cursor: 'pointer' }}
                >
                  <FaCamera size={16} color="white" />
                </label>
                <input
                  id="profile-picture-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
              
              {selectedFile && (
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-2"
                  onClick={handleUploadPicture}
                >
                  Upload Picture
                </Button>
              )}
              
              <hr />
              
              <div className="text-start">
                <p><FaEnvelope className="me-2 text-muted" /> {profile?.email}</p>
                <p><FaUser className="me-2 text-muted" /> Member since {new Date(profile?.createdAt).toLocaleDateString()}</p>
                <p><FaInfoCircle className="me-2 text-muted" /> Trust Score: {profile?.trustScore || 0}%</p>
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
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Bio</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell others about yourself..."
                  />
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