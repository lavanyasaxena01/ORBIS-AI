import React, { useState } from 'react';
import { RegionData } from '../../types/climate';
import { GlassCard } from '../common/GlassCard';
import { MetricCard } from '../common/MetricCard';
import { ClimateRiskBadge } from '../common/ClimateRiskBadge';
import { getAssetUrl, logImageError } from '../../lib/assetUrl';
import {
  Users,
  Wheat,
  ArrowUpRight,
  AlertTriangle,
  Loader2,
  ChevronDown,
  Droplets,
} from 'lucide-react';

interface FloodIntelligenceViewProps {
  region: RegionData;
}

export const FloodIntelligenceView: React.FC<FloodIntelligenceViewProps> = ({ region }) => {
  const [activeViewMode, setActiveViewMode] = useState<'sar' | 'optical' | 'mask'>('sar');
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [methodOpen, setMethodOpen] = useState(false);

  const currentImgUrl = getAssetUrl(
    activeViewMode === 'sar'
      ? region.sarUrl
      : activeViewMode === 'optical'
      ? region.opticalAfterUrl
      : region.opticalAfterUrl
  );

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#1B2520] tracking-tight">
            Flood Impact Assessment
          </h1>
          <p className="text-[15px] text-[#5D6E64] mt-2 leading-relaxed">
            Who and what is affected? Satellite radar observations identify areas of
            surface-water expansion — even through clouds and heavy rain.
          </p>
        </div>
        <ClimateRiskBadge level={region.metrics.riskLevel} score={region.metrics.riskScore} size="md" />
      </div>

      {/* Headline numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Flood extent"
          value={region.metrics.floodAreaKm2.toLocaleString()}
          unit="km²"
          subtext="Area under water"
          highlight
        />
        <MetricCard
          label="Share of region"
          value={region.metrics.floodPercentage}
          unit="%"
          delta={{ value: `of ${region.metrics.totalAreaKm2.toLocaleString()} km²`, isNegativeBad: true }}
          subtext="Submerged proportion"
        />
        <MetricCard
          label="Population exposed"
          value={region.metrics.populationExposed.toLocaleString()}
          subtext="People in affected areas"
        />
        <MetricCard
          label="Agriculture affected"
          value={region.metrics.croplandImpactedHa.toLocaleString()}
          unit="ha"
          subtext="Cropland under water"
        />
      </div>

      {/* Impact cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#FDF0EC] border border-[#E8B4A6] flex items-center justify-center text-[#B3261E] shrink-0">
            <Users className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[#5D6E64] uppercase tracking-wider">
              Population exposure
            </div>
            <div className="text-2xl font-semibold text-[#1B2520] tabular-nums mt-0.5">
              {region.metrics.populationExposed.toLocaleString()}
            </div>
            <div className="text-[12px] text-[#5D6E64] mt-0.5">
              Residents in high-vulnerability communities
            </div>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#FBF3E4] border border-[#E5CD9C] flex items-center justify-center text-[#B45309] shrink-0">
            <Wheat className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[#5D6E64] uppercase tracking-wider">
              Agriculture affected
            </div>
            <div className="text-2xl font-semibold text-[#1B2520] tabular-nums mt-0.5">
              {region.metrics.croplandImpactedHa.toLocaleString()} ha
            </div>
            <div className="text-[12px] text-[#5D6E64] mt-0.5">
              Standing crops at risk of loss
            </div>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#EBF1FB] border border-[#BCCFEB] flex items-center justify-center text-[#2563EB] shrink-0">
            <Droplets className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[#5D6E64] uppercase tracking-wider">
              Flood severity
            </div>
            <div className="text-2xl font-semibold text-[#1B2520] tabular-nums mt-0.5">
              {region.riskBreakdown.floodSeverity} / 100
            </div>
            <div className="text-[12px] text-[#5D6E64] mt-0.5">
              Based on extent, depth and exposure
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Flood extent viewer + explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <div className="relative rounded-2xl overflow-hidden border border-[#E3E9E3] bg-white shadow-[0_1px_3px_rgba(27,37,32,0.06)] h-[460px]">
            {imgError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#F7F8F5]">
                <AlertTriangle className="w-8 h-8 text-[#B3261E] mb-2" aria-hidden="true" />
                <div className="text-sm font-semibold text-[#1B2520]">Satellite image unavailable</div>
                <p className="text-[13px] text-[#5D6E64] mt-1 max-w-sm">
                  The flood observation layer could not be loaded.
                </p>
                <button
                  onClick={() => { setImgError(false); setImgLoaded(false); }}
                  className="mt-3 px-4 py-2 bg-[#1E5641] hover:bg-[#15402F] text-white text-[13px] font-semibold rounded-lg cursor-pointer transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : (
              <img
                src={currentImgUrl}
                alt="Flood extent satellite observation"
                className="w-full h-full object-cover transition-opacity duration-300"
                style={{ opacity: imgLoaded ? (activeViewMode === 'mask' ? 0.75 : 1) : 0 }}
                onLoad={() => setImgLoaded(true)}
                onError={(e) => {
                  setImgError(true);
                  logImageError('FloodIntelligenceView', currentImgUrl, e);
                }}
              />
            )}

            {activeViewMode === 'mask' && !imgError && (
              <div className="absolute inset-0 bg-[#2563EB]/30 mix-blend-color-dodge pointer-events-none" />
            )}

            {!imgLoaded && !imgError && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#F4F6F2]/85 text-[#5D6E64] text-sm gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#1E5641]" aria-hidden="true" />
                <span>Loading satellite observation…</span>
              </div>
            )}

            {/* View switcher */}
            <div
              className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-white/95 border border-[#E3E9E3] rounded-lg p-1 text-[12px] font-medium shadow-sm"
              role="tablist"
              aria-label="Flood imagery view"
            >
              {([
                ['sar', 'Radar (SAR)'],
                ['optical', 'Optical'],
                ['mask', 'Flood extent'],
              ] as const).map(([mode, label]) => (
                <button
                  key={mode}
                  role="tab"
                  aria-selected={activeViewMode === mode}
                  onClick={() => setActiveViewMode(mode)}
                  className={`px-3 py-1.5 rounded-md transition-colors duration-200 cursor-pointer ${
                    activeViewMode === mode
                      ? 'bg-[#EBF1FB] text-[#1D4ED8] font-semibold'
                      : 'text-[#5D6E64] hover:text-[#1B2520]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="absolute bottom-3 left-3 z-10 bg-white/95 border border-[#E3E9E3] rounded-lg px-3 py-1.5 text-[12px] text-[#5D6E64] flex items-center gap-4 shadow-sm">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#2563EB] inline-block" aria-hidden="true" />
                Deep standing water
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#D97706] inline-block" aria-hidden="true" />
                Shallow waterlogging
              </span>
            </div>
          </div>
        </div>

        {/* Explanation + actions */}
        <div className="lg:col-span-4 space-y-4">
          <GlassCard glow className="space-y-4">
            <div className="text-[15px] font-semibold text-[#1B2520]">
              What the satellites show
            </div>

            <p className="text-[13px] text-[#5D6E64] leading-relaxed">
              Satellite observations indicate significant surface-water expansion across the
              alluvial plains of {region.name}: about {region.metrics.floodAreaKm2.toLocaleString()} km²
              of deep standing water, cutting off access roads and waterlogging roughly{' '}
              {region.metrics.croplandImpactedHa.toLocaleString()} hectares of standing crops.
            </p>

            <div className="pt-3 border-t border-[#EDF1EC] space-y-2.5">
              <div className="text-[13px] font-semibold text-[#1B2520]">Recommended actions</div>
              {region.adaptationActions.map((action, i) => (
                <div key={i} className="flex items-start gap-2 text-[13px] text-[#5D6E64]">
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#1E5641] shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="leading-snug">{action}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Methodology (collapsible) */}
          <GlassCard>
            <button
              onClick={() => setMethodOpen(!methodOpen)}
              aria-expanded={methodOpen}
              className="w-full flex items-center justify-between cursor-pointer"
            >
              <span className="text-[14px] font-semibold text-[#1B2520]">View methodology</span>
              <ChevronDown
                className={`w-4 h-4 text-[#5D6E64] transition-transform duration-200 ${methodOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>
            {methodOpen && (
              <div className="mt-4 space-y-2 text-[13px] text-[#5D6E64]">
                <p className="leading-relaxed">
                  Sentinel-1 radar (C-band, VV+VH polarization, Interferometric Wide swath)
                  measures how strongly the surface reflects microwave signals. Standing water
                  reflects almost nothing back (backscatter below −16.2 dB), which lets the
                  model map water even through cloud cover. Results are validated against the
                  Sen1Floods11 ground-truth dataset.
                </p>
                <div className="pt-2 border-t border-[#EDF1EC] space-y-1.5">
                  <div className="flex justify-between"><span>Satellite</span><span className="text-[#1B2520] font-medium">Sentinel-1A</span></div>
                  <div className="flex justify-between"><span>Detection confidence</span><span className="text-[#1B2520] font-medium">{Math.round(region.metrics.confidence * 100)}%</span></div>
                  <div className="flex justify-between"><span>Benchmark</span><span className="text-[#1B2520] font-medium">Sen1Floods11</span></div>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
