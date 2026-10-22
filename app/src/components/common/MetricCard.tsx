import React from 'react';
import { GlassCard } from './GlassCard';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: {
    value: string;
    isNegativeBad?: boolean;
    isPositiveGood?: boolean;
  };
  subtext?: string;
  highlight?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  delta,
  subtext,
  highlight = false,
}) => {
  const deltaColor = (() => {
    if (!delta) return '';
    if (delta.value.startsWith('+')) {
      return delta.isPositiveGood ? 'text-[#1D7A46]' : 'text-[#B45309]';
    }
    return delta.isNegativeBad ? 'text-[#B3261E]' : 'text-[#1D7A46]';
  })();

  return (
    <GlassCard
      glow={highlight}
      className="flex flex-col justify-between gap-3 p-5"
    >
      <div>
        <div className="text-[11px] uppercase tracking-wider text-[#5D6E64] font-semibold mb-2">
          {label}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-semibold text-[#1B2520] tabular-nums tracking-tight">
            {value}
          </span>
          {unit && (
            <span className="text-sm font-medium text-[#5D6E64]">
              {unit}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 text-xs">
        {delta ? (
          <span className={`font-medium ${deltaColor}`}>{delta.value}</span>
        ) : (
          <span />
        )}
        {subtext && (
          <span className="text-[#5D6E64] text-right leading-snug">{subtext}</span>
        )}
      </div>
    </GlassCard>
  );
};
