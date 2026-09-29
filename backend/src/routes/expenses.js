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
    const { rows: membership } = await db.query(
      'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, req.user.id]
    );
    if (membership.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    const { rows: expenses } = await db.query(`
      SELECT e.*, u.name as paid_by_name, u.email as paid_by_email
      FROM expenses e
      LEFT JOIN users u ON e.paid_by = u.id
      WHERE e.group_id = $1
      ORDER BY e.created_at DESC, e.id DESC
    `, [groupId]);

    if (expenses.length === 0) {
      return res.json([]);
    }

    // Fetch every split in a single query instead of one query per expense
    const { rows: allSplits } = await db.query(`
      SELECT es.*, u.name as user_name, u.email as user_email
      FROM expense_splits es
      LEFT JOIN users u ON es.user_id = u.id
      WHERE es.expense_id = ANY($1::int[])
    `, [expenses.map((e) => e.id)]);

    const splitsByExpense = new Map();
    for (const split of allSplits) {
      if (!splitsByExpense.has(split.expense_id)) splitsByExpense.set(split.expense_id, []);
      splitsByExpense.get(split.expense_id).push(split);
    }

    const result = expenses.map((expense) => ({
      ...expense,
      splits: splitsByExpense.get(expense.id) || [],
    }));

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
  body('splits.*.userId').isInt().withMessage('Each split needs a user'),
  body('paymentMethod').optional().isIn(['cash', 'upi', 'card', 'bank']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let connection;
  try {
    const { groupId, description, amount, paidBy, splitType, splits, paymentMethod } = req.body;

    connection = await db.getConnection();
    await connection.query('BEGIN');

    // Everyone involved must belong to the group
    const { rows: memberRows } = await connection.query(
      'SELECT user_id FROM group_members WHERE group_id = $1',
      [groupId]
    );
    const memberIds = new Set(memberRows.map((r) => r.user_id));

    if (!memberIds.has(req.user.id)) {
      await connection.query('ROLLBACK');
      return res.status(403).json({ error: 'You are not a member of this group' });
    }
    if (!memberIds.has(Number(paidBy))) {
      await connection.query('ROLLBACK');
      return res.status(400).json({ error: 'Payer must be a member of the group' });
    }
    const unknownSplitUser = splits.find((s) => !memberIds.has(Number(s.userId)));
    if (unknownSplitUser) {
      await connection.query('ROLLBACK');
      return res.status(400).json({ error: 'Every split must belong to a group member' });
    }

    // Payer cannot be counted twice in the same expense
    const uniqueSplitUsers = new Set(splits.map((s) => Number(s.userId)));
    if (uniqueSplitUsers.size !== splits.length) {
      await connection.query('ROLLBACK');
      return res.status(400).json({ error: 'Each person can only appear once in a split' });
    }

    // Create expense
    const { rows: expenseRows } = await connection.query(
      'INSERT INTO expenses (group_id, description, amount, paid_by, split_type, payment_method) ' +
        'VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [groupId, description, amount, paidBy, splitType, paymentMethod || 'cash']
    );
    const expenseId = expenseRows[0].id;

    // Create splits
    let totalSplit = 0;
    for (const split of splits) {
      const splitAmount = splitType === 'equal' ? (amount / splits.length) : split.amount;
      const percentage = splitType === 'percentage' ? split.percentage : null;

      await connection.query(
        'INSERT INTO expense_splits (expense_id, user_id, amount, percentage) VALUES ($1, $2, $3, $4)',
        [expenseId, split.userId, Math.round(splitAmount * 100) / 100, percentage]
      );
      totalSplit += splitAmount;
    }

    // Validate total split equals expense amount
    if (Math.abs(totalSplit - amount) > 0.02 && splitType !== 'equal') {
      await connection.query('ROLLBACK');
      return res.status(400).json({ error: 'Total splits do not equal expense amount' });
    }

    await connection.query('COMMIT');
    connection.release();
    connection = null;

    // Fetch full expense with splits
    const { rows: fullExpense } = await db.query(`
      SELECT e.*, u.name as paid_by_name, u.email as paid_by_email
      FROM expenses e
      LEFT JOIN users u ON e.paid_by = u.id
      WHERE e.id = $1
    `, [expenseId]);

    const { rows: expenseSplits } = await db.query(`
      SELECT es.*, u.name as user_name, u.email as user_email
      FROM expense_splits es
      LEFT JOIN users u ON es.user_id = u.id
      WHERE es.expense_id = $1
    `, [expenseId]);

    const result = { ...fullExpense[0], splits: expenseSplits };

    // Emit socket event
    const io = req.app.get('io');
    io.to(`group-${groupId}`).emit('expense-created', result);

    res.status(201).json(result);
  } catch (err) {
    if (connection) {
      try { await connection.query('ROLLBACK'); } catch (e) { /* already rolled back */ }
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

    const { rows: expenseRows } = await db.query('SELECT * FROM expenses WHERE id = $1', [id]);
    if (expenseRows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Check membership
    const { rows: membership } = await db.query(
      'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
      [expenseRows[0].group_id, req.user.id]
    );
    if (membership.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    // Only payer or group creator can update
    const isPayer = expenseRows[0].paid_by === req.user.id;
    const { rows: isCreator } = await db.query(
      'SELECT id FROM "groups" WHERE id = $1 AND created_by = $2',
      [expenseRows[0].group_id, req.user.id]
    );
    if (!isPayer && isCreator.length === 0) {
      return res.status(403).json({ error: 'Only the payer or group creator can update expenses' });
    }

    const updates = [];
    const values = [];

    if (description) {
      values.push(description);
      updates.push(`description = $${values.length}`);
    }
    if (amount) {
      values.push(amount);
      updates.push(`amount = $${values.length}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const { rows: updated } = await db.query(
      `UPDATE expenses SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );

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

    const { rows: expenseRows } = await db.query('SELECT * FROM expenses WHERE id = $1', [id]);
    if (expenseRows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Only payer or group creator can delete
    const isPayer = expenseRows[0].paid_by === req.user.id;
    const { rows: isCreator } = await db.query(
      'SELECT id FROM "groups" WHERE id = $1 AND created_by = $2',
      [expenseRows[0].group_id, req.user.id]
    );

    if (!isPayer && isCreator.length === 0) {
      return res.status(403).json({ error: 'Only the payer or group creator can delete expenses' });
    }

    await db.query('DELETE FROM expenses WHERE id = $1', [id]);

    const io = req.app.get('io');
    io.to(`group-${expenseRows[0].group_id}`).emit('expense-deleted', { expenseId: parseInt(id) });

    res.json({ message: 'Expense deleted' });
  } catch (err) {
    console.error('Delete expense error:', err);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

module.exports = router;
