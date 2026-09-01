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
  let connection;
  try {
    console.log('Seeding database...');
    connection = await db.getConnection();
    
    // Clear existing data
    await connection.execute('DELETE FROM settlements');
    await connection.execute('DELETE FROM expense_splits');
    await connection.execute('DELETE FROM expenses');
    await connection.execute('DELETE FROM group_members');
    await connection.execute('DELETE FROM `groups`');
    await connection.execute('DELETE FROM users');

    // Reset auto-increment
    await connection.execute('ALTER TABLE users AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE `groups` AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE expenses AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE expense_splits AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE settlements AUTO_INCREMENT = 1');

    // Insert users
    const userIds = [];
    for (const user of users) {
      const hash = await bcrypt.hash(user.password, 10);
      const [result] = await connection.execute(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
        [user.name, user.email, hash]
      );
      userIds.push(result.insertId);
    }
    console.log(`Created ${userIds.length} users`);

    // Insert groups
    const groupIds = [];
    for (const group of groups) {
      const [result] = await connection.execute(
        'INSERT INTO `groups` (name, description, created_by) VALUES (?, ?, ?)',
        [group.name, group.description, group.created_by]
      );
      groupIds.push(result.insertId);
    }
    console.log(`Created ${groupIds.length} groups`);

    // Add members to groups
    // Roommates: Alice, Bob, Charlie
    await connection.execute('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)', [groupIds[0], userIds[0]]);
    await connection.execute('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)', [groupIds[0], userIds[1]]);
    await connection.execute('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)', [groupIds[0], userIds[2]]);

    // Trip to Bali: All four
    for (const uid of userIds) {
      await connection.execute('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)', [groupIds[1], uid]);
    }

    // Office Lunch: Bob, Charlie, Diana
    await connection.execute('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)', [groupIds[2], userIds[1]]);
    await connection.execute('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)', [groupIds[2], userIds[2]]);
    await connection.execute('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)', [groupIds[2], userIds[3]]);

    // Sample expenses for Roommates
    const [exp1] = await connection.execute(
      'INSERT INTO expenses (group_id, description, amount, paid_by) VALUES (?, ?, ?, ?)',
      [groupIds[0], 'Electricity Bill', 150.00, userIds[0]]
    );
    // Split equally among 3
    await connection.execute('INSERT INTO expense_splits (expense_id, user_id, amount) VALUES (?, ?, ?)', [exp1.insertId, userIds[0], 50.00]);
    await connection.execute('INSERT INTO expense_splits (expense_id, user_id, amount) VALUES (?, ?, ?)', [exp1.insertId, userIds[1], 50.00]);
    await connection.execute('INSERT INTO expense_splits (expense_id, user_id, amount) VALUES (?, ?, ?)', [exp1.insertId, userIds[2], 50.00]);

    const [exp2] = await connection.execute(
      'INSERT INTO expenses (group_id, description, amount, paid_by) VALUES (?, ?, ?, ?)',
      [groupIds[0], 'Internet Bill', 80.00, userIds[1]]
    );
    await connection.execute('INSERT INTO expense_splits (expense_id, user_id, amount) VALUES (?, ?, ?)', [exp2.insertId, userIds[0], 26.67]);
    await connection.execute('INSERT INTO expense_splits (expense_id, user_id, amount) VALUES (?, ?, ?)', [exp2.insertId, userIds[1], 26.67]);
    await connection.execute('INSERT INTO expense_splits (expense_id, user_id, amount) VALUES (?, ?, ?)', [exp2.insertId, userIds[2], 26.66]);

    const [exp3] = await connection.execute(
      'INSERT INTO expenses (group_id, description, amount, paid_by) VALUES (?, ?, ?, ?)',
      [groupIds[0], 'Groceries', 200.00, userIds[2]]
    );
    await connection.execute('INSERT INTO expense_splits (expense_id, user_id, amount) VALUES (?, ?, ?)', [exp3.insertId, userIds[0], 66.67]);
    await connection.execute('INSERT INTO expense_splits (expense_id, user_id, amount) VALUES (?, ?, ?)', [exp3.insertId, userIds[1], 66.67]);
    await connection.execute('INSERT INTO expense_splits (expense_id, user_id, amount) VALUES (?, ?, ?)', [exp3.insertId, userIds[2], 66.66]);

    console.log('Sample expenses created');
    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    if (connection) connection.release();
  }
}

seed();
