import React from 'react';

export const BackgroundAmbient: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Subtle Dot Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-25 dark:opacity-10" />
    </div>
  );
};
