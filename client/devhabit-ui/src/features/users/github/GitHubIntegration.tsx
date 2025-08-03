import React, { useState } from 'react';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import type { GitHubUserProfile } from './useGitHub';
import { useGitHub } from './useGitHub';

interface GitHubIntegrationProps {
  profile: GitHubUserProfile | null;
  isLoading: boolean;
  error: string | null;
  onTokenSubmit: () => Promise<void>;
  onTokenRevoke: () => Promise<void>;
}

export const GitHubIntegration: React.FC<GitHubIntegrationProps> = ({
  profile,
  isLoading,
  error,
  onTokenSubmit,
  onTokenRevoke,
}) => {
  const github = useGitHub();
  const [showForm, setShowForm] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [personalAccessToken, setPersonalAccessToken] = useState('');
  const [expiresInDays, setExpiresInDays] = useState(30);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await github.submitPAT(personalAccessToken, expiresInDays);
      await onTokenSubmit();
      setShowForm(false);
      setPersonalAccessToken('');
    } catch (error) {
      console.error('Failed to submit GitHub PAT:', error);
    }
  };

  const handleRevoke = async () => {
    try {
      if (!profile) return;

      const revokeLink = profile.links.find(link => link.rel === 'revoke-token')!;
      await github.revokePAT(revokeLink);
      await onTokenRevoke();
    } catch (error) {
      console.error('Failed to revoke GitHub PAT:', error);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse h-32 bg-gray-100 rounded-lg"></div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">GitHub Integration</h2>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

      {profile ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <img src={profile.avatar_url} alt={profile.login} className="w-16 h-16 rounded-full" />
            <div>
              <h3 className="font-medium">{profile.name || profile.login}</h3>
              {profile.bio && <p className="text-gray-600 text-sm">{profile.bio}</p>}
              <div className="flex space-x-4 text-sm text-gray-500 mt-2">
                <span>{profile.public_repos} repos</span>
                <span>{profile.followers} followers</span>
                <span>{profile.following} following</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            {profile.links?.find(link => link.rel === 'store-token') && (
              <button
                onClick={() => setShowForm(true)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Update Token
              </button>
            )}
            {profile.links?.find(link => link.rel === 'revoke-token') && (
              <button onClick={handleRevoke} className="text-sm text-red-600 hover:text-red-800">
                Revoke Token
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          <p className="text-gray-600 mb-4">
            GitHub integration is not configured. Add your Personal Access Token to enable
            integration.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Configure GitHub Integration
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Personal Access Token
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={personalAccessToken}
                onChange={e => setPersonalAccessToken(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                {showToken ? (
                  <HiEyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <HiEye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expires In (Days)
            </label>
            <input
              type="number"
              value={expiresInDays}
              onChange={e => setExpiresInDays(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-md"
              min="1"
              max="365"
              required
            />
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Save Token
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
