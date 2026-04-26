import React, { useState, useEffect, useRef } from 'react';
import { Container, Form, Button, Card, Row, Col, Image, Alert, Spinner, Modal, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { 
  FaUpload, FaTrash, FaPlus, FaSearch, FaFolderPlus, FaRupeeSign, 
  FaMapMarkerAlt, FaPhone, FaInfoCircle, FaArrowLeft, FaTools,
  FaCheckCircle, FaShieldAlt, FaTag
} from 'react-icons/fa';
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
    pincode: '',
    city: '',
    state: '',
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
    if (!categorySearch.trim()) return categories;
    return categories.filter(cat =>
      cat.name && cat.name.toLowerCase().includes(categorySearch.toLowerCase())
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
        setFormData(prev => ({ ...prev, categoryId: created.id }));
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
    
    if (!formData.pincode?.trim()) newErrors.pincode = 'Pincode is required';
    if (!formData.city?.trim()) newErrors.city = 'City is required';
    if (!formData.state?.trim()) newErrors.state = 'State is required';
    
    if (isFirstTool) {
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
        pincode: formData.pincode,
        city: formData.city,
        state: formData.state,
        pickupInstructions: formData.pickupInstructions,
        ownerContact: formData.ownerContact,
        contactMethod: formData.contactMethod
      });
      toast.success('Tool listed successfully!');
      navigate('/my-tools');
    } catch (error) {
      console.error('Create tool error:', error);
      toast.error(error.response?.data?.message || 'Failed to list tool. Ensure address is valid.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = getFilteredCategories();

  return (
    <div className="add-tool-wrapper">
      <style>
        {`
          .add-tool-wrapper {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            min-height: 100vh;
            padding-top: 76px;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: #e2e8f0;
            padding-bottom: 3rem;
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
          
          .main-card {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 24px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          }
          
          .main-card .card-body {
            padding: 2rem;
          }
          
          .section-title {
            color: #f1f5f9;
            font-weight: 700;
            font-size: 1.25rem;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }
          
          .section-title .icon {
            color: #60a5fa;
          }
          
          .divider {
            border-color: #334155;
            margin: 1.5rem 0;
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
          
          .privacy-alert {
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 14px;
            padding: 1rem 1.25rem;
            color: #93c5fd;
          }
          
          .info-alert {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 12px;
            padding: 0.75rem 1rem;
            color: #6ee7b7;
          }
          
          .btn-gradient-primary {
            background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            padding: 0.75rem 1.5rem;
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
            padding: 0.75rem 1.5rem;
            transition: all 0.3s ease;
          }
          
          .btn-outline-secondary-custom:hover {
            background: #1e293b;
            border-color: #60a5fa;
            color: #e2e8f0;
          }
          
          .btn-outline-primary-custom {
            background: transparent;
            color: #60a5fa;
            border: 1px solid #334155;
            border-radius: 12px;
            font-weight: 600;
            padding: 0.75rem 1.5rem;
            transition: all 0.3s ease;
          }
          
          .btn-outline-primary-custom:hover {
            background: rgba(59, 130, 246, 0.1);
            border-color: #60a5fa;
            color: #93c5fd;
          }
          
          .image-preview-container {
            position: relative;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #334155;
          }
          
          .main-badge {
            position: absolute;
            top: 8px;
            left: 8px;
            background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
            color: white;
            padding: 4px 8px;
            border-radius: 8px;
            font-size: 10px;
            font-weight: 600;
            z-index: 2;
          }
          
          .delete-image-btn {
            position: absolute;
            top: 8px;
            right: 8px;
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 50%;
            width: 24px;
            height: 24px;
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
          
          .modal-dark .modal-content {
            background: #1e293b;
            color: #e2e8f0;
            border: 1px solid #334155;
          }
          
          .modal-dark .modal-header {
            border-bottom: 1px solid #334155;
          }
          
          .modal-dark .modal-footer {
            border-top: 1px solid #334155;
          }
          
          .modal-dark .btn-close {
            filter: invert(1);
          }
          
          .radio-group {
            display: flex;
            gap: 1.5rem;
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
        `}
      </style>

      <Container className="py-4">
        
        {/* Page Header */}
        <div className="page-header">
          <button 
            className="back-button"
            onClick={() => navigate('/my-tools')}
          >
            <FaArrowLeft size={18} />
          </button>
          <h2 className="mb-0">
            <span className="gradient-text">List Your Tool</span>
          </h2>
        </div>
        
        <Row>
          <Col lg={8} className="mx-auto">
            <Card className="main-card">
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  
                  {/* Tool Details Section */}
                  <div className="section-title">
                    <FaTools className="icon" />
                    <span>Tool Details</span>
                  </div>

                  <Form.Group className="mb-4">
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
                    <Form.Control.Feedback type="invalid" style={{ color: '#fca5a5' }}>
                      {errors.name}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="form-label-dark">
                      Category <span className="required-star">*</span>
                    </Form.Label>
                    <InputGroup>
                      <Form.Select
                        name="categoryId"
                        value={formData.categoryId || ''}
                        onChange={handleChange}
                        isInvalid={!!errors.categoryId}
                        className="form-select-dark"
                        style={{ borderRight: 'none' }}
                      >
                        <option value="">Select a category</option>
                        {filteredCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                          </option>
                        ))}
                      </Form.Select>
                      <Button 
                        className="btn-outline-primary-custom"
                        onClick={() => setShowCategoryModal(true)}
                        title="Create new category"
                        style={{ borderLeft: 'none' }}
                      >
                        <FaFolderPlus />
                      </Button>
                    </InputGroup>
                    <div className="mt-2">
                      <InputGroup>
                        <InputGroup.Text className="input-group-text-dark">
                          <FaSearch size={12} />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Search categories..."
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          className="form-control-dark"
                        />
                      </InputGroup>
                    </div>
                    <Form.Text style={{ color: '#64748b' }}>
                      Can't find a category? Click the + button to create one
                    </Form.Text>
                    {errors.categoryId && (
                      <div style={{ color: '#fca5a5', fontSize: '0.875rem', marginTop: '4px' }}>
                        {errors.categoryId}
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="form-label-dark">Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe your tool, its condition, and any special features..."
                      className="form-control-dark"
                    />
                  </Form.Group>

                  {/* Pricing Section */}
                  <div className="section-title mt-4">
                    <FaRupeeSign className="icon" />
                    <span>Pricing</span>
                  </div>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
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
                            min="0"
                            name="dailyRate"
                            value={formData.dailyRate}
                            onChange={handleChange}
                            placeholder="0.00"
                            className="form-control-dark"
                            isInvalid={!!errors.dailyRate}
                          />
                        </InputGroup>
                        <Form.Text style={{ color: '#64748b' }}>
                          Set to 0 for free tools
                        </Form.Text>
                        {errors.dailyRate && (
                          <div style={{ color: '#fca5a5', fontSize: '0.875rem', marginTop: '4px' }}>
                            {errors.dailyRate}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="form-label-dark">Weekly Rate (₹) (Optional)</Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="input-group-text-dark">
                            <FaRupeeSign />
                          </InputGroup.Text>
                          <Form.Control
                            type="number"
                            step="0.01"
                            min="0"
                            name="weeklyRate"
                            value={formData.weeklyRate}
                            onChange={handleChange}
                            placeholder="0.00"
                            className="form-control-dark"
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="form-label-dark">Monthly Rate (₹) (Optional)</Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="input-group-text-dark">
                            <FaRupeeSign />
                          </InputGroup.Text>
                          <Form.Control
                            type="number"
                            step="0.01"
                            min="0"
                            name="monthlyRate"
                            value={formData.monthlyRate}
                            onChange={handleChange}
                            placeholder="0.00"
                            className="form-control-dark"
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="form-label-dark">Deposit Amount (₹) (Optional)</Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="input-group-text-dark">
                            <FaRupeeSign />
                          </InputGroup.Text>
                          <Form.Control
                            type="number"
                            step="0.01"
                            min="0"
                            name="depositAmount"
                            value={formData.depositAmount}
                            onChange={handleChange}
                            placeholder="0.00"
                            className="form-control-dark"
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Location Section */}
                  <div className="section-title mt-4">
                    <FaMapMarkerAlt className="icon" />
                    <span>Location & Search Settings</span>
                  </div>
                  
                  <div className="privacy-alert mb-4">
                    <FaShieldAlt className="me-2" />
                    <strong>Privacy First:</strong> We only use your Pincode, City, and State to place your tool on the map. Your exact address is kept hidden until a booking is confirmed.
                    {isFirstTool && <strong> Contact details required for your first tool.</strong>}
                  </div>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-4">
                        <Form.Label className="form-label-dark">
                          Pincode <span className="required-star">*</span>
                        </Form.Label>
                        <Form.Control 
                          type="text" 
                          name="pincode" 
                          value={formData.pincode} 
                          onChange={handleChange} 
                          placeholder="e.g., 249404" 
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
                      <Form.Group className="mb-4">
                        <Form.Label className="form-label-dark">
                          City <span className="required-star">*</span>
                        </Form.Label>
                        <Form.Control 
                          type="text" 
                          name="city" 
                          value={formData.city} 
                          onChange={handleChange} 
                          placeholder="e.g., Haridwar" 
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
                      <Form.Group className="mb-4">
                        <Form.Label className="form-label-dark">
                          State <span className="required-star">*</span>
                        </Form.Label>
                        <Form.Control 
                          type="text" 
                          name="state" 
                          value={formData.state} 
                          onChange={handleChange} 
                          placeholder="e.g., Uttarakhand" 
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

                  <Form.Group className="mb-4">
                    <Form.Label className="form-label-dark">Exact Address & Pickup Instructions</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="pickupInstructions"
                      value={formData.pickupInstructions}
                      onChange={handleChange}
                      placeholder="e.g., House No. 42, Near City Mall. Call when you arrive."
                      className="form-control-dark"
                    />
                    <Form.Text style={{ color: '#64748b' }}>
                      Only shared with the borrower AFTER you approve their booking request.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="form-label-dark">
                      Contact Number {isFirstTool && <span className="required-star">*</span>}
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
                        placeholder="+91 98765 43210"
                        className="form-control-dark"
                        isInvalid={!!errors.ownerContact}
                      />
                    </InputGroup>
                    <Form.Text style={{ color: '#64748b' }}>
                      Your phone number for borrower to contact you
                    </Form.Text>
                    {errors.ownerContact && (
                      <div style={{ color: '#fca5a5', fontSize: '0.875rem', marginTop: '4px' }}>
                        {errors.ownerContact}
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="form-label-dark">Preferred Contact Method</Form.Label>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="contactMethod"
                          value="CALL"
                          checked={formData.contactMethod === 'CALL'}
                          onChange={handleChange}
                        />
                        Call
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="contactMethod"
                          value="TEXT"
                          checked={formData.contactMethod === 'TEXT'}
                          onChange={handleChange}
                        />
                        Text
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="contactMethod"
                          value="BOTH"
                          checked={formData.contactMethod === 'BOTH'}
                          onChange={handleChange}
                        />
                        Both
                      </label>
                    </div>
                  </Form.Group>

                  {/* Images Section */}
                  <div className="section-title mt-4">
                    <FaUpload className="icon" />
                    <span>Images <span className="required-star">*</span></span>
                  </div>

                  <Form.Group className="mb-4">
                    <div
                      {...getRootProps()}
                      className={`dropzone ${isDragActive ? 'active' : ''}`}
                    >
                      <input {...getInputProps()} />
                      <FaUpload size={36} style={{ color: '#64748b', marginBottom: '1rem' }} />
                      <p style={{ color: '#e2e8f0', marginBottom: '0.5rem' }}>
                        {isDragActive
                          ? 'Drop images here...'
                          : 'Drag & drop images here, or click to select'}
                      </p>
                      <small style={{ color: '#64748b' }}>Up to 5 images (JPG, PNG)</small>
                    </div>
                    <div className="info-alert mt-3">
                      <FaInfoCircle className="me-2" />
                      <small>
                        <strong>Note:</strong> The first image you upload will be used as the main preview image.
                      </small>
                    </div>
                    {errors.images && (
                      <div style={{ color: '#fca5a5', fontSize: '0.875rem', marginTop: '8px' }}>
                        {errors.images}
                      </div>
                    )}
                  </Form.Group>

                  {imagePreviews.length > 0 && (
                    <div className="mb-4">
                      <Form.Label className="form-label-dark">Preview</Form.Label>
                      <Row>
                        {imagePreviews.map((preview, index) => (
                          <Col key={index} xs={4} md={3} className="mb-3">
                            <div className="image-preview-container">
                              <Image
                                src={preview}
                                style={{ 
                                  height: '100px', 
                                  width: '100%', 
                                  objectFit: 'cover'
                                }}
                              />
                              {index === 0 && (
                                <div className="main-badge">
                                  Main
                                </div>
                              )}
                              <button
                                type="button"
                                className="delete-image-btn"
                                onClick={() => removeImage(index)}
                              >
                                <FaTrash size={12} />
                              </button>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="d-flex gap-3 mt-4 pt-3">
                    <Button
                      className="btn-outline-secondary-custom"
                      onClick={() => navigate('/my-tools')}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="btn-gradient-primary flex-grow-1"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <Spinner animation="border" size="sm" className="me-2" />
                      ) : (
                        <FaPlus className="me-2" />
                      )}
                      {loading ? 'Creating...' : 'List Tool'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Create Category Modal */}
        <Modal 
          show={showCategoryModal} 
          onHide={() => setShowCategoryModal(false)} 
          centered
          className="modal-dark"
        >
          <Modal.Header closeButton>
            <Modal.Title style={{ color: '#f1f5f9' }}>
              <FaFolderPlus className="me-2" style={{ color: '#60a5fa' }} />
              Create New Category
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="form-label-dark">Category Name *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., Power Tools"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="form-control-dark"
                  autoFocus
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="form-label-dark">Description *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Brief description of this category"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="form-control-dark"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="form-label-dark">Icon (Emoji)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., 🔧, 🛠️, ⚡"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                  className="form-control-dark"
                />
                <Form.Text style={{ color: '#64748b' }}>
                  Add an emoji to make your category stand out
                </Form.Text>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              className="btn-outline-secondary-custom"
              onClick={() => setShowCategoryModal(false)}
            >
              Cancel
            </Button>
            <Button 
              className="btn-gradient-primary"
              onClick={handleCreateCategory}
              disabled={creatingCategory || !newCategory.name.trim() || !newCategory.description.trim()}
            >
              {creatingCategory ? <Spinner animation="border" size="sm" /> : 'Create Category'}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default AddToolPage;