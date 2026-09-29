const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '') + '/api';

const AUTH_FREE_ENDPOINTS = ['/auth/login', '/auth/register'];

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, config);
  } catch (err) {
    throw new Error('Cannot reach the server. Check your connection and try again.');
  }

  // Read as text first: a proxy/error page is not JSON and response.json()
  // would throw an unhelpful "Unexpected token" error.
  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (err) {
      data = null;
    }
  }

  if (!response.ok) {
    if (response.status === 401 && !AUTH_FREE_ENDPOINTS.includes(endpoint)) {
      // Token expired or invalid — clear it and let AuthContext log the user out.
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    const message =
      data?.error ||
      data?.errors?.[0]?.msg ||
      (response.status >= 500
        ? 'The server had a problem. Please try again in a moment.'
        : `Request failed (${response.status})`);

    throw new Error(message);
  }

  return data;
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (name, email, password) => request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  getMe: () => request('/auth/me'),
  searchUsers: (q) => request(`/auth/search?q=${encodeURIComponent(q)}`),

  // Groups
  getGroups: () => request('/groups'),
  createGroup: (data) => request('/groups', { method: 'POST', body: JSON.stringify(data) }),
  getGroup: (id) => request(`/groups/${id}`),
  updateGroup: (id, data) => request(`/groups/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteGroup: (id) => request(`/groups/${id}`, { method: 'DELETE' }),
  addMember: (groupId, userId) => request(`/groups/${groupId}/members`, { method: 'POST', body: JSON.stringify({ userId }) }),
  removeMember: (groupId, userId) => request(`/groups/${groupId}/members/${userId}`, { method: 'DELETE' }),

  // Expenses
  getGroupExpenses: (groupId) => request(`/expenses/group/${groupId}`),
  createExpense: (data) => request('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: 'DELETE' }),

  // Balances
  getBalances: (groupId) => request(`/balances/${groupId}`),

  // Settlements
  getSettlements: (groupId) => request(`/settlements/group/${groupId}`),
  createSettlement: (data) => request('/settlements', { method: 'POST', body: JSON.stringify(data) }),
  deleteSettlement: (id) => request(`/settlements/${id}`, { method: 'DELETE' }),
};
