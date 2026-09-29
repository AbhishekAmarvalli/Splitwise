const db = require('./db');
const bcrypt = require('bcryptjs');

const users = [
  { name: 'Alice Johnson', email: 'alice@example.com', password: 'password123' },
  { name: 'Bob Smith', email: 'bob@example.com', password: 'password123' },
  { name: 'Charlie Brown', email: 'charlie@example.com', password: 'password123' },
  { name: 'Diana Prince', email: 'diana@example.com', password: 'password123' },
];

const groups = [
  { name: 'Roommates', description: 'Shared apartment expenses', created_by: 1 },
  { name: 'Trip to Bali', description: 'Vacation expenses', created_by: 1 },
  { name: 'Office Lunch', description: 'Weekly team lunch', created_by: 2 },
];

async function seed() {
  let client;
  try {
    console.log('Seeding database...');
    client = await db.pool.connect();
    await client.query('BEGIN');

    // Clear existing data
    await client.query('DELETE FROM settlements');
    await client.query('DELETE FROM expense_splits');
    await client.query('DELETE FROM expenses');
    await client.query('DELETE FROM group_members');
    await client.query('DELETE FROM "groups"');
    await client.query('DELETE FROM users');

    // Reset auto-increment
    await client.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE groups_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE expenses_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE expense_splits_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE settlements_id_seq RESTART WITH 1');

    // Insert users
    const userIds = [];
    for (const user of users) {
      const hash = await bcrypt.hash(user.password, 10);
      const res = await client.query(
        'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
        [user.name, user.email, hash]
      );
      userIds.push(res.rows[0].id);
    }
    console.log(`Created ${userIds.length} users`);

    // Insert groups
    const groupIds = [];
    for (const group of groups) {
      const res = await client.query(
        'INSERT INTO "groups" (name, description, created_by) VALUES ($1, $2, $3) RETURNING id',
        [group.name, group.description, group.created_by]
      );
      groupIds.push(res.rows[0].id);
    }
    console.log(`Created ${groupIds.length} groups`);

    // Add members to groups
    await client.query('INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)', [groupIds[0], userIds[0]]);
    await client.query('INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)', [groupIds[0], userIds[1]]);
    await client.query('INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)', [groupIds[0], userIds[2]]);

    for (const uid of userIds) {
      await client.query('INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)', [groupIds[1], uid]);
    }

    await client.query('INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)', [groupIds[2], userIds[1]]);
    await client.query('INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)', [groupIds[2], userIds[2]]);
    await client.query('INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)', [groupIds[2], userIds[3]]);

    // Sample expenses for Roommates
    const res1 = await client.query(
      'INSERT INTO expenses (group_id, description, amount, paid_by) VALUES ($1, $2, $3, $4) RETURNING id',
      [groupIds[0], 'Electricity Bill', 150.00, userIds[0]]
    );
    await client.query('INSERT INTO expense_splits (expense_id, user_id, amount) VALUES ($1, $2, $3)', [res1.rows[0].id, userIds[0], 50.00]);
    await client.query('INSERT INTO expense_splits (expense_id, user_id, amount) VALUES ($1, $2, $3)', [res1.rows[0].id, userIds[1], 50.00]);
    await client.query('INSERT INTO expense_splits (expense_id, user_id, amount) VALUES ($1, $2, $3)', [res1.rows[0].id, userIds[2], 50.00]);

    const res2 = await client.query(
      'INSERT INTO expenses (group_id, description, amount, paid_by) VALUES ($1, $2, $3, $4) RETURNING id',
      [groupIds[0], 'Internet Bill', 80.00, userIds[1]]
    );
    await client.query('INSERT INTO expense_splits (expense_id, user_id, amount) VALUES ($1, $2, $3)', [res2.rows[0].id, userIds[0], 26.67]);
    await client.query('INSERT INTO expense_splits (expense_id, user_id, amount) VALUES ($1, $2, $3)', [res2.rows[0].id, userIds[1], 26.67]);
    await client.query('INSERT INTO expense_splits (expense_id, user_id, amount) VALUES ($1, $2, $3)', [res2.rows[0].id, userIds[2], 26.66]);

    const res3 = await client.query(
      'INSERT INTO expenses (group_id, description, amount, paid_by) VALUES ($1, $2, $3, $4) RETURNING id',
      [groupIds[0], 'Groceries', 200.00, userIds[2]]
    );
    await client.query('INSERT INTO expense_splits (expense_id, user_id, amount) VALUES ($1, $2, $3)', [res3.rows[0].id, userIds[0], 66.67]);
    await client.query('INSERT INTO expense_splits (expense_id, user_id, amount) VALUES ($1, $2, $3)', [res3.rows[0].id, userIds[1], 66.67]);
    await client.query('INSERT INTO expense_splits (expense_id, user_id, amount) VALUES ($1, $2, $3)', [res3.rows[0].id, userIds[2], 66.66]);

    await client.query('COMMIT');
    console.log('Sample expenses created');
    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    if (client) await client.query('ROLLBACK');
    process.exit(1);
  } finally {
    if (client) client.release();
  }
}

seed();
