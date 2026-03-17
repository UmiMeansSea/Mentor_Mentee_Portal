# MentorPath — Mentor-Mentee Communication Platform

A full-stack platform for university students to connect with mentors via invite codes, communicate in real-time, track goals and tasks, and schedule sessions.

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+ (or use [Neon.tech](https://neon.tech) for a free cloud DB)

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env        # Edit DATABASE_URL and JWT_SECRET
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed             # Creates demo accounts
npm run dev                 # Starts on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev                 # Starts on http://localhost:5173
```

### 3. Open the app
Visit **http://localhost:5173**

---

## Demo Accounts (after seeding)

| Role   | Email                          | Password     |
|--------|-------------------------------|--------------|
| Admin  | admin@mentorplatform.com      | Admin@1234   |
| Mentor | mentor@mentorplatform.com     | Mentor@1234  |
| Mentee | mentee@mentorplatform.com     | Mentee@1234  |

Mentor invite code: **SARAH2024**

---

## Features

| Feature | Description |
|---|---|
| Invite Code Join | Mentor generates unique code → Mentee enters code to join (max 2 mentors) |
| Real-time Chat | Socket.io WebSockets with typing indicators and read receipts |
| Goal Workflow | Mentee submits goal → Mentor approves/rejects with note |
| Task Management | Mentor assigns tasks → Mentee tracks progress |
| Calendar | FullCalendar.io session scheduling (mentor creates, mentee views) |
| Admin Portal | SAP Fiori-style dashboard with full platform oversight |

---

## Tech Stack

**Frontend:** React 18 + Vite + React Router + Socket.io Client + FullCalendar + Axios

**Backend:** Node.js + Express + Socket.io + Prisma ORM + PostgreSQL + JWT + bcryptjs

---

## Project Structure

```
mentor-platform/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database models
│   │   └── seed.js            # Demo data seeder
│   └── src/
│       ├── index.js           # Express + Socket.io server
│       ├── middleware/auth.js  # JWT middleware
│       ├── routes/            # auth, mentorships, goals, tasks, sessions, messages, admin
│       └── socket/chat.js     # Socket.io real-time chat
└── frontend/
    └── src/
        ├── App.jsx            # Routes + role guards
        ├── context/           # AuthContext, SocketContext
        ├── pages/
        │   ├── mentor/        # Dashboard, Goals, Tasks, Sessions
        │   ├── mentee/        # Dashboard, Goals, Tasks
        │   ├── admin/         # Dashboard, Users, AdminPages
        │   ├── Chat.jsx       # Real-time chat
        │   └── Profile.jsx    # Profile editor
        └── utils/api.js       # Axios with JWT interceptor
```

---

## Documentation

See **MentorPath-Documentation.docx** for the full technical documentation including:
- System architecture
- Full API reference
- Database schema
- User guide for all three roles
- Setup instructions
- Design decision log
