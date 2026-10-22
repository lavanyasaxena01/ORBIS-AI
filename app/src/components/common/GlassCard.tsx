import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

/**
 * Base surface card for the ORBIS AI design system.
 * Kept under the original name for compatibility: renders a clean white
 * card with a soft border and restrained elevation.
 */
export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', glow = false }) => {
  return (
    <div
      className={`relative bg-white rounded-xl border border-[#E3E9E3] p-5 lg:p-6 transition-all duration-200 ${
        glow
          ? 'shadow-sm border-[#C9DACD] ring-1 ring-[#1E5641]/10'
          : 'hover:border-[#C9D6CC] shadow-[0_1px_2px_rgba(27,37,32,0.04)]'
      } ${className}`}
    >
      {children}
    </div>
  );
};
