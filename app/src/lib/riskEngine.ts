import { RiskLevel } from '../types/climate';

export interface RiskWeights {
  floodSeverity: number;
  vegetationDecline: number;
  waterAnomaly: number;
  landUseChange: number;
  historicalTrend: number;
}

export const DEFAULT_RISK_WEIGHTS: RiskWeights = {
  floodSeverity: 0.35,
  vegetationDecline: 0.25,
  waterAnomaly: 0.15,
  landUseChange: 0.15,
  historicalTrend: 0.10,
};

export interface RiskCalculationResult {
  score: number; // 0 - 100 rounded
  level: RiskLevel;
  contributions: {
    floodSeverity: { value: number; weight: number; contribution: number };
    vegetationDecline: { value: number; weight: number; contribution: number };
    waterAnomaly: { value: number; weight: number; contribution: number };
    landUseChange: { value: number; weight: number; contribution: number };
    historicalTrend: { value: number; weight: number; contribution: number };
  };
  narrative: string;
}

export function calculateClimateRisk(
  factors: {
    floodSeverity: number; // 0 - 100
    vegetationDecline: number; // 0 - 100
    waterAnomaly: number; // 0 - 100
    landUseChange: number; // 0 - 100
    historicalTrend: number; // 0 - 100
  },
  customWeights?: Partial<RiskWeights>
): RiskCalculationResult {
  const weights: RiskWeights = {
    ...DEFAULT_RISK_WEIGHTS,
    ...(customWeights || {}),
  };

  // Ensure weights normalize to 1.0
  const totalWeight =
    weights.floodSeverity +
    weights.vegetationDecline +
    weights.waterAnomaly +
    weights.landUseChange +
    weights.historicalTrend;

  const wFlood = weights.floodSeverity / totalWeight;
  const wVeg = weights.vegetationDecline / totalWeight;
  const wWater = weights.waterAnomaly / totalWeight;
  const wLand = weights.landUseChange / totalWeight;
  const wHist = weights.historicalTrend / totalWeight;

  const cFlood = factors.floodSeverity * wFlood;
  const cVeg = factors.vegetationDecline * wVeg;
  const cWater = factors.waterAnomaly * wWater;
  const cLand = factors.landUseChange * wLand;
  const cHist = factors.historicalTrend * wHist;

  const rawScore = cFlood + cVeg + cWater + cLand + cHist;
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  let level: RiskLevel = 'LOW';
  if (score >= 75) {
    level = 'CRITICAL';
  } else if (score >= 55) {
    level = 'HIGH';
  } else if (score >= 35) {
    level = 'MODERATE';
  } else {
    level = 'LOW';
  }

  let narrative = '';
  if (score >= 75) {
    narrative = 'Immediate critical environmental stress with compound hydrological shock and ecosystem degradation requiring urgent intervention.';
  } else if (score >= 55) {
    narrative = 'Elevated climate hazard profile dominated by severe surface-water inundation and accelerated canopy stress.';
  } else if (score >= 35) {
    narrative = 'Moderate vulnerability with measurable environmental flux within seasonal buffer thresholds.';
  } else {
    narrative = 'Low current anomaly index with stable biophysical parameters across optical and radar observations.';
  }

  return {
    score,
    level,
    contributions: {
      floodSeverity: {
        value: factors.floodSeverity,
        weight: Math.round(wFlood * 100),
        contribution: Math.round(cFlood * 10) / 10,
      },
      vegetationDecline: {
        value: factors.vegetationDecline,
        weight: Math.round(wVeg * 100),
        contribution: Math.round(cVeg * 10) / 10,
      },
      waterAnomaly: {
        value: factors.waterAnomaly,
        weight: Math.round(wWater * 100),
        contribution: Math.round(cWater * 10) / 10,
      },
      landUseChange: {
        value: factors.landUseChange,
        weight: Math.round(wLand * 100),
        contribution: Math.round(cLand * 10) / 10,
      },
      historicalTrend: {
        value: factors.historicalTrend,
        weight: Math.round(wHist * 100),
        contribution: Math.round(cHist * 10) / 10,
      },
    },
    narrative,
  };
}
