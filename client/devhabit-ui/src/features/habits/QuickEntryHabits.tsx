import React, { useEffect, useState } from 'react';
import { useHabits } from './useHabits';
import { useEntries } from '../entries/useEntries';
import { Habit } from './types';
import { format } from 'date-fns';

export const QuickEntryHabits: React.FC = () => {
  const { listHabits, isLoading: isLoadingHabits, error: habitsError } = useHabits();
  const { createEntry, isLoading: isCreatingEntry } = useEntries();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    const result = await listHabits({ pageSize: 8, sort: 'createdAtUtc desc' });
    if (result) {
      setHabits(result.items);
    }
  };

  const handleQuickEntry = async (habit: Habit) => {
    setIsSubmitting(habit.id);
    const result = await createEntry({
      habitId: habit.id,
      value: habit.type === 1 ? 1 : habit.target.value, // Use 1 for binary habits, target value for measurable
      date: format(new Date(), 'yyyy-MM-dd'),
    });

    if (result) {
      // Optionally show success message
    }
    setIsSubmitting(null);
  };

  if (habitsError) {
    return <div className="text-red-500">{habitsError}</div>;
  }

  if (isLoadingHabits) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-100 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-4">Quick Entry</h2>
      <div className="space-y-3">
        {habits.length === 0 ? (
          <p className="text-gray-500">No habits found</p>
        ) : (
          habits.map(habit => (
            <button
              key={habit.id}
              onClick={() => handleQuickEntry(habit)}
              disabled={isCreatingEntry || isSubmitting === habit.id}
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            >
              <div className="text-left">
                <h3 className="font-medium">{habit.name}</h3>
                <p className="text-sm text-gray-500">
                  {habit.target.value} {habit.target.unit}
                </p>
              </div>
              {isSubmitting === habit.id ? (
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="text-blue-600">+ Add Entry</span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};
