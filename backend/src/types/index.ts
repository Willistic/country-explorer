// Backend types - copy of shared types for now
export interface Country {
  _id?: string;
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

export interface ApiError {
  success: false;
  error: string;
  details?: Record<string, unknown>;
  statusCode: number;
}

export interface CountryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  region?: string;
  subregion?: string;
  sortBy?: 'name' | 'population' | 'area';
  sortOrder?: 'asc' | 'desc';
}