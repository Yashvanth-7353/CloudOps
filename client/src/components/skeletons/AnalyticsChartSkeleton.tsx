import React from 'react';
import Skeleton from './Skeleton';

const AnalyticsChartSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl border border-white/8 bg-[rgba(10,14,24,0.62)] backdrop-blur-md p-5 shadow-[0_20px_60px_rgba(2,6,23,0.35)]">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-3 w-16" />
      </div>

      <div className="mt-5 grid grid-cols-6 gap-2 items-end h-56">
        {[34, 48, 22, 60, 40, 72].map((height, index) => (
          <Skeleton
            key={index}
            className="rounded-t-xl"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>

      <div className="mt-4 flex gap-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
};

export default AnalyticsChartSkeleton;
