const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.errors?.[0]?.msg || 'Request failed');
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
};
