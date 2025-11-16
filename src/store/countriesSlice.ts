import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

// Helper function to sort countries alphabetically by name
const sortCountriesAlphabetically = (countries: Country[]): Country[] => {
  return [...countries].sort((a, b) => a.name.common.localeCompare(b.name.common));
};

// Define the country type based on the REST Countries API
export interface Country {
  name: {
    common: string;
    official?: string;
    };
    region: string;
    capital?: string[];
    population: number;
    flags: {
    png: string;
    svg: string;
    alt?: string;
  };
}

// Define the initial state interface
interface CountriesState {
  countries: Country[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  totalCountries: number; // Total from server
}

// Helper function to get initial page from localStorage
const getInitialPage = (): number => {
  try {
    const savedPage = localStorage.getItem('countries-current-page');
    return savedPage ? parseInt(savedPage, 10) : 1;
  } catch {
    return 1;
  }
};

// Helper function to get initial items per page from localStorage
const getInitialItemsPerPage = (): number => {
  try {
    const savedItemsPerPage = localStorage.getItem('countries-items-per-page');
    const parsed = savedItemsPerPage ? parseInt(savedItemsPerPage, 10) : 25;
    // Ensure valid range, default to 25 if invalid
    return parsed >= 5 && parsed <= 100 ? parsed : 25;
  } catch {
    return 25;
  }
};

// Define the initial state
const initialState: CountriesState = {
  countries: [],
  loading: false,
  error: null,
  currentPage: getInitialPage(),
  itemsPerPage: getInitialItemsPerPage(),
  totalPages: 0,
  totalCountries: 0,
};

// Create async thunk for fetching countries
export const fetchCountries = createAsyncThunk(
  'countries/fetchCountries',
  async (params?: { page?: number; limit?: number; search?: string; region?: string }) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.region) searchParams.set('region', params.region);
    
    const url = `${baseUrl}/countries${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    console.log('fetchCountries: Making API call to:', url);
    console.log('fetchCountries: Using base URL:', baseUrl);
    
    try {
      const response = await fetch(url);
      console.log('fetchCountries: Response status:', response.status);
      console.log('fetchCountries: Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        console.error('fetchCountries: API error:', response.status, response.statusText);
        throw new Error(`Failed to fetch countries: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('fetchCountries: Success! Data received:', { 
        totalCountries: result.total, 
        currentPage: result.page, 
        dataLength: result.data?.length 
      });
      
      // Backend returns { success: true, data: Country[], pagination: {...} }
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch countries');
      }
      
      return {
        countries: result.data as Country[],
        pagination: result.pagination
      };
    } catch (error) {
      console.error('fetchCountries: Request failed:', error);
      throw error;
    }
  }
);

// Create the countries slice
const countriesSlice = createSlice({
  name: 'countries',
  initialState,
  reducers: {
    // Regular reducers for synchronous actions
    clearCountries: (state) => {
      state.countries = [];
      state.currentPage = 1;
      state.totalPages = 0;
      state.totalCountries = 0;
      // Save to localStorage
      localStorage.setItem('countries-current-page', '1');
    },
    setCountries: (state, action: PayloadAction<Country[]>) => {
      state.countries = sortCountriesAlphabetically(action.payload);
      // Note: totalPages should be set by server response, not calculated locally
      // Don't reset to page 1 if we have countries and a valid current page
      if (state.currentPage > state.totalPages && state.totalPages > 0) {
        state.currentPage = 1;
        localStorage.setItem('countries-current-page', '1');
      }
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
      // Save to localStorage
      localStorage.setItem('countries-current-page', action.payload.toString());
    },
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1;
      // Save to localStorage
      localStorage.setItem('countries-items-per-page', action.payload.toString());
      localStorage.setItem('countries-current-page', '1');
      // Note: Will need to trigger fetchCountries after this action
    },
  },
  extraReducers: (builder) => {
    // Handle async thunk states
    builder
      .addCase(fetchCountries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.loading = false;
        state.countries = sortCountriesAlphabetically(action.payload.countries);
        state.totalCountries = action.payload.pagination.total;
        state.totalPages = action.payload.pagination.totalPages;
        
        // Only reset to page 1 if the current page is invalid
        if (state.currentPage > state.totalPages || state.currentPage < 1) {
          state.currentPage = 1;
          localStorage.setItem('countries-current-page', '1');
        }
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch countries';
      });
  },
});

// Export actions
export const { clearCountries, setCountries, setCurrentPage, setItemsPerPage } = countriesSlice.actions;

// Export reducer
export default countriesSlice.reducer;