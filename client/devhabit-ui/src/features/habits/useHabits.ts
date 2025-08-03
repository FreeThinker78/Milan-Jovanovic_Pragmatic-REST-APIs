import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../api/config';
import { CreateHabitDto, Habit, UpdateHabitDto } from './types';
import { fetchWithAuth } from '../../utils/fetchUtils';
import type { Link } from '../../types/api';

interface HabitsResponse {
  items: Habit[];
  links: Link[];
}

interface ListHabitsParams {
  pageSize?: number;
  fields?: string;
  sort?: string;
  url?: string;
}

export function useHabits() {
  const { accessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listHabits = async ({
    pageSize = 6,
    fields,
    sort,
    url,
  }: ListHabitsParams = {}): Promise<HabitsResponse | null> => {
    if (!accessToken) return null;
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchWithAuth<HabitsResponse>(
        url ||
          `${API_BASE_URL}/habits?pageSize=${pageSize}${fields ? `&fields=${fields}` : ''}${sort ? `&sort=${sort}` : ''}`,
        accessToken,
        {
          headers: {
            Accept: 'application/vnd.dev-habit.hateoas+json',
          },
        }
      );
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch habits');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getHabit = async (link: Link): Promise<Habit | null> => {
    if (!accessToken) return null;
    if (link.rel !== 'self' || link.method !== 'GET') {
      throw new Error('Invalid operation: Link does not support fetching habit');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchWithAuth<Habit>(link.href, accessToken, {
        headers: {
          Accept: 'application/vnd.dev-habit.hateoas+json',
        },
      });
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch habit');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateHabit = async (link: Link, data: UpdateHabitDto): Promise<boolean> => {
    if (!accessToken) return false;
    if (link.rel !== 'update' || link.method !== 'PUT') {
      throw new Error('Invalid operation: Link does not support updating habit');
    }

    setIsLoading(true);
    setError(null);

    try {
      await fetchWithAuth<Habit>(link.href, accessToken, {
        method: link.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to update habit');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const createHabit = async (data: CreateHabitDto): Promise<Habit | null> => {
    if (!accessToken) return null;
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchWithAuth<Habit>(`${API_BASE_URL}/habits`, accessToken, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/vnd.dev-habit.hateoas+json',
        },
        body: JSON.stringify(data),
      });

      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to create habit');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHabit = async (link: Link): Promise<boolean> => {
    if (!accessToken) return false;
    if (link.rel !== 'delete' || link.method !== 'DELETE') {
      throw new Error('Invalid operation: Link does not support deleting habit');
    }

    setIsLoading(true);
    setError(null);

    try {
      await fetchWithAuth<Habit>(link.href, accessToken, {
        method: link.method,
      });
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete habit');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    listHabits,
    getHabit,
    createHabit,
    updateHabit,
    deleteHabit,
    isLoading,
    error,
  };
}
