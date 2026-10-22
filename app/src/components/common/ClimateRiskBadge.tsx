import React from 'react';
import { RiskLevel } from '../../types/climate';
import { AlertTriangle, AlertOctagon, CheckCircle2, AlertCircle } from 'lucide-react';

interface ClimateRiskBadgeProps {
  level: RiskLevel;
  score?: number;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ClimateRiskBadge: React.FC<ClimateRiskBadgeProps> = ({
  level,
  score,
  showScore = true,
  size = 'md',
}) => {
  const getDetails = () => {
    switch (level) {
      case 'CRITICAL':
        return {
          bg: 'bg-[#FDF0EC]',
          border: 'border-[#E8B4A6]',
          text: 'text-[#A9301F]',
          dot: 'bg-[#B3261E]',
          icon: AlertOctagon,
          label: 'Critical risk',
        };
      case 'HIGH':
        return {
          bg: 'bg-[#FBF3E4]',
          border: 'border-[#E5CD9C]',
          text: 'text-[#92520A]',
          dot: 'bg-[#B45309]',
          icon: AlertTriangle,
          label: 'High risk',
        };
      case 'MODERATE':
        return {
          bg: 'bg-[#FBF6E4]',
          border: 'border-[#E5DA9C]',
          text: 'text-[#7A660A]',
          dot: 'bg-[#A38A0A]',
          icon: AlertCircle,
          label: 'Moderate risk',
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-[#EBF4EE]',
          border: 'border-[#BEDCC9]',
          text: 'text-[#1D6A3E]',
          dot: 'bg-[#1D7A46]',
          icon: CheckCircle2,
          label: 'Low risk',
        };
    }
  };

  const details = getDetails();
  const Icon = details.icon;

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3 py-1.5 text-sm gap-2',
    lg: 'px-4 py-2 text-base gap-2.5',
  }[size];

  return (
    <div
      role="status"
      aria-label={`${details.label}${showScore && score !== undefined ? `, score ${score} out of 100` : ''}`}
      className={`inline-flex items-center rounded-full border font-medium ${details.bg} ${details.border} ${details.text} ${sizeClasses}`}
    >
      <span className={`w-2 h-2 rounded-full ${details.dot} shrink-0`} aria-hidden="true" />
      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span>{details.label}</span>
      {showScore && score !== undefined && (
        <span className="pl-2 ml-0.5 border-l border-current/25 tabular-nums font-semibold">
          {score}/100
        </span>
      )}
    </div>
  );
};
