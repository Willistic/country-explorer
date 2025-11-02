import type { Request, Response } from 'express';
import NodeCache from 'node-cache';
import axios from 'axios';
import { Country, CountriesResponse, CountryQueryParams } from '../types/index.js';

// Cache for 1 hour (3600 seconds)
const cache = new NodeCache({ stdTTL: 3600 });

export const getAllCountries = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      page = 1,
      limit = 25,
      search,
      region,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query as CountryQueryParams;

    const cacheKey = `countries_${page}_${limit}_${search || ''}_${region || ''}_${sortBy}_${sortOrder}`;
    
    // Check cache first
    const cachedData = cache.get<CountriesResponse>(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    let countries: Country[] = [];

    try {
      // Try to fetch from external API first
      const response = await axios.get(
        'https://restcountries.com/v3.1/all?fields=name,capital,region,population,flags'
      );
      countries = response.data;
    } catch (externalApiError) {
      console.warn('External API failed, using sample data:', externalApiError);
      
      // Fallback to sample data if external API fails
      countries = [
        {
          name: { common: "United States", official: "United States of America" },
          region: "Americas",
          capital: ["Washington, D.C."],
          population: 331900000,
          flags: {
            png: "https://flagcdn.com/w320/us.png",
            svg: "https://flagcdn.com/us.svg",
            alt: "The flag of the United States"
          }
        },
        {
          name: { common: "Germany", official: "Federal Republic of Germany" },
          region: "Europe",
          capital: ["Berlin"],
          population: 83240000,
          flags: {
            png: "https://flagcdn.com/w320/de.png",
            svg: "https://flagcdn.com/de.svg",
            alt: "The flag of Germany"
          }
        },
        {
          name: { common: "Japan", official: "Japan" },
          region: "Asia",
          capital: ["Tokyo"],
          population: 125800000,
          flags: {
            png: "https://flagcdn.com/w320/jp.png",
            svg: "https://flagcdn.com/jp.svg",
            alt: "The flag of Japan"
          }
        },
        {
          name: { common: "Brazil", official: "Federative Republic of Brazil" },
          region: "Americas",
          capital: ["Brasília"],
          population: 215300000,
          flags: {
            png: "https://flagcdn.com/w320/br.png",
            svg: "https://flagcdn.com/br.svg",
            alt: "The flag of Brazil"
          }
        },
        {
          name: { common: "Australia", official: "Commonwealth of Australia" },
          region: "Oceania",
          capital: ["Canberra"],
          population: 25690000,
          flags: {
            png: "https://flagcdn.com/w320/au.png",
            svg: "https://flagcdn.com/au.svg",
            alt: "The flag of Australia"
          }
        }
      ];
    }

    // Apply filtering
    if (search) {
      const searchLower = search.toLowerCase();
      countries = countries.filter(country => 
        country.name.common.toLowerCase().includes(searchLower) ||
        (country.capital && country.capital[0]?.toLowerCase().includes(searchLower))
      );
    }

    if (region) {
      countries = countries.filter(country => 
        country.region.toLowerCase() === region.toLowerCase()
      );
    }

    // Apply sorting
    countries.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'population':
          aValue = a.population;
          bValue = b.population;
          break;
        case 'area':
          aValue = a.area || 0;
          bValue = b.area || 0;
          break;
        default: // name
          aValue = a.name.common;
          bValue = b.name.common;
      }

      if (sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    // Apply pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedCountries = countries.slice(startIndex, endIndex);

    const result: CountriesResponse = {
      success: true,
      data: paginatedCountries,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: countries.length,
        totalPages: Math.ceil(countries.length / Number(limit))
      }
    };

    // Cache the result
    cache.set(cacheKey, result);

    return res.json(result);
  } catch (error: any) {
    console.error('Error fetching countries:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch countries',
      details: error.message,
      statusCode: 500
    });
  }
};

export const getCountryById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    
    // For now, we'll fetch from the external API
    // Later this will query the database
    const response = await axios.get(
      `https://restcountries.com/v3.1/name/${id}?fullText=true&fields=name,capital,population,flags,region,subregion,area,languages,currencies,timezones,borders`
    );

    if (!response.data || response.data.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Country not found',
        statusCode: 404
      });
    }

    return res.json({
      success: true,
      data: response.data[0]
    });
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'Country not found',
        statusCode: 404
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to fetch country',
      details: error.message,
      statusCode: 500
    });
  }
};

export const searchCountries = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
        statusCode: 400
      });
    }

    const cacheKey = `search_${q}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Search in external API
    const response = await axios.get(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(q)}?fields=name,capital,population,flags,region`
    );

    const result = {
      success: true,
      data: response.data || [],
      message: `Found ${response.data?.length || 0} countries matching "${q}"`
    };

    cache.set(cacheKey, result);
    return res.json(result);
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return res.json({
        success: true,
        data: [],
        message: `No countries found matching "${req.query.q}"`
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Search failed',
      details: error.message,
      statusCode: 500
    });
  }
};

export const syncCountriesData = async (req: Request, res: Response): Promise<Response> => {
  try {
    // This will later sync data to our database
    // For now, just clear the cache to force fresh data
    cache.flushAll();
    
    return res.json({
      success: true,
      message: 'Countries data synced successfully (cache cleared)'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'Failed to sync countries data',
      details: error.message,
      statusCode: 500
    });
  }
};