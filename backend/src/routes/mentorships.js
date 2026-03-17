const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Join mentor via invite code (Mentee only)
router.post('/join', authenticate, requireRole('MENTEE'), async (req, res) => {
  try {
    const { inviteCode } = req.body;

    const mentor = await prisma.user.findUnique({ where: { inviteCode } });
    if (!mentor) return res.status(404).json({ error: 'Invalid invite code' });

    // Check max 2 mentors
    const count = await prisma.mentorship.count({ where: { menteeId: req.user.id } });
    if (count >= 2) return res.status(400).json({ error: 'You can have a maximum of 2 mentors' });

    // Check duplicate
    const existing = await prisma.mentorship.findFirst({
      where: { mentorId: mentor.id, menteeId: req.user.id },
    });
    if (existing) return res.status(400).json({ error: 'Already enrolled with this mentor' });

    const mentorship = await prisma.mentorship.create({
      data: { mentorId: mentor.id, menteeId: req.user.id },
      include: { mentor: { select: { id: true, name: true, email: true, bio: true } } },
    });

    res.status(201).json(mentorship);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get my mentors (Mentee)
router.get('/my-mentors', authenticate, requireRole('MENTEE'), async (req, res) => {
  try {
    const mentorships = await prisma.mentorship.findMany({
      where: { menteeId: req.user.id },
      include: { mentor: { select: { id: true, name: true, email: true, bio: true, inviteCode: true } } },
    });
    res.json(mentorships);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get my mentees (Mentor)
router.get('/my-mentees', authenticate, requireRole('MENTOR'), async (req, res) => {
  try {
    const mentorships = await prisma.mentorship.findMany({
      where: { mentorId: req.user.id },
      include: { mentee: { select: { id: true, name: true, email: true, bio: true } } },
    });
    res.json(mentorships);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove mentorship
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await prisma.mentorship.delete({ where: { id: req.params.id } });
    res.json({ message: 'Mentorship removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
