import React from 'react';

interface TaskFlowLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const TaskFlowLogo: React.FC<TaskFlowLogoProps> = ({
  className = '',
  showText = true,
  size = 'md',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Abstract geometric overlapping workflow check icon mark */}
      <div
        className={`${iconSizes[size]} rounded-lg bg-gradient-to-tr from-secondary via-indigo-600 to-tertiary flex items-center justify-center shadow-md shadow-secondary/25 relative overflow-hidden flex-shrink-0`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5"
        >
          <path
            d="M8 16 L14 22 L24 10"
            stroke="#FFFFFF"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="22" cy="22" r="2.25" fill="#38BDF8" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-headline font-extrabold tracking-tight text-primary dark:text-slate-100 ${textSizes[size]}`}
          >
            TASK<span className="text-secondary dark:text-indigo-400">FLOW</span>
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant dark:text-slate-400 -mt-0.5">
            Academic OS
          </span>
        </div>
      )}
    </div>
  );
};
