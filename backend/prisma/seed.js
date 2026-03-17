const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  // Admin
  await prisma.user.upsert({
    where: { email: 'admin@mentorplatform.com' },
    update: {},
    create: {
      email: 'admin@mentorplatform.com',
      password: await bcrypt.hash('Admin@1234', 10),
      name: 'Platform Admin',
      role: 'ADMIN',
    },
  });

  // Mentor
  const mentor = await prisma.user.upsert({
    where: { email: 'mentor@mentorplatform.com' },
    update: {},
    create: {
      email: 'mentor@mentorplatform.com',
      password: await bcrypt.hash('Mentor@1234', 10),
      name: 'Dr. Sarah Johnson',
      role: 'MENTOR',
      bio: 'Senior Software Engineer with 10 years of experience.',
      inviteCode: 'SARAH2024',
    },
  });

  // Mentee
  const mentee = await prisma.user.upsert({
    where: { email: 'mentee@mentorplatform.com' },
    update: {},
    create: {
      email: 'mentee@mentorplatform.com',
      password: await bcrypt.hash('Mentee@1234', 10),
      name: 'Alex Chen',
      role: 'MENTEE',
      bio: 'Computer Science student, year 3.',
    },
  });

  // Mentorship
  const existingMentorship = await prisma.mentorship.findFirst({
    where: { mentorId: mentor.id, menteeId: mentee.id },
  });

  if (!existingMentorship) {
    await prisma.mentorship.create({
      data: { mentorId: mentor.id, menteeId: mentee.id },
    });
  }

  console.log('✅ Seed complete');
  console.log('Admin:  admin@mentorplatform.com / Admin@1234');
  console.log('Mentor: mentor@mentorplatform.com / Mentor@1234');
  console.log('Mentee: mentee@mentorplatform.com / Mentee@1234');
}

main().catch(console.error).finally(() => prisma.$disconnect());
