import React, { useEffect, useState } from 'react';
import { useEntryStats, type EntryStats } from './useEntryStats';
import { parseISO, format, subDays } from 'date-fns';

const getContributionClass = (count: number): string => {
  if (count === 0) return 'bg-blue-100';
  if (count <= 2) return 'bg-blue-200';
  if (count <= 3) return 'bg-blue-400';
  if (count <= 5) return 'bg-blue-500';
  if (count <= 7) return 'bg-blue-600';
  return 'bg-blue-800';
};

export const ContributionGrid: React.FC = () => {
  const { getStats, isLoading, error } = useEntryStats();
  const [stats, setStats] = useState<EntryStats | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const result = await getStats();
    if (result) {
      setStats(result);
    }
  };

  // Create a 10x3 grid (30 days)
  const grid = Array(10)
    .fill(0)
    .map(() => Array(3).fill(0)); // [column][row]

  // Calculate today and grid dates
  const today = new Date();
  const gridDates = Array(10)
    .fill(0)
    .map(() => Array(3).fill(null));

  // Fill in dates for each position, starting from oldest (top-left) to newest (bottom-right)
  for (let colIndex = 0; colIndex < 10; colIndex++) {
    for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
      const daysAgo = 29 - (colIndex * 3 + rowIndex); // 29 to start from 29 days ago
      gridDates[colIndex][rowIndex] = subDays(today, daysAgo);
    }
  }

  // Fill in the counts from stats if we have them
  if (stats?.dailyStats) {
    const countMap = new Map(
      stats.dailyStats.map(stat => [format(parseISO(stat.date), 'yyyy-MM-dd'), stat.count])
    );

    for (let colIndex = 0; colIndex < 10; colIndex++) {
      for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
        const date = gridDates[colIndex][rowIndex];
        const dateStr = format(date, 'yyyy-MM-dd');
        grid[colIndex][rowIndex] = countMap.get(dateStr) || 0;
      }
    }
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-gray-100 rounded-lg"></div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Daily Activity</h2>
        {stats && (
          <div className="text-sm text-gray-500">Current Streak: {stats.currentStreak} days</div>
        )}
      </div>

      <div className="space-y-3">
        {/* Grid */}
        <div className="flex gap-3">
          {Array(10)
            .fill(0)
            .map((_, colIndex) => (
              <div key={colIndex} className="flex flex-col gap-3">
                {Array(3)
                  .fill(0)
                  .map((_, rowIndex) => {
                    const count = grid[colIndex][rowIndex];
                    const date = gridDates[colIndex][rowIndex];
                    const tooltip = `${count} activit${count !== 1 ? 'ies' : 'y'} on ${format(date, 'MMMM do')}`;

                    return (
                      <div
                        key={rowIndex}
                        title={tooltip}
                        className={`w-10 h-10 rounded transition-colors hover:ring-2 ring-blue-400 ${getContributionClass(count)}`}
                      />
                    );
                  })}
              </div>
            ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-4">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map(level => (
            <div key={level} className={`w-4 h-4 rounded ${getContributionClass(level * 3)}`} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
