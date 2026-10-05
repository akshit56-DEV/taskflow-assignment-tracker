import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  textClassName?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  textClassName = '',
}) => {
  const sizeMap = {
    sm: {
      box: 'w-7 h-7 rounded-[8px]',
      bars: [
        { w: 'w-[4px]', h: 'h-[8px]' },
        { w: 'w-[5px]', h: 'h-[13px]' },
        { w: 'w-[6px]', h: 'h-[18px]' },
      ],
      gap: 'gap-[2px]',
      text: 'text-[15px]',
    },
    md: {
      box: 'w-[34px] h-[34px] rounded-[10px]',
      bars: [
        { w: 'w-[6px]', h: 'h-[11px]' },
        { w: 'w-[7px]', h: 'h-[16px]' },
        { w: 'w-[8.5px]', h: 'h-[22px]' },
      ],
      gap: 'gap-[3px]',
      text: 'text-[18px]',
    },
    lg: {
      box: 'w-[44px] h-[44px] rounded-[12px]',
      bars: [
        { w: 'w-[8px]', h: 'h-[14px]' },
        { w: 'w-[9.5px]', h: 'h-[21px]' },
        { w: 'w-[11px]', h: 'h-[28px]' },
      ],
      gap: 'gap-[3.5px]',
      text: 'text-[22px]',
    },
  };

  const current = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Figma ▰ Brand Geometric Block in #4355ED */}
      <div
        className={`${current.box} bg-[#4355ED] shadow-tf-subtle flex items-center justify-center flex-shrink-0 text-white font-bold select-none transition-transform hover:scale-105 rounded-lg`}
      >
        <span className="text-base leading-none select-none">▰</span>
      </div>

      {showText && (
        <span
          className={`font-semibold tracking-tight text-[#18223F] dark:text-white font-sans ${current.text} ${textClassName}`}
        >
          TaskFlow
        </span>
      )}
    </div>
  );
};
