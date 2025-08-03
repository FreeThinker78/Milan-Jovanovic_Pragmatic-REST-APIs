import React from 'react';
import { ContributionGrid } from '../features/entries/ContributionGrid';
import { LatestEntries } from '../features/entries/LatestEntries';
import { QuickEntryHabits } from '../features/habits/QuickEntryHabits';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 space-y-6">
        <div className="space-y-6">
          <ContributionGrid />
          <LatestEntries />
        </div>
        <QuickEntryHabits />
      </div>
    </div>
  );
};

export default Dashboard;
