const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Dashboard stats
router.get('/stats', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const [totalMentors, totalMentees, totalMentorships, totalGoals, totalTasks, totalSessions] = await Promise.all([
      prisma.user.count({ where: { role: 'MENTOR' } }),
      prisma.user.count({ where: { role: 'MENTEE' } }),
      prisma.mentorship.count(),
      prisma.goal.count(),
      prisma.task.count(),
      prisma.session.count(),
    ]);

    const goalStats = await prisma.goal.groupBy({
      by: ['status'],
      _count: true,
    });

    const taskStats = await prisma.task.groupBy({
      by: ['status'],
      _count: true,
    });

    res.json({
      totalMentors, totalMentees, totalMentorships,
      totalGoals, totalTasks, totalSessions,
      goalStats, taskStats,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// All users
router.get('/users', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { role, search } = req.query;
    const where = {
      role: role ? role : { not: 'ADMIN' },
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const users = await prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, bio: true, inviteCode: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// All mentorships with details
router.get('/mentorships', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const mentorships = await prisma.mentorship.findMany({
      include: {
        mentor: { select: { id: true, name: true, email: true } },
        mentee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(mentorships);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// All goals
router.get('/goals', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const goals = await prisma.goal.findMany({
      include: { mentee: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// All tasks
router.get('/tasks', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        assignedBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// All sessions
router.get('/sessions', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const sessions = await prisma.session.findMany({
      include: {
        mentor: { select: { id: true, name: true } },
        mentee: { select: { id: true, name: true } },
      },
      orderBy: { startTime: 'desc' },
    });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user
router.delete('/users/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
