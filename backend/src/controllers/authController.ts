import type { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import Joi from 'joi';
import User from '../models/User.js';

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Generate JWT token
const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  return jwt.sign({ userId }, secret, { expiresIn } as any);
};

// Register new user
export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Validate request body
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message,
        statusCode: 400
      });
    }

    const { email, password, firstName, lastName } = value;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User already exists with this email',
        statusCode: 409
      });
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName
    });

    await user.save();

    // Generate token
    const token = generateToken((user as any)._id.toString());

    // Return user data (without password)
    const userResponse = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      favorites: user.favorites,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return res.status(201).json({
      success: true,
      data: {
        user: userResponse,
        tokens: {
          accessToken: token,
          refreshToken: token, // Using same token for now
          expiresIn: process.env.JWT_EXPIRE || '7d'
        }
      },
      message: 'User registered successfully'
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Registration failed',
      details: error.message,
      statusCode: 500
    });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Validate request body
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message,
        statusCode: 400
      });
    }

    const { email, password } = value;

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        statusCode: 401
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        statusCode: 401
      });
    }

    // Generate token
    const token = generateToken((user as any)._id.toString());

    // Return user data (without password)
    const userResponse = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      favorites: user.favorites,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return res.json({
      success: true,
      data: {
        user: userResponse,
        tokens: {
          accessToken: token,
          refreshToken: token, // Using same token for now
          expiresIn: process.env.JWT_EXPIRE || '7d'
        }
      },
      message: 'Login successful'
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Login failed',
      details: error.message,
      statusCode: 500
    });
  }
};

// Get user profile
export const getProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId; // From auth middleware

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        statusCode: 404
      });
    }

    const userResponse = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      favorites: user.favorites,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return res.json({
      success: true,
      data: userResponse
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get profile',
      details: error.message,
      statusCode: 500
    });
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId;
    const { firstName, lastName } = req.body;

    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update',
        statusCode: 400
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        statusCode: 404
      });
    }

    const userResponse = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      favorites: user.favorites,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return res.json({
      success: true,
      data: userResponse,
      message: 'Profile updated successfully'
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update profile',
      details: error.message,
      statusCode: 500
    });
  }
};

// Add country to favorites
export const addToFavorites = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId;
    const { countryId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        statusCode: 404
      });
    }

    if (!user.favorites.includes(countryId)) {
      user.favorites.push(countryId);
      await user.save();
    }

    return res.json({
      success: true,
      data: { favorites: user.favorites },
      message: 'Country added to favorites'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'Failed to add to favorites',
      details: error.message,
      statusCode: 500
    });
  }
};

// Remove country from favorites
export const removeFromFavorites = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId;
    const { countryId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        statusCode: 404
      });
    }

    user.favorites = user.favorites.filter(id => id !== countryId);
    await user.save();

    return res.json({
      success: true,
      data: { favorites: user.favorites },
      message: 'Country removed from favorites'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'Failed to remove from favorites',
      details: error.message,
      statusCode: 500
    });
  }
};