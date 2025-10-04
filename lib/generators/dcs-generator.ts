/**
 * DCS (Distributed Control System) Data Generator
 * Simulates raw historian data exports with cryptic tag names and no batch context
 */

export interface DCSDataPoint {
  timestamp: string;
  tag_id: string;
  value: number;
  quality_flag: string;
}

export interface DCSExport {
  system_name: string;
  export_date: string;
  site_code: string;
  data: DCSDataPoint[];
}

// Realistic tag naming conventions from different vendors/sites
const TAG_DEFINITIONS = {
  // Temperature sensors (various naming schemes)
  'BR001_PV_TEMP': { min: 36.5, max: 37.2, unit: 'degC', pattern: 'stable' },
  'REACTOR_1_TEMP_AI': { min: 36.5, max: 37.2, unit: 'degC', pattern: 'stable' },
  'TI_2001_JACKET': { min: 35.0, max: 38.0, unit: 'degC', pattern: 'variable' },

  // Agitation/stirrer
  'REACTOR_1_AGIT_SPEED': { min: 45, max: 55, unit: 'RPM', pattern: 'stable' },
  'BR001_STIR_PV': { min: 45, max: 55, unit: 'RPM', pattern: 'stable' },

  // Dissolved oxygen
  'DO_2001_PV': { min: 30, max: 40, unit: 'percent', pattern: 'controlled' },
  'BR001_DO_MEAS': { min: 30, max: 40, unit: 'percent', pattern: 'controlled' },

  // pH
  'PH_AI_2001': { min: 7.0, max: 7.2, unit: 'pH', pattern: 'stable' },
  'BR001_PH_PV': { min: 7.0, max: 7.2, unit: 'pH', pattern: 'stable' },

  // Pressure
  'CHR_A_PRESS_01': { min: 0.5, max: 2.5, unit: 'bar', pattern: 'step_change' },
  'COLUMN_01_PI': { min: 0.5, max: 2.5, unit: 'bar', pattern: 'step_change' },

  // Flow rates
  'CHR_A_FLOW_FI': { min: 0, max: 100, unit: 'L/hr', pattern: 'step_change' },
  'FEED_FLOW_2001': { min: 0, max: 50, unit: 'L/hr', pattern: 'variable' },

  // Level sensors
  'BR001_LVL_PERCENT': { min: 45, max: 95, unit: 'percent', pattern: 'slow_rise' },
  'LI_2001_VESSEL': { min: 45, max: 95, unit: 'percent', pattern: 'slow_rise' },

  // Gas flow
  'O2_FLOW_FI_2001': { min: 0.2, max: 2.0, unit: 'SLPM', pattern: 'controlled' },
  'CO2_FLOW_2001': { min: 0, max: 0.5, unit: 'SLPM', pattern: 'variable' },
};

function generateValue(
  tagConfig: typeof TAG_DEFINITIONS[keyof typeof TAG_DEFINITIONS],
  timestamp: Date,
  batchPhase: 'inoculation' | 'growth' | 'production' | 'harvest'
): number {
  const { min, max, pattern } = tagConfig;
  const baseValue = min + (max - min) / 2;
  const range = max - min;

  switch (pattern) {
    case 'stable':
      // Small random variation
      return baseValue + (Math.random() - 0.5) * range * 0.1;

    case 'controlled':
      // Controlled with occasional adjustments
      const controlNoise = (Math.random() - 0.5) * range * 0.15;
      const adjustment = Math.sin(timestamp.getTime() / 3600000) * range * 0.2;
      return baseValue + controlNoise + adjustment;

    case 'variable':
      // More variation
      return min + Math.random() * range;

    case 'step_change':
      // Changes based on phase
      const phaseMultiplier = batchPhase === 'production' ? 0.8 : 0.3;
      return min + range * phaseMultiplier + (Math.random() - 0.5) * range * 0.1;

    case 'slow_rise':
      // Gradual increase (like cell growth)
      const hoursSinceStart = timestamp.getTime() / 3600000;
      const growthFactor = Math.min(hoursSinceStart / 72, 1); // 72 hour batch
      return min + range * growthFactor + (Math.random() - 0.5) * range * 0.05;

    default:
      return baseValue;
  }
}

function getQualityFlag(): string {
  const random = Math.random();
  if (random > 0.98) return 'BAD'; // 2% bad quality
  if (random > 0.95) return 'UNCERTAIN'; // 3% uncertain
  return 'GOOD'; // 95% good
}

function getBatchPhase(hoursElapsed: number): 'inoculation' | 'growth' | 'production' | 'harvest' {
  if (hoursElapsed < 4) return 'inoculation';
  if (hoursElapsed < 24) return 'growth';
  if (hoursElapsed < 84) return 'production';
  return 'harvest';
}

export function generateDCSExport(
  startDate: Date,
  durationHours: number = 96,
  intervalSeconds: number = 30
): DCSExport {
  const data: DCSDataPoint[] = [];
  const totalPoints = (durationHours * 3600) / intervalSeconds;

  for (let i = 0; i < totalPoints; i++) {
    const timestamp = new Date(startDate.getTime() + i * intervalSeconds * 1000);
    const hoursElapsed = (i * intervalSeconds) / 3600;
    const batchPhase = getBatchPhase(hoursElapsed);

    // Generate data for each tag
    for (const [tagId, config] of Object.entries(TAG_DEFINITIONS)) {
      data.push({
        timestamp: timestamp.toISOString(),
        tag_id: tagId,
        value: parseFloat(generateValue(config, timestamp, batchPhase).toFixed(3)),
        quality_flag: getQualityFlag(),
      });
    }
  }

  return {
    system_name: 'DeltaV_Historian_Site_A',
    export_date: new Date().toISOString(),
    site_code: 'MFG-01',
    data: data,
  };
}

// Generate CSV export format (common DCS export format)
export function formatDCSAsCSV(dcsExport: DCSExport): string {
  const header = 'Timestamp,TagID,Value,Quality\n';
  const rows = dcsExport.data
    .map(point => `${point.timestamp},${point.tag_id},${point.value},${point.quality_flag}`)
    .join('\n');

  return `# DCS Historian Export\n# System: ${dcsExport.system_name}\n# Site: ${dcsExport.site_code}\n# Export Date: ${dcsExport.export_date}\n${header}${rows}`;
}

// Get sample of data (first N points)
export function getDCSSample(dcsExport: DCSExport, sampleSize: number = 100): DCSDataPoint[] {
  return dcsExport.data.slice(0, sampleSize);
}
