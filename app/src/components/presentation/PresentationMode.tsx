import React, { useState } from 'react';
import { RegionData } from '../../types/climate';
import { ClimateRiskBadge } from '../common/ClimateRiskBadge';
import { getAssetUrl, logImageError } from '../../lib/assetUrl';
import {
  Globe2,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

interface PresentationModeProps {
  region: RegionData;
  onExit: () => void;
}

const SLIDES = [
  {
    step: 1,
    title: 'Observing the Earth',
    subtitle: 'Frequent satellite coverage, day and night',
    tag: 'Satellite observations',
  },
  {
    step: 2,
    title: 'Detecting change',
    subtitle: 'Comparing before and after the event',
    tag: 'Change detection',
  },
  {
    step: 3,
    title: 'Measuring the impact',
    subtitle: 'Flooded area, vegetation stress and people affected',
    tag: 'Impact',
  },
  {
    step: 4,
    title: 'Scoring the risk',
    subtitle: 'A clear 0–100 score anyone can understand',
    tag: 'Risk assessment',
  },
  {
    step: 5,
    title: 'Acting on the evidence',
    subtitle: 'Prioritized recommendations for response teams',
    tag: 'Climate action',
  },
];

export const PresentationMode: React.FC<PresentationModeProps> = ({ region, onExit }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slide = SLIDES[currentSlide];

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onExit();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#F4F6F2] text-[#1B2520] flex flex-col justify-between p-6 lg:p-12 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="ORBIS AI presentation"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-[#E3E9E3] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#1E5641] flex items-center justify-center text-white">
            <Globe2 className="w-4.5 h-4.5 w-[18px] h-[18px]" aria-hidden="true" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-[#1B2520]">
              ORBIS AI
            </div>
            <div className="text-xs text-[#5D6E64]">
              From satellite data to climate action
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs text-[#5D6E64] tabular-nums">
            {currentSlide + 1} / {SLIDES.length}
          </div>
          <button
            onClick={onExit}
            className="p-2 rounded-lg bg-white hover:bg-[#F0F4EF] border border-[#DDE5DD] text-[#5D6E64] hover:text-[#1B2520] transition-colors cursor-pointer"
            title="Exit presentation"
            aria-label="Exit presentation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Slide stage */}
      <div className="flex-1 flex items-center justify-center py-6">
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Text */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-block text-[11px] font-semibold uppercase tracking-wider text-[#1E5641] bg-[#E9F2EC] px-2.5 py-1 rounded-full">
              {slide.tag}
            </div>

            <h2 className="text-3xl lg:text-4xl font-bold text-[#1B2520] tracking-tight leading-tight">
              {slide.title}
            </h2>
            <p className="text-[#5D6E64] text-sm">
              {slide.subtitle}
            </p>

            {currentSlide === 0 && (
              <div className="space-y-3 text-sm text-[#37453D] leading-relaxed">
                <p>
                  ORBIS AI monitors <strong>{region.name}</strong> using optical and radar
                  satellites. Optical imagery shows vegetation and land cover; radar sees
                  through clouds and rain to find standing water.
                </p>
                <div className="p-3.5 rounded-lg bg-white border border-[#E3E9E3] text-[12px] text-[#5D6E64]">
                  Last observation: {region.lastObserved} · {region.sensorPlatforms.join(' · ')}
                </div>
              </div>
            )}

            {currentSlide === 1 && (
              <div className="space-y-3 text-sm text-[#37453D] leading-relaxed">
                <p>
                  By aligning the baseline and post-event observations, ORBIS AI isolates real
                  surface change from seasonal noise and cloud shadows.
                </p>
                <div className="p-3.5 rounded-lg bg-[#FBF3E4] border border-[#E5CD9C] text-[13px] font-semibold text-[#92520A]">
                  Changed area: {region.metrics.changedAreaKm2.toLocaleString()} km² ({region.metrics.changedPercentage}% of the region)
                </div>
              </div>
            )}

            {currentSlide === 2 && (
              <div className="space-y-3 text-sm text-[#37453D] leading-relaxed">
                <p>Raw change is translated into indicators people can act on:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#2563EB]" aria-hidden="true" />
                    Flood impact: <strong>{region.metrics.floodAreaKm2.toLocaleString()} km²</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#B3261E]" aria-hidden="true" />
                    Vegetation change: <strong>{region.metrics.ndviChangePercent}%</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#B45309]" aria-hidden="true" />
                    Population exposed: <strong>{region.metrics.populationExposed.toLocaleString()}</strong>
                  </li>
                </ul>
              </div>
            )}

            {currentSlide === 3 && (
              <div className="space-y-3 text-sm text-[#37453D] leading-relaxed">
                <p>
                  Five weighted indicators combine into one explainable score — so officials,
                  NGOs and insurers can trust and verify it.
                </p>
                <div className="flex items-center gap-3">
                  <ClimateRiskBadge level={region.metrics.riskLevel} score={region.metrics.riskScore} size="lg" />
                </div>
              </div>
            )}

            {currentSlide === 4 && (
              <div className="space-y-3 text-sm text-[#37453D] leading-relaxed">
                <p>Every assessment ends with clear, prioritized actions:</p>
                <div className="space-y-2">
                  {region.adaptationActions.slice(0, 3).map((act, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1D7A46] shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="text-[13px]">{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Visual */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl overflow-hidden border border-[#E3E9E3] bg-white h-[360px] lg:h-[440px] shadow-lg">
              <img
                key={currentSlide}
                src={getAssetUrl(
                  currentSlide === 0
                    ? region.opticalBeforeUrl
                    : currentSlide === 1
                    ? region.sarUrl
                    : region.opticalAfterUrl
                )}
                alt="Satellite observation for this presentation step"
                className="w-full h-full object-cover transition-opacity duration-300"
                onError={(e) => {
                  logImageError(
                    'PresentationMode',
                    getAssetUrl(
                      currentSlide === 0
                        ? region.opticalBeforeUrl
                        : currentSlide === 1
                        ? region.sarUrl
                        : region.opticalAfterUrl
                    ),
                    e
                  );
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B2520]/45 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[13px] text-white bg-[#1B2520]/55 backdrop-blur-sm px-3.5 py-2.5 rounded-lg">
                <span className="font-medium">{region.name}</span>
                <span className="font-semibold">{region.primaryHazard}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="flex items-center justify-between border-t border-[#E3E9E3] pt-4">
        <button
          onClick={handlePrev}
          disabled={currentSlide === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-[#F0F4EF] border border-[#DDE5DD] text-[13px] font-medium text-[#5D6E64] disabled:opacity-40 cursor-pointer transition-colors"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${
                i === currentSlide ? 'bg-[#1E5641] w-6' : 'bg-[#C9D6CC] w-2'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#1E5641] hover:bg-[#15402F] text-white font-semibold text-[13px] cursor-pointer transition-colors shadow-[0_1px_2px_rgba(27,37,32,0.12)]"
        >
          <span>{currentSlide === SLIDES.length - 1 ? 'Finish' : 'Next'}</span>
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
