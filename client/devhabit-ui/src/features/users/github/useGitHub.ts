import { useAuth } from '../../../context/AuthContext';
import { fetchWithAuth } from '../../../utils/fetchUtils';
import { API_BASE_URL } from '../../../api/config';
import type { Link } from '../../../types/api';

export interface GitHubUserProfile {
  login: string;
  name?: string;
  avatar_url: string;
  bio?: string;
  public_repos: number;
  followers: number;
  following: number;
  links: Link[];
}

export function useGitHub() {
  const { accessToken } = useAuth();

  const submitPAT = async (personalAccessToken: string, expiresInDays: number) => {
    if (!accessToken) throw new Error('Not authenticated');

    await fetchWithAuth(`${API_BASE_URL}/github/personal-access-token`, accessToken, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken: personalAccessToken, expiresInDays }),
    });
  };

  const getProfile = async (): Promise<GitHubUserProfile | null> => {
    if (!accessToken) return null;

    try {
      const response = await fetchWithAuth<GitHubUserProfile>(
        `${API_BASE_URL}/github/profile`,
        accessToken,
        {
          headers: {
            Accept: 'application/vnd.dev-habit.hateoas+json',
          },
        }
      );
      return response;
    } catch {
      return null;
    }
  };

  const revokePAT = async (link: Link): Promise<void> => {
    if (!accessToken) throw new Error('Not authenticated');
    if (link.rel !== 'revoke-token' || link.method !== 'DELETE') {
      throw new Error('Invalid operation: Link does not support token revocation');
    }

    await fetchWithAuth(link.href, accessToken, {
      method: link.method,
      headers: {
        Accept: 'application/vnd.dev-habit.hateoas+json',
      },
    });
  };

  return {
    submitPAT,
    getProfile,
    revokePAT,
  };
}
