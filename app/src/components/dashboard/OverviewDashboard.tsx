import React from 'react';
import { RegionData } from '../../types/climate';
import { MetricCard } from '../common/MetricCard';
import { ClimateRiskBadge } from '../common/ClimateRiskBadge';
import { GlassCard } from '../common/GlassCard';
import { InteractiveMap } from './InteractiveMap';
import {
  ArrowRight,
  Waves,
  Trees,
  ShieldAlert,
  MapPin,
  Satellite,
  Sparkles,
} from 'lucide-react';
import { NavTab } from '../layout/TopNavigation';

interface OverviewDashboardProps {
  region: RegionData;
  onNavigateTab: (tab: NavTab) => void;
  onSelectRegion: (region: RegionData) => void;
  allRegions: RegionData[];
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  region,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="max-w-3xl">
        <h1 className="text-3xl lg:text-[40px] font-bold text-[#1B2520] tracking-tight leading-tight">
          Environmental change, detected and explained.
        </h1>
        <p className="text-[15px] lg:text-base text-[#5D6E64] mt-3 leading-relaxed">
          ORBIS AI monitors flood impact, vegetation stress and land-surface change
          using satellite observations — and turns them into clear, decision-ready intelligence.
        </p>

        <dl className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-[#5D6E64] font-semibold">Region</dt>
            <dd className="font-semibold text-[#1B2520] mt-0.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#1E5641]" aria-hidden="true" />
              {region.name}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-[#5D6E64] font-semibold">Last observation</dt>
            <dd className="font-semibold text-[#1B2520] mt-0.5">{region.lastObserved}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-[#5D6E64] font-semibold">Risk</dt>
            <dd className="mt-1">
              <ClimateRiskBadge level={region.metrics.riskLevel} score={region.metrics.riskScore} size="sm" />
            </dd>
          </div>
        </dl>
      </section>

      {/* Headline metrics — four clean cards */}
      <section aria-label="Key indicators" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Area monitored"
          value={region.metrics.totalAreaKm2.toLocaleString()}
          unit="km²"
          subtext="Satellite footprint"
        />
        <MetricCard
          label="Change detected"
          value={region.metrics.changedPercentage}
          unit="%"
          delta={{ value: `${region.metrics.changedAreaKm2.toLocaleString()} km²`, isNegativeBad: false }}
          subtext="Surface change vs. baseline"
          highlight={region.metrics.changedPercentage > 20}
        />
        <MetricCard
          label="Vegetation change"
          value={region.metrics.ndviChangePercent}
          unit="%"
          delta={{ value: `${region.metrics.ndviBefore} → ${region.metrics.ndviAfter} NDVI`, isNegativeBad: true }}
          subtext="Compared with previous observation"
        />
        <MetricCard
          label="Flood impact"
          value={region.metrics.floodAreaKm2.toLocaleString()}
          unit="km²"
          delta={{ value: `${region.metrics.floodPercentage}% of region`, isNegativeBad: true }}
          subtext="Surface water expansion"
          highlight={region.metrics.floodAreaKm2 > 100}
        />
      </section>

      {/* Map as the visual centerpiece + region intelligence */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <InteractiveMap region={region} className="h-[560px]" onSelectRegion={() => {}} />

          {/* Where to go next */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {[
              { tab: 'change' as NavTab, label: 'Change Detection', desc: 'What changed' },
              { tab: 'flood' as NavTab, label: 'Flood Intelligence', desc: 'Who is affected' },
              { tab: 'vegetation' as NavTab, label: 'Vegetation', desc: 'Ecosystem response' },
              { tab: 'risk' as NavTab, label: 'Risk', desc: 'How serious it is' },
            ].map((item) => (
              <button
                key={item.tab}
                onClick={() => onNavigateTab(item.tab)}
                className="flex items-center justify-between gap-2 p-3.5 rounded-xl bg-white border border-[#E3E9E3] hover:border-[#1E5641]/40 hover:shadow-sm text-left transition-all duration-200 cursor-pointer group"
              >
                <div>
                  <div className="text-[13px] font-semibold text-[#1B2520] group-hover:text-[#15402F]">
                    {item.label}
                  </div>
                  <div className="text-[11px] text-[#5D6E64] mt-0.5">{item.desc}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#93A398] group-hover:text-[#1E5641] group-hover:translate-x-0.5 transition-all shrink-0" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>

        {/* Region intelligence panel */}
        <div className="lg:col-span-4 space-y-4">
          <GlassCard glow className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#EDF1EC]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5D6E64]">
                Region intelligence
              </span>
              <ClimateRiskBadge level={region.metrics.riskLevel} score={region.metrics.riskScore} size="sm" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#1B2520] leading-snug">{region.name}</h2>
              <div className="text-[13px] text-[#5D6E64] mt-1">{region.country} · {region.biome}</div>
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-[#5D6E64] font-semibold">Flood impact</dt>
                <dd className="font-semibold text-[#1B2520] mt-0.5 tabular-nums">{region.metrics.floodAreaKm2.toLocaleString()} km²</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-[#5D6E64] font-semibold">Vegetation change</dt>
                <dd className="font-semibold text-[#B3261E] mt-0.5 tabular-nums">{region.metrics.ndviChangePercent}%</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-[#5D6E64] font-semibold">Population exposed</dt>
                <dd className="font-semibold text-[#1B2520] mt-0.5 tabular-nums">{region.metrics.populationExposed.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-[#5D6E64] font-semibold">Agriculture affected</dt>
                <dd className="font-semibold text-[#1B2520] mt-0.5 tabular-nums">{region.metrics.croplandImpactedHa.toLocaleString()} ha</dd>
              </div>
            </dl>

            <div className="pt-4 border-t border-[#EDF1EC]">
              <div className="text-[13px] font-semibold text-[#1B2520] mb-1.5">Why this matters</div>
              <p className="text-[13px] text-[#5D6E64] leading-relaxed">
                Satellite observations indicate significant surface-water expansion and
                vegetation stress across the monitored region.
              </p>
            </div>

            <div className="pt-4 border-t border-[#EDF1EC]">
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#5D6E64] font-semibold mb-2">
                <Satellite className="w-3.5 h-3.5" aria-hidden="true" />
                Satellite sources
              </div>
              <ul className="space-y-1.5">
                {region.sensorPlatforms.map((plat) => (
                  <li key={plat} className="flex items-center gap-2 text-[13px] text-[#1B2520]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#87A796] shrink-0" aria-hidden="true" />
                    {plat}
                  </li>
                ))}
              </ul>
            </div>
          </GlassCard>

          {/* AI summary teaser */}
          <GlassCard className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#1B2520]">
                <Sparkles className="w-4 h-4 text-[#1E5641]" aria-hidden="true" />
                AI summary
              </div>
              <button
                onClick={() => onNavigateTab('analyst')}
                className="text-[12px] font-medium text-[#1E5641] hover:text-[#15402F] hover:underline cursor-pointer"
              >
                Ask the analyst →
              </button>
            </div>
            <p className="text-[13px] text-[#5D6E64] leading-relaxed line-clamp-4">
              {region.aiExplanation}
            </p>
          </GlassCard>
        </div>
      </section>
    </div>
  );
};
