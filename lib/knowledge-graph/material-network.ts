/**
 * Material Flow Network
 * Defines material transformations, quality gates, and genealogy
 */

export interface MaterialNode {
  id: string;
  materialCode: string;
  materialName: string;
  materialType: 'RawMaterial' | 'Intermediate' | 'FinalProduct' | 'Waste';
  lotNumber?: string;
  quantity: number;
  unit: string;
  qualityStatus: 'InSpec' | 'OutOfSpec' | 'Pending' | 'Quarantine';
  location: string;
  specifications?: {
    parameter: string;
    value: number;
    unit: string;
    spec: string;
    result: 'Pass' | 'Fail';
  }[];
}

export interface MaterialTransformation {
  transformationId: string;
  transformationType: 'Process' | 'Mix' | 'Split' | 'Purify' | 'Formulate';
  inputMaterials: string[]; // Material IDs
  outputMaterials: string[]; // Material IDs
  equipmentId: string;
  processId: string;
  timestamp: Date;
  yieldPercentage?: number;
  qualityGate?: {
    required: boolean;
    status: 'Passed' | 'Failed' | 'Pending';
    results?: { test: string; result: string }[];
  };
}

// Material nodes in the network
export function getMaterialNodes(): MaterialNode[] {
  return [
    // Raw Materials
    {
      id: 'MAT_MEDIA_001',
      materialCode: 'MED-CHO-001',
      materialName: 'CHO Basal Medium',
      materialType: 'RawMaterial',
      lotNumber: 'LOT-847261',
      quantity: 1500,
      unit: 'L',
      qualityStatus: 'InSpec',
      location: 'Raw Material Storage',
      specifications: [
        { parameter: 'pH', value: 7.2, unit: 'pH', spec: '7.0-7.4', result: 'Pass' },
        { parameter: 'Osmolality', value: 295, unit: 'mOsm/kg', spec: '280-310', result: 'Pass' },
      ],
    },
    {
      id: 'MAT_SEED_001',
      materialCode: 'SEED-CHO-001',
      materialName: 'CHO Seed Culture',
      materialType: 'Intermediate',
      lotNumber: 'SEED-2024-0341',
      quantity: 150,
      unit: 'L',
      qualityStatus: 'InSpec',
      location: 'Seed Bioreactor',
      specifications: [
        { parameter: 'Viability', value: 95, unit: 'percent', spec: '>90%', result: 'Pass' },
        { parameter: 'VCD', value: 5.2, unit: 'E6 cells/mL', spec: '>3.0', result: 'Pass' },
      ],
    },
    {
      id: 'MAT_FEED_001',
      materialCode: 'FEED-GLU-01',
      materialName: 'Glucose Feed Solution',
      materialType: 'RawMaterial',
      lotNumber: 'LOT-938271',
      quantity: 100,
      unit: 'L',
      qualityStatus: 'InSpec',
      location: 'Feed Tank 1',
    },

    // Intermediates
    {
      id: 'MAT_CULTURE_001',
      materialCode: 'CULTURE-B2024-0342',
      materialName: 'Production Culture',
      materialType: 'Intermediate',
      lotNumber: 'B-2024-0342-CULTURE',
      quantity: 1820,
      unit: 'L',
      qualityStatus: 'InSpec',
      location: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
      specifications: [
        { parameter: 'Viability', value: 88, unit: 'percent', spec: '>80%', result: 'Pass' },
        { parameter: 'VCD', value: 12.5, unit: 'E6 cells/mL', spec: '>8.0', result: 'Pass' },
        { parameter: 'Titer', value: 2.8, unit: 'g/L', spec: '>1.5', result: 'Pass' },
      ],
    },
    {
      id: 'MAT_HARVEST_001',
      materialCode: 'HCCCF-001',
      materialName: 'Harvested Cell Culture Fluid',
      materialType: 'Intermediate',
      lotNumber: 'B-2024-0342-HCCCF',
      quantity: 1820,
      unit: 'L',
      qualityStatus: 'InSpec',
      location: 'SITE_A.STORAGE.TANK_001',
      specifications: [
        { parameter: 'Bioburden', value: 2, unit: 'CFU/mL', spec: '<10', result: 'Pass' },
        { parameter: 'Protein', value: 3.2, unit: 'g/L', spec: '>2.0', result: 'Pass' },
      ],
    },
    {
      id: 'MAT_POOL_001',
      materialCode: 'mAb-2847-POOL',
      materialName: 'Purified mAb Pool',
      materialType: 'Intermediate',
      lotNumber: 'B-2024-0342-POOL-001',
      quantity: 45,
      unit: 'L',
      qualityStatus: 'Pending',
      location: 'SITE_A.STORAGE.TANK_002',
      specifications: [
        { parameter: 'Purity', value: 97.2, unit: 'percent', spec: '>95%', result: 'Pass' },
        { parameter: 'Aggregates', value: 1.8, unit: 'percent', spec: '<3.0%', result: 'Pass' },
        { parameter: 'Endotoxin', value: 0.02, unit: 'EU/mL', spec: '<0.5', result: 'Pass' },
      ],
    },

    // Final Product (future state)
    {
      id: 'MAT_FINAL_001',
      materialCode: 'mAb-2847-DS',
      materialName: 'mAb-2847 Drug Substance',
      materialType: 'FinalProduct',
      lotNumber: 'B-2024-0342-DS',
      quantity: 40,
      unit: 'L',
      qualityStatus: 'Pending',
      location: 'Final Storage',
    },

    // Waste streams
    {
      id: 'MAT_WASTE_001',
      materialCode: 'WASTE-CELLS',
      materialName: 'Spent Cell Mass',
      materialType: 'Waste',
      quantity: 1775,
      unit: 'L',
      qualityStatus: 'InSpec',
      location: 'Waste Processing',
    },
  ];
}

// Material transformations
export function getMaterialTransformations(): MaterialTransformation[] {
  return [
    // Media + Seed → Production Culture
    {
      transformationId: 'TRANS_001',
      transformationType: 'Process',
      inputMaterials: ['MAT_MEDIA_001', 'MAT_SEED_001', 'MAT_FEED_001'],
      outputMaterials: ['MAT_CULTURE_001'],
      equipmentId: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
      processId: 'UP_CULTURE',
      timestamp: new Date('2024-03-15T10:00:00Z'),
      yieldPercentage: 98,
      qualityGate: {
        required: true,
        status: 'Passed',
        results: [
          { test: 'Viability', result: 'Pass' },
          { test: 'Titer', result: 'Pass' },
        ],
      },
    },

    // Production Culture → Harvest (Split: product + waste)
    {
      transformationId: 'TRANS_002',
      transformationType: 'Split',
      inputMaterials: ['MAT_CULTURE_001'],
      outputMaterials: ['MAT_HARVEST_001', 'MAT_WASTE_001'],
      equipmentId: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
      processId: 'UP_HARVEST',
      timestamp: new Date('2024-03-19T18:00:00Z'),
      yieldPercentage: 100,
      qualityGate: {
        required: true,
        status: 'Passed',
        results: [
          { test: 'Bioburden', result: 'Pass' },
          { test: 'Cell Debris', result: 'Pass' },
        ],
      },
    },

    // Harvest → Purified Pool
    {
      transformationId: 'TRANS_003',
      transformationType: 'Purify',
      inputMaterials: ['MAT_HARVEST_001'],
      outputMaterials: ['MAT_POOL_001'],
      equipmentId: 'SITE_A.DSP.CHR_CELL_1.CHR_UNIT_A01.CHR-A-01',
      processId: 'UP_CHROM',
      timestamp: new Date('2024-03-20T06:00:00Z'),
      yieldPercentage: 85,
      qualityGate: {
        required: true,
        status: 'Pending',
        results: [
          { test: 'Purity', result: 'Pass' },
          { test: 'Aggregates', result: 'Pass' },
          { test: 'Endotoxin', result: 'Pending' },
        ],
      },
    },

    // Purified Pool → Final Product (future)
    {
      transformationId: 'TRANS_004',
      transformationType: 'Formulate',
      inputMaterials: ['MAT_POOL_001'],
      outputMaterials: ['MAT_FINAL_001'],
      equipmentId: 'SITE_A.DSP.FORMULATION.FORM-01',
      processId: 'UP_FORMULATION',
      timestamp: new Date('2024-03-21T14:00:00Z'),
      yieldPercentage: 95,
      qualityGate: {
        required: true,
        status: 'Pending',
      },
    },
  ];
}

// Query functions
export function traceMaterialGenealogy(materialId: string): {
  ancestors: MaterialNode[];
  descendants: MaterialNode[];
  transformations: MaterialTransformation[];
} {
  const materials = getMaterialNodes();
  const transformations = getMaterialTransformations();
  const materialMap = new Map(materials.map(m => [m.id, m]));

  const ancestors: MaterialNode[] = [];
  const descendants: MaterialNode[] = [];
  const relatedTransformations: MaterialTransformation[] = [];

  // Find transformations involving this material
  transformations.forEach(trans => {
    if (trans.inputMaterials.includes(materialId)) {
      // This material is an input, find outputs (descendants)
      relatedTransformations.push(trans);
      trans.outputMaterials.forEach(outId => {
        const mat = materialMap.get(outId);
        if (mat) descendants.push(mat);
      });
    }

    if (trans.outputMaterials.includes(materialId)) {
      // This material is an output, find inputs (ancestors)
      relatedTransformations.push(trans);
      trans.inputMaterials.forEach(inId => {
        const mat = materialMap.get(inId);
        if (mat) ancestors.push(mat);
      });
    }
  });

  return { ancestors, descendants, transformations: relatedTransformations };
}

export function findMaterialsByQualityStatus(status: MaterialNode['qualityStatus']): MaterialNode[] {
  return getMaterialNodes().filter(m => m.qualityStatus === status);
}

export function findMaterialsByType(type: MaterialNode['materialType']): MaterialNode[] {
  return getMaterialNodes().filter(m => m.materialType === type);
}

export function getMaterialsAtLocation(location: string): MaterialNode[] {
  return getMaterialNodes().filter(m => m.location.includes(location));
}

export function getQualityGateStatus(): {
  total: number;
  passed: number;
  failed: number;
  pending: number;
} {
  const transformations = getMaterialTransformations();

  const total = transformations.filter(t => t.qualityGate?.required).length;
  const passed = transformations.filter(t => t.qualityGate?.status === 'Passed').length;
  const failed = transformations.filter(t => t.qualityGate?.status === 'Failed').length;
  const pending = transformations.filter(t => t.qualityGate?.status === 'Pending').length;

  return { total, passed, failed, pending };
}

// Build material flow graph
export function buildMaterialFlowGraph(): {
  nodes: MaterialNode[];
  edges: { from: string; to: string; transformation: MaterialTransformation }[];
} {
  const nodes = getMaterialNodes();
  const transformations = getMaterialTransformations();
  const edges: { from: string; to: string; transformation: MaterialTransformation }[] = [];

  transformations.forEach(trans => {
    trans.inputMaterials.forEach(inputId => {
      trans.outputMaterials.forEach(outputId => {
        edges.push({
          from: inputId,
          to: outputId,
          transformation: trans,
        });
      });
    });
  });

  return { nodes, edges };
}

// Calculate overall yield
export function calculateOverallYield(fromMaterialId: string, toMaterialId: string): number {
  const transformations = getMaterialTransformations();

  // Simple path finding - multiply yields
  let totalYield = 100;
  let currentMaterials = [fromMaterialId];
  const visited = new Set<string>();

  while (currentMaterials.length > 0 && !currentMaterials.includes(toMaterialId)) {
    const nextMaterials: string[] = [];

    currentMaterials.forEach(matId => {
      if (visited.has(matId)) return;
      visited.add(matId);

      transformations.forEach(trans => {
        if (trans.inputMaterials.includes(matId)) {
          if (trans.yieldPercentage) {
            totalYield *= trans.yieldPercentage / 100;
          }
          nextMaterials.push(...trans.outputMaterials);
        }
      });
    });

    currentMaterials = nextMaterials;
  }

  return Math.round(totalYield * 10) / 10;
}
