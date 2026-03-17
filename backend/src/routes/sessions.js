const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Mentor: Create session
router.post('/', authenticate, requireRole('MENTOR'), async (req, res) => {
  try {
    const { title, description, startTime, endTime, menteeId } = req.body;

    const mentorship = await prisma.mentorship.findFirst({
      where: { mentorId: req.user.id, menteeId },
    });
    if (!mentorship) return res.status(403).json({ error: 'Not your mentee' });

    const session = await prisma.session.create({
      data: {
        title, description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        mentorId: req.user.id,
        menteeId,
      },
      include: {
        mentor: { select: { id: true, name: true } },
        mentee: { select: { id: true, name: true } },
      },
    });
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get sessions for current user (mentor or mentee)
router.get('/', authenticate, async (req, res) => {
  try {
    const where = req.user.role === 'MENTOR'
      ? { mentorId: req.user.id }
      : { menteeId: req.user.id };

    const sessions = await prisma.session.findMany({
      where,
      include: {
        mentor: { select: { id: true, name: true } },
        mentee: { select: { id: true, name: true } },
      },
      orderBy: { startTime: 'asc' },
    });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update session (Mentor only)
router.put('/:id', authenticate, requireRole('MENTOR'), async (req, res) => {
  try {
    const { title, description, startTime, endTime } = req.body;
    const session = await prisma.session.update({
      where: { id: req.params.id, mentorId: req.user.id },
      data: {
        title, description,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
      },
    });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete session (Mentor only)
router.delete('/:id', authenticate, requireRole('MENTOR'), async (req, res) => {
  try {
    await prisma.session.delete({ where: { id: req.params.id, mentorId: req.user.id } });
    res.json({ message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
