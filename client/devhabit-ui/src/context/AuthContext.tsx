import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeAuthHandlers } from '../utils/fetchUtils';

interface AuthContextType {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'auth_tokens';

interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Initialize auth state from localStorage
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  // Load tokens from localStorage on mount
  useEffect(() => {
    const storedTokens = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (storedTokens) {
      const { accessToken, refreshToken } = JSON.parse(storedTokens) as StoredTokens;
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
    }
  }, []);

  // Update localStorage when auth state changes
  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated.toString());
  }, [isAuthenticated]);

  // Initialize auth handlers on mount
  useEffect(() => {
    initializeAuthHandlers({
      getAccessToken: () => accessToken,
      getRefreshToken: () => refreshToken,
      onTokenRefreshed: (newAccessToken, newRefreshToken) => {
        login(newAccessToken, newRefreshToken);
      },
    });
  }, [accessToken, refreshToken]); // Re-initialize if tokens change

  const login = (newAccessToken: string, newRefreshToken: string) => {
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);

    // Store tokens in localStorage
    localStorage.setItem(
      TOKEN_STORAGE_KEY,
      JSON.stringify({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      })
    );

    setIsAuthenticated(true);
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    accessToken,
    refreshToken,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
