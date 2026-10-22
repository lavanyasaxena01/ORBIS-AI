import React from 'react';
import { GlassCard } from '../common/GlassCard';
import {
  LifeBuoy,
  Wheat,
  Trees,
  Droplets,
  ClipboardList,
  Target,
  ArrowRight,
} from 'lucide-react';

const IMPACT_AREAS = [
  {
    icon: Droplets,
    title: 'Climate monitoring',
    desc: 'Continuous tracking of floods, drought and land-surface change from satellite observations.',
  },
  {
    icon: LifeBuoy,
    title: 'Disaster preparedness',
    desc: 'Flood extent and population exposure maps help emergency teams act within hours, not weeks.',
  },
  {
    icon: Wheat,
    title: 'Agricultural resilience',
    desc: 'Vegetation stress detection supports farmers, food-security planning and crop insurance.',
  },
  {
    icon: Trees,
    title: 'Ecosystem monitoring',
    desc: 'Early detection of deforestation and ecosystem degradation before damage becomes irreversible.',
  },
  {
    icon: ClipboardList,
    title: 'Resource planning',
    desc: 'Evidence-based reports help governments and NGOs direct funding where it matters most.',
  },
];

export const MarketImpactView: React.FC = () => {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="max-w-2xl">
        <h1 className="text-3xl lg:text-4xl font-bold text-[#1B2520] tracking-tight">
          Why it matters
        </h1>
        <p className="text-[15px] text-[#5D6E64] mt-2 leading-relaxed">
          ORBIS AI turns satellite observations into timely, explainable climate intelligence —
          supporting the UN Sustainable Development Goals, above all Climate Action.
        </p>
      </div>

      {/* SDG 13 hero */}
      <GlassCard glow className="flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-[#1E5641] flex items-center justify-center text-white shrink-0">
          <Target className="w-8 h-8" aria-hidden="true" />
        </div>
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-wider text-[#1E5641]">
            UN Sustainable Development Goal 13
          </div>
          <h2 className="text-2xl font-bold text-[#1B2520] mt-1 tracking-tight">Climate Action</h2>
          <p className="text-[14px] text-[#5D6E64] mt-2 leading-relaxed max-w-2xl">
            Take urgent action to combat climate change and its impacts. ORBIS AI contributes by
            strengthening resilience and adaptive capacity: integrating satellite-based early
            warning into planning, and improving awareness of climate hazards as they unfold.
          </p>
        </div>
      </GlassCard>

      {/* How ORBIS AI supports climate action */}
      <section>
        <h2 className="text-xl font-semibold text-[#1B2520] mb-4">How ORBIS AI supports climate action</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {IMPACT_AREAS.map((area) => {
            const Icon = area.icon;
            return (
              <GlassCard key={area.title} className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#E9F2EC] border border-[#CFE0D3] flex items-center justify-center text-[#1E5641]">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="text-[15px] font-semibold text-[#1B2520]">{area.title}</h3>
                <p className="text-[13px] text-[#5D6E64] leading-relaxed">{area.desc}</p>
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* From observation to action */}
      <section>
        <h2 className="text-xl font-semibold text-[#1B2520] mb-4">From observation to action</h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {[
            { n: 1, title: 'Observe', desc: 'Satellites image the region on a regular cadence.' },
            { n: 2, title: 'Detect', desc: 'ORBIS AI finds flood, vegetation and land change.' },
            { n: 3, title: 'Measure', desc: 'Impacts are quantified in km², hectares and people.' },
            { n: 4, title: 'Explain', desc: 'The AI analyst explains what changed and why.' },
            { n: 5, title: 'Act', desc: 'Teams receive clear, prioritized recommendations.' },
          ].map((step, i, arr) => (
            <div
              key={step.n}
              className="relative p-4 rounded-xl bg-white border border-[#E3E9E3]"
            >
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-full bg-[#E9F2EC] text-[#15402F] text-[13px] font-semibold flex items-center justify-center">
                  {step.n}
                </div>
                {i < arr.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-[#C9D6CC] hidden sm:block" aria-hidden="true" />
                )}
              </div>
              <div className="text-[14px] font-semibold text-[#1B2520] mt-3">{step.title}</div>
              <p className="text-[12px] text-[#5D6E64] mt-1 leading-snug">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Additional goals */}
      <section>
        <h2 className="text-xl font-semibold text-[#1B2520] mb-4">Additional goals supported</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: 'SDG 6', title: 'Clean Water & Sanitation', desc: 'Tracking freshwater bodies, flood contamination and lake contraction.' },
            { id: 'SDG 11', title: 'Sustainable Cities', desc: 'Reducing disaster impact on communities through earlier warning.' },
            { id: 'SDG 15', title: 'Life on Land', desc: 'Detecting deforestation and protecting degraded ecosystems.' },
          ].map((sdg) => (
            <GlassCard key={sdg.id} className="space-y-2">
              <div className="text-[12px] font-bold text-[#1E5641]">{sdg.id}</div>
              <h3 className="text-[15px] font-semibold text-[#1B2520]">{sdg.title}</h3>
              <p className="text-[13px] text-[#5D6E64] leading-relaxed">{sdg.desc}</p>
            </GlassCard>
          ))}
        </div>
        <p className="text-[12px] text-[#93A398] mt-4">
          Impact descriptions are illustrative, based on the coverage capabilities of the
          Sentinel satellite missions.
        </p>
      </section>
    </div>
  );
};
