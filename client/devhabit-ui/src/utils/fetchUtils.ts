import { refresh } from '../api/auth';

type RequestInit = Parameters<typeof fetch>[1];

// Create a store for the auth context handlers
type AuthContextHandlers = {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  onTokenRefreshed: (accessToken: string, refreshToken: string) => void;
};

let authHandlers: AuthContextHandlers | null = null;

// Function to initialize the auth handlers
export function initializeAuthHandlers(handlers: AuthContextHandlers) {
  authHandlers = handlers;
}

interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  traceId?: string;
}

class ApiError extends Error {
  details?: ProblemDetails;

  constructor(message: string, details?: ProblemDetails) {
    super(message);
    this.details = details;
  }
}

export async function fetchWithAuth<T>(
  url: string,
  accessToken: string | null,
  options: RequestInit = {}
): Promise<T> {
  if (!accessToken) {
    throw new Error('No access token available');
  }

  const defaultHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  // Handle 401 Unauthorized error
  if (response.status === 401) {
    try {
      if (!authHandlers) {
        throw new Error('Auth handlers not initialized');
      }

      const refreshToken = authHandlers.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Attempt to refresh the token
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await refresh(refreshToken);

      // Update tokens in context
      authHandlers.onTokenRefreshed(newAccessToken, newRefreshToken);

      // Retry the original request with the new token
      return fetchWithAuth<T>(url, newAccessToken, options);
    } catch {
      // If refresh fails, throw unauthorized error
      throw new Error('Session expired. Please login again.');
    }
  }

  if (!response.ok) {
    // Try to get error message from response
    const errorData = await response.json();
    throw new ApiError(
      errorData.detail || errorData.message || `HTTP error! status: ${response.status}`,
      errorData
    );
  }

  // Return null for 204 responses or empty bodies, otherwise parse JSON
  if (response.status === 204) {
    return null as T;
  }
  try {
    return await response.json();
  } catch {
    return null as T;
  }
}
