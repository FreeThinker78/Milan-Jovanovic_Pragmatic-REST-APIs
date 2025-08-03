import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useHabits } from './useHabits';
import { FrequencyType } from './types';
import type { Habit } from './types';
import type { Link as HypermediaLink } from '../../types/api';

export const HabitsPage: React.FC = () => {
  const { listHabits, isLoading, error } = useHabits();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [createLink, setCreateLink] = useState<HypermediaLink | null>(null);
  const [nextPageLink, setNextPageLink] = useState<HypermediaLink | null>(null);
  const [prevPageLink, setPrevPageLink] = useState<HypermediaLink | null>(null);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    const result = await listHabits({ pageSize: 6 });
    if (result) {
      setHabits(result.items);
      setCreateLink(result.links.find(l => l.rel === 'create') || null);
      setNextPageLink(result.links.find(l => l.rel === 'next-page') || null);
      setPrevPageLink(result.links.find(l => l.rel === 'previous-page') || null);
    }
  };

  const handlePageChange = async (link: HypermediaLink) => {
    const result = await listHabits({ pageSize: 6, url: link.href });
    if (result) {
      setHabits(result.items);
      setNextPageLink(result.links.find(l => l.rel === 'next-page') || null);
      setPrevPageLink(result.links.find(l => l.rel === 'previous-page') || null);
    }
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">My Habits</h1>
        <div className="flex gap-4">
          {createLink && (
            <Link
              to="/habits/create"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
            >
              Create New Habit
            </Link>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">You haven't created any habits yet.</p>
          {createLink && (
            <Link to="/habits/create" className="text-blue-600 hover:text-blue-800">
              Create your first habit
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4">
            {habits.map(habit => (
              <Link
                key={habit.id}
                to={`/habits/${habit.id}`}
                className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-medium">{habit.name}</h2>
                    {habit.description && <p className="text-gray-600 mt-1">{habit.description}</p>}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>
                        {habit.frequency.timesPerPeriod}x {FrequencyType[habit.frequency.type]}
                      </span>
                      <span>
                        {habit.target.value} {habit.target.unit}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {habit.endDate && (
                      <span className="text-sm text-gray-500">
                        Ends {new Date(habit.endDate).toLocaleDateString()}
                      </span>
                    )}
                    {habit.milestone && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md">
                        Milestone: {habit.milestone.target}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex justify-center gap-4 mt-6">
            {prevPageLink && (
              <button
                onClick={() => handlePageChange(prevPageLink)}
                className="px-4 py-2 text-blue-600 hover:text-blue-800 cursor-pointer"
                disabled={isLoading}
              >
                ← Previous
              </button>
            )}
            {nextPageLink && (
              <button
                onClick={() => handlePageChange(nextPageLink)}
                className="px-4 py-2 text-blue-600 hover:text-blue-800 cursor-pointer"
                disabled={isLoading}
              >
                Next →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
