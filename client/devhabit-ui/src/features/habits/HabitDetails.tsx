import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Habit, HabitType, FrequencyType } from './types';
import { useTags } from '../tags/useTags';
import { useHabits } from './useHabits';
import type { Link as HypermediaLink } from '../../types/api';

interface HabitDetailsProps {
  habit: Habit;
  onDelete?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onUpdate?: (updatedHabit: Habit) => void;
}

export const HabitDetails: React.FC<HabitDetailsProps> = ({ habit, onDelete, onUpdate }) => {
  const { getTags, upsertHabitTags, isLoading: isTagsLoading, error: tagsError } = useTags();
  const { getHabit, isLoading: isHabitLoading, error: habitError } = useHabits();
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    const response = await getTags();
    if (response) {
      setTags(response.items);
    }
  };

  const refreshHabit = async () => {
    const selfLink = habit.links.find(link => link.rel === 'self');
    if (!selfLink || !onUpdate) return;

    const updatedHabit = await getHabit(selfLink);
    if (updatedHabit) {
      onUpdate(updatedHabit);
    }
  };

  const handleTagsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const upsertLink = habit.links.find(link => link.rel === 'upsert-tags');
    if (!upsertLink) return;

    try {
      await upsertHabitTags(upsertLink, selectedTags);
      await refreshHabit();
      setIsEditing(false);
    } catch {
      // Error is handled by the hook
    }
  };

  const getOperationLink = (rel: string): HypermediaLink | undefined => {
    return habit.links.find(link => link.rel === rel);
  };

  const updateLink = getOperationLink('update');
  const deleteLink = getOperationLink('delete');

  const isLoading = isTagsLoading || isHabitLoading;
  const error = tagsError || habitError;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-semibold">{habit.name}</h2>
          {habit.description && <p className="text-gray-600 mt-1">{habit.description}</p>}
        </div>
        <div className="flex space-x-2">
          {updateLink && (
            <Link to={`/habits/${habit.id}/edit`} className="text-blue-600 hover:text-blue-800">
              Edit
            </Link>
          )}
          {deleteLink && onDelete && (
            <button onClick={onDelete} className="text-red-600 hover:text-red-800">
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-medium mb-2">Type</h3>
          <p>{HabitType[habit.type]}</p>
        </div>
        <div>
          <h3 className="font-medium mb-2">Frequency</h3>
          <p>
            {habit.frequency.timesPerPeriod}x {FrequencyType[habit.frequency.type]}
          </p>
        </div>
        <div>
          <h3 className="font-medium mb-2">Target</h3>
          <p>
            {habit.target.value} {habit.target.unit}
          </p>
        </div>
        {habit.endDate && (
          <div>
            <h3 className="font-medium mb-2">End Date</h3>
            <p>{new Date(habit.endDate).toLocaleDateString()}</p>
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Tags</h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {isEditing ? 'Cancel' : 'Edit Tags'}
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

        {isEditing ? (
          <form onSubmit={handleTagsSubmit} className="space-y-4">
            <select
              multiple
              value={selectedTags}
              onChange={e =>
                setSelectedTags(Array.from(e.target.selectedOptions, opt => opt.value))
              }
              className="w-full px-3 py-2 border rounded-md"
              size={5}
            >
              {tags.map(tag => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end space-x-2">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {isLoading ? 'Saving...' : 'Save Tags'}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-wrap gap-2">
            {habit.tags?.map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-100 rounded-md text-sm">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
