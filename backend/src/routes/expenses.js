const express = require('express');
const { body, param, validationResult } = require('express-validator');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get expenses for a group
router.get('/group/:groupId', [
  param('groupId').isInt(),
], async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check membership
    const [membership] = await db.query(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, req.user.id]
    );
    if (membership.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    const [expenses] = await db.query(`
      SELECT e.*, u.name as paid_by_name, u.email as paid_by_email
      FROM expenses e
      LEFT JOIN users u ON e.paid_by = u.id
      WHERE e.group_id = ?
      ORDER BY e.created_at DESC
    `, [groupId]);

    // Fetch splits for each expense
    const result = [];
    for (const expense of expenses) {
      const [splits] = await db.query(`
        SELECT es.*, u.name as user_name, u.email as user_email
        FROM expense_splits es
        LEFT JOIN users u ON es.user_id = u.id
        WHERE es.expense_id = ?
      `, [expense.id]);

      result.push({ ...expense, splits });
    }

    res.json(result);
  } catch (err) {
    console.error('Get expenses error:', err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Create a new expense
router.post('/', [
  body('groupId').isInt().withMessage('Group ID is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
  body('paidBy').isInt().withMessage('Payer is required'),
  body('splitType').isIn(['equal', 'exact', 'percentage']).withMessage('Invalid split type'),
  body('splits').isArray({ min: 1 }).withMessage('At least one split is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const { groupId, description, amount, paidBy, splitType, splits } = req.body;

    // Check membership
    const [membership] = await connection.query(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, req.user.id]
    );
    if (membership.length === 0) {
      await connection.rollback();
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    // Create expense
    const [expenseResult] = await connection.query(
      'INSERT INTO expenses (group_id, description, amount, paid_by, split_type) VALUES (?, ?, ?, ?, ?)',
      [groupId, description, amount, paidBy, splitType]
    );
    const expenseId = expenseResult.insertId;

    // Create splits
    let totalSplit = 0;
    for (const split of splits) {
      const splitAmount = splitType === 'equal' ? (amount / splits.length) : split.amount;
      const percentage = splitType === 'percentage' ? split.percentage : null;

      await connection.query(
        'INSERT INTO expense_splits (expense_id, user_id, amount, percentage) VALUES (?, ?, ?, ?)',
        [expenseId, split.userId, Math.round(splitAmount * 100) / 100, percentage]
      );
      totalSplit += splitAmount;
    }

    // Validate total split equals expense amount
    if (Math.abs(totalSplit - amount) > 0.02 && splitType !== 'equal') {
      await connection.rollback();
      return res.status(400).json({ error: 'Total splits do not equal expense amount' });
    }

    await connection.commit();
    connection.release();
    connection = null;

    // Fetch full expense with splits
    const [fullExpense] = await db.query(`
      SELECT e.*, u.name as paid_by_name, u.email as paid_by_email
      FROM expenses e
      LEFT JOIN users u ON e.paid_by = u.id
      WHERE e.id = ?
    `, [expenseId]);

    const [expenseSplits] = await db.query(`
      SELECT es.*, u.name as user_name, u.email as user_email
      FROM expense_splits es
      LEFT JOIN users u ON es.user_id = u.id
      WHERE es.expense_id = ?
    `, [expenseId]);

    const result = { ...fullExpense[0], splits: expenseSplits };

    // Emit socket event
    const io = req.app.get('io');
    io.to(`group-${groupId}`).emit('expense-created', result);

    res.status(201).json(result);
  } catch (err) {
    if (connection) {
      try { await connection.rollback(); } catch (e) {}
      connection.release();
    }
    console.error('Create expense error:', err);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// Update an expense
router.put('/:id', [
  param('id').isInt(),
  body('description').optional().trim().notEmpty(),
  body('amount').optional().isFloat({ min: 0.01 }),
], async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount } = req.body;

    const [expenseRows] = await db.query('SELECT * FROM expenses WHERE id = ?', [id]);
    if (expenseRows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Check membership
    const [membership] = await db.query(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?',
      [expenseRows[0].group_id, req.user.id]
    );
    if (membership.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    const updates = [];
    const values = [];

    if (description) {
      updates.push('description = ?');
      values.push(description);
    }
    if (amount) {
      updates.push('amount = ?');
      values.push(amount);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const [result] = await db.query(
      `UPDATE expenses SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Fetch updated expense
    const [updated] = await db.query('SELECT * FROM expenses WHERE id = ?', [id]);

    const io = req.app.get('io');
    io.to(`group-${expenseRows[0].group_id}`).emit('expense-updated', updated[0]);

    res.json(updated[0]);
  } catch (err) {
    console.error('Update expense error:', err);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// Delete an expense
router.delete('/:id', [
  param('id').isInt(),
], async (req, res) => {
  try {
    const { id } = req.params;

    const [expenseRows] = await db.query('SELECT * FROM expenses WHERE id = ?', [id]);
    if (expenseRows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Only payer or group creator can delete
    const isPayer = expenseRows[0].paid_by === req.user.id;
    const [isCreator] = await db.query(
      'SELECT id FROM `groups` WHERE id = ? AND created_by = ?',
      [expenseRows[0].group_id, req.user.id]
    );

    if (!isPayer && isCreator.length === 0) {
      return res.status(403).json({ error: 'Only the payer or group creator can delete expenses' });
    }

    await db.query('DELETE FROM expenses WHERE id = ?', [id]);

    const io = req.app.get('io');
    io.to(`group-${expenseRows[0].group_id}`).emit('expense-deleted', { expenseId: parseInt(id) });

    res.json({ message: 'Expense deleted' });
  } catch (err) {
    console.error('Delete expense error:', err);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

module.exports = router;
