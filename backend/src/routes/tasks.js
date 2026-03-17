const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Mentor: Assign task to mentee
router.post('/', authenticate, requireRole('MENTOR'), async (req, res) => {
  try {
    const { title, description, menteeId, dueDate } = req.body;

    const mentorship = await prisma.mentorship.findFirst({
      where: { mentorId: req.user.id, menteeId },
    });
    if (!mentorship) return res.status(403).json({ error: 'Not your mentee' });

    const task = await prisma.task.create({
      data: {
        title, description,
        mentorId: req.user.id,
        menteeId,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        assignedTo: { select: { id: true, name: true } },
      },
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mentor: Get tasks assigned by me
router.get('/assigned', authenticate, requireRole('MENTOR'), async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { mentorId: req.user.id },
      include: { assignedTo: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mentee: Get my tasks
router.get('/my', authenticate, requireRole('MENTEE'), async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { menteeId: req.user.id },
      include: { assignedBy: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mentee: Update task status
router.patch('/:id/status', authenticate, requireRole('MENTEE'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['IN_PROGRESS', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const task = await prisma.task.update({
      where: { id: req.params.id, menteeId: req.user.id },
      data: { status },
    });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mentor: Delete task
router.delete('/:id', authenticate, requireRole('MENTOR'), async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id, mentorId: req.user.id } });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
