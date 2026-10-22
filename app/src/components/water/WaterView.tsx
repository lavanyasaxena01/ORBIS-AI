import React, { useState } from 'react';
import { RegionData } from '../../types/climate';
import { GlassCard } from '../common/GlassCard';
import { MetricCard } from '../common/MetricCard';
import { getAssetUrl, logImageError } from '../../lib/assetUrl';
import { AlertTriangle, Loader2, ChevronDown, Info } from 'lucide-react';

interface WaterViewProps {
  region: RegionData;
}

export const WaterView: React.FC<WaterViewProps> = ({ region }) => {
  const isExpansion = region.metrics.ndwiChangePercent > 0;
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);

  const resolvedUrl = getAssetUrl(region.opticalAfterUrl);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="max-w-2xl">
        <h1 className="text-3xl lg:text-4xl font-bold text-[#1B2520] tracking-tight">
          Surface Water
        </h1>
        <p className="text-[15px] text-[#5D6E64] mt-2 leading-relaxed">
          How water bodies across the region are expanding or receding, measured from
          satellite observations.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Water index before"
          value={region.metrics.ndwiBefore.toFixed(2)}
          subtext="Baseline observation"
        />
        <MetricCard
          label="Water index after"
          value={region.metrics.ndwiAfter.toFixed(2)}
          subtext="Latest observation"
          highlight
        />
        <MetricCard
          label="Change"
          value={region.metrics.ndwiChangePercent > 0 ? `+${region.metrics.ndwiChangePercent}` : region.metrics.ndwiChangePercent}
          unit="%"
          delta={{
            value: isExpansion ? 'Water expansion' : 'Water recession',
            isNegativeBad: !isExpansion,
          }}
          subtext="Surface water dynamics"
        />
        <MetricCard
          label="Open water extent"
          value={region.metrics.floodAreaKm2.toLocaleString()}
          unit="km²"
          subtext="Mapped surface water"
        />
      </div>

      <GlassCard className="flex items-start gap-3">
        <Info className="w-[18px] h-[18px] text-[#87A796] shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="text-[14px] text-[#1B2520] leading-relaxed">
            NDWI is a satellite-derived indicator of open water. Positive values mark lakes,
            rivers and flooded areas; strongly negative shifts can signal drought and drying.
          </p>
          <button
            onClick={() => setCalcOpen(!calcOpen)}
            aria-expanded={calcOpen}
            className="mt-2 text-[13px] font-medium text-[#1E5641] hover:text-[#15402F] hover:underline cursor-pointer"
          >
            {calcOpen ? 'Hide calculation' : 'View calculation'}
          </button>
          {calcOpen && (
            <div className="mt-3 p-3.5 rounded-lg bg-[#F4F7F3] border border-[#E3E9E3] font-mono text-[13px] text-[#1B2520]">
              <div className="font-semibold">NDWI = (GREEN − NIR) / (GREEN + NIR)</div>
              <div className="text-[12px] text-[#5D6E64] mt-1 font-sans">
                Computed from Sentinel-2 green (Band 3) and near-infrared (Band 8) reflectance.
                Water reflects green light but absorbs near-infrared, so open water produces
                positive NDWI values.
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Viewer + implications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <div className="relative rounded-2xl overflow-hidden border border-[#E3E9E3] bg-white shadow-[0_1px_3px_rgba(27,37,32,0.06)] h-[440px]">
            {imgError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#F7F8F5]">
                <AlertTriangle className="w-8 h-8 text-[#2563EB] mb-2" aria-hidden="true" />
                <div className="text-sm font-semibold text-[#1B2520]">Satellite image unavailable</div>
                <p className="text-[13px] text-[#5D6E64] mt-1 max-w-sm">
                  The surface-water observation layer could not be loaded.
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
                src={resolvedUrl}
                alt="Surface water extent from satellite observation"
                className="w-full h-full object-cover transition-opacity duration-300"
                style={{ opacity: imgLoaded ? 1 : 0 }}
                onLoad={() => setImgLoaded(true)}
                onError={(e) => {
                  setImgError(true);
                  logImageError('WaterView', resolvedUrl, e);
                }}
              />
            )}

            {!imgLoaded && !imgError && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#F4F6F2]/85 text-[#5D6E64] text-sm gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#1E5641]" aria-hidden="true" />
                <span>Loading water observation…</span>
              </div>
            )}

            {!imgError && <div className="absolute inset-0 bg-[#2563EB]/25 mix-blend-color pointer-events-none" />}

            <div className="absolute bottom-3 left-3 z-10 bg-white/95 border border-[#E3E9E3] rounded-lg px-3 py-2 text-[12px] text-[#5D6E64] shadow-sm">
              <span className="font-semibold text-[#1B2520]">How to read this: </span>
              blue shading marks likely open water — lakes, rivers and flooded basins.
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <GlassCard className="space-y-3">
            <div className="text-[15px] font-semibold text-[#1B2520]">Current situation</div>
            <dl className="space-y-2 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-[#5D6E64]">Hydrological state</dt>
                <dd className="font-medium text-[#1B2520]">
                  {isExpansion ? 'Water expansion' : 'Water recession'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#5D6E64]">Primary driver</dt>
                <dd className="font-medium text-[#1B2520]">{region.primaryHazard}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#5D6E64]">Observed extent</dt>
                <dd className="font-medium text-[#1B2520] tabular-nums">{region.metrics.floodAreaKm2.toLocaleString()} km²</dd>
              </div>
            </dl>
          </GlassCard>

          <GlassCard className="space-y-2.5">
            <div className="text-[15px] font-semibold text-[#1B2520]">Why it matters</div>
            <p className="text-[13px] text-[#5D6E64] leading-relaxed">
              Rapid changes in surface water disrupt the regional water balance. Sustained
              standing water raises the risk of waterborne disease and damages infrastructure,
              while persistent recession threatens drinking water, fishing and irrigation.
              These observations guide drainage management and water-resource planning.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
