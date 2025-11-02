import { Router } from 'express';
import { register, login, getProfile, updateProfile, addToFavorites, removeFromFavorites } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// @route   POST /api/v1/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', register);

// @route   POST /api/v1/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   GET /api/v1/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticate, getProfile);

// @route   PUT /api/v1/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, updateProfile);

// @route   POST /api/v1/auth/favorites/:countryId
// @desc    Add country to favorites
// @access  Private
router.post('/favorites/:countryId', authenticate, addToFavorites);

// @route   DELETE /api/v1/auth/favorites/:countryId
// @desc    Remove country from favorites
// @access  Private
router.delete('/favorites/:countryId', authenticate, removeFromFavorites);

export default router;