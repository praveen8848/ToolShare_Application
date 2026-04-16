import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Table, Modal, Form, Badge, Spinner } from 'react-bootstrap';
import { 
  FaPlus, FaEdit, FaTrash, FaFolder, FaSave, FaTimes, FaTags,
  FaCheckCircle, FaTimesCircle, FaArrowUp, FaArrowDown
} from 'react-icons/fa';
import categoryService from '../services/categoryService';
import { toast } from 'react-toastify';

const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    displayOrder: 0,
    isActive: true
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAllCategories();
      // Sort by display order
      const sorted = (data || []).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      setCategories(sorted);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name || '',
        description: category.description || '',
        icon: category.icon || '',
        displayOrder: category.displayOrder || 0,
        isActive: category.isActive !== false
      });
    } else {
      setEditingCategory(null);
      const maxOrder = Math.max(...categories.map(c => c.displayOrder || 0), 0);
      setFormData({
        name: '',
        description: '',
        icon: '',
        displayOrder: maxOrder + 1,
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: '',
      displayOrder: 0,
      isActive: true
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, formData);
        toast.success('Category updated successfully');
      } else {
        await categoryService.createCategory(formData);
        toast.success('Category created successfully');
      }
      handleCloseModal();
      loadCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    
    setDeletingId(categoryToDelete.id);
    try {
      await categoryService.deleteCategory(categoryToDelete.id);
      toast.success(`Category "${categoryToDelete.name}" deleted successfully`);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      loadCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    } finally {
      setDeletingId(null);
    }
  };

  const handleMoveUp = async (category, index) => {
    if (index === 0) return;
    
    const prevCategory = categories[index - 1];
    try {
      await categoryService.updateCategory(category.id, { displayOrder: prevCategory.displayOrder });
      await categoryService.updateCategory(prevCategory.id, { displayOrder: category.displayOrder });
      toast.success('Order updated');
      loadCategories();
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const handleMoveDown = async (category, index) => {
    if (index === categories.length - 1) return;
    
    const nextCategory = categories[index + 1];
    try {
      await categoryService.updateCategory(category.id, { displayOrder: nextCategory.displayOrder });
      await categoryService.updateCategory(nextCategory.id, { displayOrder: category.displayOrder });
      toast.success('Order updated');
      loadCategories();
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  if (loading) {
    return (
      <div className="category-management-wrapper">
        <style>
          {`
            .category-management-wrapper {
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
              min-height: 100vh;
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }
          `}
        </style>
        <Container className="py-5 text-center">
          <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '400px' }}>
            <Spinner animation="border" style={{ color: '#60a5fa', width: '3rem', height: '3rem' }} />
            <p className="mt-3" style={{ color: '#94a3b8' }}>Loading categories...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="category-management-wrapper">
      <style>
        {`
          .category-management-wrapper {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            min-height: 100vh;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: #e2e8f0;
            padding-bottom: 3rem;
          }
          
          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-top: 1.5rem;
          }
          
          .gradient-text {
            background: linear-gradient(135deg, #60a5fa 0%, #34d399 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .main-card {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          }
          
          .table-dark-custom {
            color: #e2e8f0;
            margin-bottom: 0;
          }
          
          .table-dark-custom thead tr {
            border-bottom: 1px solid #334155;
          }
          
          .table-dark-custom thead th {
            color: #94a3b8;
            font-weight: 600;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 1rem 1.25rem;
            border-bottom: none;
            background: #0f172a;
          }
          
          .table-dark-custom tbody tr {
            border-bottom: 1px solid #334155;
            transition: all 0.2s ease;
          }
          
          .table-dark-custom tbody tr:hover {
            background: #0f172a;
          }
          
          .table-dark-custom tbody td {
            padding: 1rem 1.25rem;
            color: #cbd5e1;
            vertical-align: middle;
          }
          
          .table-dark-custom tbody tr:last-child {
            border-bottom: none;
          }
          
          .category-name {
            color: #f1f5f9;
            font-weight: 600;
          }
          
          .category-icon {
            font-size: 1.5rem;
            line-height: 1;
          }
          
          .status-badge {
            padding: 6px 12px;
            border-radius: 8px;
            font-weight: 500;
            font-size: 0.8rem;
            display: inline-block;
          }
          
          .status-active {
            background: rgba(16, 185, 129, 0.15);
            color: #34d399;
            border: 1px solid rgba(16, 185, 129, 0.3);
          }
          
          .status-inactive {
            background: rgba(100, 116, 139, 0.15);
            color: #94a3b8;
            border: 1px solid rgba(100, 116, 139, 0.3);
          }
          
          .btn-gradient-primary {
            background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            padding: 0.6rem 1.5rem;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }
          
          .btn-gradient-primary:hover {
            background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
            color: white;
          }
          
          .btn-outline-primary-custom {
            background: transparent;
            color: #60a5fa;
            border: 1px solid #334155;
            border-radius: 8px;
            padding: 0.4rem 0.75rem;
            font-size: 0.85rem;
            transition: all 0.2s ease;
          }
          
          .btn-outline-primary-custom:hover {
            background: rgba(59, 130, 246, 0.1);
            border-color: #60a5fa;
            color: #93c5fd;
          }
          
          .btn-outline-danger-custom {
            background: transparent;
            color: #ef4444;
            border: 1px solid #334155;
            border-radius: 8px;
            padding: 0.4rem 0.75rem;
            font-size: 0.85rem;
            transition: all 0.2s ease;
          }
          
          .btn-outline-danger-custom:hover {
            background: rgba(239, 68, 68, 0.1);
            border-color: #ef4444;
            color: #f87171;
          }
          
          .btn-order {
            background: transparent;
            color: #64748b;
            border: 1px solid #334155;
            border-radius: 6px;
            padding: 0.25rem 0.5rem;
            font-size: 0.75rem;
            transition: all 0.2s ease;
          }
          
          .btn-order:hover {
            background: #1e293b;
            border-color: #60a5fa;
            color: #60a5fa;
          }
          
          .btn-order:disabled {
            opacity: 0.3;
            cursor: not-allowed;
          }
          
          .empty-state {
            text-align: center;
            padding: 4rem 2rem;
          }
          
          .empty-icon {
            width: 80px;
            height: 80px;
            border-radius: 20px;
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            border: 1px solid #334155;
            color: #60a5fa;
          }
          
          .modal-dark .modal-content {
            background: #1e293b;
            color: #e2e8f0;
            border: 1px solid #334155;
            border-radius: 20px;
          }
          
          .modal-dark .modal-header {
            border-bottom: 1px solid #334155;
            padding: 1.5rem 1.5rem 1rem;
          }
          
          .modal-dark .modal-title {
            color: #f1f5f9;
            font-weight: 700;
          }
          
          .modal-dark .modal-body {
            padding: 1rem 1.5rem;
          }
          
          .modal-dark .modal-footer {
            border-top: 1px solid #334155;
            padding: 1rem 1.5rem 1.5rem;
          }
          
          .modal-dark .btn-close {
            filter: invert(1);
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
          
          .form-control-dark:focus {
            border-color: #60a5fa;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
            background: #0f172a;
            color: #e2e8f0;
          }
          
          .form-control-dark::placeholder {
            color: #64748b;
          }
          
          .form-check-input {
            background-color: #0f172a;
            border-color: #334155;
          }
          
          .form-check-input:checked {
            background-color: #60a5fa;
            border-color: #60a5fa;
          }
          
          .form-check-label {
            color: #cbd5e1;
          }
          
          .required-star {
            color: #ef4444;
            margin-left: 2px;
          }
          
          .action-buttons {
            display: flex;
            gap: 0.5rem;
          }
        `}
      </style>

      <Container>
        
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h2 className="mb-1">
              <span className="gradient-text">Category Management</span>
            </h2>
            <p style={{ color: '#94a3b8', marginBottom: 0 }}>
              Organize tools with custom categories
            </p>
          </div>
          <Button className="btn-gradient-primary" onClick={() => handleOpenModal()}>
            <FaPlus className="me-2" />
            Add Category
          </Button>
        </div>

        {/* Categories Table */}
        <div className="main-card">
          {categories.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FaTags size={32} />
              </div>
              <h4 style={{ color: '#f1f5f9', marginBottom: '0.5rem' }}>No Categories Yet</h4>
              <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
                Create your first category to start organizing tools
              </p>
              <Button className="btn-gradient-primary" onClick={() => handleOpenModal()}>
                <FaPlus className="me-2" />
                Create First Category
              </Button>
            </div>
          ) : (
            <Table responsive className="table-dark-custom">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Order</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th style={{ width: '100px' }}>Status</th>
                  <th style={{ width: '160px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category, index) => (
                  <tr key={category.id}>
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        <span style={{ color: '#64748b', minWidth: '24px' }}>
                          {category.displayOrder || index + 1}
                        </span>
                        <div className="d-flex flex-column">
                          <button
                            className="btn-order mb-1"
                            onClick={() => handleMoveUp(category, index)}
                            disabled={index === 0}
                            title="Move Up"
                          >
                            <FaArrowUp size={10} />
                          </button>
                          <button
                            className="btn-order"
                            onClick={() => handleMoveDown(category, index)}
                            disabled={index === categories.length - 1}
                            title="Move Down"
                          >
                            <FaArrowDown size={10} />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        {category.icon && (
                          <span className="category-icon">{category.icon}</span>
                        )}
                        <span className="category-name">{category.name}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: '#94a3b8' }}>
                        {category.description || '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${category.isActive ? 'status-active' : 'status-inactive'}`}>
                        {category.isActive ? (
                          <><FaCheckCircle className="me-1" size={12} /> Active</>
                        ) : (
                          <><FaTimesCircle className="me-1" size={12} /> Inactive</>
                        )}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Button
                          className="btn-outline-primary-custom"
                          onClick={() => handleOpenModal(category)}
                          title="Edit Category"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          className="btn-outline-danger-custom"
                          onClick={() => handleDeleteClick(category)}
                          disabled={deletingId === category.id}
                          title="Delete Category"
                        >
                          {deletingId === category.id ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <FaTrash />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>

        {/* Add/Edit Modal */}
        <Modal 
          show={showModal} 
          onHide={handleCloseModal} 
          centered
          className="modal-dark"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <FaTags className="me-2" style={{ color: '#60a5fa' }} />
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label className="form-label-dark">
                  Category Name <span className="required-star">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Power Tools"
                  className="form-control-dark"
                  required
                  autoFocus
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="form-label-dark">Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of this category"
                  className="form-control-dark"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="form-label-dark">Icon (Emoji)</Form.Label>
                <Form.Control
                  type="text"
                  name="icon"
                  value={formData.icon}
                  onChange={handleChange}
                  placeholder="e.g., 🔧, 🛠️, ⚡"
                  className="form-control-dark"
                />
                <Form.Text style={{ color: '#64748b' }}>
                  Add an emoji to make your category stand out
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="form-label-dark">Display Order</Form.Label>
                <Form.Control
                  type="number"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={handleChange}
                  placeholder="0"
                  className="form-control-dark"
                />
                <Form.Text style={{ color: '#64748b' }}>
                  Lower numbers appear first in lists
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  label="Active"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button 
                className="btn-outline-secondary-custom"
                onClick={handleCloseModal}
              >
                <FaTimes className="me-2" />
                Cancel
              </Button>
              <Button 
                className="btn-gradient-primary"
                type="submit" 
                disabled={submitting}
              >
                {submitting ? (
                  <Spinner animation="border" size="sm" className="me-2" />
                ) : (
                  <FaSave className="me-2" />
                )}
                {submitting ? 'Saving...' : (editingCategory ? 'Save Changes' : 'Create Category')}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal 
          show={showDeleteModal} 
          onHide={() => setShowDeleteModal(false)} 
          centered
          className="modal-dark"
        >
          <Modal.Header closeButton>
            <Modal.Title style={{ color: '#ef4444' }}>
              <FaTrash className="me-2" />
              Confirm Deletion
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p style={{ color: '#e2e8f0', marginBottom: '1rem' }}>
              Are you sure you want to delete the category <strong style={{ color: '#f1f5f9' }}>
                "{categoryToDelete?.name}"
              </strong>?
            </p>
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '1rem',
              color: '#fca5a5'
            }}>
              <FaTimesCircle className="me-2" />
              This action cannot be undone. Tools in this category will become uncategorized.
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              className="btn-outline-secondary-custom"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button 
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '0.6rem 1.5rem',
                fontWeight: 600
              }}
              onClick={handleDeleteConfirm}
              disabled={deletingId !== null}
            >
              {deletingId ? (
                <Spinner animation="border" size="sm" className="me-2" />
              ) : (
                <FaTrash className="me-2" />
              )}
              Delete Category
            </Button>
          </Modal.Footer>
        </Modal>

      </Container>
    </div>
  );
};

export default CategoryManagementPage;