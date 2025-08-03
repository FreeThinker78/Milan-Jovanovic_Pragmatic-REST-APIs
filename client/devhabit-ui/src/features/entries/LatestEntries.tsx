import React, { useEffect, useState } from 'react';
import { useEntries } from './useEntries';
import { Entry } from './types';
import { format } from 'date-fns';

export const LatestEntries: React.FC = () => {
  const { getEntries, isLoading, error } = useEntries();
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const result = await getEntries({
      page: 1,
      pageSize: 4,
      sort: 'date desc,createdAtUtc desc',
    });
    if (result) {
      setEntries(result.items);
    }
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (isLoading) {
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
      <h2 className="text-lg font-semibold mb-4">Latest Entries</h2>
      <div className="space-y-4">
        {entries.length === 0 ? (
          <p className="text-gray-500">No entries yet</p>
        ) : (
          entries.map(entry => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <h3 className="font-medium">{entry.habit.name}</h3>
                <p className="text-sm text-gray-500">
                  {format(new Date(entry.date), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{entry.value}</p>
                {entry.notes && <p className="text-sm text-gray-500">{entry.notes}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
