// Country interface shared between frontend and backend
export interface Country {
  _id?: string; // MongoDB ObjectId when stored in database
  name: {
    common: string;
    official?: string;
  };
  region: string;
  subregion?: string;
  capital?: string[];
  population: number;
  area?: number;
  flags: {
    png: string;
    svg: string;
    alt?: string;
  };
  languages?: { [key: string]: string };
  currencies?: { [key: string]: { name: string; symbol: string } };
  timezones?: string[];
  borders?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// API Response interfaces
export interface CountriesResponse {
  success: boolean;
  data: Country[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export interface CountryResponse {
  success: boolean;
  data: Country;
  message?: string;
}

// API Error interface
export interface ApiError {
  success: false;
  error: string;
  details?: Record<string, unknown>;
  statusCode: number;
}

// User interfaces for authentication
export interface User {
  _id?: string;
  email: string;
  password?: string; // Hashed password, not returned in responses
  firstName: string;
  lastName: string;
  favorites?: string[]; // Array of country codes
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserResponse {
  success: boolean;
  data: Omit<User, 'password'>;
  token?: string;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  firstName: string;
  lastName: string;
}

// Query parameters for filtering and pagination
export interface CountryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  region?: string;
  subregion?: string;
  sortBy?: 'name' | 'population' | 'area';
  sortOrder?: 'asc' | 'desc';
}