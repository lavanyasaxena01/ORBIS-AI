import React, { useState, useEffect } from 'react';
import { CLIMATE_REGIONS } from './data/regionsData';
import { RegionData } from './types/climate';
import { TopNavigation, NavTab } from './components/layout/TopNavigation';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { InteractiveMap } from './components/dashboard/InteractiveMap';
import { ChangeDetectionView } from './components/change/ChangeDetectionView';
import { FloodIntelligenceView } from './components/flood/FloodIntelligenceView';
import { VegetationView } from './components/vegetation/VegetationView';
import { WaterView } from './components/water/WaterView';
import { ClimateRiskView } from './components/risk/ClimateRiskView';
import { AIAnalystView } from './components/ai/AIAnalystView';
import { ReportView } from './components/reports/ReportView';
import { MarketImpactView } from './components/impact/MarketImpactView';
import { PresentationMode } from './components/presentation/PresentationMode';
import { ProcessingTimeline } from './components/common/ProcessingTimeline';
import { Globe2 } from 'lucide-react';

export default function App() {
  const [regions, setRegions] = useState<RegionData[]>(CLIMATE_REGIONS);
  const [selectedRegion, setSelectedRegion] = useState<RegionData>(CLIMATE_REGIONS[0]);
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [presentationOpen, setPresentationOpen] = useState(false);

  // Attempt to fetch regions from backend if available while preserving bundled image assets
  useEffect(() => {
    fetch('/api/regions')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to load regions from API');
      })
      .then((data: RegionData[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setRegions((prev) =>
            prev.map((local) => {
              const remote = data.find((r) => r.id === local.id);
              if (!remote) return local;
              return {
                ...remote,
                opticalBeforeUrl: local.opticalBeforeUrl,
                opticalAfterUrl: local.opticalAfterUrl,
                sarUrl: local.sarUrl,
              };
            })
          );
        }
      })
      .catch((err) => {
        console.warn('Using client-side fallback regions:', err);
      });
  }, []);

  const handleTriggerAnalysis = async () => {
    setShowProcessingModal(true);
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regionId: selectedRegion.id }),
      });
      if (res.ok) {
        const analysis = await res.json();
        setSelectedRegion((prev) => ({
          ...prev,
          metrics: {
            ...prev.metrics,
            changedAreaKm2: analysis.change?.area_km2 ?? prev.metrics.changedAreaKm2,
            changedPercentage: analysis.change?.percentage ?? prev.metrics.changedPercentage,
            floodAreaKm2: analysis.flood?.area_km2 ?? prev.metrics.floodAreaKm2,
            riskScore: analysis.risk?.score ?? prev.metrics.riskScore,
            riskLevel: analysis.risk?.level ?? prev.metrics.riskLevel,
          },
        }));
      }
    } catch (e) {
      console.warn('API analyze call fallback:', e);
    }
  };

  const handleProcessingComplete = () => {
    setShowProcessingModal(false);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F2] text-[#1B2520] flex flex-col font-sans selection:bg-[#CFE3D5] selection:text-[#15402F]">
      {/* Presentation Mode Full-Screen Overlay */}
      {presentationOpen && (
        <PresentationMode
          region={selectedRegion}
          onExit={() => setPresentationOpen(false)}
        />
      )}

      {/* Analysis Processing Modal Overlay */}
      {showProcessingModal && (
        <div
          className="fixed inset-0 z-50 bg-[#1B2520]/40 backdrop-blur-[2px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Analysis in progress"
        >
          <div className="w-full max-w-xl">
            <ProcessingTimeline
              durationMs={2500}
              onComplete={handleProcessingComplete}
            />
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <TopNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        regions={regions}
        selectedRegion={selectedRegion}
        onSelectRegion={setSelectedRegion}
        onTriggerPresentation={() => setPresentationOpen(true)}
        isAnalyzing={isAnalyzing}
        onTriggerAnalysis={handleTriggerAnalysis}
      />

      {/* Observation context strip */}
      <div className="bg-white border-b border-[#EDF1EC] px-4 lg:px-8 py-2">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-2 text-xs text-[#5D6E64]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1D7A46]" aria-hidden="true" />
            <span>
              Monitoring <span className="font-medium text-[#1B2520]">{selectedRegion.name}</span>
            </span>
            <span className="text-[#B9C6BC] hidden sm:inline">·</span>
            <span className="hidden sm:inline font-mono text-[11px]">
              {selectedRegion.center[0]}°, {selectedRegion.center[1]}°
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>Last observation: {selectedRegion.lastObserved}</span>
            <span className="text-[#B9C6BC]">·</span>
          </div>
        </div>
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 lg:px-8 py-8 lg:py-10">
        {activeTab === 'overview' && (
          <OverviewDashboard
            region={selectedRegion}
            onNavigateTab={setActiveTab}
            onSelectRegion={setSelectedRegion}
            allRegions={regions}
          />
        )}

        {activeTab === 'monitor' && (
          <div className="space-y-6">
            <div className="max-w-3xl">
              <h1 className="text-3xl lg:text-4xl font-bold text-[#1B2520] tracking-tight">
                Earth Monitor
              </h1>
              <p className="text-[15px] text-[#5D6E64] mt-2 leading-relaxed">
                What the satellites are seeing right now — explore the live satellite basemap and
                switch observation layers on and off.
              </p>
            </div>
            <InteractiveMap
              region={selectedRegion}
              className="h-[600px]"
              onSelectRegion={setSelectedRegion}
            />
          </div>
        )}

        {activeTab === 'change' && (
          <ChangeDetectionView region={selectedRegion} />
        )}

        {activeTab === 'flood' && (
          <FloodIntelligenceView region={selectedRegion} />
        )}

        {activeTab === 'vegetation' && (
          <VegetationView region={selectedRegion} />
        )}

        {activeTab === 'water' && (
          <WaterView region={selectedRegion} />
        )}

        {activeTab === 'risk' && (
          <ClimateRiskView region={selectedRegion} />
        )}

        {activeTab === 'analyst' && (
          <AIAnalystView region={selectedRegion} />
        )}

        {activeTab === 'reports' && (
          <ReportView region={selectedRegion} />
        )}

        {activeTab === 'impact' && (
          <MarketImpactView />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E3E9E3] bg-white px-4 lg:px-8 py-6 mt-8">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5D6E64]">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-[#1E5641]" aria-hidden="true" />
            <span className="font-semibold text-[#1B2520]">ORBIS AI</span>
            <span className="text-[#B9C6BC]">·</span>
            <span>Climate Intelligence from Earth Observation</span>
          </div>

          <div className="flex items-center gap-3">
            <span>Sentinel-1 · Sentinel-2 · Landsat-9</span>
            <span className="text-[#B9C6BC]">·</span>
            <span>OpticalSARChangeNet v2</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
