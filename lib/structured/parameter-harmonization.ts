/**
 * Parameter Harmonization
 * Maps raw system parameters to standardized names and units
 */

export type ParameterClassification = 'Critical' | 'NonCritical' | 'Informational';

export interface StandardParameter {
  standardId: string;
  standardName: string;
  category: 'Process' | 'Equipment' | 'Quality' | 'Material';
  classification: ParameterClassification;
  standardUnit: string;
  alternateUnits?: string[];
  description: string;
  criticalRanges?: {
    min?: number;
    max?: number;
    target?: number;
  };
}

export interface ParameterMapping {
  rawSystemId: string;
  rawParameterName: string;
  rawUnit?: string;
  system: 'DCS' | 'eBR' | 'LIMS';
  standardParameter: StandardParameter;
  conversionFactor?: number; // Multiply raw value by this to get standard value
  conversionOffset?: number; // Add this after applying factor
}

// Define standard parameters
const STANDARD_PARAMETERS: StandardParameter[] = [
  {
    standardId: 'PARAM_TEMP_CULTURE',
    standardName: 'Culture Temperature',
    category: 'Process',
    classification: 'Critical',
    standardUnit: 'degC',
    alternateUnits: ['degF', 'K'],
    description: 'Cell culture temperature',
    criticalRanges: { min: 36.5, max: 37.5, target: 37.0 },
  },
  {
    standardId: 'PARAM_PH',
    standardName: 'pH',
    category: 'Process',
    classification: 'Critical',
    standardUnit: 'pH',
    description: 'Culture pH value',
    criticalRanges: { min: 7.0, max: 7.2, target: 7.1 },
  },
  {
    standardId: 'PARAM_DO',
    standardName: 'Dissolved Oxygen',
    category: 'Process',
    classification: 'Critical',
    standardUnit: 'percent',
    description: 'Dissolved oxygen saturation',
    criticalRanges: { min: 30, max: 40, target: 35 },
  },
  {
    standardId: 'PARAM_AGITATION',
    standardName: 'Agitation Speed',
    category: 'Equipment',
    classification: 'Critical',
    standardUnit: 'RPM',
    description: 'Impeller rotation speed',
    criticalRanges: { min: 45, max: 55, target: 50 },
  },
  {
    standardId: 'PARAM_PRESSURE',
    standardName: 'Vessel Pressure',
    category: 'Equipment',
    classification: 'NonCritical',
    standardUnit: 'bar',
    alternateUnits: ['psi', 'kPa'],
    description: 'Vessel internal pressure',
  },
  {
    standardId: 'PARAM_LEVEL',
    standardName: 'Liquid Level',
    category: 'Equipment',
    classification: 'NonCritical',
    standardUnit: 'percent',
    alternateUnits: ['L', 'cm'],
    description: 'Liquid level in vessel',
  },
  {
    standardId: 'PARAM_FLOW_O2',
    standardName: 'Oxygen Flow Rate',
    category: 'Process',
    classification: 'Critical',
    standardUnit: 'SLPM',
    alternateUnits: ['L/min', 'mL/min'],
    description: 'Oxygen gas flow rate',
  },
  {
    standardId: 'PARAM_FLOW_CO2',
    standardName: 'Carbon Dioxide Flow Rate',
    category: 'Process',
    classification: 'NonCritical',
    standardUnit: 'SLPM',
    alternateUnits: ['L/min', 'mL/min'],
    description: 'CO2 gas flow rate',
  },
  {
    standardId: 'PARAM_FLOW_FEED',
    standardName: 'Feed Flow Rate',
    category: 'Process',
    classification: 'Critical',
    standardUnit: 'L/hr',
    alternateUnits: ['mL/min', 'L/day'],
    description: 'Nutrient feed flow rate',
  },
  {
    standardId: 'PARAM_VCD',
    standardName: 'Viable Cell Density',
    category: 'Quality',
    classification: 'Critical',
    standardUnit: 'E6 cells/mL',
    description: 'Concentration of viable cells',
  },
  {
    standardId: 'PARAM_VIABILITY',
    standardName: 'Cell Viability',
    category: 'Quality',
    classification: 'Critical',
    standardUnit: 'percent',
    description: 'Percentage of viable cells',
    criticalRanges: { min: 80 },
  },
  {
    standardId: 'PARAM_GLUCOSE',
    standardName: 'Glucose Concentration',
    category: 'Material',
    classification: 'Critical',
    standardUnit: 'g/L',
    alternateUnits: ['mM'],
    description: 'Glucose concentration in media',
    criticalRanges: { min: 0.5, max: 6.0 },
  },
  {
    standardId: 'PARAM_LACTATE',
    standardName: 'Lactate Concentration',
    category: 'Material',
    classification: 'NonCritical',
    standardUnit: 'g/L',
    alternateUnits: ['mM'],
    description: 'Lactate concentration in media',
    criticalRanges: { max: 3.5 },
  },
  {
    standardId: 'PARAM_TITER',
    standardName: 'Product Titer',
    category: 'Quality',
    classification: 'Critical',
    standardUnit: 'g/L',
    alternateUnits: ['mg/mL'],
    description: 'Product concentration',
    criticalRanges: { min: 0.5 },
  },
  {
    standardId: 'PARAM_CHR_PRESSURE',
    standardName: 'Column Pressure',
    category: 'Equipment',
    classification: 'Critical',
    standardUnit: 'bar',
    alternateUnits: ['psi', 'MPa'],
    description: 'Chromatography column pressure',
    criticalRanges: { max: 2.5 },
  },
  {
    standardId: 'PARAM_CHR_FLOW',
    standardName: 'Column Flow Rate',
    category: 'Process',
    classification: 'Critical',
    standardUnit: 'L/hr',
    alternateUnits: ['mL/min', 'cm/hr'],
    description: 'Chromatography flow rate',
  },
  {
    standardId: 'PARAM_PURITY',
    standardName: 'Product Purity',
    category: 'Quality',
    classification: 'Critical',
    standardUnit: 'percent',
    description: 'Product purity by SEC-HPLC',
    criticalRanges: { min: 95 },
  },
  {
    standardId: 'PARAM_AGGREGATES',
    standardName: 'Aggregate Content',
    category: 'Quality',
    classification: 'Critical',
    standardUnit: 'percent',
    description: 'High molecular weight species',
    criticalRanges: { max: 3.0 },
  },
];

// Define parameter mappings from raw systems to standard
export function getParameterMappings(): ParameterMapping[] {
  return [
    // Temperature mappings
    {
      rawSystemId: 'BR001_PV_TEMP',
      rawParameterName: 'BR001 Process Temperature',
      rawUnit: 'degC',
      system: 'DCS',
      standardParameter: STANDARD_PARAMETERS[0],
    },
    {
      rawSystemId: 'REACTOR_1_TEMP_AI',
      rawParameterName: 'Reactor 1 Temperature Analog Input',
      rawUnit: 'degC',
      system: 'DCS',
      standardParameter: STANDARD_PARAMETERS[0],
    },
    {
      rawSystemId: 'TI_2001_JACKET',
      rawParameterName: 'TI-2001 Jacket Temperature',
      rawUnit: 'degC',
      system: 'DCS',
      standardParameter: STANDARD_PARAMETERS[0],
    },

    // pH mappings
    {
      rawSystemId: 'PH_AI_2001',
      rawParameterName: 'pH Analog Input 2001',
      rawUnit: 'pH',
      system: 'DCS',
      standardParameter: STANDARD_PARAMETERS[1],
    },
    {
      rawSystemId: 'BR001_PH_PV',
      rawParameterName: 'BR001 pH Process Value',
      rawUnit: 'pH',
      system: 'DCS',
      standardParameter: STANDARD_PARAMETERS[1],
    },

    // DO mappings
    {
      rawSystemId: 'DO_2001_PV',
      rawParameterName: 'DO-2001 Process Value',
      rawUnit: 'percent',
      system: 'DCS',
      standardParameter: STANDARD_PARAMETERS[2],
    },
    {
      rawSystemId: 'BR001_DO_MEAS',
      rawParameterName: 'BR001 DO Measurement',
      rawUnit: 'percent',
      system: 'DCS',
      standardParameter: STANDARD_PARAMETERS[2],
    },

    // Agitation mappings
    {
      rawSystemId: 'REACTOR_1_AGIT_SPEED',
      rawParameterName: 'Reactor 1 Agitation Speed',
      rawUnit: 'RPM',
      system: 'DCS',
      standardParameter: STANDARD_PARAMETERS[3],
    },
    {
      rawSystemId: 'BR001_STIR_PV',
      rawParameterName: 'BR001 Stirrer Process Value',
      rawUnit: 'RPM',
      system: 'DCS',
      standardParameter: STANDARD_PARAMETERS[3],
    },

    // Level mappings
    {
      rawSystemId: 'BR001_LVL_PERCENT',
      rawParameterName: 'BR001 Level Percent',
      rawUnit: 'percent',
      system: 'DCS',
      standardParameter: STANDARD_PARAMETERS[5],
    },
    {
      rawSystemId: 'LI_2001_VESSEL',
      rawParameterName: 'LI-2001 Vessel Level',
      rawUnit: 'percent',
      system: 'DCS',
      standardParameter: STANDARD_PARAMETERS[5],
    },

    // Gas flow mappings
    {
      rawSystemId: 'O2_FLOW_FI_2001',
      rawParameterName: 'O2 Flow Indicator 2001',
      rawUnit: 'SLPM',
      system: 'DCS',
      standardParameter: STANDARD_PARAMETERS[6],
    },
    {
      rawSystemId: 'CO2_FLOW_2001',
      rawParameterName: 'CO2 Flow 2001',
      rawUnit: 'SLPM',
      system: 'DCS',
      standardParameter: STANDARD_PARAMETERS[7],
    },
    {
      rawSystemId: 'FEED_FLOW_2001',
      rawParameterName: 'Feed Flow 2001',
      rawUnit: 'L/hr',
      system: 'DCS',
      standardParameter: STANDARD_PARAMETERS[8],
    },

    // Chromatography mappings
    {
      rawSystemId: 'CHR_A_PRESS_01',
      rawParameterName: 'Chromatography A Pressure 01',
      rawUnit: 'bar',
      system: 'DCS',
      standardParameter: STANDARD_PARAMETERS[14],
    },
    {
      rawSystemId: 'COLUMN_01_PI',
      rawParameterName: 'Column 01 Pressure Indicator',
      rawUnit: 'bar',
      system: 'DCS',
      standardParameter: STANDARD_PARAMETERS[14],
    },
    {
      rawSystemId: 'CHR_A_FLOW_FI',
      rawParameterName: 'Chromatography A Flow Indicator',
      rawUnit: 'L/hr',
      system: 'DCS',
      standardParameter: STANDARD_PARAMETERS[15],
    },

    // LIMS mappings
    {
      rawSystemId: 'VCD-TRYPAN',
      rawParameterName: 'Viable Cell Density by Trypan Blue',
      rawUnit: 'E6 cells/mL',
      system: 'LIMS',
      standardParameter: STANDARD_PARAMETERS[9],
    },
    {
      rawSystemId: 'VIAB-TRYPAN',
      rawParameterName: 'Viability by Trypan Blue',
      rawUnit: 'percent',
      system: 'LIMS',
      standardParameter: STANDARD_PARAMETERS[10],
    },
    {
      rawSystemId: 'METAB-GLU',
      rawParameterName: 'Metabolite - Glucose',
      rawUnit: 'g/L',
      system: 'LIMS',
      standardParameter: STANDARD_PARAMETERS[11],
    },
    {
      rawSystemId: 'METAB-LAC',
      rawParameterName: 'Metabolite - Lactate',
      rawUnit: 'g/L',
      system: 'LIMS',
      standardParameter: STANDARD_PARAMETERS[12],
    },
    {
      rawSystemId: 'TITER-ELISA',
      rawParameterName: 'Product Titer by ELISA',
      rawUnit: 'g/L',
      system: 'LIMS',
      standardParameter: STANDARD_PARAMETERS[13],
    },
    {
      rawSystemId: 'PURITY-SEC-HPLC',
      rawParameterName: 'Purity by SEC-HPLC (Monomer)',
      rawUnit: 'percent',
      system: 'LIMS',
      standardParameter: STANDARD_PARAMETERS[16],
    },
    {
      rawSystemId: 'AGG-SEC-HPLC-HMW',
      rawParameterName: 'High Molecular Weight Species by SEC-HPLC',
      rawUnit: 'percent',
      system: 'LIMS',
      standardParameter: STANDARD_PARAMETERS[17],
    },
  ];
}

// Find standard parameter by raw ID
export function findStandardParameter(rawSystemId: string, system: 'DCS' | 'eBR' | 'LIMS'): ParameterMapping | undefined {
  return getParameterMappings().find(
    m => m.rawSystemId === rawSystemId && m.system === system
  );
}

// Convert raw value to standard value
export function convertToStandardValue(
  rawValue: number,
  mapping: ParameterMapping
): number {
  let value = rawValue;

  if (mapping.conversionFactor) {
    value *= mapping.conversionFactor;
  }

  if (mapping.conversionOffset) {
    value += mapping.conversionOffset;
  }

  // Round to appropriate precision based on parameter type
  const precision = mapping.standardParameter.standardUnit === 'pH' ? 2 : 1;
  return parseFloat(value.toFixed(precision));
}

// Get all standard parameters
export function getAllStandardParameters(): StandardParameter[] {
  return STANDARD_PARAMETERS;
}

// Group parameters by category
export function groupParametersByCategory(): {
  [category: string]: StandardParameter[];
} {
  const grouped: { [category: string]: StandardParameter[] } = {
    Process: [],
    Equipment: [],
    Quality: [],
    Material: [],
  };

  STANDARD_PARAMETERS.forEach(param => {
    grouped[param.category].push(param);
  });

  return grouped;
}

// Get critical parameters only
export function getCriticalParameters(): StandardParameter[] {
  return STANDARD_PARAMETERS.filter(p => p.classification === 'Critical');
}
