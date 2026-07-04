import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import countriesRouter from './routes/countries.js';
import authRouter from './routes/auth.js';

// Build and configure the Express application. Kept free of side effects
// (no DB connection, no listen) so it can be imported directly in tests.
export const createApp = (): express.Express => {
  const app = express();

  // Rate limiting - more lenient in development, disabled under test
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000,
    message: {
      success: false,
      error: 'Too many requests from this IP, please try again later.',
      statusCode: 429
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'test'
  });

  // Middleware
  app.use(helmet()); // Security headers
  app.use(compression()); // Gzip compression

  // Allowed browser origins. FRONTEND_URL may be a single URL or a
  // comma-separated list (e.g. production Netlify site + preview URL).
  // Local dev origins are always allowed. Trailing slashes are stripped so
  // "https://site.netlify.app/" matches the browser's "https://site.netlify.app".
  const allowedOrigins = [
    ...(process.env.FRONTEND_URL ?? '').split(','),
    'http://localhost:5173',
    'http://localhost:5174'
  ]
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

  app.use(cors({
    origin(origin, callback) {
      // Allow non-browser clients (no Origin header) such as curl and health checks.
      if (!origin) {
        return callback(null, true);
      }
      const normalized = origin.replace(/\/$/, '');
      if (allowedOrigins.includes(normalized)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined')); // Request logging (noisy in tests)
  }
  app.use(limiter);

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

  // API documentation endpoint
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
      }
    });
  });

  // Error handling middleware (must be last)
  app.use(notFound);
  app.use(errorHandler);

  return app;
};

export default createApp;
