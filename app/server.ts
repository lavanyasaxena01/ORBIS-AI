import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { CLIMATE_REGIONS } from './src/data/serverRegionsData';
import { calculateClimateRisk } from './src/lib/riskEngine';
import { generateClimateReasoning } from './src/server/gemini';
import { AnalysisResponse } from './src/types/climate';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
export const app = express();

async function configureApp() {
  app.use(express.json({ limit: '10mb' }));

  // Enable CORS for all incoming requests (crucial for iframe & external preview environments)
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Explicitly mount static directories so satellite imagery and raster outputs are served over HTTP
  if (!isVercel) {
    app.use('/outputs', express.static(path.resolve(__dirname, 'public/outputs')));
    app.use('/assets', express.static(path.resolve(__dirname, 'public/assets')));
    app.use(express.static(path.resolve(__dirname, 'dist')));
  }

  // GET /health
  app.get(['/health', '/api/health'], (_req, res) => {
    res.json({
      status: 'healthy',
      system: 'ORBIS AI',
      version: '2.4.0',
      timestamp: new Date().toISOString(),
      models: {
        changeDetection: 'OpticalSARChangeNet-v2',
        floodSegmentation: 'Sen1Floods11-DeepLabV3+',
        vegetationIndex: 'Sentinel2-MSI-NDVI',
        waterAnomaly: 'Sentinel2-MSI-NDWI',
        aiReasoning: process.env.GEMINI_API_KEY ? 'gemini-3.8-flash' : 'Deterministic-Grounded-Fallback',
      },
    });
  });

  // GET /api/regions
  app.get('/api/regions', (_req, res) => {
    res.json(CLIMATE_REGIONS);
  });

  // GET /api/demo
  app.get('/api/demo', (_req, res) => {
    const demoRegion = CLIMATE_REGIONS[0]; // Indus River Basin
    res.json({
      mode: 'DEMO',
      description: 'Pre-computed high-resolution multi-temporal satellite dataset for Indus River Basin flood monitoring and risk assessment.',
      region: demoRegion,
      benchmark: 'Sen1Floods11 Multimodal Validation Standard',
    });
  });

  // POST /api/analyze
  app.post('/api/analyze', async (req, res) => {
    try {
      const { regionId, customWeights } = req.body || {};
      const region = CLIMATE_REGIONS.find((r) => r.id === regionId) || CLIMATE_REGIONS[0];

      const riskCalc = calculateClimateRisk(
        {
          floodSeverity: region.riskBreakdown.floodSeverity,
          vegetationDecline: region.riskBreakdown.vegetationDecline,
          waterAnomaly: region.riskBreakdown.waterAnomaly,
          landUseChange: region.riskBreakdown.landUseChange,
          historicalTrend: region.riskBreakdown.historicalTrend,
        },
        customWeights
      );

      const aiReasoning = await generateClimateReasoning(region);

      const responsePayload: AnalysisResponse = {
        region: region.name,
        analysis_date: new Date().toISOString(),
        data_source: `${region.sensorPlatforms.join(' + ')} (Demo Dataset)`,
        is_demo: true,
        before_image_url: region.before_image_url || `/outputs/${region.id}/before.png`,
        after_image_url: region.after_image_url || `/outputs/${region.id}/after.png`,
        sar_image_url: region.sar_image_url || `/outputs/${region.id}/sar.png`,
        change_mask_url: region.change_mask_url || `/outputs/${region.id}/change_mask.png`,
        probability_url: region.probability_url || `/outputs/${region.id}/probability.png`,
        change: {
          area_km2: region.metrics.changedAreaKm2,
          percentage: region.metrics.changedPercentage,
          confidence: region.metrics.confidence,
          distribution: 'Bimodal spatial clustering along right-bank alluvial floodplain corridors.',
        },
        flood: {
          area_km2: region.metrics.floodAreaKm2,
          percentage: region.metrics.floodPercentage,
          population_exposed: region.metrics.populationExposed,
          cropland_impacted_ha: region.metrics.croplandImpactedHa,
          severity_rating: region.metrics.riskLevel,
        },
        vegetation: {
          ndvi_before: region.metrics.ndviBefore,
          ndvi_after: region.metrics.ndviAfter,
          change_percent: region.metrics.ndviChangePercent,
          condition: region.metrics.ndviChangePercent < -20 ? 'Severe decline' : 'Declining',
          loss_ha: Math.round((region.metrics.changedAreaKm2 * 100) * 0.45),
        },
        water: {
          ndwi_before: region.metrics.ndwiBefore,
          ndwi_after: region.metrics.ndwiAfter,
          change_percent: region.metrics.ndwiChangePercent,
          surface_anomaly: region.metrics.ndwiChangePercent > 100 ? 'Extreme expansion' : 'Contracting surface',
        },
        risk: {
          level: riskCalc.level,
          score: riskCalc.score,
          factors: {
            flood_severity: riskCalc.contributions.floodSeverity,
            vegetation_decline: riskCalc.contributions.vegetationDecline,
            water_anomaly: riskCalc.contributions.waterAnomaly,
            land_change: riskCalc.contributions.landUseChange,
            historical_trend: riskCalc.contributions.historicalTrend,
          },
        },
        explanation: aiReasoning,
      };

      res.json(responsePayload);
    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({ error: 'Internal geospatial analysis engine failure.' });
    }
  });

  // POST /api/change-detection
  app.post('/api/change-detection', (req, res) => {
    const { regionId } = req.body || {};
    const region = CLIMATE_REGIONS.find((r) => r.id === regionId) || CLIMATE_REGIONS[0];
    res.json({
      region: region.name,
      model: 'OpticalSARChangeNet-v2 (Gated Feature Fusion)',
      optical_bands: ['B04 (Red)', 'B08 (NIR)', 'B03 (Green)', 'B02 (Blue)'],
      sar_polarization: ['C-band VV', 'C-band VH'],
      spatial_resolution: '10 meters/pixel',
      metrics: {
        total_pixels_analyzed: Math.round(region.metrics.totalAreaKm2 * 10000),
        changed_pixels: Math.round(region.metrics.changedAreaKm2 * 10000),
        changed_area_km2: region.metrics.changedAreaKm2,
        change_percentage: region.metrics.changedPercentage,
        detection_confidence: region.metrics.confidence,
        coherence_loss: 0.74,
      },
      before_image_url: region.before_image_url || `/outputs/${region.id}/before.png`,
      after_image_url: region.after_image_url || `/outputs/${region.id}/after.png`,
      sar_image_url: region.sar_image_url || `/outputs/${region.id}/sar.png`,
      change_mask_url: region.change_mask_url || `/outputs/${region.id}/change_mask.png`,
      probability_url: region.probability_url || `/outputs/${region.id}/probability.png`,
      layers: {
        optical_before: region.opticalBeforeUrl || `/outputs/${region.id}/before.png`,
        optical_after: region.opticalAfterUrl || `/outputs/${region.id}/after.png`,
        sar_backscatter: region.sarUrl || `/outputs/${region.id}/sar.png`,
        change_mask: region.changeMaskUrl || `/outputs/${region.id}/change_mask.png`,
        probability: region.probabilityUrl || `/outputs/${region.id}/probability.png`,
      },
    });
  });

  // POST /api/flood-analysis
  app.post('/api/flood-analysis', (req, res) => {
    const { regionId } = req.body || {};
    const region = CLIMATE_REGIONS.find((r) => r.id === regionId) || CLIMATE_REGIONS[0];
    res.json({
      region: region.name,
      pipeline: 'Sen1Floods11 Dual-Sensor Inundation Segmenter',
      metrics: {
        inundated_area_km2: region.metrics.floodAreaKm2,
        inundation_percentage: region.metrics.floodPercentage,
        estimated_depth_class: 'Deep standing water (> 1.2m)',
        population_in_inundation_zone: region.metrics.populationExposed,
        cropland_flooded_ha: region.metrics.croplandImpactedHa,
        infrastructure_criticality: 'High: 14 primary bridges and 180km regional highways obstructed',
        severity: region.metrics.riskLevel,
      },
      sar_parameters: {
        incidence_angle: '38.4°',
        pass: 'Descending',
        backscatter_threshold_db: -16.2,
      },
    });
  });

  // POST /api/vegetation-analysis
  app.post('/api/vegetation-analysis', (req, res) => {
    const { regionId } = req.body || {};
    const region = CLIMATE_REGIONS.find((r) => r.id === regionId) || CLIMATE_REGIONS[0];
    res.json({
      region: region.name,
      index: 'Normalized Difference Vegetation Index (NDVI)',
      formula: '(NIR - RED) / (NIR + RED)',
      satellite: 'Sentinel-2 Level-2A Bottom-Of-Atmosphere (BOA) Reflectance',
      metrics: {
        ndvi_before: region.metrics.ndviBefore,
        ndvi_after: region.metrics.ndviAfter,
        delta_ndvi: Math.round((region.metrics.ndviAfter - region.metrics.ndviBefore) * 100) / 100,
        percentage_change: region.metrics.ndviChangePercent,
        health_status: region.metrics.ndviChangePercent < -20 ? 'Severe decline' : 'Moderate stress',
        canopy_loss_ha: region.metrics.croplandImpactedHa,
      },
    });
  });

  // POST /api/water-analysis
  app.post('/api/water-analysis', (req, res) => {
    const { regionId } = req.body || {};
    const region = CLIMATE_REGIONS.find((r) => r.id === regionId) || CLIMATE_REGIONS[0];
    res.json({
      region: region.name,
      index: 'Normalized Difference Water Index (NDWI)',
      formula: '(GREEN - NIR) / (GREEN + NIR)',
      metrics: {
        ndwi_before: region.metrics.ndwiBefore,
        ndwi_after: region.metrics.ndwiAfter,
        percentage_change: region.metrics.ndwiChangePercent,
        anomaly_trend: region.metrics.ndwiChangePercent > 0 ? 'Surge / expansion' : 'Recession / drought deficit',
        water_surface_dynamics_km2: region.metrics.floodAreaKm2,
      },
    });
  });

  // POST /api/risk-analysis
  app.post('/api/risk-analysis', (req, res) => {
    const { regionId, customWeights } = req.body || {};
    const region = CLIMATE_REGIONS.find((r) => r.id === regionId) || CLIMATE_REGIONS[0];
    const riskResult = calculateClimateRisk(
      {
        floodSeverity: region.riskBreakdown.floodSeverity,
        vegetationDecline: region.riskBreakdown.vegetationDecline,
        waterAnomaly: region.riskBreakdown.waterAnomaly,
        landUseChange: region.riskBreakdown.landUseChange,
        historicalTrend: region.riskBreakdown.historicalTrend,
      },
      customWeights
    );
    res.json({
      region: region.name,
      ...riskResult,
      governing_formula: 'RiskScore = (w_f * Flood) + (w_v * Veg) + (w_w * Water) + (w_l * Land) + (w_h * Hist)',
    });
  });

  // POST /api/ai/query
  app.post('/api/ai/query', async (req, res) => {
    try {
      const { regionId, query } = req.body || {};
      const region = CLIMATE_REGIONS.find((r) => r.id === regionId) || CLIMATE_REGIONS[0];
      const reasoning = await generateClimateReasoning(region, query);
      res.json({
        query: query || 'General climate intelligence query',
        region: region.name,
        answer: reasoning.reasoning,
        summary: reasoning.summary,
        evidence: reasoning.evidence,
        adaptation_recommendations: reasoning.adaptation_recommendations,
        attribution: reasoning.sensor_attribution,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('AI query error:', error);
      res.status(500).json({ error: 'Failed to process AI reasoning query.' });
    }
  });

  // POST /api/report
  app.post('/api/report', async (req, res) => {
    try {
      const { regionId } = req.body || {};
      const region = CLIMATE_REGIONS.find((r) => r.id === regionId) || CLIMATE_REGIONS[0];
      const reasoning = await generateClimateReasoning(region);
      const risk = calculateClimateRisk(region.riskBreakdown);

      res.json({
        reportId: `ORBIS-REP-${Date.now()}`,
        generatedAt: new Date().toISOString(),
        classification: 'OFFICIAL CLIMATE INTELLIGENCE ASSESSEMENT',
        region: {
          id: region.id,
          name: region.name,
          country: region.country,
          biome: region.biome,
          coordinates: region.center,
        },
        observationWindow: {
          baseline: region.baselineDate,
          event: region.eventDate,
          lastSensorAcquisition: region.lastObserved,
        },
        sensors: region.sensorPlatforms,
        kpiSummary: {
          totalAreaAnalyzedKm2: region.metrics.totalAreaKm2,
          changedAreaKm2: region.metrics.changedAreaKm2,
          changePercentage: region.metrics.changedPercentage,
          floodAreaKm2: region.metrics.floodAreaKm2,
          populationExposed: region.metrics.populationExposed,
          croplandDamagedHa: region.metrics.croplandImpactedHa,
          riskScore: risk.score,
          riskLevel: risk.level,
          confidence: region.metrics.confidence,
        },
        riskCalculation: risk,
        biophysicalIndices: {
          ndvi: {
            before: region.metrics.ndviBefore,
            after: region.metrics.ndviAfter,
            changePercent: region.metrics.ndviChangePercent,
          },
          ndwi: {
            before: region.metrics.ndwiBefore,
            after: region.metrics.ndwiAfter,
            changePercent: region.metrics.ndwiChangePercent,
          },
        },
        aiInterpretation: reasoning,
      });
    } catch (error) {
      console.error('Report generation error:', error);
      res.status(500).json({ error: 'Failed to compile climate intelligence report.' });
    }
  });

  // Vite middleware in dev or static files in production
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (!isVercel) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }
}

export const appReady = configureApp();

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isDirectRun) {
  appReady.then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[ORBIS AI] Server running on http://0.0.0.0:${PORT}`);
    });
  }).catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
