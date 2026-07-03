import dotenv from 'dotenv';
import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

// Load environment variables
dotenv.config();

const app = createApp();
const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`📡 API server listening on port ${PORT}`);
      console.log(`🌍 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API docs: http://localhost:${PORT}/api/v1`);
    });

    // Graceful shutdown: stop accepting new connections, then close the DB.
    const shutdown = (signal: string) => {
      console.log(`👋 ${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

startServer();
