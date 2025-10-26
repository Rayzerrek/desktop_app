import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';
import '@testing-library/jest-dom/vitest';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

vi.mock('../utils/auth', () => ({
  isAuthenticated: vi.fn(),
  clearAuthTokens: vi.fn(),
}));

import { invoke } from '@tauri-apps/api/core';
import { isAuthenticated, clearAuthTokens } from '../utils/auth';

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(isAuthenticated).mockReturnValue(false);
  });

  it('initializes with authentication state from utils', () => {
    vi.mocked(isAuthenticated).mockReturnValue(true);
    
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('sets isAdmin to true when user is admin', async () => {
    localStorage.setItem('access_token', 'test_token');
    vi.mocked(isAuthenticated).mockReturnValue(true);
    vi.mocked(invoke).mockResolvedValue(true);
    
    const { result } = renderHook(() => useAuth());
    
    await waitFor(() => {
      expect(result.current.isAdmin).toBe(true);
    });
  });

  it('sets isAdmin to false when user is not admin', async () => {
    localStorage.setItem('access_token', 'test_token');
    vi.mocked(isAuthenticated).mockReturnValue(true);
    vi.mocked(invoke).mockResolvedValue(false);
    
    const { result } = renderHook(() => useAuth());
    
    await waitFor(() => {
      expect(result.current.isAdmin).toBe(false);
    });
  });

  it('sets isAdmin to false when no token exists', async () => {
    const { result } = renderHook(() => useAuth());
    
    await result.current.refreshAdmin();
    
    expect(result.current.isAdmin).toBe(false);
  });

  it('login sets authenticated to true and refreshes admin status', async () => {
    localStorage.setItem('access_token', 'test_token');
    vi.mocked(isAuthenticated).mockReturnValue(false);
    vi.mocked(invoke).mockResolvedValue(true);
    
    const { result } = renderHook(() => useAuth());
    
    result.current.login();
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
    
    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith('check_is_admin', { accessToken: 'test_token' });
    });
  });

  it('logout clears tokens and resets state', () => {
    // reload window.location properly
    delete (window as any).location;
    (window as any).location = { reload: vi.fn() };
    
    const { result } = renderHook(() => useAuth());
    
    result.current.logout();
    
    expect(clearAuthTokens).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(window.location.reload).toHaveBeenCalled();
  });

  it('handles invoke error gracefully', async () => {
    localStorage.setItem('access_token', 'test_token');
    vi.mocked(isAuthenticated).mockReturnValue(true);
    vi.mocked(invoke).mockRejectedValue(new Error('API Error'));
    
    const { result } = renderHook(() => useAuth());
    
    await waitFor(() => {
      expect(result.current.isAdmin).toBe(false);
    });
  });
});
