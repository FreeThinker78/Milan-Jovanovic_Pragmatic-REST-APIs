import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useHabits } from '../habits/useHabits';
import { useEntries } from './useEntries';
import { Habit } from '../habits/types';
import { CreateEntryDto } from './types';

export const CreateEntryPage: React.FC = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState('1');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [selectedHabitId, setSelectedHabitId] = useState('');
  const { listHabits, isLoading: isLoadingHabits } = useHabits();
  const { createEntry, isLoading: isCreatingEntry } = useEntries();
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    const result = await listHabits({ pageSize: 100, sort: 'name', fields: 'id,name' });
    if (result) {
      setHabits(result.items);
      if (!selectedHabitId && result.items.length > 0) {
        setSelectedHabitId(result.items[0].id);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const entryData: CreateEntryDto = {
      habitId: selectedHabitId,
      value: parseFloat(value),
      notes: notes || undefined,
      date: format(date, 'yyyy-MM-dd'),
    };

    const result = await createEntry(entryData);
    if (result) {
      navigate('/entries');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <button onClick={() => navigate('/entries')} className="text-blue-600 hover:text-blue-800">
          ← Back to Entries
        </button>
      </div>

      <h1 className="text-2xl font-semibold mb-6">Create New Entry</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="habitId" className="block text-sm font-medium text-gray-700 mb-1">
            Habit
          </label>
          <select
            id="habitId"
            value={selectedHabitId}
            onChange={e => setSelectedHabitId(e.target.value)}
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
          <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
            Value
          </label>
          <input
            id="value"
            type="number"
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
            min={0}
            step={0.01}
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            id="date"
            type="date"
            value={format(date, 'yyyy-MM-dd')}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(new Date(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/entries')}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            disabled={isCreatingEntry || !selectedHabitId}
          >
            {isCreatingEntry ? 'Creating...' : 'Create Entry'}
          </button>
        </div>
      </form>
    </div>
  );
};
