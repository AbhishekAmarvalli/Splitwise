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
    // member_count / total_expenses are computed with correlated subqueries so a
    // group with N members does not multiply the expense total by N (the previous
    // multi-JOIN version inflated every total).
    const { rows } = await db.query(
      'SELECT g.*, u.name AS creator_name, ' +
        '(SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) AS member_count, ' +
        '(SELECT COALESCE(SUM(e.amount), 0) FROM expenses e WHERE e.group_id = g.id) AS total_expenses ' +
        'FROM "groups" g ' +
        'LEFT JOIN users u ON g.created_by = u.id ' +
        'WHERE EXISTS (' +
        '  SELECT 1 FROM group_members gm WHERE gm.group_id = g.id AND gm.user_id = $1' +
        ') ' +
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
  body('description').optional({ values: 'falsy' }).trim(),
  body('memberIds').optional().isArray(),
  body('memberIds.*').optional().isInt().withMessage('Member ids must be integers'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, memberIds = [] } = req.body;

    // Create group
    const { rows: created } = await db.query(
      'INSERT INTO "groups" (name, description, created_by) VALUES ($1, $2, $3) RETURNING id',
      [name, description || null, req.user.id]
    );

    const groupId = created[0].id;

    // Creator + invited members share one de-duplicated insert path.
    const uniqueMemberIds = [...new Set([req.user.id, ...memberIds.map(Number)])];
    for (const memberId of uniqueMemberIds) {
      await db.query(
        'INSERT INTO group_members (group_id, user_id) VALUES ($1, $2) ON CONFLICT (group_id, user_id) DO NOTHING',
        [groupId, memberId]
      );
    }

    // Fetch full group with members
    const { rows: fullGroup } = await db.query(
      'SELECT g.*, u.name AS creator_name ' +
        'FROM "groups" g ' +
        'LEFT JOIN users u ON g.created_by = u.id ' +
        'WHERE g.id = $1',
      [groupId]
    );

    const { rows: members } = await db.query(
      'SELECT u.id, u.name, u.email, u.avatar_url ' +
        'FROM users u ' +
        'JOIN group_members gm ON u.id = gm.user_id ' +
        'WHERE gm.group_id = $1 ORDER BY gm.joined_at',
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
    const { rows: membership } = await db.query(
      'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (membership.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    const { rows: group } = await db.query(
      'SELECT g.*, u.name AS creator_name ' +
        'FROM "groups" g ' +
        'LEFT JOIN users u ON g.created_by = u.id ' +
        'WHERE g.id = $1',
      [id]
    );

    if (group.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const { rows: members } = await db.query(
      'SELECT u.id, u.name, u.email, u.avatar_url ' +
        'FROM users u ' +
        'JOIN group_members gm ON u.id = gm.user_id ' +
        'WHERE gm.group_id = $1 ORDER BY gm.joined_at',
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
  body('description').optional({ values: 'falsy' }).trim(),
], async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Only creator can update
    const { rows: group } = await db.query('SELECT * FROM "groups" WHERE id = $1 AND created_by = $2', [id, req.user.id]);
    if (group.length === 0) {
      return res.status(403).json({ error: 'Only the group creator can update the group' });
    }

    const updates = [];
    const values = [];

    if (name) {
      values.push(name);
      updates.push(`name = $${values.length}`);
    }
    if (description !== undefined) {
      values.push(description || null);
      updates.push(`description = $${values.length}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const { rows: updated } = await db.query(
      'UPDATE "groups" SET ' + updates.join(', ') + ` WHERE id = $${values.length} RETURNING *`,
      values
    );

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
    const { rows: membership } = await db.query(
      'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    if (membership.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    const { rows: invited } = await db.query(
      'SELECT id, name, email, avatar_url FROM users WHERE id = $1',
      [userId]
    );
    if (invited.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add member (idempotent)
    await db.query(
      'INSERT INTO group_members (group_id, user_id) VALUES ($1, $2) ON CONFLICT (group_id, user_id) DO NOTHING',
      [id, userId]
    );

    const io = req.app.get('io');
    io.to('group-' + id).emit('member-added', invited[0]);

    res.json(invited[0]);
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
      const { rows: group } = await db.query('SELECT * FROM "groups" WHERE id = $1 AND created_by = $2', [id, req.user.id]);
      if (group.length === 0) {
        return res.status(403).json({ error: 'Only the group creator can remove members' });
      }
    }

    await db.query(
      'DELETE FROM group_members WHERE group_id = $1 AND user_id = $2',
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

    const { rows: group } = await db.query('SELECT * FROM "groups" WHERE id = $1 AND created_by = $2', [id, req.user.id]);
    if (group.length === 0) {
      return res.status(403).json({ error: 'Only the group creator can delete the group' });
    }

    await db.query('DELETE FROM "groups" WHERE id = $1', [id]);

    const io = req.app.get('io');
    io.to('group-' + id).emit('group-deleted', { groupId: parseInt(id) });

    res.json({ message: 'Group deleted' });
  } catch (err) {
    console.error('Delete group error:', err);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

module.exports = router;
