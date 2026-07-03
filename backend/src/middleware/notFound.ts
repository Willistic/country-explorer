import type { Request, Response } from 'express';

export const notFound = (req: Request, res: Response): Response => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  return res.json({
    success: false,
    error: error.message,
    statusCode: 404
  });
};