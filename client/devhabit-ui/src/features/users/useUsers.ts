import { useAuth } from '../../context/AuthContext';
import { fetchWithAuth } from '../../utils/fetchUtils';
import { API_BASE_URL } from '../../api/config';
import type { HateoasResponse, Link } from '../../types/api';

export interface UserProfile extends HateoasResponse {
  id: string;
  email: string;
  name: string;
  createdAtUtc: string;
  updatedAtUtc: string | null;
}

export function useUsers() {
  const { accessToken } = useAuth();

  const getProfile = async (): Promise<UserProfile | null> => {
    if (!accessToken) return null;

    try {
      return await fetchWithAuth<UserProfile>(`${API_BASE_URL}/users/me`, accessToken, {
        headers: {
          Accept: 'application/vnd.dev-habit.hateoas+json',
        },
      });
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return null;
    }
  };

  const updateProfile = async (name: string, link: Link): Promise<boolean> => {
    if (!accessToken) throw new Error('Not authenticated');
    if (link.rel !== 'update-profile' || link.method !== 'PUT') {
      throw new Error('Invalid operation: Link does not support profile update');
    }

    try {
      await fetchWithAuth<UserProfile>(link.href, accessToken, {
        method: link.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      return true;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      return false;
    }
  };

  return {
    getProfile,
    updateProfile,
  };
}
