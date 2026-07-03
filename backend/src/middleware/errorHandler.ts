import type { Request, Response, NextFunction } from 'express';

interface HttpError extends Error {
  statusCode?: number;
  error?: string;
  details?: unknown;
  code?: number;
}

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  console.error('🚨 Error:', error);

  const err = error as HttpError;

  // If it's already an ApiError with statusCode, use it
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.error || err.message,
      details: err.details,
      statusCode: err.statusCode
    });
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: err.message,
      statusCode: 400
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID format',
      statusCode: 400
    });
  }

  if (err.name === 'MongoServerError' && err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: 'Duplicate field value',
      details: 'A resource with this value already exists',
      statusCode: 409
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      statusCode: 401
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired',
      statusCode: 401
    });
  }

  // Default server error
  return res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    details: process.env.NODE_ENV === 'production' ? undefined : err.message,
    statusCode: 500
  });
};