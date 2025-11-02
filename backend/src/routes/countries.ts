import { Router } from 'express';
import { getAllCountries, getCountryById, syncCountriesData, searchCountries } from '../controllers/countriesController.js';

const router = Router();

// @route   GET /api/v1/countries
// @desc    Get all countries with pagination and filtering
// @access  Public
router.get('/', getAllCountries);

// @route   GET /api/v1/countries/search
// @desc    Search countries by name, region, etc.
// @access  Public  
router.get('/search', searchCountries);

// @route   GET /api/v1/countries/:id
// @desc    Get country by ID
// @access  Public
router.get('/:id', getCountryById);

// @route   POST /api/v1/countries/sync
// @desc    Sync countries data from external API (admin only)
// @access  Private/Admin
router.post('/sync', syncCountriesData);

export default router;