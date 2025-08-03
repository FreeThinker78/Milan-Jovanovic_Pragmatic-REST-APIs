import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../api/config';
import { fetchWithAuth } from '../../utils/fetchUtils';
import type { Link } from '../../types/api';

export interface Tag {
  id: string;
  name: string;
  description: string | null;
  links: Link[];
}

interface TagsResponse {
  items: Tag[];
  links: Link[];
}

interface CreateTagDto {
  name: string;
  description?: string | null;
}

export function useTags() {
  const { accessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTags = async (): Promise<TagsResponse | null> => {
    if (!accessToken) return null;
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchWithAuth<TagsResponse>(`${API_BASE_URL}/tags`, accessToken, {
        headers: {
          Accept: 'application/vnd.dev-habit.hateoas+json',
        },
      });
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tags');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createTag = async (data: CreateTagDto): Promise<Tag | null> => {
    if (!accessToken) return null;
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchWithAuth<Tag>(`${API_BASE_URL}/tags`, accessToken, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/vnd.dev-habit.hateoas+json',
        },
        body: JSON.stringify(data),
      });
      return result;
    } catch (err: any) {
      setError(err.details?.detail || err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTag = async (link: Link, data: CreateTagDto): Promise<boolean> => {
    if (!accessToken) return false;
    if (link.rel !== 'update' || link.method !== 'PUT') {
      throw new Error('Invalid operation: Link does not support updating tag');
    }

    setIsLoading(true);
    setError(null);

    try {
      await fetchWithAuth<Tag>(link.href, accessToken, {
        method: link.method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/vnd.dev-habit.hateoas+json',
        },
        body: JSON.stringify(data),
      });
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to update tag');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTag = async (link: Link): Promise<boolean> => {
    if (!accessToken) return false;
    if (link.rel !== 'delete' || link.method !== 'DELETE') {
      throw new Error('Invalid operation: Link does not support deleting tag');
    }

    setIsLoading(true);
    setError(null);

    try {
      await fetchWithAuth(link.href, accessToken, {
        method: link.method,
      });
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete tag');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const upsertHabitTags = async (link: Link, tagIds: string[]): Promise<void> => {
    if (!accessToken) return;
    if (link.rel !== 'upsert-tags' || link.method !== 'PUT') {
      throw new Error('Invalid operation: Link does not support tag update');
    }

    setIsLoading(true);
    setError(null);

    try {
      await fetchWithAuth(link.href, accessToken, {
        method: link.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tagIds,
        }),
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update tags');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getTags,
    createTag,
    updateTag,
    deleteTag,
    upsertHabitTags,
    isLoading,
    error,
  };
}
