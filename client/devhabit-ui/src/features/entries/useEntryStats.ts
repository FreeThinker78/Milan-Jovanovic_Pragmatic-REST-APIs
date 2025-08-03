import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../api/config';
import { fetchWithAuth } from '../../utils/fetchUtils';

export interface DailyStats {
  date: string;
  count: number;
}

export interface EntryStats {
  dailyStats: DailyStats[];
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
}

export function useEntryStats() {
  const { accessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStats = async (): Promise<EntryStats | null> => {
    if (!accessToken) return null;
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchWithAuth<EntryStats>(`${API_BASE_URL}/entries/stats`, accessToken, {
        headers: {
          Accept: 'application/vnd.dev-habit.hateoas+json',
        },
      });
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch entry statistics');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getStats,
    isLoading,
    error,
  };
}
