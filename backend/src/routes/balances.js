const express = require('express');
const { param, validationResult } = require('express-validator');
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const { simplifyDebts } = require('../utils/simplifyDebts');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get balances for a group
router.get('/:groupId', [
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

    // Get all members
    const [members] = await db.query(`
      SELECT u.id, u.name, u.email, u.avatar_url
      FROM users u
      JOIN group_members gm ON u.id = gm.user_id
      WHERE gm.group_id = ?
    `, [groupId]);

    // Calculate net balance for each member
    const balances = {};

    for (const member of members) {
      balances[member.id] = 0;
    }

    // Amounts paid by each person
    const [paidAmounts] = await db.query(`
      SELECT paid_by, SUM(amount) as total_paid
      FROM expenses
      WHERE group_id = ?
      GROUP BY paid_by
    `, [groupId]);

    for (const row of paidAmounts) {
      if (balances[row.paid_by] !== undefined) {
        balances[row.paid_by] += parseFloat(row.total_paid);
      }
    }

    // Amounts each person owes
    const [owedAmounts] = await db.query(`
      SELECT es.user_id, SUM(es.amount) as total_owed
      FROM expense_splits es
      JOIN expenses e ON es.expense_id = e.id
      WHERE e.group_id = ?
      GROUP BY es.user_id
    `, [groupId]);

    for (const row of owedAmounts) {
      if (balances[row.user_id] !== undefined) {
        balances[row.user_id] -= parseFloat(row.total_owed);
      }
    }

    // Deduct settlements already made
    const [settlements] = await db.query(`
      SELECT from_user, to_user, SUM(amount) as total_settled
      FROM settlements
      WHERE group_id = ?
      GROUP BY from_user, to_user
    `, [groupId]);

    for (const row of settlements) {
      if (balances[row.from_user] !== undefined) {
        balances[row.from_user] += parseFloat(row.total_settled);
      }
      if (balances[row.to_user] !== undefined) {
        balances[row.to_user] -= parseFloat(row.total_settled);
      }
    }

    // Simplify debts
    const simplifiedTransactions = simplifyDebts(balances);

    // Map user IDs to names
    const memberMap = {};
    for (const member of members) {
      memberMap[member.id] = member;
    }

    const result = members.map((member) => ({
      ...member,
      balance: Math.round((balances[member.id] || 0) * 100) / 100,
    }));

    const transactions = simplifiedTransactions.map((t) => ({
      from: { ...memberMap[t.from] },
      to: { ...memberMap[t.to] },
      amount: t.amount,
    }));

    res.json({
      members: result,
      transactions,
      totalExpenses: paidAmounts.reduce((sum, r) => sum + parseFloat(r.total_paid), 0),
    });
  } catch (err) {
    console.error('Get balances error:', err);
    res.status(500).json({ error: 'Failed to calculate balances' });
  }
});

module.exports = router;
