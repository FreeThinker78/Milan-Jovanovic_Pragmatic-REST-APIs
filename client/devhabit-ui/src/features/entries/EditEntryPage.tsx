import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { useEntries } from './useEntries';
import { Entry, UpdateEntryDto } from './types';

export const EditEntryPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [entry, setEntry] = useState<Entry | null>(null);
  const { getEntry, updateEntry, isLoading } = useEntries();

  useEffect(() => {
    loadEntry();
  }, [id]);

  const loadEntry = async () => {
    if (!id) return;
    const result = await getEntry(id);
    if (result) {
      setEntry(result);
      setValue(result.value.toString());
      setNotes(result.notes || '');
      setDate(new Date(result.date));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!entry) return;

    const updateLink = entry.links?.find(link => link.rel === 'update');
    if (!updateLink) return;

    const entryData: UpdateEntryDto = {
      value: parseFloat(value),
      notes: notes || undefined,
      date: format(date, 'yyyy-MM-dd'),
    };

    const result = await updateEntry(updateLink, entryData);
    if (result) {
      navigate('/entries');
    }
  };

  if (!entry) {
    return <p className="text-gray-500">Loading...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <button onClick={() => navigate('/entries')} className="text-blue-600 hover:text-blue-800">
          ← Back to Entries
        </button>
      </div>

      <h1 className="text-2xl font-semibold mb-6">Edit Entry</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Habit</label>
          <p className="text-gray-900">{entry.habit.name}</p>
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
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
