import React from 'react';
import { RegionData } from '../../types/climate';
import { ClimateRiskBadge } from '../common/ClimateRiskBadge';
import { Download, Printer, Globe2 } from 'lucide-react';

interface ReportViewProps {
  region: RegionData;
}

export const ReportView: React.FC<ReportViewProps> = ({ region }) => {
  const reportId = `ORBIS-REP-${region.id.toUpperCase()}-2024`;
  const generationTimestamp = new Date().toUTCString();

  const handleDownloadJSON = () => {
    const reportData = {
      reportId,
      generationTimestamp,
      region: {
        id: region.id,
        name: region.name,
        country: region.country,
        biome: region.biome,
        center: region.center,
      },
      sensorPlatforms: region.sensorPlatforms,
      temporalBaseline: region.baselineDate,
      eventObservation: region.eventDate,
      biophysicalMetrics: region.metrics,
      riskBreakdown: region.riskBreakdown,
      aiScientificExplanation: region.aiExplanation,
      adaptationActionPlan: region.adaptationActions,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 print:hidden">
        <div className="max-w-2xl">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#1B2520] tracking-tight">
            Reports
          </h1>
          <p className="text-[15px] text-[#5D6E64] mt-2 leading-relaxed">
            A professional environmental assessment, ready to share with government officials,
            NGOs, climate researchers and disaster management teams.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadJSON}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white hover:bg-[#F0F6F1] border border-[#DDE5DD] text-[13px] font-medium text-[#1B2520] transition-colors duration-200 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#1E5641]" aria-hidden="true" />
            <span>Download data (JSON)</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1E5641] hover:bg-[#15402F] text-[13px] font-semibold text-white transition-colors duration-200 cursor-pointer shadow-[0_1px_2px_rgba(27,37,32,0.08)]"
          >
            <Printer className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Download report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Document sheet */}
      <article className="bg-white border border-[#E3E9E3] rounded-2xl p-6 lg:p-12 space-y-10 max-w-4xl mx-auto shadow-[0_2px_8px_rgba(27,37,32,0.05)] print:border-none print:shadow-none print:p-0 print:rounded-none">
        {/* Report header */}
        <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-[#E3E9E3] pb-8">
          <div>
            <div className="flex items-center gap-2 text-[12px] font-semibold text-[#1E5641]">
              <Globe2 className="w-4 h-4" aria-hidden="true" />
              ORBIS AI Climate Assessment
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-[#1B2520] mt-2 tracking-tight">
              {region.name}
            </h2>
            <div className="text-[13px] text-[#5D6E64] mt-1">
              {region.country} · {region.biome}
            </div>
            <div className="mt-3">
              <ClimateRiskBadge level={region.metrics.riskLevel} score={region.metrics.riskScore} size="md" />
            </div>
          </div>

          <dl className="text-left sm:text-right text-[12px] text-[#5D6E64] space-y-1 shrink-0">
            <div><dt className="inline font-medium text-[#1B2520]">Report ID: </dt><dd className="inline font-mono">{reportId}</dd></div>
            <div><dt className="inline font-medium text-[#1B2520]">Generated: </dt><dd className="inline">{generationTimestamp}</dd></div>
            <div><dt className="inline font-medium text-[#1B2520]">Confidence: </dt><dd className="inline">{Math.round(region.metrics.confidence * 100)}%</dd></div>
          </dl>
        </header>

        {/* Executive summary */}
        <section>
          <h3 className="text-lg font-semibold text-[#1B2520] mb-3">Executive summary</h3>
          <p className="text-[14px] text-[#37453D] leading-relaxed">
            Satellite observations of {region.name} between {region.baselineDate} and{' '}
            {region.eventDate} show {region.metrics.changedAreaKm2.toLocaleString()} km² of
            surface change ({region.metrics.changedPercentage}% of the monitored area),
            including {region.metrics.floodAreaKm2.toLocaleString()} km² of flood impact and a{' '}
            {region.metrics.ndviChangePercent}% decline in vegetation activity. An estimated{' '}
            {region.metrics.populationExposed.toLocaleString()} people and{' '}
            {region.metrics.croplandImpactedHa.toLocaleString()} hectares of agricultural land
            are affected. The overall climate risk is assessed as{' '}
            <strong>{region.metrics.riskLevel}</strong> ({region.metrics.riskScore}/100).
          </p>
          <p className="text-[14px] text-[#37453D] leading-relaxed mt-3">{region.description}</p>
        </section>

        {/* Environmental indicators */}
        <section>
          <h3 className="text-lg font-semibold text-[#1B2520] mb-3">Environmental indicators</h3>
          <div className="overflow-x-auto rounded-xl border border-[#E3E9E3]">
            <table className="w-full text-[13px] text-left">
              <thead className="bg-[#F4F7F3] text-[#5D6E64]">
                <tr>
                  <th className="p-3 font-semibold">Indicator</th>
                  <th className="p-3 font-semibold">Baseline</th>
                  <th className="p-3 font-semibold">Latest</th>
                  <th className="p-3 font-semibold">Change</th>
                  <th className="p-3 font-semibold">Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF1EC] text-[#1B2520]">
                <tr>
                  <td className="p-3 font-medium">Flood impact</td>
                  <td className="p-3 text-[#5D6E64]">Normal river channel</td>
                  <td className="p-3 font-semibold tabular-nums">{region.metrics.floodAreaKm2.toLocaleString()} km²</td>
                  <td className="p-3 text-[#2563EB] tabular-nums">+{region.metrics.floodPercentage}% of region</td>
                  <td className="p-3 text-[#B3261E] font-medium">Severe inundation</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Vegetation health (NDVI)</td>
                  <td className="p-3 text-[#5D6E64] tabular-nums">{region.metrics.ndviBefore}</td>
                  <td className="p-3 tabular-nums">{region.metrics.ndviAfter}</td>
                  <td className="p-3 text-[#B3261E] tabular-nums">{region.metrics.ndviChangePercent}%</td>
                  <td className="p-3 text-[#B3261E] font-medium">Significant stress</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Surface water (NDWI)</td>
                  <td className="p-3 text-[#5D6E64] tabular-nums">{region.metrics.ndwiBefore}</td>
                  <td className="p-3 tabular-nums">{region.metrics.ndwiAfter}</td>
                  <td className="p-3 text-[#2563EB] tabular-nums">+{region.metrics.ndwiChangePercent}%</td>
                  <td className="p-3 text-[#2563EB] font-medium">Major expansion</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Population exposure</td>
                  <td className="p-3 text-[#5D6E64]">—</td>
                  <td className="p-3 font-semibold tabular-nums">{region.metrics.populationExposed.toLocaleString()}</td>
                  <td className="p-3 text-[#B45309]">Residents affected</td>
                  <td className="p-3 text-[#B45309] font-medium">Priority for support</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Agriculture affected</td>
                  <td className="p-3 text-[#5D6E64]">Productive harvest</td>
                  <td className="p-3 font-semibold tabular-nums">{region.metrics.croplandImpactedHa.toLocaleString()} ha</td>
                  <td className="p-3 text-[#B3261E]">Crop loss</td>
                  <td className="p-3 text-[#B3261E] font-medium">Food security risk</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Analysis */}
        <section>
          <h3 className="text-lg font-semibold text-[#1B2520] mb-3">Analysis</h3>
          <div className="p-5 rounded-xl bg-[#F7F9F5] border border-[#EDF1EC] text-[14px] leading-relaxed text-[#37453D]">
            {region.aiExplanation}
          </div>
        </section>

        {/* Recommended actions */}
        <section>
          <h3 className="text-lg font-semibold text-[#1B2520] mb-3">Recommended actions</h3>
          <ol className="space-y-2.5">
            {region.adaptationActions.map((action, i) => (
              <li key={i} className="flex items-start gap-3 text-[14px] text-[#37453D]">
                <span className="w-6 h-6 rounded-full bg-[#E9F2EC] text-[#15402F] text-[12px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{action}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Methodology */}
        <section>
          <h3 className="text-lg font-semibold text-[#1B2520] mb-3">Methodology</h3>
          <p className="text-[13px] text-[#5D6E64] leading-relaxed">
            This assessment combines Sentinel-1 radar and Sentinel-2 optical satellite
            observations aligned to a 10 m ground grid. Surface change is detected by comparing
            the baseline and event observations; flood extent is mapped from radar backscatter;
            vegetation health (NDVI) and surface water (NDWI) are computed from multispectral
            reflectance. The risk score combines five weighted indicators (flood impact 35%,
            vegetation stress 25%, water anomaly 15%, land-use change 15%, historical events
            10%). Detections are calibrated against the Sen1Floods11 public benchmark.
          </p>
        </section>

        {/* Sources */}
        <section>
          <h3 className="text-lg font-semibold text-[#1B2520] mb-3">Data sources</h3>
          <ul className="space-y-1.5 text-[13px] text-[#5D6E64]">
            {region.sensorPlatforms.map((s, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#87A796]" aria-hidden="true" />
                {s}
              </li>
            ))}
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#87A796]" aria-hidden="true" />
              Sen1Floods11 validation dataset
            </li>
          </ul>
        </section>

        {/* Footer */}
        <footer className="pt-6 border-t border-[#E3E9E3] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#93A398]">
          <div>ORBIS AI · Climate Intelligence from Earth Observation</div>
          <div>Observation window: {region.baselineDate} → {region.eventDate}</div>
        </footer>
      </article>
    </div>
  );
};
