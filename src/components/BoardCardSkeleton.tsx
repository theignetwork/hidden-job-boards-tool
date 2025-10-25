import React from 'react';

/**
 * Skeleton loader component that matches the BoardCard layout
 * Provides visual feedback during data loading
 */
const BoardCardSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 animate-pulse">
      {/* Header with title and favorite button */}
      <div className="flex justify-between items-start mb-2">
        <div className="h-6 bg-gray-800 rounded w-3/4"></div>
        <div className="w-6 h-6 bg-gray-800 rounded"></div>
      </div>

      {/* Summary text */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-800 rounded w-full"></div>
        <div className="h-4 bg-gray-800 rounded w-5/6"></div>
        <div className="h-4 bg-gray-800 rounded w-4/6"></div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="h-6 bg-gray-800 rounded-full w-16"></div>
        <div className="h-6 bg-gray-800 rounded-full w-20"></div>
        <div className="h-6 bg-gray-800 rounded-full w-14"></div>
      </div>

      {/* View button */}
      <div className="h-10 bg-gray-800 rounded w-20"></div>
    </div>
  );
};

export default BoardCardSkeleton;

/**
 * Grid of skeleton loaders
 */
export const BoardCardSkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <BoardCardSkeleton key={index} />
      ))}
    </div>
  );
};
