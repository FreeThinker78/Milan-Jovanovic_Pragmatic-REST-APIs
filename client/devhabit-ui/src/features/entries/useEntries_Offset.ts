import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../api/config';
import {
  CreateEntryDto,
  CreateBatchEntriesDto,
  EntriesResponse,
  Entry,
  UpdateEntryDto,
} from './types';
import { fetchWithAuth } from '../../utils/fetchUtils';
import type { Link } from '../../types/api';

interface GetEntriesOptions {
  page?: number;
  pageSize?: number;
  sort: string;
}

export function useEntries() {
  const { accessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getEntries = async ({
    page = 1,
    pageSize = 10,
    sort,
  }: GetEntriesOptions): Promise<EntriesResponse | null> => {
    if (!accessToken) return null;
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchWithAuth<EntriesResponse>(
        `${API_BASE_URL}/entries?page=${page}&pageSize=${pageSize}&sort=${sort}`,
        accessToken,
        {
          headers: {
            Accept: 'application/vnd.dev-habit.hateoas+json',
          },
        }
      );
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch entries');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getEntry = async (id: string): Promise<Entry | null> => {
    if (!accessToken) return null;
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchWithAuth<Entry>(`${API_BASE_URL}/entries/${id}`, accessToken, {
        headers: {
          Accept: 'application/vnd.dev-habit.hateoas+json',
        },
      });
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch entry');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createEntry = async (data: CreateEntryDto): Promise<Entry | null> => {
    if (!accessToken) return null;
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchWithAuth<Entry>(`${API_BASE_URL}/entries`, accessToken, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/vnd.dev-habit.hateoas+json',
        },
        body: JSON.stringify(data),
      });
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to create entry');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createBatchEntries = async (
    link: Link,
    data: CreateBatchEntriesDto
  ): Promise<Entry[] | null> => {
    if (!accessToken) return null;
    if (link.rel !== 'create-batch' || link.method !== 'POST') {
      throw new Error('Invalid operation: Link does not support batch entry creation');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchWithAuth<Entry[]>(link.href, accessToken, {
        method: link.method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/vnd.dev-habit.hateoas+json',
        },
        body: JSON.stringify(data),
      });
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to create batch entries');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateEntry = async (link: Link, data: UpdateEntryDto): Promise<boolean> => {
    if (!accessToken) return false;
    if (link.rel !== 'update' || link.method !== 'PUT') {
      throw new Error('Invalid operation: Link does not support updating entry');
    }

    setIsLoading(true);
    setError(null);

    try {
      await fetchWithAuth<Entry>(link.href, accessToken, {
        method: link.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to update entry');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEntry = async (link: Link): Promise<boolean> => {
    if (!accessToken) return false;
    if (link.rel !== 'delete' || link.method !== 'DELETE') {
      throw new Error('Invalid operation: Link does not support deleting entry');
    }

    setIsLoading(true);
    setError(null);

    try {
      await fetchWithAuth(link.href, accessToken, {
        method: link.method,
      });
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete entry');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const archiveEntry = async (link: Link): Promise<boolean> => {
    if (!accessToken) return false;
    if (link.rel !== 'archive' || link.method !== 'PUT') {
      throw new Error('Invalid operation: Link does not support archiving entry');
    }

    setIsLoading(true);
    setError(null);

    try {
      await fetchWithAuth(link.href, accessToken, {
        method: link.method,
      });
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to archive entry');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unarchiveEntry = async (link: Link): Promise<boolean> => {
    if (!accessToken) return false;
    if (link.rel !== 'un-archive' || link.method !== 'PUT') {
      throw new Error('Invalid operation: Link does not support unarchiving entry');
    }

    setIsLoading(true);
    setError(null);

    try {
      await fetchWithAuth(link.href, accessToken, {
        method: link.method,
      });
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to unarchive entry');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getEntries,
    getEntry,
    createEntry,
    createBatchEntries,
    updateEntry,
    deleteEntry,
    archiveEntry,
    unarchiveEntry,
    isLoading,
    error,
  };
}
