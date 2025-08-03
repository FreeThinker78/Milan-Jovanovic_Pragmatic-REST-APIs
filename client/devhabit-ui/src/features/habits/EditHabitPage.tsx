import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useHabits } from './useHabits';
import {
  HabitType,
  FrequencyType,
  type Habit,
  type CreateHabitDto,
  AutomationSource,
} from './types';
import type { Link as HypermediaLink } from '../../types/api';

const ALLOWED_UNITS = [
  'minutes',
  'hours',
  'steps',
  'km',
  'cal',
  'pages',
  'books',
  'tasks',
  'sessions',
] as const;

const BINARY_UNITS = ['sessions', 'tasks'] as const;

export const EditHabitPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getHabit, updateHabit, isLoading, error: apiError } = useHabits();
  const [error, setError] = useState<string | null>(null);
  const [habit, setHabit] = useState<Habit | null>(null);

  const [formData, setFormData] = useState<CreateHabitDto>({
    name: '',
    description: '',
    type: HabitType.Binary,
    frequency: {
      type: FrequencyType.Daily,
      timesPerPeriod: 1,
    },
    target: {
      value: 1,
      unit: 'sessions',
    },
    automationSource: undefined as AutomationSource | undefined,
  });

  useEffect(() => {
    loadHabit();
  }, [id]);

  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name,
        description: habit.description || '',
        type: habit.type,
        frequency: habit.frequency,
        target: habit.target,
        endDate: habit.endDate,
        milestone: habit.milestone,
        automationSource: habit.automationSource,
      });
    }
  }, [habit]);

  const loadHabit = async () => {
    if (!id) return;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habit) return;

    const updateLink = habit.links.find(link => link.rel === 'update');
    if (!updateLink) {
      setError('Cannot update this habit');
      return;
    }

    const payload = {
      ...formData,
      endDate: formData.endDate || undefined,
      milestone: formData.milestone?.target ? formData.milestone : undefined,
    };

    const result = await updateHabit(updateLink, payload);
    if (result) {
      navigate(`/habits/${habit.id}`);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => {
        const parentObj = prev[parent as keyof typeof prev];
        if (typeof parentObj === 'object' && parentObj !== null) {
          return {
            ...prev,
            [parent]: {
              ...parentObj,
              [child]: value,
            },
          };
        }
        return prev;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    // Special handling for habit type changes
    if (name === 'type') {
      const newType = parseInt(value) as HabitType;
      if (newType === HabitType.Binary && !BINARY_UNITS.includes(formData.target.unit as any)) {
        setFormData(prev => ({
          ...prev,
          target: {
            ...prev.target,
            unit: 'sessions',
          },
        }));
      }
    }
  };

  if (error || apiError) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <Link to={`/habits/${id}`} className="text-blue-600 hover:text-blue-800">
            ← Back to Habit
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
        <Link to={`/habits/${id}`} className="text-blue-600 hover:text-blue-800">
          ← Back to Habit
        </Link>
      </div>

      <h1 className="text-2xl font-semibold mb-6">Edit Habit</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
            required
            minLength={3}
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
            maxLength={500}
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value={HabitType.Binary}>Binary (Yes/No)</option>
            <option value={HabitType.Measurable}>Measurable (with units)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency Type</label>
            <select
              name="frequency.type"
              value={formData.frequency.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value={FrequencyType.Daily}>Daily</option>
              <option value={FrequencyType.Weekly}>Weekly</option>
              <option value={FrequencyType.Monthly}>Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Times Per Period</label>
            <input
              type="number"
              name="frequency.timesPerPeriod"
              value={formData.frequency.timesPerPeriod}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md"
              min={1}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Value</label>
            <input
              type="number"
              name="target.value"
              value={formData.target.value}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md"
              min={1}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <select
              name="target.unit"
              value={formData.target.unit}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              {(formData.type === HabitType.Binary ? BINARY_UNITS : ALLOWED_UNITS).map(unit => (
                <option key={unit} value={unit}>
                  {unit.charAt(0).toUpperCase() + unit.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date (Optional)
          </label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Milestone Target (Optional)
          </label>
          <input
            type="number"
            name="milestone.target"
            value={formData.milestone?.target || 0}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
            min={0}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Automation Source (Optional)
          </label>
          <select
            name="automationSource"
            value={formData.automationSource || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">None</option>
            <option value={AutomationSource.GitHub}>GitHub</option>
          </select>
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
