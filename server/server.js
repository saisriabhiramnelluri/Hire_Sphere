import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { connectDatabase } from './src/config/database.js';
import routes from './src/routes/index.js';
import { errorHandler, notFound } from './src/middleware/errorMiddleware.js';
import { startCronJobs } from './src/jobs/emailScheduler.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL,
  'https://hire-sphere-opal.vercel.app'
].filter(Boolean);

// Socket.IO setup for WebRTC signaling
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:5173',
        process.env.CLIENT_URL,
        'https://hire-sphere-opal.vercel.app'
      ];
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Track users in interview rooms
const rooms = new Map();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join interview room
  socket.on('join-room', ({ roomId, userId, userName }) => {
    socket.join(roomId);

    // Track user in room
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
    }
    rooms.get(roomId).set(socket.id, { userId, userName, socketId: socket.id });

    // Notify others in the room
    socket.to(roomId).emit('user-joined', {
      socketId: socket.id,
      userId,
      userName,
    });

    // Send existing users to the new user
    const existingUsers = [];
    rooms.get(roomId).forEach((user, sid) => {
      if (sid !== socket.id) {
        existingUsers.push(user);
      }
    });
    socket.emit('existing-users', existingUsers);

    console.log(`User ${userName} joined room ${roomId}`);
  });

  // WebRTC signaling: Send offer
  socket.on('offer', ({ offer, to, from }) => {
    io.to(to).emit('offer', { offer, from });
  });

  // WebRTC signaling: Send answer
  socket.on('answer', ({ answer, to, from }) => {
    io.to(to).emit('answer', { answer, from });
  });

  // WebRTC signaling: ICE candidate exchange
  socket.on('ice-candidate', ({ candidate, to, from }) => {
    io.to(to).emit('ice-candidate', { candidate, from });
  });

  // Leave room
  socket.on('leave-room', ({ roomId }) => {
    socket.leave(roomId);
    if (rooms.has(roomId)) {
      rooms.get(roomId).delete(socket.id);
      if (rooms.get(roomId).size === 0) {
        rooms.delete(roomId);
      }
    }
    socket.to(roomId).emit('user-left', { socketId: socket.id });
    console.log(`User left room ${roomId}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    // Clean up from all rooms
    rooms.forEach((users, roomId) => {
      if (users.has(socket.id)) {
        users.delete(socket.id);
        socket.to(roomId).emit('user-left', { socketId: socket.id });
        if (users.size === 0) {
          rooms.delete(roomId);
        }
      }
    });
    console.log(`User disconnected: ${socket.id}`);
  });
});

connectDatabase();

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      process.env.CLIENT_URL,
      'https://hire-sphere-opal.vercel.app'
    ];
    // Allow requests with no origin
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HireSphere API is running correctly. Use /api for endpoints.',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HireSphere API is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api', routes);

startCronJobs();

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`Allowed Origins: ${allowedOrigins.join(', ')}`);
  console.log(`Socket.IO signaling server ready for WebRTC connections`);
});

export default app;

