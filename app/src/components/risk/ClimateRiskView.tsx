import React, { useState } from 'react';
import { RegionData } from '../../types/climate';
import { GlassCard } from '../common/GlassCard';
import { ClimateRiskBadge } from '../common/ClimateRiskBadge';
import { calculateClimateRisk, DEFAULT_RISK_WEIGHTS } from '../../lib/riskEngine';
import { ChevronDown, RotateCcw } from 'lucide-react';

interface ClimateRiskViewProps {
  region: RegionData;
}

const FACTORS = [
  { key: 'floodSeverity' as const, label: 'Flood impact', color: '#2563EB' },
  { key: 'vegetationDecline' as const, label: 'Vegetation stress', color: '#1D7A46' },
  { key: 'waterAnomaly' as const, label: 'Water anomaly', color: '#3B82F6' },
  { key: 'landUseChange' as const, label: 'Land-use change', color: '#B45309' },
  { key: 'historicalTrend' as const, label: 'Historical events', color: '#5D6E64' },
];

export const ClimateRiskView: React.FC<ClimateRiskViewProps> = ({ region }) => {
  const [factors, setFactors] = useState({
    floodSeverity: region.riskBreakdown.floodSeverity,
    vegetationDecline: region.riskBreakdown.vegetationDecline,
    waterAnomaly: region.riskBreakdown.waterAnomaly,
    landUseChange: region.riskBreakdown.landUseChange,
    historicalTrend: region.riskBreakdown.historicalTrend,
  });

  const [weights] = useState(DEFAULT_RISK_WEIGHTS);
  const [howOpen, setHowOpen] = useState(false);
  const [simOpen, setSimOpen] = useState(false);

  const computed = calculateClimateRisk(factors, weights);

  const resetToRegionDefaults = () => {
    setFactors({
      floodSeverity: region.riskBreakdown.floodSeverity,
      vegetationDecline: region.riskBreakdown.vegetationDecline,
      waterAnomaly: region.riskBreakdown.waterAnomaly,
      landUseChange: region.riskBreakdown.landUseChange,
      historicalTrend: region.riskBreakdown.historicalTrend,
    });
  };

  const contributions: Record<string, { value: number; weight: number; contribution: number }> = {
    floodSeverity: computed.contributions.floodSeverity,
    vegetationDecline: computed.contributions.vegetationDecline,
    waterAnomaly: computed.contributions.waterAnomaly,
    landUseChange: computed.contributions.landUseChange,
    historicalTrend: computed.contributions.historicalTrend,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="max-w-2xl">
        <h1 className="text-3xl lg:text-4xl font-bold text-[#1B2520] tracking-tight">
          Climate Risk
        </h1>
        <p className="text-[15px] text-[#5D6E64] mt-2 leading-relaxed">
          How serious is the situation? The risk score combines the observed environmental
          indicators into a single, explainable number.
        </p>
      </div>

      {/* Score hero */}
      <GlassCard glow className="flex flex-col sm:flex-row sm:items-center gap-6">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-[#5D6E64] font-semibold">
            Climate risk score
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-5xl font-bold text-[#1B2520] tabular-nums tracking-tight">
              {computed.score}
            </span>
            <span className="text-xl text-[#5D6E64] font-medium">/ 100</span>
          </div>
        </div>
        <div className="sm:border-l sm:border-[#EDF1EC] sm:pl-6 space-y-2">
          <ClimateRiskBadge level={computed.level} score={computed.score} size="lg" showScore={false} />
          <p className="text-[13px] text-[#5D6E64] leading-relaxed max-w-md">{computed.narrative}</p>
        </div>
      </GlassCard>

      {/* Contributing factors */}
      <GlassCard className="space-y-5">
        <div className="text-[15px] font-semibold text-[#1B2520]">What drives this score</div>

        <div className="space-y-4">
          {FACTORS.map((f) => {
            const c = contributions[f.key];
            return (
              <div key={f.key}>
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1.5">
                  <span className="text-[14px] font-medium text-[#1B2520]">
                    {f.label}
                    <span className="text-[#5D6E64] font-normal text-[12px] ml-2">
                      weight {c.weight}%
                    </span>
                  </span>
                  <span className="text-[13px] text-[#5D6E64] tabular-nums">
                    {c.value}/100 → <span className="font-semibold text-[#1B2520]">+{c.contribution} pts</span>
                  </span>
                </div>
                <div
                  className="w-full bg-[#EDF1EC] h-2.5 rounded-full overflow-hidden"
                  role="img"
                  aria-label={`${f.label}: ${c.value} out of 100`}
                >
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${c.value}%`, backgroundColor: f.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* How is this calculated */}
        <div className="pt-4 border-t border-[#EDF1EC]">
          <button
            onClick={() => setHowOpen(!howOpen)}
            aria-expanded={howOpen}
            className="flex items-center gap-1.5 text-[13px] font-medium text-[#1E5641] hover:text-[#15402F] cursor-pointer"
          >
            <span>How is this calculated?</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${howOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>

          {howOpen && (
            <div className="mt-3 space-y-3">
              <p className="text-[13px] text-[#5D6E64] leading-relaxed">
                The risk score combines the observed environmental indicators using predefined
                weights. Each factor is scored from 0 to 100, multiplied by its weight, and the
                results are added together.
              </p>
              <div className="p-3.5 rounded-lg bg-[#F4F7F3] border border-[#E3E9E3] font-mono text-[12px] text-[#1B2520] leading-relaxed">
                Risk = (0.35 × {factors.floodSeverity}) + (0.25 × {factors.vegetationDecline}) + (0.15 × {factors.waterAnomaly}) + (0.15 × {factors.landUseChange}) + (0.10 × {factors.historicalTrend}) = <strong>{computed.score}</strong>
              </div>
              <p className="text-[12px] text-[#5D6E64]">
                Risk bands: below 35 low · 35–54 moderate · 55–74 high · 75 and above critical.
              </p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Scenario explorer */}
      <GlassCard>
        <button
          onClick={() => setSimOpen(!simOpen)}
          aria-expanded={simOpen}
          className="w-full flex items-center justify-between cursor-pointer"
        >
          <div className="text-left">
            <div className="text-[15px] font-semibold text-[#1B2520]">Explore scenarios</div>
            <p className="text-[12px] text-[#5D6E64] mt-0.5">
              Adjust the factors to see how the risk score would respond.
            </p>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-[#5D6E64] transition-transform duration-200 ${simOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>

        {simOpen && (
          <div className="mt-5 space-y-4">
            {FACTORS.map((f) => (
              <div key={f.key}>
                <div className="flex justify-between text-[13px] mb-1.5">
                  <label htmlFor={`sim-${f.key}`} className="text-[#1B2520] font-medium">
                    {f.label}
                  </label>
                  <span className="text-[#5D6E64] tabular-nums">{factors[f.key]}/100</span>
                </div>
                <input
                  id={`sim-${f.key}`}
                  type="range"
                  min="0"
                  max="100"
                  value={factors[f.key]}
                  onChange={(e) =>
                    setFactors({ ...factors, [f.key]: parseInt(e.target.value, 10) })
                  }
                  className="w-full aeris-range cursor-pointer"
                />
              </div>
            ))}

            <button
              onClick={resetToRegionDefaults}
              className="flex items-center gap-1.5 text-[13px] font-medium text-[#1E5641] hover:text-[#15402F] cursor-pointer pt-1"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset to observed values</span>
            </button>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
