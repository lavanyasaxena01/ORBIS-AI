export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface GeospatialBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface RegionData {
  id: string;
  name: string;
  country: string;
  biome: string;
  center: [number, number]; // [lat, lng]
  zoom: number;
  bounds: GeospatialBounds;
  coordinatesPolygon: [number, number][]; // Geo polygon coordinates
  primaryHazard: 'Flood' | 'Deforestation' | 'Water Retraction' | 'Urban Encroachment';
  sensorPlatforms: string[];
  lastObserved: string;
  baselineDate: string;
  eventDate: string;
  description: string;
  opticalBeforeUrl: string;
  opticalAfterUrl: string;
  sarUrl: string;
  changeMaskUrl?: string;
  probabilityUrl?: string;
  before_image_url?: string;
  after_image_url?: string;
  sar_image_url?: string;
  change_mask_url?: string;
  probability_url?: string;
  metrics: {
    totalAreaKm2: number;
    changedAreaKm2: number;
    changedPercentage: number;
    floodAreaKm2: number;
    floodPercentage: number;
    populationExposed: number;
    croplandImpactedHa: number;
    ndviBefore: number;
    ndviAfter: number;
    ndviChangePercent: number;
    ndwiBefore: number;
    ndwiAfter: number;
    ndwiChangePercent: number;
    riskScore: number; // 0 - 100
    riskLevel: RiskLevel;
    confidence: number; // 0.0 - 1.0
  };
  riskBreakdown: {
    floodSeverity: number; // 0 - 100
    vegetationDecline: number; // 0 - 100
    waterAnomaly: number; // 0 - 100
    landUseChange: number; // 0 - 100
    historicalTrend: number; // 0 - 100
  };
  aiExplanation: string;
  adaptationActions: string[];
}

export interface AnalysisRequest {
  regionId: string;
  analysisTypes?: ('change' | 'flood' | 'vegetation' | 'water' | 'risk')[];
  customWeights?: {
    floodSeverity: number;
    vegetationDecline: number;
    waterAnomaly: number;
    landUseChange: number;
    historicalTrend: number;
  };
}

export interface AnalysisResponse {
  region: string;
  analysis_date: string;
  data_source: string;
  is_demo: boolean;
  before_image_url?: string;
  after_image_url?: string;
  sar_image_url?: string;
  change_mask_url?: string;
  probability_url?: string;
  change: {
    area_km2: number;
    percentage: number;
    confidence: number;
    distribution: string;
  };
  flood: {
    area_km2: number;
    percentage: number;
    population_exposed: number;
    cropland_impacted_ha: number;
    severity_rating: string;
  };
  vegetation: {
    ndvi_before: number;
    ndvi_after: number;
    change_percent: number;
    condition: 'Stable' | 'Improving' | 'Declining' | 'Severe decline';
    loss_ha: number;
  };
  water: {
    ndwi_before: number;
    ndwi_after: number;
    change_percent: number;
    surface_anomaly: string;
  };
  risk: {
    level: RiskLevel;
    score: number;
    factors: {
      flood_severity: { value: number; weight: number; contribution: number };
      vegetation_decline: { value: number; weight: number; contribution: number };
      water_anomaly: { value: number; weight: number; contribution: number };
      land_change: { value: number; weight: number; contribution: number };
      historical_trend: { value: number; weight: number; contribution: number };
    };
  };
  explanation: {
    summary: string;
    evidence: string[];
    reasoning: string;
    adaptation_recommendations: string[];
    sensor_attribution: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  groundedData?: {
    regionName: string;
    riskScore: number;
    metrics: Record<string, string | number>;
  };
}
