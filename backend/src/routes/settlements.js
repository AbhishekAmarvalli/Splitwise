const express = require('express');
const { body, param, validationResult } = require('express-validator');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get settlements for a group
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

    const [result] = await db.query(`
      SELECT s.*, 
        fu.name as from_user_name, fu.email as from_user_email,
        tu.name as to_user_name, tu.email as to_user_email
      FROM settlements s
      LEFT JOIN users fu ON s.from_user = fu.id
      LEFT JOIN users tu ON s.to_user = tu.id
      WHERE s.group_id = ?
      ORDER BY s.settled_at DESC
    `, [groupId]);

    res.json(result);
  } catch (err) {
    console.error('Get settlements error:', err);
    res.status(500).json({ error: 'Failed to fetch settlements' });
  }
});

// Record a settlement
router.post('/', [
  body('groupId').isInt().withMessage('Group ID is required'),
  body('fromUser').isInt().withMessage('From user is required'),
  body('toUser').isInt().withMessage('To user is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { groupId, fromUser, toUser, amount } = req.body;

    // Check that from and to are different
    if (fromUser === toUser) {
      return res.status(400).json({ error: 'Cannot settle with yourself' });
    }

    // Only the payer or group creator can record a settlement
    const [group] = await db.query('SELECT created_by FROM `groups` WHERE id = ?', [groupId]);
    if (group.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }
    const isPayer = fromUser === req.user.id;
    const isCreator = group[0].created_by === req.user.id;
    if (!isPayer && !isCreator) {
      return res.status(403).json({ error: 'Only the payer or group creator can record settlements' });
    }

    // Check membership for both users
    const [fromMembership] = await db.query(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, fromUser]
    );
    const [toMembership] = await db.query(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, toUser]
    );

    if (fromMembership.length === 0 || toMembership.length === 0) {
      return res.status(400).json({ error: 'Both users must be members of the group' });
    }

    // Record settlement
    const [result] = await db.query(
      'INSERT INTO settlements (group_id, from_user, to_user, amount) VALUES (?, ?, ?, ?)',
      [groupId, fromUser, toUser, amount]
    );

    // Fetch full settlement with names
    const [fullSettlement] = await db.query(`
      SELECT s.*, 
        fu.name as from_user_name, fu.email as from_user_email,
        tu.name as to_user_name, tu.email as to_user_email
      FROM settlements s
      LEFT JOIN users fu ON s.from_user = fu.id
      LEFT JOIN users tu ON s.to_user = tu.id
      WHERE s.id = ?
    `, [result.insertId]);

    // Emit socket event
    const io = req.app.get('io');
    io.to(`group-${groupId}`).emit('settlement-created', fullSettlement[0]);

    res.status(201).json(fullSettlement[0]);
  } catch (err) {
    console.error('Create settlement error:', err);
    res.status(500).json({ error: 'Failed to record settlement' });
  }
});

// Delete a settlement
router.delete('/:id', [
  param('id').isInt(),
], async (req, res) => {
  try {
    const { id } = req.params;

    const [settlement] = await db.query('SELECT * FROM settlements WHERE id = ?', [id]);
    if (settlement.length === 0) {
      return res.status(404).json({ error: 'Settlement not found' });
    }

    // Only the person who made the payment can delete
    if (settlement[0].from_user !== req.user.id) {
      return res.status(403).json({ error: 'Only the payer can delete a settlement' });
    }

    await db.query('DELETE FROM settlements WHERE id = ?', [id]);

    const io = req.app.get('io');
    io.to(`group-${settlement[0].group_id}`).emit('settlement-deleted', { settlementId: parseInt(id) });

    res.json({ message: 'Settlement deleted' });
  } catch (err) {
    console.error('Delete settlement error:', err);
    res.status(500).json({ error: 'Failed to delete settlement' });
  }
});

module.exports = router;
