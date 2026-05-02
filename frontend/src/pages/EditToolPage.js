import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, Image, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { 
  FaUpload, FaTrash, FaSave, FaArrowLeft, FaMapMarkerAlt, 
  FaPhone, FaRupeeSign, FaWrench, FaImages, FaShieldAlt
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
    name: '', description: '', categoryId: '', dailyRate: '', weeklyRate: '',
    monthlyRate: '', depositAmount: '', status: '', pincode: '', city: '',
    state: '', pickupInstructions: '', ownerContact: '', contactMethod: 'BOTH'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tool, categoriesData] = await Promise.all([
        toolService.getToolById(id),
        toolService.getCategories()
      ]);
      setFormData({
        name: tool.name || '', description: tool.description || '', categoryId: tool.categoryId || '',
        dailyRate: tool.dailyRate || '', weeklyRate: tool.weeklyRate || '', monthlyRate: tool.monthlyRate || '',
        depositAmount: tool.depositAmount || '', status: tool.status || 'AVAILABLE',
        pincode: tool.pincode || '', city: tool.city || '', state: tool.state || '',
        pickupInstructions: tool.pickupInstructions || '', ownerContact: tool.ownerContact || '',
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
    onDrop, accept: { 'image/*': [] }, maxFiles: 5,
  });

  const removeExistingImage = (index) => setExistingImages(existingImages.filter((_, i) => i !== index));
  const removeNewImage = (index) => {
    setNewImages(newImages.filter((_, i) => i !== index));
    setNewImagePreviews(newImagePreviews.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Tool name is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.dailyRate || parseFloat(formData.dailyRate) < 0) newErrors.dailyRate = 'Valid daily rate is required';
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
      await toolService.updateTool(id, {
        ...formData,
        dailyRate: parseFloat(formData.dailyRate),
        weeklyRate: formData.weeklyRate ? parseFloat(formData.weeklyRate) : null,
        monthlyRate: formData.monthlyRate ? parseFloat(formData.monthlyRate) : null,
        depositAmount: formData.depositAmount ? parseFloat(formData.depositAmount) : null,
        images: [...existingImages, ...newImages]
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
        <style>{`.edit-tool-wrapper { background: #121212; min-height: 100vh; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }`}</style>
        <Container className="py-5 text-center">
          <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '400px' }}>
            <Spinner animation="border" style={{ color: '#34D399', width: '3rem', height: '3rem' }} />
            <p className="mt-3" style={{ color: '#A3A3A3' }}>Loading tool details...</p>
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
            background: #121212;
            min-height: 100vh;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: #E5E5E5;
            padding-bottom: 4rem;
            padding-top: 76px;
          }

          .page-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
            padding-top: 1rem;
          }

          .page-header h2 {
            font-weight: 700;
            color: #F5F5F5;
          }

          .back-btn {
            color: #A3A3A3;
            background: transparent;
            border: 1px solid #2A2A2A;
            border-radius: 8px;
            padding: 0.4rem 0.75rem;
            cursor: pointer;
            transition: all 0.2s;
          }

          .back-btn:hover { border-color: #3A3A3A; color: #E5E5E5; }

          .section-card {
            background: #1E1E1E;
            border: 1px solid #2A2A2A;
            border-radius: 14px;
            margin-bottom: 1.25rem;
            overflow: hidden;
          }

          .section-header {
            padding: 1rem 1.25rem;
            border-bottom: 1px solid #2A2A2A;
            display: flex;
            align-items: center;
            gap: 0.6rem;
          }

          .section-header h5 {
            margin: 0;
            color: #F5F5F5;
            font-weight: 600;
            font-size: 0.95rem;
          }

          .section-body { padding: 1.25rem; }

          .form-label-dark {
            color: #A3A3A3;
            font-weight: 600;
            font-size: 0.85rem;
            margin-bottom: 0.4rem;
          }

          .form-control-dark, .form-select-dark {
            background: #0A0A0A;
            border: 1px solid #2A2A2A;
            color: #E5E5E5;
            border-radius: 10px;
            padding: 0.65rem 0.9rem;
            font-size: 0.9rem;
          }

          .form-control-dark:focus, .form-select-dark:focus {
            border-color: #10B981;
            box-shadow: none;
            background: #0A0A0A;
            color: #E5E5E5;
          }

          .form-control-dark::placeholder { color: #737373; }

          .form-control-dark.is-invalid { border-color: #EF4444; }

          .input-group-text-dark {
            background: #0A0A0A;
            border: 1px solid #2A2A2A;
            color: #A3A3A3;
            border-radius: 10px 0 0 10px;
          }

          .privacy-note {
            background: rgba(16, 185, 129, 0.06);
            border: 1px solid rgba(16, 185, 129, 0.15);
            border-radius: 10px;
            padding: 0.75rem 1rem;
            color: #34D399;
            font-size: 0.85rem;
          }

          .private-section {
            background: #0A0A0A;
            border: 1px solid #2A2A2A;
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 0.75rem;
          }

          .dropzone {
            background: #0A0A0A;
            border: 2px dashed #2A2A2A;
            border-radius: 12px;
            padding: 2rem;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
          }

          .dropzone:hover { border-color: #10B981; }

          .image-preview-container {
            position: relative;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid #2A2A2A;
          }

          .delete-image-btn {
            position: absolute;
            top: 6px; right: 6px;
            background: #EF4444;
            color: #fff;
            border: none;
            border-radius: 6px;
            width: 24px; height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 0.7rem;
          }

          .delete-image-btn:hover { background: #DC2626; }

          .btn-mint {
            background: #10B981;
            color: #121212;
            border: 1px solid #10B981;
            border-radius: 10px;
            font-weight: 600;
            padding: 0.65rem 1.5rem;
            font-size: 0.9rem;
            transition: all 0.2s;
          }

          .btn-mint:hover { background: #059669; border-color: #059669; color: #121212; }
          .btn-mint:disabled { opacity: 0.5; }

          .btn-outline {
            background: transparent;
            color: #A3A3A3;
            border: 1px solid #2A2A2A;
            border-radius: 10px;
            font-weight: 500;
            padding: 0.65rem 1.5rem;
            font-size: 0.9rem;
            transition: all 0.2s;
          }

          .btn-outline:hover { border-color: #3A3A3A; color: #E5E5E5; }

          .radio-group { display: flex; gap: 1.25rem; margin-top: 0.25rem; }
          .radio-label { display: flex; align-items: center; gap: 0.4rem; color: #A3A3A3; cursor: pointer; font-size: 0.9rem; }
          .radio-label input[type="radio"] { accent-color: #10B981; }

          .required-star { color: #EF4444; }

          .action-bar { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem; }

          @media (max-width: 768px) {
            .section-body { padding: 1rem; }
          }
        `}
      </style>

      <Container style={{ maxWidth: '860px' }}>
        
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/my-tools')}>
            <FaArrowLeft size={18} />
          </button>
          <h2>Edit Tool Listing</h2>
        </div>
        
        <Form onSubmit={handleSubmit}>
          
          {/* Basic Info */}
          <div className="section-card">
            <div className="section-header">
              <FaWrench style={{ color: '#34D399' }} />
              <h5>Basic Information</h5>
            </div>
            <div className="section-body">
              <Row>
                <Col md={7}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-dark">Tool Name <span className="required-star">*</span></Form.Label>
                    <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Bosch Professional Drill" className="form-control-dark" isInvalid={!!errors.name} />
                    {errors.name && <div style={{ color: '#FCA5A5', fontSize: '0.8rem', marginTop: '4px' }}>{errors.name}</div>}
                  </Form.Group>
                </Col>
                <Col md={5}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-dark">Status</Form.Label>
                    <Form.Select name="status" value={formData.status} onChange={handleChange} className="form-select-dark">
                      <option value="AVAILABLE">Available</option>
                      <option value="BORROWED">Borrowed</option>
                      <option value="MAINTENANCE">Maintenance</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label className="form-label-dark">Category <span className="required-star">*</span></Form.Label>
                <Form.Select name="categoryId" value={formData.categoryId} onChange={handleChange} className="form-select-dark" isInvalid={!!errors.categoryId}>
                  <option value="">Select a category</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </Form.Select>
                {errors.categoryId && <div style={{ color: '#FCA5A5', fontSize: '0.8rem', marginTop: '4px' }}>{errors.categoryId}</div>}
              </Form.Group>
              <Form.Group>
                <Form.Label className="form-label-dark">Description</Form.Label>
                <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} placeholder="Describe your tool's condition, included accessories..." className="form-control-dark" />
              </Form.Group>
            </div>
          </div>

          {/* Pricing */}
          <div className="section-card">
            <div className="section-header">
              <FaRupeeSign style={{ color: '#34D399' }} />
              <h5>Pricing Details</h5>
            </div>
            <div className="section-body">
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="form-label-dark">Daily Rate (₹) <span className="required-star">*</span></Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="input-group-text-dark">₹</InputGroup.Text>
                      <Form.Control type="number" step="0.01" name="dailyRate" value={formData.dailyRate} onChange={handleChange} className="form-control-dark" isInvalid={!!errors.dailyRate} />
                    </InputGroup>
                    {errors.dailyRate && <div style={{ color: '#FCA5A5', fontSize: '0.8rem', marginTop: '4px' }}>{errors.dailyRate}</div>}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="form-label-dark">Weekly Rate (₹) <span style={{ color: '#737373', fontWeight: 400 }}>(optional)</span></Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="input-group-text-dark">₹</InputGroup.Text>
                      <Form.Control type="number" step="0.01" name="weeklyRate" value={formData.weeklyRate} onChange={handleChange} className="form-control-dark" />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="form-label-dark">Monthly Rate (₹) <span style={{ color: '#737373', fontWeight: 400 }}>(optional)</span></Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="input-group-text-dark">₹</InputGroup.Text>
                      <Form.Control type="number" step="0.01" name="monthlyRate" value={formData.monthlyRate} onChange={handleChange} className="form-control-dark" />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="form-label-dark">Deposit (₹) <span style={{ color: '#737373', fontWeight: 400 }}>(optional)</span></Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="input-group-text-dark">₹</InputGroup.Text>
                      <Form.Control type="number" step="0.01" name="depositAmount" value={formData.depositAmount} onChange={handleChange} placeholder="Refundable" className="form-control-dark" />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </div>

          {/* Location */}
          <div className="section-card">
            <div className="section-header">
              <FaMapMarkerAlt style={{ color: '#34D399' }} />
              <h5>Location & Pickup</h5>
            </div>
            <div className="section-body">
              <div className="privacy-note mb-4">
                <FaShieldAlt className="me-2" />
                Your exact address remains hidden until a booking is confirmed.
              </div>
              <Row className="g-3 mb-4">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="form-label-dark">Pincode <span className="required-star">*</span></Form.Label>
                    <Form.Control type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="form-control-dark" isInvalid={!!errors.pincode} />
                    {errors.pincode && <div style={{ color: '#FCA5A5', fontSize: '0.8rem', marginTop: '4px' }}>{errors.pincode}</div>}
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="form-label-dark">City <span className="required-star">*</span></Form.Label>
                    <Form.Control type="text" name="city" value={formData.city} onChange={handleChange} className="form-control-dark" isInvalid={!!errors.city} />
                    {errors.city && <div style={{ color: '#FCA5A5', fontSize: '0.8rem', marginTop: '4px' }}>{errors.city}</div>}
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="form-label-dark">State <span className="required-star">*</span></Form.Label>
                    <Form.Control type="text" name="state" value={formData.state} onChange={handleChange} className="form-control-dark" isInvalid={!!errors.state} />
                    {errors.state && <div style={{ color: '#FCA5A5', fontSize: '0.8rem', marginTop: '4px' }}>{errors.state}</div>}
                  </Form.Group>
                </Col>
              </Row>
              <div className="private-section">
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-dark">Pickup Instructions</Form.Label>
                  <Form.Control as="textarea" rows={2} name="pickupInstructions" value={formData.pickupInstructions} onChange={handleChange} placeholder="e.g., House No. 42, Near City Mall" className="form-control-dark" />
                </Form.Group>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="form-label-dark">Contact Number <span className="required-star">*</span></Form.Label>
                      <InputGroup>
                        <InputGroup.Text className="input-group-text-dark"><FaPhone /></InputGroup.Text>
                        <Form.Control type="tel" name="ownerContact" value={formData.ownerContact} onChange={handleChange} className="form-control-dark" isInvalid={!!errors.ownerContact} />
                      </InputGroup>
                      {errors.ownerContact && <div style={{ color: '#FCA5A5', fontSize: '0.8rem', marginTop: '4px' }}>{errors.ownerContact}</div>}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="form-label-dark">Contact Preference</Form.Label>
                      <div className="radio-group">
                        {['CALL', 'TEXT', 'BOTH'].map(method => (
                          <label key={method} className="radio-label">
                            <input type="radio" name="contactMethod" value={method} checked={formData.contactMethod === method} onChange={handleChange} />
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

          {/* Images */}
          <div className="section-card">
            <div className="section-header">
              <FaImages style={{ color: '#34D399' }} />
              <h5>Photos</h5>
            </div>
            <div className="section-body">
              {existingImages.length > 0 && (
                <div className="mb-4">
                  <Form.Label className="form-label-dark">Current Photos</Form.Label>
                  <Row className="g-3">
                    {existingImages.map((image, index) => (
                      <Col key={`existing-${index}`} xs={4} md={3} lg={2}>
                        <div className="image-preview-container">
                          <Image src={image} style={{ height: '90px', width: '100%', objectFit: 'cover' }} />
                          <button type="button" className="delete-image-btn" onClick={() => removeExistingImage(index)}><FaTrash size={10} /></button>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
              <Form.Label className="form-label-dark">Upload New Photos</Form.Label>
              <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                <input {...getInputProps()} />
                <FaUpload size={30} style={{ color: '#737373', marginBottom: '0.75rem' }} />
                <h6 style={{ color: '#E5E5E5', marginBottom: '0.25rem', fontSize: '0.95rem' }}>
                  {isDragActive ? 'Drop images here' : 'Click or drag images to upload'}
                </h6>
                <p style={{ color: '#737373', fontSize: '0.8rem', marginBottom: 0 }}>Max 5 photos (JPG, PNG)</p>
              </div>
              {newImagePreviews.length > 0 && (
                <div className="mt-4">
                  <Form.Label className="form-label-dark">New Photos</Form.Label>
                  <Row className="g-3">
                    {newImagePreviews.map((preview, index) => (
                      <Col key={`new-${index}`} xs={4} md={3} lg={2}>
                        <div className="image-preview-container">
                          <Image src={preview} style={{ height: '90px', width: '100%', objectFit: 'cover' }} />
                          <button type="button" className="delete-image-btn" onClick={() => removeNewImage(index)}><FaTrash size={10} /></button>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
            </div>
          </div>

          <div className="action-bar">
            <Button className="btn-outline" onClick={() => navigate('/my-tools')} disabled={saving}>Cancel</Button>
            <Button className="btn-mint" type="submit" disabled={saving}>
              {saving ? <><Spinner animation="border" size="sm" className="me-2" /> Saving...</> : <><FaSave className="me-2" /> Save Changes</>}
            </Button>
          </div>
        </Form>
      </Container>
    </div>
  );
};

export default EditToolPage;