import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useHabits } from './useHabits';
import { HabitDetails } from './HabitDetails';
import type { Habit } from './types';
import type { Link as HypermediaLink } from '../../types/api';

export const HabitDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getHabit, deleteHabit, isLoading, error: apiError } = useHabits();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHabit();
  }, [id]);

  const loadHabit = async () => {
    if (!id) return;

    // Create a self link for the habit
    const selfLink: HypermediaLink = {
      href: `${import.meta.env.VITE_API_BASE_URL}/habits/${id}`,
      rel: 'self',
      method: 'GET',
    };

    const result = await getHabit(selfLink);
    if (result) {
      setHabit(result);
      setError(null);
    } else {
      setError('Failed to load habit');
    }
  };

  const handleHabitUpdate = (updatedHabit: Habit) => {
    setHabit(updatedHabit);
  };

  const handleDelete = async () => {
    if (!habit) return;

    const deleteLink = habit.links.find(link => link.rel === 'delete');
    if (!deleteLink) {
      setError('Cannot delete this habit');
      return;
    }

    if (window.confirm('Are you sure you want to delete this habit?')) {
      const success = await deleteHabit(deleteLink);
      if (success) {
        navigate('/habits');
      }
    }
  };

  if (error || apiError) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <Link to="/habits" className="text-blue-600 hover:text-blue-800">
            ← Back to Habits
          </Link>
        </div>
        <div className="p-3 bg-red-100 text-red-700 rounded-md">{error || apiError}</div>
      </div>
    );
  }

  if (isLoading || !habit) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-48 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <Link to="/habits" className="text-blue-600 hover:text-blue-800">
          ← Back to Habits
        </Link>
      </div>
      <HabitDetails habit={habit} onUpdate={handleHabitUpdate} onDelete={handleDelete} />
    </div>
  );
};
