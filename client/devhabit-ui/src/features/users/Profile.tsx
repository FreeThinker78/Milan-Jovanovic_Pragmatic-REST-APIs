import React, { useState, useEffect } from 'react';
import { HiPencil } from 'react-icons/hi';
import { format } from 'date-fns';
import { GitHubIntegration } from './github/GitHubIntegration';
import { useGitHub, type GitHubUserProfile } from './github/useGitHub';
import { useUsers, type UserProfile } from './useUsers';

export default function Profile() {
  const github = useGitHub();
  const user = useUsers();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [githubProfile, setGithubProfile] = useState<GitHubUserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGithubLoading, setIsGithubLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [githubError, setGithubError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setIsGithubLoading(true);
      setError(null);
      setGithubError(null);

      // Load both profiles in parallel
      const [userData, githubData] = await Promise.all([user.getProfile(), github.getProfile()]);

      if (userData) {
        setProfile(userData);
        setNewName(userData.name);
      }
      setGithubProfile(githubData);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load profile data. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsGithubLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGithubTokenSubmit = async () => {
    try {
      setIsGithubLoading(true);
      setGithubError(null);
      const data = await github.getProfile();
      setGithubProfile(data);
    } catch (error) {
      console.error('Failed to load GitHub profile:', error);
      setGithubError('Failed to load GitHub profile. Please try again later.');
    } finally {
      setIsGithubLoading(false);
    }
  };

  const handleGithubTokenRevoke = async () => {
    try {
      setIsGithubLoading(true);
      setGithubError(null);
      setGithubProfile(null);
    } catch (error) {
      console.error('Failed to revoke GitHub token:', error);
      setGithubError('Failed to revoke GitHub token. Please try again later.');
    } finally {
      setIsGithubLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const updateLink = profile.links?.find(link => link.rel === 'update-profile');
    if (!updateLink) {
      setError('Update operation not available');
      return;
    }

    try {
      setError(null);
      await user.updateProfile(newName, updateLink);
      await loadData();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError('Failed to update profile. Please try again later.');
    }
  };

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!profile) return null;

  const canUpdateProfile = profile.links?.some(link => link.rel === 'update-profile');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Profile</h1>
            {!isEditing && canUpdateProfile && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-600 hover:text-gray-900"
              >
                <HiPencil className="h-5 w-5" />
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setNewName(profile.name);
                  }}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p className="mt-1">{profile.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1">{profile.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Member Since</h3>
                <p className="mt-1">{format(new Date(profile.createdAtUtc), 'PPP')}</p>
              </div>
              {profile.updatedAtUtc && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                  <p className="mt-1">{format(new Date(profile.updatedAtUtc), 'PPP')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 max-w-3xl mx-auto p-6">
        <GitHubIntegration
          profile={githubProfile}
          isLoading={isGithubLoading}
          error={githubError}
          onTokenSubmit={handleGithubTokenSubmit}
          onTokenRevoke={handleGithubTokenRevoke}
        />
      </div>
    </div>
  );
}
