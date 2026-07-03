import { describe, it, expect, beforeEach } from 'vitest';
import authReducer, { logout, clearError, loginUser } from './authSlice';
import type { AuthState } from '../types/auth';

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

describe('authSlice reducer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns the initial state', () => {
    expect(authReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('sets loading and clears error on loginUser.pending', () => {
    const state = authReducer(
      { ...initialState, error: 'stale error' },
      { type: loginUser.pending.type },
    );
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('authenticates the user on loginUser.fulfilled', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = { _id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', favorites: [] } as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tokens = { accessToken: 'a', refreshToken: 'r', expiresIn: '7d' } as any;

    const state = authReducer(initialState, {
      type: loginUser.fulfilled.type,
      payload: { user, tokens },
    });

    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(user);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('records the error and stays unauthenticated on loginUser.rejected', () => {
    const state = authReducer(initialState, {
      type: loginUser.rejected.type,
      payload: 'Invalid email or password',
    });

    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBe('Invalid email or password');
  });

  it('clears auth state on logout', () => {
    const authed: AuthState = {
      ...initialState,
      isAuthenticated: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user: {} as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tokens: {} as any,
    };

    const state = authReducer(authed, logout());

    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.tokens).toBeNull();
  });

  it('clears the error with clearError', () => {
    const state = authReducer({ ...initialState, error: 'boom' }, clearError());
    expect(state.error).toBeNull();
  });
});
