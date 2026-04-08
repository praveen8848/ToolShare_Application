import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, Image, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaTrash, FaSave, FaArrowLeft, FaMapMarkerAlt, FaPhone, FaInfoCircle, FaRupeeSign } from 'react-icons/fa';
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
    location: '',
    status: '',
    // NEW: Pickup details fields
    pickupLocation: '',
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
        location: tool.location || '',
        status: tool.status || 'AVAILABLE',
        // NEW: Load pickup details
        pickupLocation: tool.pickupLocation || '',
        pickupInstructions: tool.pickupInstructions || '',
        ownerContact: tool.ownerContact || '',
        contactMethod: tool.contactMethod || 'BOTH'
      });
      
      setExistingImages(tool.images || []);
      setCategories(categoriesData);
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
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors');
      return;
    }

    setSaving(true);
    try {
      // Combine existing images with new images
      const allImages = [...existingImages, ...newImages];
      
      await toolService.updateTool(id, {
        ...formData,
        dailyRate: parseFloat(formData.dailyRate),
        weeklyRate: formData.weeklyRate ? parseFloat(formData.weeklyRate) : null,
        monthlyRate: formData.monthlyRate ? parseFloat(formData.monthlyRate) : null,
        depositAmount: formData.depositAmount ? parseFloat(formData.depositAmount) : null,
        images: allImages,
        // Include pickup details
        pickupLocation: formData.pickupLocation,
        pickupInstructions: formData.pickupInstructions,
        ownerContact: formData.ownerContact,
        contactMethod: formData.contactMethod
      });
      toast.success('Tool updated successfully!');
      navigate('/my-tools');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update tool');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'AVAILABLE': 'success',
      'BORROWED': 'warning',
      'MAINTENANCE': 'danger',
    };
    return variants[status] || 'secondary';
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading tool details...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Button 
        variant="link" 
        className="mb-3 text-decoration-none"
        onClick={() => navigate('/my-tools')}
      >
        <FaArrowLeft className="me-1" /> Back to My Tools
      </Button>
      
      <h2 className="mb-4">Edit Tool</h2>
      
      <Row>
        <Col lg={8} className="mx-auto">
          <Card className="shadow-sm">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {/* Tool Details Section */}
                <h5 className="mb-3">Tool Details</h5>
                <hr className="mt-0 mb-3" />

                <Form.Group className="mb-3">
                  <Form.Label>Tool Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., DeWalt Cordless Drill"
                    isInvalid={!!errors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    isInvalid={!!errors.categoryId}
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.categoryId}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="BORROWED">Borrowed</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Set to "Maintenance" when tool is being repaired
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your tool, its condition, and any special features..."
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Daily Rate (₹) *</Form.Label>
                      <InputGroup>
                        <InputGroup.Text><FaRupeeSign /></InputGroup.Text>
                        <Form.Control
                          type="number"
                          step="0.01"
                          name="dailyRate"
                          value={formData.dailyRate}
                          onChange={handleChange}
                          placeholder="0.00"
                          isInvalid={!!errors.dailyRate}
                        />
                      </InputGroup>
                      <Form.Control.Feedback type="invalid">
                        {errors.dailyRate}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Weekly Rate (₹) (Optional)</Form.Label>
                      <InputGroup>
                        <InputGroup.Text><FaRupeeSign /></InputGroup.Text>
                        <Form.Control
                          type="number"
                          step="0.01"
                          name="weeklyRate"
                          value={formData.weeklyRate}
                          onChange={handleChange}
                          placeholder="0.00"
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Monthly Rate (₹) (Optional)</Form.Label>
                      <InputGroup>
                        <InputGroup.Text><FaRupeeSign /></InputGroup.Text>
                        <Form.Control
                          type="number"
                          step="0.01"
                          name="monthlyRate"
                          value={formData.monthlyRate}
                          onChange={handleChange}
                          placeholder="0.00"
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Deposit Amount (₹) (Optional)</Form.Label>
                      <InputGroup>
                        <InputGroup.Text><FaRupeeSign /></InputGroup.Text>
                        <Form.Control
                          type="number"
                          step="0.01"
                          name="depositAmount"
                          value={formData.depositAmount}
                          onChange={handleChange}
                          placeholder="0.00"
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Pickup Details Section */}
                <h5 className="mb-3 mt-4">
                  <FaMapMarkerAlt className="me-2" />
                  Pickup & Contact Details
                </h5>
                <Alert variant="info" className="mb-3">
                  <FaInfoCircle className="me-2" />
                  These details will be shared with the borrower after booking confirmation.
                </Alert>

                <Form.Group className="mb-3">
                  <Form.Label>Pickup Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={handleChange}
                    placeholder="e.g., 123 Main Street, Apt 4B, City, ZIP"
                  />
                  <Form.Text className="text-muted">
                    Full address where borrower will pick up the tool
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Pickup Instructions</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="pickupInstructions"
                    value={formData.pickupInstructions}
                    onChange={handleChange}
                    placeholder="e.g., Call when you arrive, ring bell #4B, I'll come down"
                  />
                  <Form.Text className="text-muted">
                    Any special instructions for pickup
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Contact Number</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FaPhone /></InputGroup.Text>
                    <Form.Control
                      type="tel"
                      name="ownerContact"
                      value={formData.ownerContact}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                    />
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Your phone number for borrower to contact you
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Preferred Contact Method</Form.Label>
                  <div>
                    <Form.Check
                      inline
                      label="Call"
                      name="contactMethod"
                      type="radio"
                      value="CALL"
                      checked={formData.contactMethod === 'CALL'}
                      onChange={handleChange}
                    />
                    <Form.Check
                      inline
                      label="Text"
                      name="contactMethod"
                      type="radio"
                      value="TEXT"
                      checked={formData.contactMethod === 'TEXT'}
                      onChange={handleChange}
                    />
                    <Form.Check
                      inline
                      label="Both"
                      name="contactMethod"
                      type="radio"
                      value="BOTH"
                      checked={formData.contactMethod === 'BOTH'}
                      onChange={handleChange}
                    />
                  </div>
                </Form.Group>

                {/* Images Section */}
                <h5 className="mb-3 mt-4">Images</h5>
                <hr className="mt-0 mb-3" />

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <Form.Group className="mb-3">
                    <Form.Label>Current Images</Form.Label>
                    <Row>
                      {existingImages.map((image, index) => (
                        <Col key={index} xs={4} md={3} className="mb-2">
                          <div className="position-relative">
                            <Image
                              src={image}
                              thumbnail
                              style={{ height: '100px', width: '100%', objectFit: 'cover' }}
                            />
                            <Button
                              variant="danger"
                              size="sm"
                              className="position-absolute top-0 end-0 rounded-circle"
                              style={{ padding: '2px 6px' }}
                              onClick={() => removeExistingImage(index)}
                            >
                              <FaTrash size={10} />
                            </Button>
                          </div>
                        </Col>
                      ))}
                    </Row>
                    <Form.Text className="text-muted">
                      Click trash icon to remove images
                    </Form.Text>
                  </Form.Group>
                )}

                {/* Add New Images */}
                <Form.Group className="mb-3">
                  <Form.Label>Add New Images</Form.Label>
                  <div
                    {...getRootProps()}
                    className={`border rounded p-4 text-center ${isDragActive ? 'bg-light' : ''}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <input {...getInputProps()} />
                    <FaUpload size={30} className="text-muted mb-2" />
                    <p className="mb-0">
                      {isDragActive
                        ? 'Drop images here...'
                        : 'Drag & drop new images here, or click to select'}
                    </p>
                    <small className="text-muted">Up to 5 images (JPG, PNG)</small>
                  </div>
                </Form.Group>

                {/* New Image Previews */}
                {newImagePreviews.length > 0 && (
                  <div className="mb-3">
                    <Form.Label>New Images Preview</Form.Label>
                    <Row>
                      {newImagePreviews.map((preview, index) => (
                        <Col key={index} xs={4} md={3} className="mb-2">
                          <div className="position-relative">
                            <Image
                              src={preview}
                              thumbnail
                              style={{ height: '100px', width: '100%', objectFit: 'cover' }}
                            />
                            <Button
                              variant="danger"
                              size="sm"
                              className="position-absolute top-0 end-0 rounded-circle"
                              style={{ padding: '2px 6px' }}
                              onClick={() => removeNewImage(index)}
                            >
                              <FaTrash size={10} />
                            </Button>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}

                <div className="d-flex gap-2 mt-4">
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/my-tools')}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={saving}
                    className="flex-grow-1"
                  >
                    {saving ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <><FaSave className="me-2" /> Save Changes</>
                    )}
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

export default EditToolPage;