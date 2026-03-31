import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, Image, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaTrash, FaPlus } from 'react-icons/fa';
import toolService from '../services/toolService';
import { toast } from 'react-toastify';

const AddToolPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    dailyRate: '',
    weeklyRate: '',
    monthlyRate: '',
    depositAmount: '',
    location: '',
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await toolService.getCategories();
      setCategories(data);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const onDrop = (acceptedFiles) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    
    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result);
        newPreviews.push(reader.result);
        setImages(newImages);
        setImagePreviews(newPreviews);
      };
      reader.readAsDataURL(file);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 5,
  });

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
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
    if (images.length === 0) newErrors.images = 'At least one image is required';
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

    setLoading(true);
    try {
      await toolService.createTool({
        ...formData,
        dailyRate: parseFloat(formData.dailyRate),
        weeklyRate: formData.weeklyRate ? parseFloat(formData.weeklyRate) : null,
        monthlyRate: formData.monthlyRate ? parseFloat(formData.monthlyRate) : null,
        depositAmount: formData.depositAmount ? parseFloat(formData.depositAmount) : null,
        images: images,
      });
      toast.success('Tool listed successfully!');
      navigate('/my-tools');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to list tool');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">List Your Tool</h2>
      
      <Row>
        <Col lg={8} className="mx-auto">
          <Card className="shadow-sm">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
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
                      <Form.Label>Daily Rate *</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="dailyRate"
                        value={formData.dailyRate}
                        onChange={handleChange}
                        placeholder="0.00"
                        isInvalid={!!errors.dailyRate}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.dailyRate}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Weekly Rate (Optional)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="weeklyRate"
                        value={formData.weeklyRate}
                        onChange={handleChange}
                        placeholder="0.00"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Monthly Rate (Optional)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="monthlyRate"
                        value={formData.monthlyRate}
                        onChange={handleChange}
                        placeholder="0.00"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Deposit Amount (Optional)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="depositAmount"
                        value={formData.depositAmount}
                        onChange={handleChange}
                        placeholder="0.00"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Pickup Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Downtown, Main Street area"
                  />
                  <Form.Text className="text-muted">
                    Full address will be shared after booking
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Images *</Form.Label>
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
                        : 'Drag & drop images here, or click to select'}
                    </p>
                    <small className="text-muted">Up to 5 images (JPG, PNG)</small>
                  </div>
                  {errors.images && (
                    <div className="text-danger small mt-1">{errors.images}</div>
                  )}
                </Form.Group>

                {imagePreviews.length > 0 && (
                  <div className="mb-3">
                    <Form.Label>Preview</Form.Label>
                    <Row>
                      {imagePreviews.map((preview, index) => (
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
                              onClick={() => removeImage(index)}
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
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="flex-grow-1"
                  >
                    {loading ? <Spinner animation="border" size="sm" /> : <><FaPlus className="me-2" /> List Tool</>}
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

export default AddToolPage;