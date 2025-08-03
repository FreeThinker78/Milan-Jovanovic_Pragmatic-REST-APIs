import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { useHabits } from '../habits/useHabits';
import { useEntries } from './useEntries';
import { Habit } from '../habits/types';
import { CreateEntryDto } from './types';
import { Link } from '../../types/api';

interface BatchEntry {
  habitId: string;
  value: string;
  notes: string;
  date: Date;
}

interface LocationState {
  createBatchLink: Link;
}

export const CreateBatchEntriesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { createBatchLink } = (location.state as LocationState) || {};

  // Redirect if no create-batch link is provided
  useEffect(() => {
    if (!createBatchLink) {
      navigate('/entries');
    }
  }, [createBatchLink, navigate]);

  const [batchEntries, setBatchEntries] = useState<BatchEntry[]>([
    {
      habitId: '',
      value: '1',
      notes: '',
      date: new Date(),
    },
  ]);
  const { listHabits, isLoading: isLoadingHabits } = useHabits();
  const { createBatchEntries, isLoading: isCreatingEntries } = useEntries();
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    const result = await listHabits({ pageSize: 100, sort: 'name', fields: 'id,name' });
    if (result) {
      setHabits(result.items);
      if (result.items.length > 0) {
        setBatchEntries(entries =>
          entries.map(entry => ({
            ...entry,
            habitId: entry.habitId || result.items[0].id,
          }))
        );
      }
    }
  };

  const handleAddEntry = () => {
    setBatchEntries([
      ...batchEntries,
      {
        habitId: habits.length > 0 ? habits[0].id : '',
        value: '1',
        notes: '',
        date: new Date(),
      },
    ]);
  };

  const handleRemoveEntry = (index: number) => {
    setBatchEntries(entries => entries.filter((_, i) => i !== index));
  };

  const handleEntryChange = (index: number, field: keyof BatchEntry, value: string | Date) => {
    setBatchEntries(entries =>
      entries.map((entry, i) =>
        i === index
          ? {
              ...entry,
              [field]: value,
            }
          : entry
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!createBatchLink) {
      console.error('Create batch link not found');
      return;
    }

    const entries: CreateEntryDto[] = batchEntries.map(entry => ({
      habitId: entry.habitId,
      value: parseFloat(entry.value),
      notes: entry.notes || undefined,
      date: format(entry.date, 'yyyy-MM-dd'),
    }));

    const result = await createBatchEntries(createBatchLink, { entries });
    if (result) {
      navigate('/entries');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/entries')}
          className="text-blue-600 hover:text-blue-800 cursor-pointer"
        >
          ← Back to Entries
        </button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Create Multiple Entries</h1>
        <button
          type="button"
          onClick={handleAddEntry}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer"
        >
          Add Entry
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {batchEntries.map((entry, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Entry #{index + 1}</h3>
              {batchEntries.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveEntry(index)}
                  className="text-red-600 hover:text-red-800 cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor={`habitId-${index}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Habit
                </label>
                <select
                  id={`habitId-${index}`}
                  value={entry.habitId}
                  onChange={e => handleEntryChange(index, 'habitId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  disabled={isLoadingHabits}
                >
                  {isLoadingHabits ? (
                    <option>Loading habits...</option>
                  ) : habits.length === 0 ? (
                    <option value="">No habits available</option>
                  ) : (
                    habits.map(habit => (
                      <option key={habit.id} value={habit.id}>
                        {habit.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label
                  htmlFor={`value-${index}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Value
                </label>
                <input
                  id={`value-${index}`}
                  type="number"
                  value={entry.value}
                  onChange={e => handleEntryChange(index, 'value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  min={0}
                  step={0.01}
                />
              </div>

              <div className="col-span-2">
                <label
                  htmlFor={`notes-${index}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Notes
                </label>
                <textarea
                  id={`notes-${index}`}
                  value={entry.notes}
                  onChange={e => handleEntryChange(index, 'notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={2}
                />
              </div>

              <div>
                <label
                  htmlFor={`date-${index}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Date
                </label>
                <input
                  id={`date-${index}`}
                  type="date"
                  value={format(entry.date, 'yyyy-MM-dd')}
                  onChange={e => handleEntryChange(index, 'date', new Date(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/entries')}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
            disabled={isCreatingEntries || batchEntries.length === 0}
          >
            {isCreatingEntries ? 'Creating...' : 'Create Entries'}
          </button>
        </div>
      </form>
    </div>
  );
};
