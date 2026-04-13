import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, Image, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { 
  FaUpload, FaTrash, FaSave, FaArrowLeft, FaMapMarkerAlt, 
  FaPhone, FaInfoCircle, FaRupeeSign, FaWrench, FaTags, FaImages 
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
  
  // FIXED: Strictly using pincode, city, and state. Removed 'location' and 'pickupLocation'.
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
        // FIXED: Hydrate new location fields
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
    if (!formData.dailyRate || parseFloat(formData.dailyRate) <= 0) {
      newErrors.dailyRate = 'Valid daily rate is required';
    }
    
    // FIXED: Validate individual location fields
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
      <Container className="py-5 text-center mt-5">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        <h5 className="mt-3 text-muted">Loading tool details...</h5>
      </Container>
    );
  }

  return (
    <Container className="py-4" style={{ maxWidth: '900px' }}>
      <div className="d-flex align-items-center mb-4">
        <Button 
          variant="link" 
          className="text-decoration-none p-0 me-3 text-secondary hover-primary"
          onClick={() => navigate('/my-tools')}
          title="Back to My Tools"
        >
          <FaArrowLeft size={24} />
        </Button>
        <h2 className="mb-0 fw-bold">Edit Tool Listing</h2>
      </div>
      
      <Form onSubmit={handleSubmit}>
        
        {/* SECTION 1: BASIC INFO */}
        <Card className="shadow-sm mb-4 border-0 rounded-4">
          <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
            <h5 className="text-primary fw-bold mb-0">
              <FaWrench className="me-2 mb-1" /> Basic Information
            </h5>
          </Card.Header>
          <Card.Body className="p-4">
            <Row>
              <Col md={7}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Tool Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., DeWalt Cordless Drill"
                    isInvalid={!!errors.name}
                    className="p-2"
                  />
                  <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="p-2 bg-light"
                  >
                    <option value="AVAILABLE">🟢 Available</option>
                    <option value="BORROWED">🟡 Borrowed</option>
                    <option value="MAINTENANCE">🔴 Maintenance</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Category <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                isInvalid={!!errors.categoryId}
                className="p-2"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.categoryId}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-0">
              <Form.Label className="fw-semibold">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your tool's condition, included accessories, etc..."
                className="p-2"
              />
            </Form.Group>
          </Card.Body>
        </Card>

        {/* SECTION 2: PRICING */}
        <Card className="shadow-sm mb-4 border-0 rounded-4">
          <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
            <h5 className="text-primary fw-bold mb-0">
              <FaTags className="me-2 mb-1" /> Pricing Details
            </h5>
          </Card.Header>
          <Card.Body className="p-4">
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Daily Rate <span className="text-danger">*</span></Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light"><FaRupeeSign /></InputGroup.Text>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="dailyRate"
                      value={formData.dailyRate}
                      onChange={handleChange}
                      isInvalid={!!errors.dailyRate}
                    />
                  </InputGroup>
                  <Form.Control.Feedback type="invalid">{errors.dailyRate}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted">Weekly Rate (Optional)</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light"><FaRupeeSign /></InputGroup.Text>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="weeklyRate"
                      value={formData.weeklyRate}
                      onChange={handleChange}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted">Monthly Rate (Optional)</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light"><FaRupeeSign /></InputGroup.Text>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="monthlyRate"
                      value={formData.monthlyRate}
                      onChange={handleChange}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted">Deposit Amount (Optional)</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light"><FaRupeeSign /></InputGroup.Text>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="depositAmount"
                      value={formData.depositAmount}
                      onChange={handleChange}
                      placeholder="Refundable deposit"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* SECTION 3: LOCATION & CONTACT */}
        <Card className="shadow-sm mb-4 border-0 rounded-4">
          <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
            <h5 className="text-primary fw-bold mb-0">
              <FaMapMarkerAlt className="me-2 mb-1" /> Location & Pickup
            </h5>
          </Card.Header>
          <Card.Body className="p-4">
            <Alert variant="primary" className="bg-primary bg-opacity-10 border-0 text-primary">
              <FaInfoCircle className="me-2 mb-1" />
              Updating your Pincode, City, or State will recalculate your tool's map position. <strong>Your exact house address remains hidden</strong> until a booking is confirmed.
            </Alert>

            <Row className="g-3 mb-4">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Pincode <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="text" name="pincode" value={formData.pincode} onChange={handleChange} isInvalid={!!errors.pincode} />
                  <Form.Control.Feedback type="invalid">{errors.pincode}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">City <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="text" name="city" value={formData.city} onChange={handleChange} isInvalid={!!errors.city} />
                  <Form.Control.Feedback type="invalid">{errors.city}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">State <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="text" name="state" value={formData.state} onChange={handleChange} isInvalid={!!errors.state} />
                  <Form.Control.Feedback type="invalid">{errors.state}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <div className="p-3 bg-light rounded-3 mb-4 border">
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Private Pickup Instructions</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="pickupInstructions"
                  value={formData.pickupInstructions}
                  onChange={handleChange}
                  placeholder="e.g., House No. 42, Opposite Gupta Sweets. Call when you arrive."
                />
              </Form.Group>

              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Contact Number <span className="text-danger">*</span></Form.Label>
                    <InputGroup>
                      <InputGroup.Text><FaPhone /></InputGroup.Text>
                      <Form.Control
                        type="tel"
                        name="ownerContact"
                        value={formData.ownerContact}
                        onChange={handleChange}
                        isInvalid={!!errors.ownerContact}
                      />
                    </InputGroup>
                    <Form.Control.Feedback type="invalid">{errors.ownerContact}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Contact Preference</Form.Label>
                    <div className="d-flex mt-2 gap-3">
                      {['CALL', 'TEXT', 'BOTH'].map(method => (
                        <Form.Check
                          key={method}
                          inline
                          label={method === 'BOTH' ? 'Both' : method.charAt(0) + method.slice(1).toLowerCase()}
                          name="contactMethod"
                          type="radio"
                          value={method}
                          checked={formData.contactMethod === method}
                          onChange={handleChange}
                          id={`radio-${method}`}
                        />
                      ))}
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </Card.Body>
        </Card>

        {/* SECTION 4: IMAGES */}
        <Card className="shadow-sm mb-4 border-0 rounded-4">
          <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
            <h5 className="text-primary fw-bold mb-0">
              <FaImages className="me-2 mb-1" /> Photos
            </h5>
          </Card.Header>
          <Card.Body className="p-4">
            
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <Form.Label className="fw-semibold text-muted">Current Photos</Form.Label>
                <Row className="g-2">
                  {existingImages.map((image, index) => (
                    <Col key={`existing-${index}`} xs={4} md={3} lg={2}>
                      <div className="position-relative h-100">
                        <Image 
                          src={image} 
                          className="rounded border" 
                          style={{ height: '100px', width: '100%', objectFit: 'cover' }} 
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          className="position-absolute top-0 end-0 m-1 rounded-circle p-1 shadow-sm"
                          onClick={() => removeExistingImage(index)}
                        >
                          <FaTrash size={12} />
                        </Button>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            )}

            {/* Dropzone */}
            <Form.Label className="fw-semibold text-muted">Upload New Photos</Form.Label>
            <div
              {...getRootProps()}
              className={`border-2 rounded-4 p-5 text-center transition-all ${
                isDragActive ? 'border-primary bg-primary bg-opacity-10' : 'border-dashed border-secondary bg-light'
              }`}
              style={{ cursor: 'pointer', borderStyle: 'dashed' }}
            >
              <input {...getInputProps()} />
              <FaUpload size={40} className={`mb-3 ${isDragActive ? 'text-primary' : 'text-secondary'}`} />
              <h6 className="mb-1">{isDragActive ? 'Drop images here!' : 'Click or drag images here to upload'}</h6>
              <p className="text-muted small mb-0">Max 5 photos (JPG, PNG)</p>
            </div>

            {/* New Image Previews */}
            {newImagePreviews.length > 0 && (
              <div className="mt-4">
                <Form.Label className="fw-semibold text-muted">New Photos To Add</Form.Label>
                <Row className="g-2">
                  {newImagePreviews.map((preview, index) => (
                    <Col key={`new-${index}`} xs={4} md={3} lg={2}>
                      <div className="position-relative h-100">
                        <Image 
                          src={preview} 
                          className="rounded border border-primary border-2" 
                          style={{ height: '100px', width: '100%', objectFit: 'cover' }} 
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          className="position-absolute top-0 end-0 m-1 rounded-circle p-1 shadow-sm"
                          onClick={() => removeNewImage(index)}
                        >
                          <FaTrash size={12} />
                        </Button>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* BOTTOM ACTION BAR */}
        <div className="d-flex gap-3 justify-content-end mb-5 pb-5">
          <Button
            variant="light"
            size="lg"
            className="px-4 border"
            onClick={() => navigate('/my-tools')}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            size="lg"
            className="px-5 shadow-sm"
            disabled={saving}
          >
            {saving ? (
              <><Spinner animation="border" size="sm" className="me-2" /> Saving...</>
            ) : (
              <><FaSave className="me-2 mb-1" /> Save Changes</>
            )}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default EditToolPage;