const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const setupSocket = (io) => {
  // Auth middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  // Track online users: userId -> socketId
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    onlineUsers.set(userId, socket.id);

    // Broadcast online status
    io.emit('user:online', { userId, online: true });

    // Join personal room
    socket.join(`user:${userId}`);

    // Send private message
    socket.on('message:send', async ({ receiverId, content }) => {
      try {
        const message = await prisma.message.create({
          data: { content, senderId: userId, receiverId },
          include: { sender: { select: { id: true, name: true } } },
        });

        // Deliver to receiver if online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(`user:${receiverId}`).emit('message:receive', message);
        }

        // Confirm to sender
        socket.emit('message:sent', message);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Typing indicators
    socket.on('typing:start', ({ receiverId }) => {
      io.to(`user:${receiverId}`).emit('typing:start', { userId });
    });

    socket.on('typing:stop', ({ receiverId }) => {
      io.to(`user:${receiverId}`).emit('typing:stop', { userId });
    });

    // Mark messages as read
    socket.on('messages:read', async ({ senderId }) => {
      await prisma.message.updateMany({
        where: { senderId, receiverId: userId, read: false },
        data: { read: true },
      });
      io.to(`user:${senderId}`).emit('messages:read', { by: userId });
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('user:online', { userId, online: false });
    });
  });
};

module.exports = setupSocket;
