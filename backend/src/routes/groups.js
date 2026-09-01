const express = require('express');
const { body, param, validationResult } = require('express-validator');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all groups for current user
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT g.*, ' +
      'u.name as creator_name, ' +
      'COUNT(DISTINCT gm2.user_id) as member_count, ' +
      'COALESCE(SUM(e.amount), 0) as total_expenses ' +
      'FROM `groups` g ' +
      'LEFT JOIN users u ON g.created_by = u.id ' +
      'LEFT JOIN group_members gm ON g.id = gm.group_id ' +
      'LEFT JOIN group_members gm2 ON g.id = gm2.group_id ' +
      'LEFT JOIN expenses e ON g.id = e.group_id ' +
      'WHERE gm.user_id = ? ' +
      'GROUP BY g.id, u.name ' +
      'ORDER BY g.created_at DESC',
      [req.user.id]
    );

    res.json(rows);
  } catch (err) {
    console.error('Get groups error:', err);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Create a new group
router.post('/', [
  body('name').trim().notEmpty().withMessage('Group name is required'),
  body('description').optional().trim(),
  body('memberIds').optional().isArray(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, memberIds = [] } = req.body;

    // Create group
    const [result] = await db.query(
      'INSERT INTO `groups` (name, description, created_by) VALUES (?, ?, ?)',
      [name, description || null, req.user.id]
    );

    const groupId = result.insertId;

    // Add creator as member
    await db.query(
      'INSERT IGNORE INTO group_members (group_id, user_id) VALUES (?, ?)',
      [groupId, req.user.id]
    );

    // Add other members
    for (const memberId of memberIds) {
      if (memberId !== req.user.id) {
        await db.query(
          'INSERT IGNORE INTO group_members (group_id, user_id) VALUES (?, ?)',
          [groupId, memberId]
        );
      }
    }

    // Fetch full group with members
    const [fullGroup] = await db.query(
      'SELECT g.*, u.name as creator_name ' +
      'FROM `groups` g ' +
      'LEFT JOIN users u ON g.created_by = u.id ' +
      'WHERE g.id = ?',
      [groupId]
    );

    const [members] = await db.query(
      'SELECT u.id, u.name, u.email, u.avatar_url ' +
      'FROM users u ' +
      'JOIN group_members gm ON u.id = gm.user_id ' +
      'WHERE gm.group_id = ?',
      [groupId]
    );

    // Emit socket event
    const io = req.app.get('io');
    io.to('group-' + groupId).emit('group-created', { ...fullGroup[0], members });

    res.status(201).json({ ...fullGroup[0], members });
  } catch (err) {
    console.error('Create group error:', err);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Get a single group with members
router.get('/:id', [
  param('id').isInt(),
], async (req, res) => {
  try {
    const { id } = req.params;

    // Check membership
    const [membership] = await db.query(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (membership.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    const [group] = await db.query(
      'SELECT g.*, u.name as creator_name ' +
      'FROM `groups` g ' +
      'LEFT JOIN users u ON g.created_by = u.id ' +
      'WHERE g.id = ?',
      [id]
    );

    if (group.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const [members] = await db.query(
      'SELECT u.id, u.name, u.email, u.avatar_url ' +
      'FROM users u ' +
      'JOIN group_members gm ON u.id = gm.user_id ' +
      'WHERE gm.group_id = ?',
      [id]
    );

    res.json({ ...group[0], members });
  } catch (err) {
    console.error('Get group error:', err);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

// Update a group
router.put('/:id', [
  param('id').isInt(),
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim(),
], async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Only creator can update
    const [group] = await db.query('SELECT * FROM `groups` WHERE id = ? AND created_by = ?', [id, req.user.id]);
    if (group.length === 0) {
      return res.status(403).json({ error: 'Only the group creator can update the group' });
    }

    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await db.query(
      'UPDATE `groups` SET ' + updates.join(', ') + ' WHERE id = ?',
      values
    );

    // Fetch updated group
    const [updated] = await db.query('SELECT * FROM `groups` WHERE id = ?', [id]);

    res.json(updated[0]);
  } catch (err) {
    console.error('Update group error:', err);
    res.status(500).json({ error: 'Failed to update group' });
  }
});

// Add member to group
router.post('/:id/members', [
  param('id').isInt(),
  body('userId').isInt(),
], async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Check membership
    const [membership] = await db.query(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?',
      [id, req.user.id]
    );
    if (membership.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    // Add member
    await db.query(
      'INSERT IGNORE INTO group_members (group_id, user_id) VALUES (?, ?)',
      [id, userId]
    );

    const [member] = await db.query(
      'SELECT id, name, email, avatar_url FROM users WHERE id = ?',
      [userId]
    );

    const io = req.app.get('io');
    io.to('group-' + id).emit('member-added', member[0]);

    res.json(member[0]);
  } catch (err) {
    console.error('Add member error:', err);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Remove member from group
router.delete('/:id/members/:userId', [
  param('id').isInt(),
  param('userId').isInt(),
], async (req, res) => {
  try {
    const { id, userId } = req.params;

    // Only creator can remove members (or user removing themselves)
    if (parseInt(userId) !== req.user.id) {
      const [group] = await db.query('SELECT * FROM `groups` WHERE id = ? AND created_by = ?', [id, req.user.id]);
      if (group.length === 0) {
        return res.status(403).json({ error: 'Only the group creator can remove members' });
      }
    }

    await db.query(
      'DELETE FROM group_members WHERE group_id = ? AND user_id = ?',
      [id, userId]
    );

    const io = req.app.get('io');
    io.to('group-' + id).emit('member-removed', { userId: parseInt(userId) });

    res.json({ message: 'Member removed' });
  } catch (err) {
    console.error('Remove member error:', err);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// Delete a group
router.delete('/:id', [
  param('id').isInt(),
], async (req, res) => {
  try {
    const { id } = req.params;

    const [group] = await db.query('SELECT * FROM `groups` WHERE id = ? AND created_by = ?', [id, req.user.id]);
    if (group.length === 0) {
      return res.status(403).json({ error: 'Only the group creator can delete the group' });
    }

    await db.query('DELETE FROM `groups` WHERE id = ?', [id]);

    const io = req.app.get('io');
    io.to('group-' + id).emit('group-deleted', { groupId: parseInt(id) });

    res.json({ message: 'Group deleted' });
  } catch (err) {
    console.error('Delete group error:', err);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

module.exports = router;
