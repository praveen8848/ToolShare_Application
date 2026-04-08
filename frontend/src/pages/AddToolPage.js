import React, { useState, useEffect, useRef } from 'react';
import { Container, Form, Button, Card, Row, Col, Image, Alert, Spinner, Modal, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaTrash, FaPlus, FaSearch, FaFolderPlus, FaRupeeSign, FaMapMarkerAlt, FaPhone, FaInfoCircle, FaArrowLeft } from 'react-icons/fa';
import toolService from '../services/toolService';
import categoryService from '../services/categoryService';
import { toast } from 'react-toastify';

const AddToolPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    icon: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    dailyRate: '',
    weeklyRate: '',
    monthlyRate: '',
    depositAmount: '',
    location: '',
    pickupLocation: '',
    pickupInstructions: '',
    ownerContact: '',
    contactMethod: 'BOTH'
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [isFirstTool, setIsFirstTool] = useState(false);

  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;

    loadedRef.current = true;

    const init = async () => {
      await Promise.all([
        loadCategories(),
        checkIfFirstTool()
      ]);
    };

    init();
  }, []);

  const checkIfFirstTool = async () => {
    try {
      const tools = await toolService.getMyTools();
      setIsFirstTool(tools.length === 0);
    } catch (error) {
      console.error('Failed to check tools:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load categories');
      setCategories([]);
    }
  };

  const getFilteredCategories = () => {
    if (!categorySearch.trim()) {
      return categories;
    }

    return categories.filter(cat =>
      cat.name &&
      cat.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    if (!newCategory.description.trim()) {
      toast.error('Category description is required');
      return;
    }

    setCreatingCategory(true);

    try {
      const created = await categoryService.createCategory({
        name: newCategory.name,
        description: newCategory.description,
        icon: newCategory.icon || '',
        displayOrder: categories.length
      });

      toast.success('Category created successfully!');
      setShowCategoryModal(false);
      setNewCategory({ name: '', description: '', icon: '' });
      setCategorySearch('');

      await loadCategories();

      if (created && created.id) {
        setFormData(prev => ({
          ...prev,
          categoryId: created.id
        }));
      }

    } catch (error) {
      console.error('Create category error:', error);
      toast.error(error.response?.data?.message || 'Failed to create category');
    } finally {
      setCreatingCategory(false);
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
        setImages([...newImages]);
        setImagePreviews([...newPreviews]);
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
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setImages(newImages);
    setImagePreviews(newPreviews);
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
    if (!formData.name?.trim()) newErrors.name = 'Tool name is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (formData.dailyRate === '' || parseFloat(formData.dailyRate) < 0) {
      newErrors.dailyRate = 'Valid daily rate is required (can be 0 for free)';
    }
    if (images.length === 0) newErrors.images = 'At least one image is required';
    
    if (isFirstTool) {
      if (!formData.pickupLocation?.trim()) {
        newErrors.pickupLocation = 'Pickup location is required for your first tool';
      }
      if (!formData.ownerContact?.trim()) {
        newErrors.ownerContact = 'Contact number is required for your first tool';
      }
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

    setLoading(true);
    try {
      await toolService.createTool({
        ...formData,
        dailyRate: parseFloat(formData.dailyRate) || 0,
        weeklyRate: formData.weeklyRate ? parseFloat(formData.weeklyRate) : null,
        monthlyRate: formData.monthlyRate ? parseFloat(formData.monthlyRate) : null,
        depositAmount: formData.depositAmount ? parseFloat(formData.depositAmount) : null,
        images: images,
        pickupLocation: formData.pickupLocation,
        pickupInstructions: formData.pickupInstructions,
        ownerContact: formData.ownerContact,
        contactMethod: formData.contactMethod
      });
      toast.success('Tool listed successfully!');
      navigate('/my-tools');
    } catch (error) {
      console.error('Create tool error:', error);
      toast.error(error.response?.data?.message || 'Failed to list tool');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = getFilteredCategories();

  return (
    <Container className="py-4">
      
      {/* UPDATED: Header with Back Button to match dashboard ratio */}
      <div className="d-flex align-items-center mb-4">
        <Button 
          variant="link" 
          className="text-decoration-none p-0 me-3 text-secondary" 
          onClick={() => navigate('/my-tools')}
          title="Back to My Tools"
        >
          <FaArrowLeft size={22} />
        </Button>
        <h2 className="mb-0">List Your Tool</h2>
      </div>
      
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
                  <InputGroup>
                    <Form.Select
                      name="categoryId"
                      value={formData.categoryId || ''}
                      onChange={handleChange}
                      isInvalid={!!errors.categoryId}
                      style={{ flex: 1 }}
                    >
                      <option value="">Select a category</option>
                      {filteredCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Button 
                      variant="outline-primary" 
                      onClick={() => setShowCategoryModal(true)}
                      title="Create new category"
                    >
                      <FaFolderPlus />
                    </Button>
                  </InputGroup>
                  <div className="mt-2">
                    <InputGroup size="sm">
                      <InputGroup.Text><FaSearch size={12} /></InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Search categories..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            e.stopPropagation();
                          }
                        }}
                        style={{ fontSize: '14px' }}
                      />
                    </InputGroup>
                  </div>
                  <Form.Text className="text-muted">
                    Can't find a category? Click the + button to create one
                  </Form.Text>
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
                      <Form.Label>Daily Rate (₹) *</Form.Label>
                      <InputGroup>
                        <InputGroup.Text><FaRupeeSign /></InputGroup.Text>
                        <Form.Control
                          type="number"
                          step="0.01"
                          min="0"
                          name="dailyRate"
                          value={formData.dailyRate}
                          onChange={handleChange}
                          placeholder="0.00"
                          isInvalid={!!errors.dailyRate}
                        />
                      </InputGroup>
                      <Form.Text className="text-muted">
                        Set to 0 for free tools
                      </Form.Text>
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
                          min="0"
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
                          min="0"
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
                          min="0"
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
                  {isFirstTool && <span className="text-danger ms-2">*</span>}
                </h5>
                <Alert variant="info" className="mb-3">
                  <FaInfoCircle className="me-2" />
                  These details will be shared with the borrower after booking confirmation.
                  {isFirstTool && <strong> Required for your first tool.</strong>}
                </Alert>

                <Form.Group className="mb-3">
                  <Form.Label>Pickup Location {isFirstTool && <span className="text-danger">*</span>}</Form.Label>
                  <Form.Control
                    type="text"
                    name="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={handleChange}
                    placeholder="e.g., 123 Main Street, Apt 4B, City, ZIP"
                    isInvalid={!!errors.pickupLocation}
                  />
                  <Form.Text className="text-muted">
                    Full address where borrower will pick up the tool
                  </Form.Text>
                  <Form.Control.Feedback type="invalid">
                    {errors.pickupLocation}
                  </Form.Control.Feedback>
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
                  <Form.Label>Contact Number {isFirstTool && <span className="text-danger">*</span>}</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FaPhone /></InputGroup.Text>
                    <Form.Control
                      type="tel"
                      name="ownerContact"
                      value={formData.ownerContact}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      isInvalid={!!errors.ownerContact}
                    />
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Your phone number for borrower to contact you
                  </Form.Text>
                  <Form.Control.Feedback type="invalid">
                    {errors.ownerContact}
                  </Form.Control.Feedback>
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
                <h5 className="mb-3 mt-4">Images *</h5>
                <hr className="mt-0 mb-3" />

                <Form.Group className="mb-3">
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
                  <Alert variant="info" className="mt-2 mb-0 py-2">
                    <small>
                      <strong>Note:</strong> The first image you upload will be used as the main preview image for your tool listing.
                    </small>
                  </Alert>
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
                              style={{ 
                                height: '100px', 
                                width: '100%', 
                                objectFit: 'cover',
                                border: index === 0 ? '2px solid #0d6efd' : 'none'
                              }}
                            />
                            {index === 0 && (
                              <div className="position-absolute top-0 start-0 bg-primary text-white px-1 small" style={{ fontSize: '10px' }}>
                                Main
                              </div>
                            )}
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
                    <Form.Text className="text-muted">
                      The image with blue border will appear as the main preview
                    </Form.Text>
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

      {/* Create Category Modal */}
      <Modal show={showCategoryModal} onHide={() => setShowCategoryModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaFolderPlus className="me-2" />
            Create New Category
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Category Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Power Tools"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                autoFocus
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Brief description of this category"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Icon (Emoji)</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., 🔧, 🛠️, ⚡"
                value={newCategory.icon}
                onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
              />
              <Form.Text className="text-muted">
                Add an emoji to make your category stand out
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreateCategory}
            disabled={creatingCategory || !newCategory.name.trim() || !newCategory.description.trim()}
          >
            {creatingCategory ? <Spinner animation="border" size="sm" /> : 'Create Category'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AddToolPage;