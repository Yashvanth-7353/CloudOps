import React from 'react';
import Skeleton from './Skeleton';

const NavbarLoadingState: React.FC = () => {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/8 bg-[rgba(10,14,24,0.62)] px-4 py-3 backdrop-blur-md shadow-[0_20px_60px_rgba(2,6,23,0.35)]">
      <Skeleton className="h-10 w-10 rounded-full" />
      <Skeleton className="h-4 w-40 flex-1" />
      <Skeleton className="h-10 w-10 rounded-xl" />
      <Skeleton className="h-10 w-10 rounded-xl" />
      <Skeleton className="h-10 w-28 rounded-xl" />
    </div>
  );
};

export default NavbarLoadingState;
