import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectDatabase } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import countriesRouter from './routes/countries.js';
import authRouter from './routes/auth.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Gzip compression
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true
})); // CORS
app.use(express.json({ limit: '10mb' })); // JSON parser
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // URL encoded parser
app.use(morgan('combined')); // Logging
app.use(limiter); // Rate limiting

// Health check endpoint
app.get('/health', (req: express.Request, res: express.Response) => {
  res.status(200).json({
    success: true,
    message: 'Country Explorer API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/v1/countries', countriesRouter);
app.use('/api/v1/auth', authRouter);

// API Documentation endpoint
app.get('/api/v1', (req: express.Request, res: express.Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Country Explorer API v1',
    version: '1.0.0',
    endpoints: {
      countries: {
        'GET /api/v1/countries': 'Get all countries with pagination',
        'GET /api/v1/countries/:id': 'Get country by ID',
        'GET /api/v1/countries/search': 'Search countries',
        'POST /api/v1/countries/sync': 'Sync countries data (admin only)'
      },
      auth: {
        'POST /api/v1/auth/register': 'Register new user',
        'POST /api/v1/auth/login': 'Login user',
        'GET /api/v1/auth/profile': 'Get user profile (protected)',
        'PUT /api/v1/auth/profile': 'Update user profile (protected)',
        'POST /api/v1/auth/favorites/:countryId': 'Add country to favorites (protected)',
        'DELETE /api/v1/auth/favorites/:countryId': 'Remove country from favorites (protected)'
      }
    },
    documentation: 'https://github.com/your-username/country-explorer/blob/main/API.md'
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`📡 API server listening on port ${PORT}`);
      console.log(`🌍 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API docs: http://localhost:${PORT}/api/v1`);
    });
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

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

startServer();