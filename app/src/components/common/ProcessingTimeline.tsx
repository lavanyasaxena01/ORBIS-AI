import React, { useEffect, useState } from 'react';
import { Database, Eye, Cpu, Calculator, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

interface ProcessingTimelineProps {
  onComplete?: () => void;
  durationMs?: number;
}

const STEPS = [
  { id: 'ingest', label: 'Collecting satellite data', desc: 'Retrieving the latest Sentinel-1 radar and Sentinel-2 optical observations', icon: Database },
  { id: 'coregister', label: 'Aligning observations', desc: 'Aligning the baseline and current imagery to the same ground grid', icon: Eye },
  { id: 'detect', label: 'Detecting change', desc: 'Comparing the two observations to find significant surface change', icon: Cpu },
  { id: 'impact', label: 'Measuring impact', desc: 'Estimating flood extent, vegetation health and surface water change', icon: Calculator },
  { id: 'insight', label: 'Preparing the summary', desc: 'Turning the measurements into a readable climate assessment', icon: Sparkles },
];

export const ProcessingTimeline: React.FC<ProcessingTimelineProps> = ({
  onComplete,
  durationMs = 2800,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const onCompleteRef = React.useRef(onComplete);

  React.useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const stepDuration = durationMs / STEPS.length;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < STEPS.length) {
        setCurrentStepIndex(step);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          onCompleteRef.current?.();
        }, 200);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [durationMs]);

  return (
    <div className="bg-white border border-[#E3E9E3] rounded-2xl p-6 max-w-xl mx-auto shadow-xl">
      <div className="flex items-center justify-between border-b border-[#EDF1EC] pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <Loader2 className="w-4 h-4 text-[#1E5641] animate-spin" />
          <span className="text-sm font-semibold text-[#1B2520]">
            Running analysis
          </span>
        </div>
        <span className="text-xs text-[#5D6E64] tabular-nums">
          Step {currentStepIndex + 1} of {STEPS.length}
        </span>
      </div>

      <div className="space-y-2">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const isPending = idx > currentStepIndex;

          return (
            <div
              key={step.id}
              className={`flex items-start gap-3.5 p-3 rounded-lg transition-all duration-200 ${
                isCurrent
                  ? 'bg-[#F0F6F1] border border-[#CFE0D3]'
                  : isDone
                  ? 'opacity-90'
                  : 'opacity-45'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4.5 h-4.5 w-[18px] h-[18px] text-[#1D7A46]" />
                ) : (
                  <Icon
                    className={`w-[18px] h-[18px] ${
                      isCurrent ? 'text-[#1E5641]' : 'text-[#93A398]'
                    }`}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-medium ${
                      isCurrent ? 'text-[#15402F]' : isDone ? 'text-[#1B2520]' : 'text-[#5D6E64]'
                    }`}
                  >
                    {step.label}
                  </span>
                  {isCurrent && (
                    <span className="text-[11px] font-medium text-[#1E5641]">
                      In progress…
                    </span>
                  )}
                  {isDone && (
                    <span className="text-[11px] font-medium text-[#1D7A46]">
                      Done
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#5D6E64] mt-0.5 leading-snug">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
