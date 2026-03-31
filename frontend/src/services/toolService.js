import api from '../config/axiosConfig';

const toolService = {
  // Get all tools with optional filters
  getAllTools: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('categoryId', filters.category);
    if (filters.status) params.append('status', filters.status);
    
    const response = await api.get(`/api/tools?${params.toString()}`);
    return response.data;
  },

  // Get single tool by ID
  getToolById: async (id) => {
    const response = await api.get(`/api/tools/${id}`);
    return response.data;
  },

  // Get tools by owner ID
  getToolsByOwner: async (ownerId) => {
    const response = await api.get(`/api/tools/user/${ownerId}`);
    return response.data;
  },

  // Get current user's tools (uses X-User-Id from gateway)
  getMyTools: async () => {
    const response = await api.get('/api/tools/my-tools');
    return response.data;
  },

  // Create new tool
  createTool: async (toolData) => {
    const response = await api.post('/api/tools', toolData);
    return response.data;
  },

  // Update tool
  updateTool: async (id, toolData) => {
    const response = await api.put(`/api/tools/${id}`, toolData);
    return response.data;
  },

  // Delete tool
  deleteTool: async (id) => {
    const response = await api.delete(`/api/tools/${id}`);
    return response.data;
  },

  // Update tool status (for booking)
  updateToolStatus: async (id, status) => {
    const response = await api.patch(`/api/tools/${id}/status?status=${status}`);
    return response.data;
  },

  // Get all categories
  getCategories: async () => {
    const response = await api.get('/api/categories');
    return response.data;
  },

  // Create category (admin only)
  createCategory: async (categoryData) => {
    const response = await api.post('/api/categories', categoryData);
    return response.data;
  },

  // Update category (admin only)
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/api/categories/${id}`, categoryData);
    return response.data;
  },

  // Delete category (admin only)
  deleteCategory: async (id) => {
    const response = await api.delete(`/api/categories/${id}`);
    return response.data;
  },
};

export default toolService;