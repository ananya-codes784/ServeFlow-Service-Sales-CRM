import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import { connectDB } from './config/db';
import { seedDatabase } from './utils/seeder';

import authRoutes from './routes/authRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import customerRoutes from './routes/customerRoutes';
import complaintRoutes from './routes/complaintRoutes';
import serviceRoutes from './routes/serviceRoutes';
import amcRoutes from './routes/amcRoutes';
import salesRoutes from './routes/salesRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import financeRoutes from './routes/financeRoutes';
import hrRoutes from './routes/hrRoutes';
import adminRoutes from './routes/adminRoutes';
import notificationRoutes from './routes/notificationRoutes';
import expenseRoutes from './routes/expenseRoutes';
import spareIssueRoutes from './routes/spareIssueRoutes';
import productMasterRoutes from './routes/productMasterRoutes';
import leaveRoutes from './routes/leaveRoutes';
import msgTemplateRoutes from './routes/msgTemplateRoutes';
import gpsRoutes from './routes/gpsRoutes';

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/complaints', complaintRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/amc', amcRoutes);
app.use('/api/v1/sales', salesRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/finance', financeRoutes);
app.use('/api/v1/hr', hrRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/spare-issues', spareIssueRoutes);
app.use('/api/v1/products-master', productMasterRoutes);
app.use('/api/v1/leaves', leaveRoutes);
app.use('/api/v1/msg-templates', msgTemplateRoutes);
app.use('/api/v1/gps', gpsRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);
  socket.on('join_room', (room: string) => {
    socket.join(room);
    console.log(`[Socket] ${socket.id} joined room: ${room}`);
  });
  socket.on('complaint_update', (data) => {
    io.emit('complaint_updated', data);
  });
  socket.on('service_update', (data) => {
    io.emit('service_updated', data);
  });
  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server Error]', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

import mongoose from 'mongoose';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // Clean production initialization
  server.listen(PORT, () => {
    console.log(`\n🚀 ServeWell CRM Server running on http://localhost:${PORT}`);
    console.log(`📡 API Base URL: http://localhost:${PORT}/api/v1`);
    console.log(`🔌 Socket.io enabled\n`);
  });
};

startServer();
