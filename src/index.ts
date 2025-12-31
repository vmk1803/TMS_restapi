import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRouter from './routers/authRouter';
import userManagementRoutes from './routers/usersManagement/index';

import { errorHandler, notFoundHandler } from './common/middlewares/errorHandler';
import { ensureDBConnectionMiddleware } from './common/middlewares/database';

// Load environment variables
dotenv.config();

// Create Express application
const app: Application = express();
const port = Number(process.env.PORT || 3001);

// Global database connection middleware (ensures DB connection before any API call)
app.use(ensureDBConnectionMiddleware);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

// Health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Express API Server is running!',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || 'v1'
  });
});

// API routes
app.use(`/${process.env.API_VERSION || 'api/v1'}/auth`, authRouter);
app.use(`/${process.env.API_VERSION || 'api/v1'}/user-management`, userManagementRoutes);


// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`🚀 Express API Server is running on port ${port}`);
  console.log(`📍 API Version: ${process.env.API_VERSION || 'v1'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;
