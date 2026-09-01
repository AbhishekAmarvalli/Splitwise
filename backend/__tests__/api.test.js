const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db');

let authToken;
let userId;
const testEmail = `test_${Date.now()}@example.com`;
const testPassword = 'testpass123';

// Clean up test data after all tests
afterAll(async () => {
  // Delete test user (cascades to groups/expenses via FK)
  if (userId) {
    await db.query('DELETE FROM users WHERE id = ?', [userId]);
  }
  const pool = db.pool;
  await pool.end();
});

describe('Auth API', () => {
  test('POST /api/auth/register — creates a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: testEmail, password: testPassword });

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.name).toBe('Test User');
    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.token).toBeDefined();
    authToken = res.body.token;
    userId = res.body.user.id;
  });

  test('POST /api/auth/register — rejects duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User 2', email: testEmail, password: testPassword });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Email already registered');
  });

  test('POST /api/auth/register — rejects invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'not-an-email', password: testPassword });

    expect(res.status).toBe(400);
  });

  test('POST /api/auth/login — returns token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testEmail);
    authToken = res.body.token;
  });

  test('POST /api/auth/login — rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me — returns current user profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(testEmail);
    expect(res.body.name).toBe('Test User');
  });

  test('GET /api/auth/me — rejects unauthenticated request', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('Groups API', () => {
  let groupId;

  test('POST /api/groups — creates a new group', async () => {
    const res = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Test Group', description: 'For testing' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Group');
    expect(res.body.description).toBe('For testing');
    expect(res.body.members).toBeDefined();
    expect(res.body.members.length).toBe(1); // creator only
    groupId = res.body.id;
  });

  test('GET /api/groups — lists user groups', async () => {
    const res = await request(app)
      .get('/api/groups')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body.some(g => g.id === groupId)).toBe(true);
  });

  test('GET /api/groups/:id — returns group details with members', async () => {
    const res = await request(app)
      .get(`/api/groups/${groupId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Test Group');
    expect(res.body.members).toBeDefined();
    expect(res.body.members.length).toBe(1);
  });

  test('PUT /api/groups/:id — updates group name', async () => {
    const res = await request(app)
      .put(`/api/groups/${groupId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Updated Group' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Group');
  });

  test('POST /api/groups — rejects empty name', async () => {
    const res = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: '' });

    expect(res.status).toBe(400);
  });

  // Cleanup: delete the test group
  test('DELETE /api/groups/:id — deletes the group', async () => {
    const res = await request(app)
      .delete(`/api/groups/${groupId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
  });
});

describe('Expenses API', () => {
  let groupId;
  let expenseId;

  beforeAll(async () => {
    // Create a test group for expense tests
    const res = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Expense Test Group', description: 'For expense tests' });
    groupId = res.body.id;
  });

  afterAll(async () => {
    if (groupId) {
      await request(app)
        .delete(`/api/groups/${groupId}`)
        .set('Authorization', `Bearer ${authToken}`);
    }
  });

  test('POST /api/expenses — creates an expense with equal split', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        groupId,
        description: 'Test Dinner',
        amount: 100,
        paidBy: userId,
        splitType: 'equal',
        splits: [{ userId, amount: 100 }],
      });

    expect(res.status).toBe(201);
    expect(res.body.description).toBe('Test Dinner');
    expect(res.body.amount).toBe('100.00');
    expect(res.body.paid_by_name).toBe('Test User');
    expect(res.body.splits).toBeDefined();
    expenseId = res.body.id;
  });

  test('GET /api/expenses/group/:groupId — lists group expenses', async () => {
    const res = await request(app)
      .get(`/api/expenses/group/${groupId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].description).toBe('Test Dinner');
  });

  test('POST /api/expenses — rejects missing description', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        groupId,
        amount: 50,
        paidBy: userId,
        splitType: 'equal',
        splits: [{ userId, amount: 50 }],
      });

    expect(res.status).toBe(400);
  });

  test('POST /api/expenses — rejects zero amount', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        groupId,
        description: 'Zero expense',
        amount: 0,
        paidBy: userId,
        splitType: 'equal',
        splits: [{ userId, amount: 0 }],
      });

    expect(res.status).toBe(400);
  });

  test('DELETE /api/expenses/:id — deletes an expense', async () => {
    const res = await request(app)
      .delete(`/api/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
  });
});

describe('Balances API', () => {
  let groupId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Balance Test Group', description: 'For balance tests' });
    groupId = res.body.id;
  });

  afterAll(async () => {
    if (groupId) {
      await request(app)
        .delete(`/api/groups/${groupId}`)
        .set('Authorization', `Bearer ${authToken}`);
    }
  });

  test('GET /api/balances/:groupId — returns balances with no expenses', async () => {
    const res = await request(app)
      .get(`/api/balances/${groupId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.members).toBeDefined();
    expect(res.body.transactions).toEqual([]);
    expect(res.body.totalExpenses).toBe(0);
  });

  test('GET /api/balances/:groupId — rejects non-member', async () => {
    // Register a second user who is not in the group
    const email2 = `test2_${Date.now()}@example.com`;
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Other User', email: email2, password: 'testpass123' });

    const otherToken = regRes.body.token;

    const res = await request(app)
      .get(`/api/balances/${groupId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(403);

    // Cleanup
    await db.query('DELETE FROM users WHERE id = ?', [regRes.body.user.id]);
  });
});

describe('Health Check', () => {
  test('GET /api/health — returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });
});
