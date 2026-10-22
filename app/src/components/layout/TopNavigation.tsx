import React, { useState } from 'react';
import { Globe2, Play, MapPin, RefreshCw, Menu, X } from 'lucide-react';
import { RegionData } from '../../types/climate';

export type NavTab =
  | 'overview'
  | 'monitor'
  | 'change'
  | 'flood'
  | 'vegetation'
  | 'water'
  | 'risk'
  | 'analyst'
  | 'reports'
  | 'impact';

interface TopNavigationProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  regions: RegionData[];
  selectedRegion: RegionData;
  onSelectRegion: (region: RegionData) => void;
  onTriggerPresentation: () => void;
  isAnalyzing: boolean;
  onTriggerAnalysis: () => void;
}

const NAV_ITEMS: { id: NavTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'monitor', label: 'Earth Monitor' },
  { id: 'change', label: 'Change Detection' },
  { id: 'flood', label: 'Flood Intelligence' },
  { id: 'vegetation', label: 'Vegetation' },
  { id: 'water', label: 'Water' },
  { id: 'risk', label: 'Risk' },
  { id: 'analyst', label: 'AI Analyst' },
  { id: 'reports', label: 'Reports' },
  { id: 'impact', label: 'Impact' },
];

export const TopNavigation: React.FC<TopNavigationProps> = ({
  activeTab,
  setActiveTab,
  regions,
  selectedRegion,
  onSelectRegion,
  onTriggerPresentation,
  isAnalyzing,
  onTriggerAnalysis,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavigate = (tab: NavTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#E3E9E3]">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Brand */}
          <button
            onClick={() => handleNavigate('overview')}
            className="flex items-center gap-2.5 shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E5641] rounded-lg"
            aria-label="ORBIS AI home"
          >
            <div className="w-8 h-8 rounded-lg bg-[#1E5641] flex items-center justify-center text-white">
              <Globe2 className="w-4.5 h-4.5 w-[18px] h-[18px]" />
            </div>
            <div className="text-left leading-tight">
              <div className="text-[15px] font-bold tracking-tight text-[#1B2520]">
                ORBIS AI
              </div>
              <div className="text-[10px] text-[#5D6E64] hidden xl:block">
                Climate Intelligence from Earth Observation
              </div>
            </div>
          </button>

          {/* Desktop navigation */}
          <nav
            className="hidden lg:flex items-center gap-0.5 text-[13px] font-medium"
            aria-label="Primary"
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                aria-current={activeTab === item.id ? 'page' : undefined}
                className={`px-3 py-2 rounded-md transition-colors duration-200 whitespace-nowrap cursor-pointer ${
                  activeTab === item.id
                    ? 'text-[#15402F] bg-[#E9F2EC] font-semibold'
                    : 'text-[#5D6E64] hover:text-[#1B2520] hover:bg-[#F0F4EF]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right side: region selector + actions */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 bg-white border border-[#DDE5DD] rounded-lg px-2.5 py-1.5 shadow-[0_1px_2px_rgba(27,37,32,0.04)]">
              <MapPin className="w-3.5 h-3.5 text-[#1E5641] shrink-0" aria-hidden="true" />
              <select
                value={selectedRegion.id}
                onChange={(e) => {
                  const found = regions.find((r) => r.id === e.target.value);
                  if (found) onSelectRegion(found);
                }}
                aria-label="Select monitored region"
                className="bg-transparent text-[13px] font-medium text-[#1B2520] focus:outline-none cursor-pointer max-w-[180px] truncate"
              >
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onTriggerAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold text-white bg-[#1E5641] hover:bg-[#15402F] rounded-lg transition-colors duration-200 disabled:opacity-60 cursor-pointer whitespace-nowrap shadow-[0_1px_2px_rgba(27,37,32,0.08)]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span>{isAnalyzing ? 'Analyzing…' : 'Run Analysis'}</span>
            </button>

            <button
              onClick={onTriggerPresentation}
              title="Launch presentation mode"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-[#1E5641] bg-white hover:bg-[#F0F6F1] border border-[#DDE5DD] rounded-lg transition-colors duration-200 cursor-pointer whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Present</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className="lg:hidden p-2 rounded-lg text-[#1B2520] hover:bg-[#F0F4EF] cursor-pointer"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation panel */}
      {mobileOpen && (
        <nav
          className="lg:hidden border-t border-[#EDF1EC] bg-white px-4 py-3 grid grid-cols-2 gap-1.5"
          aria-label="Mobile"
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors cursor-pointer ${
                activeTab === item.id
                  ? 'bg-[#E9F2EC] text-[#15402F] font-semibold'
                  : 'text-[#5D6E64] hover:bg-[#F0F4EF]'
              }`}
            >
              {item.label}
            </button>
          ))}

          {/* Mobile region selector */}
          <div className="col-span-2 sm:hidden mt-1 flex items-center gap-1.5 bg-white border border-[#DDE5DD] rounded-lg px-3 py-2">
            <MapPin className="w-3.5 h-3.5 text-[#1E5641] shrink-0" aria-hidden="true" />
            <select
              value={selectedRegion.id}
              onChange={(e) => {
                const found = regions.find((r) => r.id === e.target.value);
                if (found) onSelectRegion(found);
              }}
              aria-label="Select monitored region"
              className="bg-transparent text-sm font-medium text-[#1B2520] focus:outline-none cursor-pointer w-full"
            >
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </nav>
      )}
    </header>
  );
};
