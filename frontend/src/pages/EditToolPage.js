import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, Image, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { 
  FaUpload, FaTrash, FaSave, FaArrowLeft, FaMapMarkerAlt, 
  FaPhone, FaInfoCircle, FaRupeeSign, FaWrench, FaTags, FaImages,
  FaShieldAlt, FaCheckCircle
} from 'react-icons/fa';
import toolService from '../services/toolService';
import { toast } from 'react-toastify';

const EditToolPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    dailyRate: '',
    weeklyRate: '',
    monthlyRate: '',
    depositAmount: '',
    status: '',
    pincode: '',
    city: '',
    state: '',
    pickupInstructions: '',
    ownerContact: '',
    contactMethod: 'BOTH'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tool, categoriesData] = await Promise.all([
        toolService.getToolById(id),
        toolService.getCategories()
      ]);
      
      setFormData({
        name: tool.name || '',
        description: tool.description || '',
        categoryId: tool.categoryId || '',
        dailyRate: tool.dailyRate || '',
        weeklyRate: tool.weeklyRate || '',
        monthlyRate: tool.monthlyRate || '',
        depositAmount: tool.depositAmount || '',
        status: tool.status || 'AVAILABLE',
        pincode: tool.pincode || '',
        city: tool.city || '',
        state: tool.state || '',
        pickupInstructions: tool.pickupInstructions || '',
        ownerContact: tool.ownerContact || '',
        contactMethod: tool.contactMethod || 'BOTH'
      });
      
      setExistingImages(tool.images || []);
      setCategories(categoriesData || []);
    } catch (error) {
      toast.error('Failed to load tool details');
      navigate('/my-tools');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (acceptedFiles) => {
    const newPreviews = [...newImagePreviews];
    const newImagesList = [...newImages];
    
    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImagesList.push(reader.result);
        newPreviews.push(reader.result);
        setNewImages(newImagesList);
        setNewImagePreviews(newPreviews);
      };
      reader.readAsDataURL(file);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 5,
  });

  const removeExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages(newImages.filter((_, i) => i !== index));
    setNewImagePreviews(newImagePreviews.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Tool name is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.dailyRate || parseFloat(formData.dailyRate) < 0) {
      newErrors.dailyRate = 'Valid daily rate is required';
    }
    
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.ownerContact.trim()) newErrors.ownerContact = 'Contact number is required';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the highlighted errors');
      return;
    }

    setSaving(true);
    try {
      const allImages = [...existingImages, ...newImages];
      
      await toolService.updateTool(id, {
        ...formData,
        dailyRate: parseFloat(formData.dailyRate),
        weeklyRate: formData.weeklyRate ? parseFloat(formData.weeklyRate) : null,
        monthlyRate: formData.monthlyRate ? parseFloat(formData.monthlyRate) : null,
        depositAmount: formData.depositAmount ? parseFloat(formData.depositAmount) : null,
        images: allImages
      });
      
      toast.success('Tool updated successfully!');
      navigate('/my-tools');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update tool');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-tool-wrapper">
        <style>
          {`
            .edit-tool-wrapper {
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
              min-height: 100vh;
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }
          `}
        </style>
        <Container className="py-5 text-center">
          <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '400px' }}>
            <Spinner animation="border" style={{ color: '#60a5fa', width: '3rem', height: '3rem' }} />
            <h5 className="mt-3" style={{ color: '#94a3b8' }}>Loading tool details...</h5>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="edit-tool-wrapper">
      <style>
        {`
          .edit-tool-wrapper {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            min-height: 100vh;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: #e2e8f0;
            padding-bottom: 4rem;
          }
          
          .page-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 2rem;
            padding-top: 1.5rem;
          }
          
          .back-button {
            color: #94a3b8;
            text-decoration: none;
            padding: 0.5rem 1rem;
            border-radius: 12px;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            border: 1px solid transparent;
            background: transparent;
          }
          
          .back-button:hover {
            color: #60a5fa;
            background: rgba(59, 130, 246, 0.1);
            border-color: rgba(59, 130, 246, 0.2);
          }
          
          .section-card {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 20px;
            margin-bottom: 1.5rem;
            overflow: hidden;
          }
          
          .section-header {
            padding: 1.25rem 1.5rem;
            border-bottom: 1px solid #334155;
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }
          
          .section-header h5 {
            margin: 0;
            color: #f1f5f9;
            font-weight: 700;
          }
          
          .section-body {
            padding: 1.5rem;
          }
          
          .form-label-dark {
            color: #cbd5e1;
            font-weight: 600;
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
          }
          
          .form-control-dark, .form-select-dark {
            background: #0f172a;
            border: 1px solid #334155;
            color: #e2e8f0;
            border-radius: 12px;
            padding: 0.75rem 1rem;
          }
          
          .form-control-dark:focus, .form-select-dark:focus {
            border-color: #60a5fa;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
            background: #0f172a;
            color: #e2e8f0;
          }
          
          .form-control-dark::placeholder {
            color: #64748b;
          }
          
          .form-control-dark.is-invalid {
            border-color: #ef4444;
          }
          
          .input-group-text-dark {
            background: #0f172a;
            border: 1px solid #334155;
            color: #94a3b8;
            border-radius: 12px 0 0 12px;
          }
          
          .input-group .form-control-dark {
            border-left: none;
          }
          
          .privacy-alert {
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 14px;
            padding: 1rem 1.25rem;
            color: #93c5fd;
          }
          
          .private-section {
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 1rem;
          }
          
          .dropzone {
            background: #0f172a;
            border: 2px dashed #334155;
            border-radius: 16px;
            padding: 2.5rem;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .dropzone:hover {
            border-color: #60a5fa;
            background: rgba(59, 130, 246, 0.05);
          }
          
          .dropzone.active {
            border-color: #60a5fa;
            background: rgba(59, 130, 246, 0.1);
          }
          
          .image-preview-container {
            position: relative;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #334155;
          }
          
          .delete-image-btn {
            position: absolute;
            top: 8px;
            right: 8px;
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 50%;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            z-index: 2;
          }
          
          .delete-image-btn:hover {
            background: #dc2626;
            transform: scale(1.1);
          }
          
          .btn-gradient-primary {
            background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            padding: 0.75rem 2rem;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }
          
          .btn-gradient-primary:hover {
            background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
            color: white;
          }
          
          .btn-gradient-primary:disabled {
            opacity: 0.6;
            transform: none;
            box-shadow: none;
          }
          
          .btn-outline-secondary-custom {
            background: transparent;
            color: #94a3b8;
            border: 1px solid #334155;
            border-radius: 12px;
            font-weight: 600;
            padding: 0.75rem 2rem;
            transition: all 0.3s ease;
          }
          
          .btn-outline-secondary-custom:hover {
            background: #1e293b;
            border-color: #60a5fa;
            color: #e2e8f0;
          }
          
          .radio-group {
            display: flex;
            gap: 1.5rem;
            margin-top: 0.5rem;
          }
          
          .radio-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #cbd5e1;
            cursor: pointer;
          }
          
          .radio-label input[type="radio"] {
            accent-color: #60a5fa;
            width: 18px;
            height: 18px;
          }
          
          .required-star {
            color: #ef4444;
            margin-left: 2px;
          }
          
          .gradient-text {
            background: linear-gradient(135deg, #60a5fa 0%, #34d399 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .action-bar {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            margin-top: 2rem;
          }
          
          .status-badge {
            display: inline-block;
            padding: 0.5rem 1rem;
            border-radius: 10px;
            font-size: 0.9rem;
            font-weight: 500;
          }
        `}
      </style>

      <Container style={{ maxWidth: '900px' }}>
        
        {/* Page Header */}
        <div className="page-header">
          <button 
            className="back-button"
            onClick={() => navigate('/my-tools')}
          >
            <FaArrowLeft size={20} />
          </button>
          <h2 className="mb-0">
            <span className="gradient-text">Edit Tool Listing</span>
          </h2>
        </div>
        
        <Form onSubmit={handleSubmit}>
          
          {/* SECTION 1: BASIC INFO */}
          <div className="section-card">
            <div className="section-header">
              <FaWrench style={{ color: '#60a5fa', fontSize: '1.25rem' }} />
              <h5>Basic Information</h5>
            </div>
            <div className="section-body">
              <Row>
                <Col md={7}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-dark">
                      Tool Name <span className="required-star">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Bosch Professional Drill"
                      className="form-control-dark"
                      isInvalid={!!errors.name}
                    />
                    {errors.name && (
                      <div style={{ color: '#fca5a5', fontSize: '0.875rem', marginTop: '4px' }}>
                        {errors.name}
                      </div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={5}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-dark">Status</Form.Label>
                    <Form.Select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="form-select-dark"
                    >
                      <option value="AVAILABLE">🟢 Available</option>
                      <option value="BORROWED">🟡 Borrowed</option>
                      <option value="MAINTENANCE">🔴 Maintenance</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label className="form-label-dark">
                  Category <span className="required-star">*</span>
                </Form.Label>
                <Form.Select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="form-select-dark"
                  isInvalid={!!errors.categoryId}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </Form.Select>
                {errors.categoryId && (
                  <div style={{ color: '#fca5a5', fontSize: '0.875rem', marginTop: '4px' }}>
                    {errors.categoryId}
                  </div>
                )}
              </Form.Group>

              <Form.Group className="mb-0">
                <Form.Label className="form-label-dark">Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your tool's condition, included accessories, etc..."
                  className="form-control-dark"
                />
              </Form.Group>
            </div>
          </div>

          {/* SECTION 2: PRICING */}
          <div className="section-card">
            <div className="section-header">
              <FaRupeeSign style={{ color: '#34d399', fontSize: '1.25rem' }} />
              <h5>Pricing Details</h5>
            </div>
            <div className="section-body">
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="form-label-dark">
                      Daily Rate (₹) <span className="required-star">*</span>
                    </Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="input-group-text-dark">
                        <FaRupeeSign />
                      </InputGroup.Text>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="dailyRate"
                        value={formData.dailyRate}
                        onChange={handleChange}
                        className="form-control-dark"
                        isInvalid={!!errors.dailyRate}
                      />
                    </InputGroup>
                    {errors.dailyRate && (
                      <div style={{ color: '#fca5a5', fontSize: '0.875rem', marginTop: '4px' }}>
                        {errors.dailyRate}
                      </div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="form-label-dark">Weekly Rate (₹) (Optional)</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="input-group-text-dark">
                        <FaRupeeSign />
                      </InputGroup.Text>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="weeklyRate"
                        value={formData.weeklyRate}
                        onChange={handleChange}
                        className="form-control-dark"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="form-label-dark">Monthly Rate (₹) (Optional)</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="input-group-text-dark">
                        <FaRupeeSign />
                      </InputGroup.Text>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="monthlyRate"
                        value={formData.monthlyRate}
                        onChange={handleChange}
                        className="form-control-dark"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="form-label-dark">Deposit Amount (₹) (Optional)</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="input-group-text-dark">
                        <FaRupeeSign />
                      </InputGroup.Text>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="depositAmount"
                        value={formData.depositAmount}
                        onChange={handleChange}
                        placeholder="Refundable deposit"
                        className="form-control-dark"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </div>

          {/* SECTION 3: LOCATION & CONTACT */}
          <div className="section-card">
            <div className="section-header">
              <FaMapMarkerAlt style={{ color: '#f59e0b', fontSize: '1.25rem' }} />
              <h5>Location & Pickup</h5>
            </div>
            <div className="section-body">
              <div className="privacy-alert mb-4">
                <FaShieldAlt className="me-2" />
                Updating your Pincode, City, or State will recalculate your tool's map position. 
                <strong> Your exact house address remains hidden</strong> until a booking is confirmed.
              </div>

              <Row className="g-3 mb-4">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="form-label-dark">
                      Pincode <span className="required-star">*</span>
                    </Form.Label>
                    <Form.Control 
                      type="text" 
                      name="pincode" 
                      value={formData.pincode} 
                      onChange={handleChange} 
                      className="form-control-dark"
                      isInvalid={!!errors.pincode} 
                    />
                    {errors.pincode && (
                      <div style={{ color: '#fca5a5', fontSize: '0.875rem', marginTop: '4px' }}>
                        {errors.pincode}
                      </div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="form-label-dark">
                      City <span className="required-star">*</span>
                    </Form.Label>
                    <Form.Control 
                      type="text" 
                      name="city" 
                      value={formData.city} 
                      onChange={handleChange} 
                      className="form-control-dark"
                      isInvalid={!!errors.city} 
                    />
                    {errors.city && (
                      <div style={{ color: '#fca5a5', fontSize: '0.875rem', marginTop: '4px' }}>
                        {errors.city}
                      </div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="form-label-dark">
                      State <span className="required-star">*</span>
                    </Form.Label>
                    <Form.Control 
                      type="text" 
                      name="state" 
                      value={formData.state} 
                      onChange={handleChange} 
                      className="form-control-dark"
                      isInvalid={!!errors.state} 
                    />
                    {errors.state && (
                      <div style={{ color: '#fca5a5', fontSize: '0.875rem', marginTop: '4px' }}>
                        {errors.state}
                      </div>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              <div className="private-section">
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-dark">Private Pickup Instructions</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="pickupInstructions"
                    value={formData.pickupInstructions}
                    onChange={handleChange}
                    placeholder="e.g., House No. 42, Near City Mall. Call when you arrive."
                    className="form-control-dark"
                  />
                </Form.Group>

                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="form-label-dark">
                        Contact Number <span className="required-star">*</span>
                      </Form.Label>
                      <InputGroup>
                        <InputGroup.Text className="input-group-text-dark">
                          <FaPhone />
                        </InputGroup.Text>
                        <Form.Control
                          type="tel"
                          name="ownerContact"
                          value={formData.ownerContact}
                          onChange={handleChange}
                          className="form-control-dark"
                          isInvalid={!!errors.ownerContact}
                        />
                      </InputGroup>
                      {errors.ownerContact && (
                        <div style={{ color: '#fca5a5', fontSize: '0.875rem', marginTop: '4px' }}>
                          {errors.ownerContact}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="form-label-dark">Contact Preference</Form.Label>
                      <div className="radio-group">
                        {['CALL', 'TEXT', 'BOTH'].map(method => (
                          <label key={method} className="radio-label">
                            <input
                              type="radio"
                              name="contactMethod"
                              value={method}
                              checked={formData.contactMethod === method}
                              onChange={handleChange}
                            />
                            {method === 'BOTH' ? 'Both' : method.charAt(0) + method.slice(1).toLowerCase()}
                          </label>
                        ))}
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </div>
          </div>

          {/* SECTION 4: IMAGES */}
          <div className="section-card">
            <div className="section-header">
              <FaImages style={{ color: '#a78bfa', fontSize: '1.25rem' }} />
              <h5>Photos</h5>
            </div>
            <div className="section-body">
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="mb-4">
                  <Form.Label className="form-label-dark">Current Photos</Form.Label>
                  <Row className="g-3">
                    {existingImages.map((image, index) => (
                      <Col key={`existing-${index}`} xs={4} md={3} lg={2}>
                        <div className="image-preview-container">
                          <Image 
                            src={image} 
                            style={{ height: '100px', width: '100%', objectFit: 'cover' }} 
                          />
                          <button
                            type="button"
                            className="delete-image-btn"
                            onClick={() => removeExistingImage(index)}
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}

              {/* Dropzone */}
              <Form.Label className="form-label-dark">Upload New Photos</Form.Label>
              <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? 'active' : ''}`}
              >
                <input {...getInputProps()} />
                <FaUpload size={36} style={{ color: '#64748b', marginBottom: '1rem' }} />
                <h6 style={{ color: '#e2e8f0', marginBottom: '0.5rem' }}>
                  {isDragActive ? 'Drop images here!' : 'Click or drag images here to upload'}
                </h6>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 0 }}>
                  Max 5 photos (JPG, PNG)
                </p>
              </div>

              {/* New Image Previews */}
              {newImagePreviews.length > 0 && (
                <div className="mt-4">
                  <Form.Label className="form-label-dark">New Photos To Add</Form.Label>
                  <Row className="g-3">
                    {newImagePreviews.map((preview, index) => (
                      <Col key={`new-${index}`} xs={4} md={3} lg={2}>
                        <div className="image-preview-container" style={{ borderColor: '#60a5fa' }}>
                          <Image 
                            src={preview} 
                            style={{ height: '100px', width: '100%', objectFit: 'cover' }} 
                          />
                          <button
                            type="button"
                            className="delete-image-btn"
                            onClick={() => removeNewImage(index)}
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
            </div>
          </div>

          {/* BOTTOM ACTION BAR */}
          <div className="action-bar">
            <Button
              className="btn-outline-secondary-custom"
              onClick={() => navigate('/my-tools')}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              className="btn-gradient-primary"
              type="submit"
              disabled={saving}
            >
              {saving ? (
                <><Spinner animation="border" size="sm" className="me-2" /> Saving...</>
              ) : (
                <><FaSave className="me-2" /> Save Changes</>
              )}
            </Button>
          </div>
        </Form>
      </Container>
    </div>
  );
};

export default EditToolPage;