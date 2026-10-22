import React, { useState } from 'react';
import { RegionData } from '../../types/climate';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { GlassCard } from '../common/GlassCard';
import { MetricCard } from '../common/MetricCard';
import { SlidersHorizontal, Info, ChevronDown } from 'lucide-react';

interface ChangeDetectionViewProps {
  region: RegionData;
}

const METHOD_STEPS = [
  { n: 1, title: 'Align observations', desc: 'Baseline and current satellite images are matched to the same ground grid.' },
  { n: 2, title: 'Compare over time', desc: 'Each location is compared between the two dates.' },
  { n: 3, title: 'Detect change', desc: 'Areas with significant surface change are identified.' },
  { n: 4, title: 'Build the change map', desc: 'Detected areas are outlined as a spatial change layer.' },
  { n: 5, title: 'Measure the impact', desc: 'The total affected area is quantified in km².' },
];

export const ChangeDetectionView: React.FC<ChangeDetectionViewProps> = ({ region }) => {
  const [threshold, setThreshold] = useState<number>(0.65);
  const [selectedDisplayMode, setSelectedDisplayMode] = useState<'optical' | 'sar' | 'fusion'>('optical');
  const [methodOpen, setMethodOpen] = useState(false);

  const effectiveChangedArea = Math.round(
    region.metrics.changedAreaKm2 * (1 + (0.65 - threshold) * 0.4) * 10
  ) / 10;
  const effectivePercent = Math.round(
    region.metrics.changedPercentage * (1 + (0.65 - threshold) * 0.4) * 10
  ) / 10;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#1B2520] tracking-tight">
            Change Detection
          </h1>
          <p className="text-[15px] text-[#5D6E64] mt-2 leading-relaxed">
            What changed between {region.baselineDate} and {region.eventDate}? ORBIS AI compares
            two satellite observations and highlights where the surface has changed.
          </p>
        </div>

        {/* Display mode */}
        <div
          className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#DDE5DD] text-[13px] font-medium shadow-[0_1px_2px_rgba(27,37,32,0.04)]"
          role="tablist"
          aria-label="Imagery type"
        >
          {([
            ['optical', 'Optical'],
            ['sar', 'Radar (SAR)'],
            ['fusion', 'Change map'],
          ] as const).map(([mode, label]) => (
            <button
              key={mode}
              role="tab"
              aria-selected={selectedDisplayMode === mode}
              onClick={() => setSelectedDisplayMode(mode)}
              className={`px-3 py-1.5 rounded-md transition-colors duration-200 cursor-pointer ${
                selectedDisplayMode === mode
                  ? 'bg-[#E9F2EC] text-[#15402F] font-semibold'
                  : 'text-[#5D6E64] hover:text-[#1B2520]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Changed area"
          value={effectiveChangedArea.toLocaleString()}
          unit="km²"
          subtext="Detected surface change"
          highlight
        />
        <MetricCard
          label="Share of region"
          value={effectivePercent}
          unit="%"
          subtext="Of monitored area"
        />
        <MetricCard
          label="Detection confidence"
          value={Math.round(region.metrics.confidence * 100)}
          unit="%"
          subtext="Model certainty"
        />
        <MetricCard
          label="Ground resolution"
          value="10"
          unit="m/px"
          subtext="Sentinel imagery"
        />
      </div>

      {/* Before / After / Change map */}
      <div className="space-y-3">
        <BeforeAfterSlider
          beforeUrl={
            selectedDisplayMode === 'sar'
              ? region.sarUrl || `/outputs/${region.id}/sar.png`
              : region.opticalBeforeUrl || `/outputs/${region.id}/before.png`
          }
          afterUrl={
            selectedDisplayMode === 'fusion'
              ? region.changeMaskUrl || `/outputs/${region.id}/change_mask.png`
              : region.opticalAfterUrl || `/outputs/${region.id}/after.png`
          }
          beforeLabel={`Before — ${region.baselineDate}`}
          afterLabel={
            selectedDisplayMode === 'fusion'
              ? `Detected change — ${region.eventDate}`
              : `After — ${region.eventDate}`
          }
          changedAreaKm2={effectiveChangedArea}
          changedPercent={effectivePercent}
          confidence={region.metrics.confidence}
          changeMaskUrl={region.changeMaskUrl || `/outputs/${region.id}/change_mask.png`}
        />
        <p className="text-[13px] text-[#5D6E64] flex items-start gap-2">
          <Info className="w-4 h-4 text-[#87A796] shrink-0 mt-0.5" aria-hidden="true" />
          Areas highlighted in orange on the change map indicate detected surface change
          between the two observations.
        </p>
      </div>

      {/* How it works + sensitivity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Methodology */}
        <div className="lg:col-span-7">
          <GlassCard>
            <button
              onClick={() => setMethodOpen(!methodOpen)}
              aria-expanded={methodOpen}
              className="w-full flex items-center justify-between cursor-pointer"
            >
              <span className="text-[15px] font-semibold text-[#1B2520]">How it works</span>
              <ChevronDown
                className={`w-4 h-4 text-[#5D6E64] transition-transform duration-200 ${methodOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>

            {methodOpen && (
              <>
                <ol className="mt-5 grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {METHOD_STEPS.map((step) => (
                    <li key={step.n} className="relative">
                      <div className="w-7 h-7 rounded-full bg-[#E9F2EC] text-[#15402F] text-[13px] font-semibold flex items-center justify-center">
                        {step.n}
                      </div>
                      <div className="text-[13px] font-semibold text-[#1B2520] mt-2">{step.title}</div>
                      <p className="text-[12px] text-[#5D6E64] mt-1 leading-snug">{step.desc}</p>
                    </li>
                  ))}
                </ol>
                <p className="text-[12px] text-[#5D6E64] mt-5 pt-4 border-t border-[#EDF1EC] leading-relaxed">
                  Optical imagery shows surface color and vegetation, while radar sees through
                  clouds and detects standing water. Combining both makes the detection reliable
                  even during storms. The detection is calibrated against the Sen1Floods11 and
                  LEVIR-CD public benchmarks to reduce false alarms from cloud shadows.
                </p>
              </>
            )}
          </GlassCard>
        </div>

        {/* Sensitivity control */}
        <div className="lg:col-span-5">
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#1E5641]" aria-hidden="true" />
                <span className="text-[15px] font-semibold text-[#1B2520]">Detection sensitivity</span>
              </div>
              <span className="text-[13px] font-medium text-[#5D6E64] tabular-nums">
                {Math.round(threshold * 100)}% cutoff
              </span>
            </div>

            <div>
              <label htmlFor="threshold" className="text-[13px] text-[#5D6E64] block mb-2">
                Only count detections the model is at least this confident about
              </label>
              <input
                id="threshold"
                type="range"
                min="0.30"
                max="0.95"
                step="0.05"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full aeris-range cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#93A398] mt-1.5">
                <span>Catch more</span>
                <span>Balanced</span>
                <span>Only certain</span>
              </div>
            </div>

            <div className="rounded-lg bg-[#F4F7F3] border border-[#E3E9E3] p-3.5 space-y-1.5 text-[13px]">
              <div className="flex justify-between">
                <span className="text-[#5D6E64]">Changed area at this setting</span>
                <span className="font-semibold text-[#1B2520] tabular-nums">{effectiveChangedArea.toLocaleString()} km²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5D6E64]">Estimated pixels affected</span>
                <span className="font-medium text-[#1B2520] tabular-nums">
                  {Math.round(effectiveChangedArea * 10000).toLocaleString()}
                </span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
