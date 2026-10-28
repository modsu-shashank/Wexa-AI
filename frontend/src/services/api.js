const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api`
  : '/api';

const getHeaders = () => {
  const token = localStorage.getItem('stockflow_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('stockflow_token');
      localStorage.removeItem('stockflow_user');
      localStorage.removeItem('stockflow_org');
      window.dispatchEvent(new Event('stockflow_auth_expired'));
    }
    const message = data.message || `Request failed with status ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.errors = data.errors;
    throw error;
  }
  return data;
};

export const api = {
  // Auth
  login: async (credentials) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(res);
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Team Management (Admin only)
  listUsers: async () => {
    const res = await fetch(`${API_BASE}/auth/users`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  inviteUser: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/invite`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  // Products
  getProducts: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const res = await fetch(`${API_BASE}/products?${query.toString()}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getProductById: async (id) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createProduct: async (productData) => {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });
    return handleResponse(res);
  },

  updateProduct: async (id, productData) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });
    return handleResponse(res);
  },

  deleteProduct: async (id) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  adjustStock: async (id, adjustment) => {
    const res = await fetch(`${API_BASE}/products/${id}/adjust-stock`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(adjustment),
    });
    return handleResponse(res);
  },

  // Dashboard
  getDashboardStats: async () => {
    const res = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Organization
  getOrgSettings: async () => {
    const res = await fetch(`${API_BASE}/organization`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  updateOrgSettings: async (settings) => {
    const res = await fetch(`${API_BASE}/organization`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(settings),
    });
    return handleResponse(res);
  },
};
