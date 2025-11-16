import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { 
  AuthState, 
  User, 
  AuthTokens, 
  LoginCredentials, 
  RegisterCredentials 
} from '../types/auth';

// Initial state
const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// API base URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

// Secure token storage utilities
class TokenStorage {
  private static readonly ACCESS_TOKEN_KEY = 'country_explorer_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'country_explorer_refresh_token';
  private static readonly USER_KEY = 'country_explorer_user';

  static setTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static getUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }

  static clearAll(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static hasValidTokens(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    return !!(accessToken && refreshToken);
  }
}

// HTTP client with automatic token handling
class AuthenticatedFetch {
  private static async makeRequest(
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> {
    const accessToken = TokenStorage.getAccessToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If access token is expired, try to refresh
    if (response.status === 401 && accessToken) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry original request with new token
        headers['Authorization'] = `Bearer ${TokenStorage.getAccessToken()}`;
        return fetch(url, { ...options, headers });
      } else {
        // Refresh failed, redirect to login
        TokenStorage.clearAll();
        window.location.href = '/login';
      }
    }

    return response;
  }

  private static async refreshToken(): Promise<boolean> {
    const refreshToken = TokenStorage.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        TokenStorage.setTokens(data.data.tokens);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  }

  static async post(url: string, data: unknown): Promise<Response> {
    return this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async get(url: string): Promise<Response> {
    return this.makeRequest(url, { method: 'GET' });
  }

  static async put(url: string, data: unknown): Promise<Response> {
    return this.makeRequest(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async delete(url: string): Promise<Response> {
    return this.makeRequest(url, { method: 'DELETE' });
  }
}

// Async thunks for authentication actions
export const loginUser = createAsyncThunk<
  { user: User; tokens: AuthTokens },
  LoginCredentials,
  { rejectValue: string }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('🔐 Attempting login for:', credentials.email);
      
      const response = await AuthenticatedFetch.post(`${API_BASE}/auth/login`, credentials);
      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Login failed:', data.error);
        return rejectWithValue(data.error || 'Login failed');
      }

      console.log('✅ Login successful');
      
      // Store tokens and user data
      TokenStorage.setTokens(data.data.tokens);
      TokenStorage.setUser(data.data.user);

      return {
        user: data.data.user,
        tokens: data.data.tokens,
      };
    } catch (error) {
      console.error('❌ Login error:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Network error');
    }
  }
);

export const registerUser = createAsyncThunk<
  { user: User; tokens: AuthTokens },
  RegisterCredentials,
  { rejectValue: string }
>(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('📝 Attempting registration for:', userData.email);
      
      // Transform RegisterCredentials to backend format
      const registrationData = {
        email: userData.email,
        password: userData.password,
        firstName: userData.username.split(' ')[0] || userData.username,
        lastName: userData.username.split(' ')[1] || 'User'
      };
      
      const response = await AuthenticatedFetch.post(`${API_BASE}/auth/register`, registrationData);
      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Registration failed:', data.error);
        return rejectWithValue(data.error || 'Registration failed');
      }

      console.log('✅ Registration successful');
      
      // Store tokens and user data
      TokenStorage.setTokens(data.data.tokens);
      TokenStorage.setUser(data.data.user);

      return {
        user: data.data.user,
        tokens: data.data.tokens,
      };
    } catch (error) {
      console.error('❌ Registration error:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Network error');
    }
  }
);

export const loadUserFromStorage = createAsyncThunk<
  { user: User; tokens: AuthTokens } | null,
  void
>(
  'auth/loadFromStorage',
  async () => {
    try {
      if (!TokenStorage.hasValidTokens()) {
        return null;
      }

      const user = TokenStorage.getUser();
      const accessToken = TokenStorage.getAccessToken();
      const refreshToken = TokenStorage.getRefreshToken();

      if (!user || !accessToken || !refreshToken) {
        TokenStorage.clearAll();
        return null;
      }

      // Verify token is still valid by fetching user profile
      const response = await AuthenticatedFetch.get(`${API_BASE}/auth/profile`);
      
      if (!response.ok) {
        TokenStorage.clearAll();
        return null;
      }

      const profileData = await response.json();
      const updatedUser = profileData.data;
      
      // Update stored user data
      TokenStorage.setUser(updatedUser);

      return {
        user: updatedUser,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: '15m', // Default value
        },
      };
    } catch (error) {
      console.error('❌ Load user from storage error:', error);
      TokenStorage.clearAll();
      return null;
    }
  }
);

export const fetchUserProfile = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AuthenticatedFetch.get(`${API_BASE}/auth/profile`);
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to fetch profile');
      }

      const user = data.data;
      
      // Update stored user data
      TokenStorage.setUser(user);

      return user;
    } catch (error) {
      console.error('❌ Fetch user profile error:', error);
      return rejectWithValue((error as Error).message || 'Network error occurred');
    }
  }
);

export const updateUserProfile = createAsyncThunk<
  User,
  { firstName?: string; lastName?: string },
  { rejectValue: string }
>(
  'auth/updateProfile',
  async (updateData, { rejectWithValue }) => {
    try {
      const response = await AuthenticatedFetch.put(`${API_BASE}/auth/profile`, updateData);
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to update profile');
      }

      // Update stored user data
      TokenStorage.setUser(data.data);
      
      return data.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Network error');
    }
  }
);

export const changePassword = createAsyncThunk<
  string,
  { currentPassword: string; newPassword: string },
  { rejectValue: string }
>(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await AuthenticatedFetch.put(`${API_BASE}/auth/change-password`, passwordData);
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to change password');
      }

      return data.message;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Network error');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      console.log('👋 Logging out user');
      TokenStorage.clearAll();
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
        state.isAuthenticated = false;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Registration failed';
        state.isAuthenticated = false;
      });

    // Load from storage
    builder
      .addCase(loadUserFromStorage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.tokens = action.payload.tokens;
          state.isAuthenticated = true;
        }
      })
      .addCase(loadUserFromStorage.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
      });

    // Fetch profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch profile';
      });

    // Update profile
    builder
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.error = action.payload || 'Failed to update profile';
      });

    // Change password
    builder
      .addCase(changePassword.rejected, (state, action) => {
        state.error = action.payload || 'Failed to change password';
      });
  },
});

// Export actions and reducer
export const { logout, clearError, setLoading } = authSlice.actions;
export { TokenStorage, AuthenticatedFetch };
export default authSlice.reducer;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;