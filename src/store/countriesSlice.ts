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
    return savedItemsPerPage ? parseInt(savedItemsPerPage, 10) : 25;
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
};

// Create async thunk for fetching countries
export const fetchCountries = createAsyncThunk(
  'countries/fetchCountries',
  async () => {
    const response = await fetch(
      'https://restcountries.com/v3.1/all?fields=name,capital,population,flags,region'
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch countries');
    }
    
    const data = await response.json();
    return data as Country[];
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
      // Save to localStorage
      localStorage.setItem('countries-current-page', '1');
    },
    setCountries: (state, action: PayloadAction<Country[]>) => {
      state.countries = sortCountriesAlphabetically(action.payload);
      state.totalPages = Math.ceil(state.countries.length / state.itemsPerPage);
      // Don't reset to page 1 if we have countries and a valid current page
      if (state.currentPage > state.totalPages) {
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
      state.totalPages = Math.ceil(state.countries.length / action.payload);
      state.currentPage = 1;
      // Save to localStorage
      localStorage.setItem('countries-items-per-page', action.payload.toString());
      localStorage.setItem('countries-current-page', '1');
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
        state.countries = sortCountriesAlphabetically(action.payload);
        state.totalPages = Math.ceil(state.countries.length / state.itemsPerPage);
        
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