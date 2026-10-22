# ORBIS AI

ORBIS AI is a climate-intelligence dashboard for exploring environmental
conditions and potential climate-related impacts across selected regions. It
brings regional context, satellite imagery, environmental indicators, risk
scores, and explanatory analysis together in one interface.

The project is designed to make complex Earth-observation information easier
to inspect and communicate. A user can select a monitored region, review its
observation context, explore analysis views, ask questions about the available
evidence, and create a shareable report.

## The problem it addresses

Climate and environmental assessments often combine information from multiple
sensors, indices, and impact estimates. Reviewing these separately can make it
difficult to understand what changed, how extensive the change may be, and
which communities or assets may be affected.

ORBIS AI organizes those elements into a common regional view. It is intended
to support exploration and communication of climate information—not to replace
official forecasts, emergency-management decisions, field validation, or
expert review.

## What the application provides

### Regional overview and monitoring

The overview summarizes the selected region, its observation date, hazard
context, and key indicators. The Earth Monitor view provides an interactive
map so users can explore the selected location and its geographic context.
Region selection is available throughout the dashboard.

### Environmental analysis

Separate analysis views organize the available metrics by topic:

- **Change Detection** compares baseline and event observations and presents
  mapped change layers and estimated changed area.
- **Flood Intelligence** presents estimated inundation area, affected
  population, impacted cropland, and related hazard context.
- **Vegetation** presents before-and-after NDVI values and vegetation-change
  metrics.
- **Water** presents before-and-after NDWI values and water-surface anomaly
  metrics.
- **Risk** combines contributing indicators into an overall score and level,
  with a breakdown of the factors used.

The interface also includes a processing timeline when a user starts an
analysis, a presentation mode for walking through regional findings, and an
Impact section explaining the climate-action context.

### AI analyst and reports

The AI Analyst accepts questions about a selected region and returns an
explanation, evidence, sensor attribution, and adaptation recommendations.
When a Gemini API key is available on the server, the application can request
Gemini-generated reasoning grounded in the region's structured data. Without a
key, it uses deterministic explanations and recommendations included with the
regional dataset.

The Reports view presents a formatted regional assessment. Users can download
the structured report data as JSON or use the browser's print dialog to save
the report as a PDF.

## Data and interpretation

The application includes five bundled regional datasets. Each region contains
location and biome details, a primary hazard, sensor-platform labels, baseline
and event dates, a last-observed timestamp, image references, environmental
metrics, risk-factor values, and explanatory text.

The sample data references optical imagery and radar observations, including
Sentinel-1 SAR, Sentinel-2 MSI, and Landsat-9 OLI. Metrics include:

- Area analyzed and estimated area of change
- Estimated flood extent, exposed population, and impacted cropland
- NDVI (Normalized Difference Vegetation Index) before and after the event
- NDWI (Normalized Difference Water Index) before and after the event
- A climate-risk score, risk category, confidence value, and factor breakdown

The risk calculation combines flood severity, vegetation decline, water
anomaly, land-use change, and historical trend. The API can accept custom
factor weights for a risk calculation.

## How the application is organized

The user interface is a React and TypeScript single-page application. Its
navigation keeps the selected region in shared application state and passes
that region to the overview and analysis views.

An Express server provides the JSON API used by the interface. The API serves
regional data, returns analysis metrics, computes risk results, and generates
AI-assisted or deterministic explanations. The data definitions, risk
calculation, and Gemini integration are kept in separate modules to make the
main responsibilities easier to follow.

The codebase is organized around these areas:

```text
api/             Serverless API entry point
public/          Sample imagery and analysis-layer assets
src/components/  Dashboard, maps, analysis views, and shared UI
src/data/        Client-side regional datasets and image references
src/lib/         Shared utilities and risk calculations
src/server/      AI reasoning integration
src/types/       Shared region, metric, and API types
server.ts        Express API routes and local development server
```

## Intended audience and use

ORBIS AI is suited to demonstrations, exploratory analysis, and communication
of regional climate indicators. Potential users include climate researchers,
planners, public-sector teams, NGOs, and people who need a consolidated view
of environmental metrics.

Interpretation should account for the observation dates, sensor coverage,
spatial resolution, uncertainty, and the provenance of every dataset. Risk
scores and impact estimates are decision-support indicators, not guarantees of
future conditions or substitutes for locally verified information.
