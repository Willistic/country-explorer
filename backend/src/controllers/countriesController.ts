import type { Request, Response } from 'express';
import NodeCache from 'node-cache';
import axios from 'axios';
import { Country, CountriesResponse, CountryQueryParams } from '../types/index.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

// Cache for 1 hour (3600 seconds)
const cache = new NodeCache({ stdTTL: 3600 });

// REST Countries v5 API configuration.
// Read lazily at call time: with ES modules, top-level reads would run before
// server.ts calls dotenv.config(), leaving these undefined.
const apiBaseUrl = () => process.env.COUNTRIES_API_URL || 'https://api.restcountries.com/countries/v5';

// Dot-path fields requested from the v5 API
const V5_FIELDS = [
  'names.common',
  'names.official',
  'capitals',
  'region',
  'subregion',
  'population',
  'area',
  'flag.url_png',
  'flag.url_svg',
  'flag.description',
  'codes.alpha_3'
].join(',');

const authHeaders = () => ({ Authorization: `Bearer ${process.env.RESTCOUNTRIES_API_KEY || ''}` });

// Shape of a country object returned by the v5 API (only the fields we request)
interface V5Country {
  names?: { common?: string; official?: string };
  capitals?: Array<{ name?: string }>;
  region?: string;
  subregion?: string;
  population?: number;
  area?: { kilometers?: number; miles?: number };
  flag?: { url_png?: string; url_svg?: string; description?: string };
  codes?: { alpha_3?: string };
}

// Map a v5 country object onto the app's Country shape
const mapV5Country = (c: V5Country): Country => ({
  name: { common: c.names?.common ?? '', official: c.names?.official },
  region: c.region ?? '',
  subregion: c.subregion,
  capital: Array.isArray(c.capitals)
    ? c.capitals.map(cap => cap?.name).filter((n): n is string => Boolean(n))
    : [],
  population: c.population ?? 0,
  area: c.area?.kilometers,
  flags: {
    png: c.flag?.url_png ?? '',
    svg: c.flag?.url_svg ?? '',
    alt: c.flag?.description || undefined
  }
});

// Fetch every country from the v5 API, paging through the free-plan 100/page cap
const fetchAllCountriesFromApi = async (): Promise<Country[]> => {
  const pageSize = 100;
  let offset = 0;
  const all: Country[] = [];

  // Guard against runaway loops (dataset is ~254 countries)
  for (let i = 0; i < 20; i++) {
    const response = await axios.get(apiBaseUrl(), {
      headers: authHeaders(),
      params: { limit: pageSize, offset, response_fields: V5_FIELDS }
    });

    const objects = response.data?.data?.objects;
    if (!Array.isArray(objects)) {
      throw new Error('External API returned an unexpected response shape');
    }

    all.push(...(objects as V5Country[]).map(mapV5Country));

    if (!response.data.data.meta?.more) break;
    offset += pageSize;
  }

  return all;
};

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
      // Fetch all countries from the REST Countries v5 API
      countries = await fetchAllCountriesFromApi();
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
      let aValue: string | number;
      let bValue: string | number;

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
  } catch (error) {
    console.error('Error fetching countries:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch countries',
      details: getErrorMessage(error),
      statusCode: 500
    });
  }
};

export const getCountryById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    // Exact, case-insensitive lookup by common name via the v5 API
    const response = await axios.get(
      `${apiBaseUrl()}/names.common/${encodeURIComponent(id)}`,
      { headers: authHeaders(), params: { response_fields: V5_FIELDS } }
    );

    const objects = response.data?.data?.objects as V5Country[] | undefined;
    if (!Array.isArray(objects) || objects.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Country not found',
        statusCode: 404
      });
    }

    return res.json({
      success: true,
      data: mapV5Country(objects[0])
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'Country not found',
        statusCode: 404
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to fetch country',
      details: getErrorMessage(error),
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

    // Search across all name variants via the v5 "name" aggregate endpoint
    const response = await axios.get(`${apiBaseUrl()}/name`, {
      headers: authHeaders(),
      params: { q, response_fields: V5_FIELDS }
    });

    const objects = (response.data?.data?.objects as V5Country[] | undefined) ?? [];
    const data = objects.map(mapV5Country);

    const result = {
      success: true,
      data,
      message: `Found ${data.length} countries matching "${q}"`
    };

    cache.set(cacheKey, result);
    return res.json(result);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return res.json({
        success: true,
        data: [],
        message: `No countries found matching "${req.query.q}"`
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Search failed',
      details: getErrorMessage(error),
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to sync countries data',
      details: getErrorMessage(error),
      statusCode: 500
    });
  }
};