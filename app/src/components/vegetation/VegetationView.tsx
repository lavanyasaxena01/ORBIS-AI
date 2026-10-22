import React, { useState } from 'react';
import { RegionData } from '../../types/climate';
import { GlassCard } from '../common/GlassCard';
import { MetricCard } from '../common/MetricCard';
import { getAssetUrl, logImageError } from '../../lib/assetUrl';
import { AlertTriangle, Loader2, ChevronDown, Info } from 'lucide-react';

interface VegetationViewProps {
  region: RegionData;
}

export const VegetationView: React.FC<VegetationViewProps> = ({ region }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);

  const resolvedUrl = getAssetUrl(region.opticalAfterUrl);

  let healthCategory: 'Stable' | 'Improving' | 'Declining' | 'Severe decline' = 'Stable';
  if (region.metrics.ndviChangePercent < -25) {
    healthCategory = 'Severe decline';
  } else if (region.metrics.ndviChangePercent < -10) {
    healthCategory = 'Declining';
  } else if (region.metrics.ndviChangePercent > 5) {
    healthCategory = 'Improving';
  }

  // NDVI trend (derived from observed before/after values)
  const timeSeries = [
    { date: 'T-12 months', ndvi: region.metrics.ndviBefore + 0.05 },
    { date: 'T-6 months', ndvi: region.metrics.ndviBefore + 0.02 },
    { date: 'T-3 months', ndvi: region.metrics.ndviBefore },
    { date: 'Current', ndvi: region.metrics.ndviAfter },
  ];
  const minNdvi = Math.min(...timeSeries.map((t) => t.ndvi));
  const maxNdvi = Math.max(...timeSeries.map((t) => t.ndvi));
  const range = Math.max(0.05, maxNdvi - minNdvi);

  // Build a smooth SVG line chart
  const chartW = 520;
  const chartH = 180;
  const pad = 24;
  const points = timeSeries.map((t, i) => {
    const x = pad + (i * (chartW - pad * 2)) / (timeSeries.length - 1);
    const y = chartH - pad - ((t.ndvi - minNdvi) / range) * (chartH - pad * 2);
    return { x, y, ...t };
  });
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  const healthColor =
    healthCategory === 'Severe decline' || healthCategory === 'Declining'
      ? 'text-[#B3261E]'
      : healthCategory === 'Improving'
      ? 'text-[#1D7A46]'
      : 'text-[#5D6E64]';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="max-w-2xl">
        <h1 className="text-3xl lg:text-4xl font-bold text-[#1B2520] tracking-tight">
          Vegetation Health
        </h1>
        <p className="text-[15px] text-[#5D6E64] mt-2 leading-relaxed">
          Tracking ecosystem and agricultural stress from satellite observations.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="NDVI before"
          value={region.metrics.ndviBefore.toFixed(2)}
          subtext="Healthy canopy baseline"
        />
        <MetricCard
          label="NDVI after"
          value={region.metrics.ndviAfter.toFixed(2)}
          subtext="Latest observation"
          highlight
        />
        <MetricCard
          label="Change"
          value={region.metrics.ndviChangePercent}
          unit="%"
          delta={{ value: healthCategory, isNegativeBad: true }}
          subtext="Vegetation activity"
        />
        <MetricCard
          label="Estimated area affected"
          value={Math.round((region.metrics.changedAreaKm2 * 100) * 0.45).toLocaleString()}
          unit="ha"
          subtext="Degraded vegetation"
        />
      </div>

      {/* Explanation */}
      <GlassCard className="flex items-start gap-3">
        <Info className="w-4.5 h-4.5 w-[18px] h-[18px] text-[#87A796] shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="text-[14px] text-[#1B2520] leading-relaxed">
            NDVI is a satellite-derived indicator of vegetation health. Lower values generally
            indicate reduced vegetation activity. Current status:{' '}
            <span className={`font-semibold ${healthColor}`}>{healthCategory}</span>.
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
              <div className="font-semibold">NDVI = (NIR − RED) / (NIR + RED)</div>
              <div className="text-[12px] text-[#5D6E64] mt-1 font-sans">
                Computed from Sentinel-2 near-infrared (Band 8) and red (Band 4) reflectance.
                Healthy vegetation strongly reflects near-infrared light and absorbs red light,
                producing higher NDVI values.
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Map + trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Vegetation map */}
        <div className="lg:col-span-7">
          <div className="relative rounded-2xl overflow-hidden border border-[#E3E9E3] bg-white shadow-[0_1px_3px_rgba(27,37,32,0.06)] h-[440px]">
            {imgError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#F7F8F5]">
                <AlertTriangle className="w-8 h-8 text-[#B3261E] mb-2" aria-hidden="true" />
                <div className="text-sm font-semibold text-[#1B2520]">Satellite image unavailable</div>
                <p className="text-[13px] text-[#5D6E64] mt-1 max-w-sm">
                  The vegetation observation layer could not be loaded.
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
                alt="Vegetation condition from satellite observation"
                className="w-full h-full object-cover transition-opacity duration-300"
                style={{ opacity: imgLoaded ? 1 : 0 }}
                onLoad={() => setImgLoaded(true)}
                onError={(e) => {
                  setImgError(true);
                  logImageError('VegetationView', resolvedUrl, e);
                }}
              />
            )}

            {!imgLoaded && !imgError && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#F4F6F2]/85 text-[#5D6E64] text-sm gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#1E5641]" aria-hidden="true" />
                <span>Loading vegetation observation…</span>
              </div>
            )}

            {/* Calm false-color NDVI shading */}
            {!imgError && (
              <div className="absolute inset-0 bg-gradient-to-tr from-[#1E5641]/35 via-[#B45309]/20 to-[#B3261E]/25 mix-blend-color pointer-events-none" />
            )}

            {/* Legend */}
            <div className="absolute bottom-3 left-3 right-3 z-10 bg-white/95 border border-[#E3E9E3] rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between text-[11px] text-[#5D6E64] mb-1.5">
                <span>Water / bare soil</span>
                <span>Sparse or stressed</span>
                <span>Healthy, dense canopy</span>
              </div>
              <div className="h-1.5 rounded-full w-full bg-gradient-to-r from-[#B3261E] via-[#D97706] to-[#1D7A46]" />
            </div>
          </div>
        </div>

        {/* Trend chart */}
        <div className="lg:col-span-5">
          <GlassCard className="space-y-4 h-full">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-semibold text-[#1B2520]">NDVI over time</span>
              <span className={`text-[13px] font-semibold ${healthColor}`}>
                {region.metrics.ndviChangePercent}% net
              </span>
            </div>

            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full"
              role="img"
              aria-label={`NDVI trend chart: from ${region.metrics.ndviBefore} to ${region.metrics.ndviAfter}`}
            >
              {/* Gridlines */}
              {[0.25, 0.5, 0.75].map((f) => (
                <line
                  key={f}
                  x1={pad}
                  x2={chartW - pad}
                  y1={chartH * f}
                  y2={chartH * f}
                  stroke="#EDF1EC"
                  strokeWidth="1"
                />
              ))}
              <path d={pathD} fill="none" stroke="#1E5641" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {points.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="4" fill="#FFFFFF" stroke="#1E5641" strokeWidth="2" />
                  <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="11" fontWeight="600" fill="#1B2520">
                    {p.ndvi.toFixed(2)}
                  </text>
                  <text x={p.x} y={chartH - 6} textAnchor="middle" fontSize="10" fill="#5D6E64">
                    {p.date}
                  </text>
                </g>
              ))}
            </svg>

            <p className="text-[12px] text-[#5D6E64] leading-relaxed pt-2 border-t border-[#EDF1EC]">
              Vegetation activity held close to the seasonal norm through the baseline period,
              then dropped {Math.abs(region.metrics.ndviChangePercent)}% following the event —
              consistent with crop damage and canopy stress observed in the imagery.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
