import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`bg-slate-200 dark:bg-slate-800/80 rounded-xl shimmer-effect ${className}`}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="glass-card p-5 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="w-20 h-5" />
        <Skeleton className="w-16 h-5" />
      </div>
      <Skeleton className="w-3/4 h-6" />
      <Skeleton className="w-full h-4" />
      <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
        <Skeleton className="w-24 h-4" />
        <div className="flex gap-2">
          <Skeleton className="w-6 h-6 rounded-lg" />
          <Skeleton className="w-6 h-6 rounded-lg" />
        </div>
      </div>
    </div>
  );
};
