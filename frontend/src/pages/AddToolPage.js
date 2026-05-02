import React, { useState, useEffect, useRef } from 'react';
import { Container, Form, Button, Row, Col, Image, Spinner, Modal, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { 
  FaUpload, FaTrash, FaPlus, FaSearch, FaFolderPlus, FaRupeeSign, 
  FaMapMarkerAlt, FaPhone, FaInfoCircle, FaArrowLeft, FaTools,
  FaShieldAlt
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
  const [newCategory, setNewCategory] = useState({ name: '', description: '', icon: '' });
  const [formData, setFormData] = useState({
    name: '', description: '', categoryId: '', dailyRate: '', weeklyRate: '',
    monthlyRate: '', depositAmount: '', pincode: '', city: '', state: '',
    pickupInstructions: '', ownerContact: '', contactMethod: 'BOTH'
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [isFirstTool, setIsFirstTool] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    const init = async () => { await Promise.all([loadCategories(), checkIfFirstTool()]); };
    init();
  }, []);

  const checkIfFirstTool = async () => {
    try {
      const tools = await toolService.getMyTools();
      setIsFirstTool(tools.length === 0);
    } catch (error) { /* ignore */ }
  };

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data || []);
    } catch (error) { toast.error('Failed to load categories'); }
  };

  const getFilteredCategories = () => {
    if (!categorySearch.trim()) return categories;
    return categories.filter(cat => cat.name?.toLowerCase().includes(categorySearch.toLowerCase()));
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) return toast.error('Category name is required');
    if (!newCategory.description.trim()) return toast.error('Category description is required');
    setCreatingCategory(true);
    try {
      const created = await categoryService.createCategory({ ...newCategory, displayOrder: categories.length });
      toast.success('Category created!');
      setShowCategoryModal(false);
      setNewCategory({ name: '', description: '', icon: '' });
      setCategorySearch('');
      await loadCategories();
      if (created?.id) setFormData(prev => ({ ...prev, categoryId: created.id }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create category');
    } finally { setCreatingCategory(false); }
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, maxFiles: 5 });

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Tool name is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (formData.dailyRate === '' || parseFloat(formData.dailyRate) < 0) newErrors.dailyRate = 'Valid daily rate is required';
    if (images.length === 0) newErrors.images = 'At least one image is required';
    if (!formData.pincode?.trim()) newErrors.pincode = 'Pincode is required';
    if (!formData.city?.trim()) newErrors.city = 'City is required';
    if (!formData.state?.trim()) newErrors.state = 'State is required';
    if (isFirstTool && !formData.ownerContact?.trim()) newErrors.ownerContact = 'Contact number is required for your first tool';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); toast.error('Please fix the errors'); return; }
    setLoading(true);
    try {
      await toolService.createTool({
        ...formData,
        dailyRate: parseFloat(formData.dailyRate) || 0,
        weeklyRate: formData.weeklyRate ? parseFloat(formData.weeklyRate) : null,
        monthlyRate: formData.monthlyRate ? parseFloat(formData.monthlyRate) : null,
        depositAmount: formData.depositAmount ? parseFloat(formData.depositAmount) : null,
        images,
      });
      toast.success('Tool listed successfully!');
      navigate('/my-tools');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to list tool');
    } finally { setLoading(false); }
  };

  const filteredCategories = getFilteredCategories();

  return (
    <div className="add-tool-wrapper">
      <style>
        {`
          .add-tool-wrapper {
            background: #121212;
            min-height: 100vh;
            padding-top: 76px;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: #E5E5E5;
            padding-bottom: 3rem;
          }
          
          .page-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
            padding-top: 1rem;
          }

          .page-header h2 { font-weight: 700; color: #F5F5F5; font-size: 1.6rem; }
          
          .back-btn {
            background: transparent;
            color: #A3A3A3;
            border: 1px solid #2A2A2A;
            border-radius: 8px;
            padding: 0.4rem 0.75rem;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
          }
          
          .back-btn:hover { border-color: #3A3A3A; color: #E5E5E5; }
          
          .main-card {
            background: #1E1E1E;
            border: 1px solid #2A2A2A;
            border-radius: 14px;
          }
          
          .main-card .card-body { padding: 1.5rem; }
          
          .section-title {
            color: #F5F5F5;
            font-weight: 600;
            font-size: 1.05rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .section-title .icon { color: #34D399; }
          
          .divider {
            border-color: #2A2A2A;
            margin: 1.25rem 0;
          }
          
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
          
          .privacy-note {
            background: rgba(16,185,129,0.04);
            border: 1px solid rgba(16,185,129,0.1);
            border-radius: 10px;
            padding: 0.75rem 1rem;
            color: #34D399;
            font-size: 0.85rem;
          }
          
          .info-note {
            background: rgba(16,185,129,0.04);
            border: 1px solid rgba(16,185,129,0.1);
            border-radius: 8px;
            padding: 0.5rem 0.75rem;
            color: #34D399;
            font-size: 0.8rem;
          }
          
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
          
          .btn-outline-mint {
            background: transparent;
            color: #34D399;
            border: 1px solid rgba(16,185,129,0.2);
            border-radius: 10px;
            font-weight: 600;
            padding: 0.65rem 1rem;
            transition: all 0.2s;
          }
          
          .btn-outline-mint:hover { background: rgba(16,185,129,0.06); border-color: rgba(16,185,129,0.4); }
          
          .image-preview-container {
            position: relative;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid #2A2A2A;
          }
          
          .main-badge {
            position: absolute;
            top: 6px; left: 6px;
            background: #10B981;
            color: #121212;
            padding: 2px 8px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 600;
            z-index: 2;
          }
          
          .delete-image-btn {
            position: absolute;
            top: 6px; right: 6px;
            background: #EF4444;
            color: #fff;
            border: none;
            border-radius: 6px;
            width: 22px; height: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 0.65rem;
          }
          
          .delete-image-btn:hover { background: #DC2626; }
          
          .modal-dark .modal-content {
            background: #1E1E1E;
            color: #E5E5E5;
            border: 1px solid #2A2A2A;
            border-radius: 14px;
          }
          
          .modal-dark .modal-header { border-bottom: 1px solid #2A2A2A; }
          .modal-dark .modal-footer { border-top: 1px solid #2A2A2A; }
          .modal-dark .btn-close { filter: invert(1); }
          
          .radio-group { display: flex; gap: 1.25rem; }
          
          .radio-label {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            color: #A3A3A3;
            cursor: pointer;
            font-size: 0.9rem;
          }
          
          .radio-label input[type="radio"] { accent-color: #10B981; }
          
          .required-star { color: #EF4444; }
        `}
      </style>

      <Container className="py-4">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/my-tools')}><FaArrowLeft size={16} /></button>
          <h2>List Your Tool</h2>
        </div>
        
        <Row>
          <Col lg={8} className="mx-auto">
            <div className="main-card">
              <div className="card-body">
                <Form onSubmit={handleSubmit}>
                  
                  <div className="section-title"><FaTools className="icon" size={18} /><span>Tool Details</span></div>

                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-dark">Tool Name <span className="required-star">*</span></Form.Label>
                    <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Bosch Professional Drill" className="form-control-dark" isInvalid={!!errors.name} />
                    {errors.name && <div style={{ color: '#FCA5A5', fontSize: '0.8rem', marginTop: '4px' }}>{errors.name}</div>}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-dark">Category <span className="required-star">*</span></Form.Label>
                    <InputGroup>
                      <Form.Select name="categoryId" value={formData.categoryId || ''} onChange={handleChange} isInvalid={!!errors.categoryId} className="form-select-dark" style={{ borderRight: 'none' }}>
                        <option value="">Select a category</option>
                        {filteredCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon ? `${cat.icon} ` : ''}{cat.name}</option>)}
                      </Form.Select>
                      <Button className="btn-outline-mint" onClick={() => setShowCategoryModal(true)} title="Create new category" style={{ borderLeft: 'none' }}><FaFolderPlus size={14} /></Button>
                    </InputGroup>
                    <div className="mt-2">
                      <InputGroup>
                        <InputGroup.Text className="input-group-text-dark"><FaSearch size={11} /></InputGroup.Text>
                        <Form.Control type="text" placeholder="Search categories..." value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)} className="form-control-dark" />
                      </InputGroup>
                    </div>
                    {errors.categoryId && <div style={{ color: '#FCA5A5', fontSize: '0.8rem', marginTop: '4px' }}>{errors.categoryId}</div>}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-dark">Description</Form.Label>
                    <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} placeholder="Describe your tool, its condition, and any special features..." className="form-control-dark" />
                  </Form.Group>

                  <div className="section-title mt-4"><FaRupeeSign className="icon" size={18} /><span>Pricing</span></div>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="form-label-dark">Daily Rate (₹) <span className="required-star">*</span></Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="input-group-text-dark">₹</InputGroup.Text>
                          <Form.Control type="number" step="0.01" min="0" name="dailyRate" value={formData.dailyRate} onChange={handleChange} placeholder="0.00" className="form-control-dark" isInvalid={!!errors.dailyRate} />
                        </InputGroup>
                        {errors.dailyRate && <div style={{ color: '#FCA5A5', fontSize: '0.8rem', marginTop: '4px' }}>{errors.dailyRate}</div>}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="form-label-dark">Weekly Rate (₹) <span style={{ color: '#737373', fontWeight: 400 }}>(optional)</span></Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="input-group-text-dark">₹</InputGroup.Text>
                          <Form.Control type="number" step="0.01" min="0" name="weeklyRate" value={formData.weeklyRate} onChange={handleChange} placeholder="0.00" className="form-control-dark" />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="form-label-dark">Monthly Rate (₹) <span style={{ color: '#737373', fontWeight: 400 }}>(optional)</span></Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="input-group-text-dark">₹</InputGroup.Text>
                          <Form.Control type="number" step="0.01" min="0" name="monthlyRate" value={formData.monthlyRate} onChange={handleChange} placeholder="0.00" className="form-control-dark" />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="form-label-dark">Deposit (₹) <span style={{ color: '#737373', fontWeight: 400 }}>(optional)</span></Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="input-group-text-dark">₹</InputGroup.Text>
                          <Form.Control type="number" step="0.01" min="0" name="depositAmount" value={formData.depositAmount} onChange={handleChange} placeholder="0.00" className="form-control-dark" />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="section-title mt-4"><FaMapMarkerAlt className="icon" size={18} /><span>Location</span></div>
                  
                  <div className="privacy-note mb-3">
                    <FaShieldAlt className="me-2" size={14} />
                    We only use your Pincode, City, and State to place your tool on the map. Exact address stays hidden until booking is confirmed.
                    {isFirstTool && <strong> Contact required for first tool.</strong>}
                  </div>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label className="form-label-dark">Pincode <span className="required-star">*</span></Form.Label>
                        <Form.Control type="text" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="e.g., 249404" className="form-control-dark" isInvalid={!!errors.pincode} />
                        {errors.pincode && <div style={{ color: '#FCA5A5', fontSize: '0.8rem', marginTop: '4px' }}>{errors.pincode}</div>}
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label className="form-label-dark">City <span className="required-star">*</span></Form.Label>
                        <Form.Control type="text" name="city" value={formData.city} onChange={handleChange} placeholder="e.g., Haridwar" className="form-control-dark" isInvalid={!!errors.city} />
                        {errors.city && <div style={{ color: '#FCA5A5', fontSize: '0.8rem', marginTop: '4px' }}>{errors.city}</div>}
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label className="form-label-dark">State <span className="required-star">*</span></Form.Label>
                        <Form.Control type="text" name="state" value={formData.state} onChange={handleChange} placeholder="e.g., Uttarakhand" className="form-control-dark" isInvalid={!!errors.state} />
                        {errors.state && <div style={{ color: '#FCA5A5', fontSize: '0.8rem', marginTop: '4px' }}>{errors.state}</div>}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-dark">Pickup Instructions</Form.Label>
                    <Form.Control as="textarea" rows={2} name="pickupInstructions" value={formData.pickupInstructions} onChange={handleChange} placeholder="e.g., House No. 42, Near City Mall" className="form-control-dark" />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-dark">Contact Number {isFirstTool && <span className="required-star">*</span>}</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="input-group-text-dark"><FaPhone size={12} /></InputGroup.Text>
                      <Form.Control type="tel" name="ownerContact" value={formData.ownerContact} onChange={handleChange} placeholder="+91 98765 43210" className="form-control-dark" isInvalid={!!errors.ownerContact} />
                    </InputGroup>
                    {errors.ownerContact && <div style={{ color: '#FCA5A5', fontSize: '0.8rem', marginTop: '4px' }}>{errors.ownerContact}</div>}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-dark">Preferred Contact</Form.Label>
                    <div className="radio-group">
                      {['CALL', 'TEXT', 'BOTH'].map(method => (
                        <label key={method} className="radio-label">
                          <input type="radio" name="contactMethod" value={method} checked={formData.contactMethod === method} onChange={handleChange} />
                          {method === 'BOTH' ? 'Both' : method.charAt(0) + method.slice(1).toLowerCase()}
                        </label>
                      ))}
                    </div>
                  </Form.Group>

                  <div className="section-title mt-4"><FaUpload className="icon" size={18} /><span>Images <span className="required-star">*</span></span></div>

                  <Form.Group className="mb-3">
                    <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                      <input {...getInputProps()} />
                      <FaUpload size={28} style={{ color: '#737373', marginBottom: '0.5rem' }} />
                      <p style={{ color: '#E5E5E5', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                        {isDragActive ? 'Drop images here...' : 'Drag & drop images, or click to select'}
                      </p>
                      <small style={{ color: '#737373' }}>Up to 5 images (JPG, PNG)</small>
                    </div>
                    <div className="info-note mt-2">
                      <FaInfoCircle className="me-2" size={12} />
                      <small>First image will be used as the main preview.</small>
                    </div>
                    {errors.images && <div style={{ color: '#FCA5A5', fontSize: '0.8rem', marginTop: '6px' }}>{errors.images}</div>}
                  </Form.Group>

                  {imagePreviews.length > 0 && (
                    <div className="mb-3">
                      <Form.Label className="form-label-dark">Preview</Form.Label>
                      <Row>
                        {imagePreviews.map((preview, index) => (
                          <Col key={index} xs={4} md={3} className="mb-3">
                            <div className="image-preview-container">
                              <Image src={preview} style={{ height: '90px', width: '100%', objectFit: 'cover' }} />
                              {index === 0 && <div className="main-badge">Main</div>}
                              <button type="button" className="delete-image-btn" onClick={() => removeImage(index)}><FaTrash size={10} /></button>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}

                  <div className="d-flex gap-3 mt-4 pt-3">
                    <Button className="btn-outline" onClick={() => navigate('/my-tools')} disabled={loading}>Cancel</Button>
                    <Button className="btn-mint flex-grow-1" type="submit" disabled={loading}>
                      {loading ? <Spinner animation="border" size="sm" className="me-2" /> : <FaPlus className="me-2" size={14} />}
                      {loading ? 'Creating...' : 'List Tool'}
                    </Button>
                  </div>
                </Form>
              </div>
            </div>
          </Col>
        </Row>

        <Modal show={showCategoryModal} onHide={() => setShowCategoryModal(false)} centered className="modal-dark">
          <Modal.Header closeButton>
            <Modal.Title style={{ color: '#F5F5F5', fontSize: '1.1rem' }}>
              <FaFolderPlus className="me-2" size={16} style={{ color: '#34D399' }} /> Create Category
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="form-label-dark">Category Name *</Form.Label>
              <Form.Control type="text" placeholder="e.g., Power Tools" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} className="form-control-dark" autoFocus />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="form-label-dark">Description *</Form.Label>
              <Form.Control as="textarea" rows={2} placeholder="Brief description" value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} className="form-control-dark" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="form-label-dark">Icon (Emoji)</Form.Label>
              <Form.Control type="text" placeholder="e.g., 🔧" value={newCategory.icon} onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })} className="form-control-dark" />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button className="btn-outline" onClick={() => setShowCategoryModal(false)}>Cancel</Button>
            <Button className="btn-mint" onClick={handleCreateCategory} disabled={creatingCategory || !newCategory.name.trim() || !newCategory.description.trim()}>
              {creatingCategory ? <Spinner animation="border" size="sm" /> : 'Create Category'}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default AddToolPage;