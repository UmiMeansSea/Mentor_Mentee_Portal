const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Mentee: Create goal
router.post('/', authenticate, requireRole('MENTEE'), async (req, res) => {
  try {
    const { title, description } = req.body;
    const goal = await prisma.goal.create({
      data: { title, description, menteeId: req.user.id },
    });
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mentee: Get my goals
router.get('/my', authenticate, requireRole('MENTEE'), async (req, res) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { menteeId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mentor: Get goals of a specific mentee
router.get('/mentee/:menteeId', authenticate, requireRole('MENTOR'), async (req, res) => {
  try {
    // Verify mentorship exists
    const mentorship = await prisma.mentorship.findFirst({
      where: { mentorId: req.user.id, menteeId: req.params.menteeId },
    });
    if (!mentorship) return res.status(403).json({ error: 'Not your mentee' });

    const goals = await prisma.goal.findMany({
      where: { menteeId: req.params.menteeId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mentor: Approve or reject goal
router.patch('/:id/review', authenticate, requireRole('MENTOR'), async (req, res) => {
  try {
    const { status, mentorNote } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Status must be APPROVED or REJECTED' });
    }

    const goal = await prisma.goal.update({
      where: { id: req.params.id },
      data: { status, mentorNote },
    });
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mentee: Delete goal
router.delete('/:id', authenticate, requireRole('MENTEE'), async (req, res) => {
  try {
    await prisma.goal.delete({ where: { id: req.params.id, menteeId: req.user.id } });
    res.json({ message: 'Goal deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
