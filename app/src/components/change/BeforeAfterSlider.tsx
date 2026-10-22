import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronsLeftRight, Eye, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
import { getAssetUrl, logImageError } from '../../lib/assetUrl';

interface BeforeAfterSliderProps {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
  changedAreaKm2?: number;
  changedPercent?: number;
  confidence?: number;
  changeMaskUrl?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeUrl,
  afterUrl,
  beforeLabel = 'Before',
  afterLabel = 'After',
  changedAreaKm2,
  changedPercent,
  confidence,
  changeMaskUrl,
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showDifferenceOverlay, setShowDifferenceOverlay] = useState<boolean>(false);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const [beforeLoaded, setBeforeLoaded] = useState<boolean>(false);
  const [afterLoaded, setAfterLoaded] = useState<boolean>(false);
  const [beforeError, setBeforeError] = useState<boolean>(false);
  const [afterError, setAfterError] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const resolvedBeforeUrl = getAssetUrl(beforeUrl);
  const resolvedAfterUrl = getAssetUrl(afterUrl);
  const resolvedMaskUrl = changeMaskUrl ? getAssetUrl(changeMaskUrl) : null;

  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setBeforeLoaded(false);
    setAfterLoaded(false);
    setBeforeError(false);
    setAfterError(false);
  }, [beforeUrl, afterUrl, reloadKey]);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };

  const handleRetry = () => {
    setReloadKey((prev) => prev + 1);
  };

  const isLoading = (!beforeLoaded || !afterLoaded) && !beforeError && !afterError;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#E3E9E3] bg-white select-none shadow-[0_1px_3px_rgba(27,37,32,0.06)]">
      {/* Toolbar */}
      <div className="px-4 py-2.5 bg-white border-b border-[#EDF1EC] flex flex-wrap items-center justify-between gap-3">
        <span className="text-[13px] font-semibold text-[#1B2520]">
          Before / after comparison
        </span>

        <div className="flex items-center gap-2">
          {(beforeError || afterError) && (
            <button
              onClick={handleRetry}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#FDF0EC] hover:bg-[#FAE3DA] text-[#A9301F] border border-[#E8B4A6] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Retry</span>
            </button>
          )}

          <button
            onClick={() => setShowDifferenceOverlay(!showDifferenceOverlay)}
            aria-pressed={showDifferenceOverlay}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer border ${
              showDifferenceOverlay
                ? 'bg-[#FBF3E4] text-[#92520A] border-[#E5CD9C]'
                : 'bg-white text-[#5D6E64] hover:text-[#1B2520] border-[#DDE5DD]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{showDifferenceOverlay ? 'Change overlay: on' : 'Show change overlay'}</span>
          </button>
        </div>
      </div>

      {/* Slider canvas */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchMove={handleTouchMove}
        role="slider"
        aria-label="Before and after comparison slider"
        aria-valuenow={Math.round(sliderPosition)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setSliderPosition((p) => Math.max(0, p - 5));
          if (e.key === 'ArrowRight') setSliderPosition((p) => Math.min(100, p + 5));
        }}
        className="relative w-full h-[400px] lg:h-[480px] overflow-hidden cursor-ew-resize bg-[#E9EDE7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E5641]"
      >
        {isLoading && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#F4F6F2]/85 text-[#5D6E64] text-sm gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#1E5641]" aria-hidden="true" />
            <span>Loading satellite imagery…</span>
          </div>
        )}

        {(beforeError || afterError) && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-[#F7F8F5]">
            <div className="w-12 h-12 rounded-full bg-[#FDF0EC] border border-[#E8B4A6] flex items-center justify-center text-[#B3261E] mb-3">
              <AlertTriangle className="w-6 h-6" aria-hidden="true" />
            </div>
            <h4 className="text-sm font-semibold text-[#1B2520]">
              Satellite image unavailable
            </h4>
            <p className="text-[13px] text-[#5D6E64] mt-1.5 max-w-md">
              The imagery for this observation could not be loaded. Check your connection and try again.
            </p>
            <button
              onClick={handleRetry}
              className="mt-4 px-4 py-2 bg-[#1E5641] hover:bg-[#15402F] text-white font-semibold rounded-lg text-[13px] flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Underneath layer: After image */}
        <div className="absolute inset-0 w-full h-full">
          <img
            key={`after-${reloadKey}`}
            src={reloadKey ? `${resolvedAfterUrl}?t=${reloadKey}` : resolvedAfterUrl}
            alt={`Satellite observation after the event — ${afterLabel}`}
            className="w-full h-full object-cover transition-opacity duration-300"
            style={{ opacity: afterLoaded ? 1 : 0 }}
            onLoad={() => setAfterLoaded(true)}
            onError={(e) => {
              setAfterError(true);
              logImageError('BeforeAfterSlider (After Image)', resolvedAfterUrl, e);
            }}
          />

          {showDifferenceOverlay && (
            resolvedMaskUrl ? (
              <img
                src={resolvedMaskUrl}
                alt="Detected change overlay"
                className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-70 pointer-events-none"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/30 via-rose-500/25 to-transparent mix-blend-screen pointer-events-none" />
            )
          )}

          <div className="absolute bottom-4 right-4 bg-white/95 border border-[#E3E9E3] rounded-md px-2.5 py-1 text-xs font-medium text-[#1B2520] z-10 shadow-sm">
            {afterLabel}
          </div>
        </div>

        {/* Clipped layer: Before image */}
        <div
          className="absolute inset-0 h-full overflow-hidden z-10"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            key={`before-${reloadKey}`}
            src={reloadKey ? `${resolvedBeforeUrl}?t=${reloadKey}` : resolvedBeforeUrl}
            alt={`Satellite observation before the event — ${beforeLabel}`}
            className="absolute inset-0 h-full object-cover max-w-none transition-opacity duration-300"
            style={{
              width: containerWidth > 0 ? `${containerWidth}px` : '100vw',
              opacity: beforeLoaded ? 1 : 0,
            }}
            onLoad={() => setBeforeLoaded(true)}
            onError={(e) => {
              setBeforeError(true);
              logImageError('BeforeAfterSlider (Before Image)', resolvedBeforeUrl, e);
            }}
          />
          <div className="absolute bottom-4 left-4 bg-white/95 border border-[#E3E9E3] rounded-md px-2.5 py-1 text-xs font-medium text-[#5D6E64] z-10 shadow-sm">
            {beforeLabel}
          </div>
        </div>

        {/* Divider handle */}
        <div
          className="absolute top-0 bottom-0 w-[3px] bg-white cursor-ew-resize z-20 shadow-[0_0_0_1px_rgba(27,37,32,0.15)]"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white border border-[#DDE5DD] flex items-center justify-center text-[#1E5641] shadow-md cursor-ew-resize">
            <ChevronsLeftRight className="w-4 h-4" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Footer summary */}
      {(changedAreaKm2 !== undefined || changedPercent !== undefined) && (
        <div className="px-4 py-3 bg-white border-t border-[#EDF1EC] flex flex-wrap items-center justify-between gap-4 text-[13px]">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5">
            {changedAreaKm2 !== undefined && (
              <div>
                <span className="text-[#5D6E64]">Changed area: </span>
                <span className="font-semibold text-[#1B2520] tabular-nums">
                  {changedAreaKm2.toLocaleString()} km²
                </span>
              </div>
            )}
            {changedPercent !== undefined && (
              <div>
                <span className="text-[#5D6E64]">Share of region: </span>
                <span className="font-semibold text-[#B45309] tabular-nums">
                  {changedPercent}%
                </span>
              </div>
            )}
            {confidence !== undefined && (
              <div>
                <span className="text-[#5D6E64]">Confidence: </span>
                <span className="font-semibold text-[#1D7A46] tabular-nums">
                  {Math.round(confidence * 100)}%
                </span>
              </div>
            )}
          </div>

          <div className="text-[12px] text-[#93A398]">
            Drag the divider to compare the two observations
          </div>
        </div>
      )}
    </div>
  );
};
