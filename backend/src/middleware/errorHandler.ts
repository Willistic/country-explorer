import type { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  console.error('🚨 Error:', error);

  // If it's already an ApiError with statusCode, use it
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.error || error.message,
      details: error.details,
      statusCode: error.statusCode
    });
  }

  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: error.message,
      statusCode: 400
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID format',
      statusCode: 400
    });
  }

  if (error.name === 'MongoServerError' && error.code === 11000) {
    return res.status(409).json({
      success: false,
      error: 'Duplicate field value',
      details: 'A resource with this value already exists',
      statusCode: 409
    });
  }

  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      statusCode: 401
    });
  }

  if (error.name === 'TokenExpiredError') {
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
    details: process.env.NODE_ENV === 'production' ? undefined : error.message,
    statusCode: 500
  });
};