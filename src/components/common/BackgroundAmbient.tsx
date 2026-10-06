import React from 'react';

export const BackgroundAmbient: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Subtle Dot Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60" />

      {/* Ambient Gradient Blob 1 (Top Left) */}
      <div
        className="hidden md:block absolute -top-32 -left-32 w-96 h-96 rounded-full bg-brand-500/10 dark:bg-brand-500/8 blur-3xl transform-gpu motion-reduce:animate-none"
        style={{ animation: 'pulseSubtle 8s ease-in-out infinite alternate' }}
      />

      {/* Ambient Gradient Blob 2 (Top Right / Middle) */}
      <div
        className="hidden md:block absolute top-1/4 -right-24 w-80 h-80 rounded-full bg-indigo-500/10 dark:bg-indigo-500/7 blur-3xl transform-gpu motion-reduce:animate-none"
        style={{ animation: 'pulseSubtle 10s ease-in-out infinite alternate 2s' }}
      />

      {/* Ambient Gradient Blob 3 (Bottom Left) */}
      <div
        className="hidden md:block absolute bottom-10 left-1/3 w-96 h-96 rounded-full bg-blue-400/8 dark:bg-blue-600/5 blur-3xl transform-gpu motion-reduce:animate-none"
        style={{ animation: 'pulseSubtle 12s ease-in-out infinite alternate 4s' }}
      />
    </div>
  );
};
