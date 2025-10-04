/**
 * Material Flow Tracking
 * Tracks materials through the manufacturing process with genealogy
 */

export interface Material {
  materialId: string;
  materialCode: string;
  materialName: string;
  materialType: 'RawMaterial' | 'Intermediate' | 'FinalProduct' | 'Consumable' | 'Buffer';
  lotNumber?: string;
  quantity: number;
  unit: string;
}

export interface MaterialFlow {
  flowId: string;
  fromEquipment?: string;
  toEquipment: string;
  material: Material;
  flowType: 'Input' | 'Output' | 'Transfer' | 'Consumption';
  timestamp: Date;
  flowRate?: number;
  flowRateUnit?: string;
  phaseContext?: string;
}

export interface MaterialBalance {
  equipmentId: string;
  timestamp: Date;
  inputs: MaterialFlow[];
  outputs: MaterialFlow[];
  accumulation: number;
  unit: string;
  balanceStatus: 'Balanced' | 'Unbalanced' | 'Pending';
}

export interface MaterialGenealogy {
  finalProduct: Material;
  genealogyTree: MaterialNode[];
}

export interface MaterialNode {
  material: Material;
  sourceEquipment?: string;
  processPhase?: string;
  timestamp: Date;
  parents?: MaterialNode[];
}

// Generate material flows for the batch
export function generateMaterialFlows(batchId: string, batchStartTime: Date): MaterialFlow[] {
  const flows: MaterialFlow[] = [];
  let flowCounter = 1;

  // Inoculation - Media Addition
  flows.push({
    flowId: `FLOW-${flowCounter++}`,
    toEquipment: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
    material: {
      materialId: 'MAT-001',
      materialCode: 'MED-CHO-001',
      materialName: 'CHO Basal Medium',
      materialType: 'RawMaterial',
      lotNumber: 'LOT-847261',
      quantity: 1500,
      unit: 'L',
    },
    flowType: 'Input',
    timestamp: new Date(batchStartTime.getTime() + 4 * 3600000),
    phaseContext: 'PROC_mAb_2847_PROD.UP_FED_BATCH_CULTURE.OP_INOCULATION.PH_MEDIA_ADD',
  });

  flows.push({
    flowId: `FLOW-${flowCounter++}`,
    toEquipment: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
    material: {
      materialId: 'MAT-002',
      materialCode: 'MED-SUP-042',
      materialName: 'Growth Supplement',
      materialType: 'RawMaterial',
      lotNumber: 'LOT-293841',
      quantity: 50,
      unit: 'L',
    },
    flowType: 'Input',
    timestamp: new Date(batchStartTime.getTime() + 4.5 * 3600000),
    phaseContext: 'PROC_mAb_2847_PROD.UP_FED_BATCH_CULTURE.OP_INOCULATION.PH_MEDIA_ADD',
  });

  // Seed culture transfer
  flows.push({
    flowId: `FLOW-${flowCounter++}`,
    toEquipment: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
    material: {
      materialId: 'MAT-003',
      materialCode: 'SEED-CHO-001',
      materialName: 'CHO Seed Culture',
      materialType: 'Intermediate',
      lotNumber: 'SEED-2024-0341',
      quantity: 150,
      unit: 'L',
    },
    flowType: 'Input',
    timestamp: new Date(batchStartTime.getTime() + 5 * 3600000),
    phaseContext: 'PROC_mAb_2847_PROD.UP_FED_BATCH_CULTURE.OP_INOCULATION.PH_SEED_TRANSFER',
  });

  // Feed additions during growth phase
  const feedTimes = [28, 40, 52, 64, 76];
  feedTimes.forEach((hour, idx) => {
    flows.push({
      flowId: `FLOW-${flowCounter++}`,
      toEquipment: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
      material: {
        materialId: `MAT-FEED-${idx + 1}`,
        materialCode: 'FEED-GLU-01',
        materialName: 'Glucose Feed Solution',
        materialType: 'RawMaterial',
        lotNumber: `LOT-${938271 + idx}`,
        quantity: 20,
        unit: 'L',
      },
      flowType: 'Input',
      timestamp: new Date(batchStartTime.getTime() + hour * 3600000),
      flowRate: 0.5,
      flowRateUnit: 'L/hr',
      phaseContext: hour < 33 ? 'PROC_mAb_2847_PROD.UP_FED_BATCH_CULTURE.OP_EXPONENTIAL_GROWTH.PH_FEED_INITIATION' : 'PROC_mAb_2847_PROD.UP_FED_BATCH_CULTURE.OP_PRODUCTION_PHASE.PH_FED_BATCH_PRODUCTION',
    });
  });

  // Harvest - Output from bioreactor
  flows.push({
    flowId: `FLOW-${flowCounter++}`,
    fromEquipment: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
    toEquipment: 'HARVEST_TANK_001',
    material: {
      materialId: 'MAT-HARVEST-001',
      materialCode: 'HCCCF-001',
      materialName: 'Harvested Cell Culture Fluid',
      materialType: 'Intermediate',
      lotNumber: `${batchId}-HCCCF`,
      quantity: 1820,
      unit: 'L',
    },
    flowType: 'Output',
    timestamp: new Date(batchStartTime.getTime() + 91 * 3600000),
    flowRate: 100,
    flowRateUnit: 'L/hr',
    phaseContext: 'PROC_mAb_2847_PROD.UP_HARVEST.OP_TRANSFER.PH_HARVEST_TRANSFER',
  });

  // Chromatography - Buffer inputs
  flows.push({
    flowId: `FLOW-${flowCounter++}`,
    toEquipment: 'SITE_A.DSP.CHR_CELL_1.CHR_UNIT_A01.CHR-A-01',
    material: {
      materialId: 'MAT-BUF-001',
      materialCode: 'BUF-PBS-7.2',
      materialName: 'Equilibration Buffer - PBS pH 7.2',
      materialType: 'Buffer',
      lotNumber: 'LOT-BUF-847261',
      quantity: 100,
      unit: 'L',
    },
    flowType: 'Input',
    timestamp: new Date(batchStartTime.getTime() + 96 * 3600000),
    phaseContext: 'PROC_mAb_2847_PROD.UP_PROTEIN_A_CHROM.OP_COLUMN_PREP.PH_EQUILIBRATION',
  });

  // Load harvested material onto column
  flows.push({
    flowId: `FLOW-${flowCounter++}`,
    fromEquipment: 'HARVEST_TANK_001',
    toEquipment: 'SITE_A.DSP.CHR_CELL_1.CHR_UNIT_A01.CHR-A-01',
    material: {
      materialId: 'MAT-HARVEST-001',
      materialCode: 'HCCCF-001',
      materialName: 'Harvested Cell Culture Fluid',
      materialType: 'Intermediate',
      lotNumber: `${batchId}-HCCCF`,
      quantity: 1820,
      unit: 'L',
    },
    flowType: 'Input',
    timestamp: new Date(batchStartTime.getTime() + 97 * 3600000),
    flowRate: 80,
    flowRateUnit: 'L/hr',
    phaseContext: 'PROC_mAb_2847_PROD.UP_PROTEIN_A_CHROM.OP_LOAD.PH_LOAD',
  });

  // Wash buffer
  flows.push({
    flowId: `FLOW-${flowCounter++}`,
    toEquipment: 'SITE_A.DSP.CHR_CELL_1.CHR_UNIT_A01.CHR-A-01',
    material: {
      materialId: 'MAT-BUF-002',
      materialCode: 'BUF-WASH-01',
      materialName: 'Wash Buffer',
      materialType: 'Buffer',
      lotNumber: 'LOT-BUF-847262',
      quantity: 200,
      unit: 'L',
    },
    flowType: 'Input',
    timestamp: new Date(batchStartTime.getTime() + 100 * 3600000),
    phaseContext: 'PROC_mAb_2847_PROD.UP_PROTEIN_A_CHROM.OP_WASH.PH_WASH_1',
  });

  // Elution - Final product output
  flows.push({
    flowId: `FLOW-${flowCounter++}`,
    fromEquipment: 'SITE_A.DSP.CHR_CELL_1.CHR_UNIT_A01.CHR-A-01',
    toEquipment: 'POOL_TANK_001',
    material: {
      materialId: 'MAT-PURIFIED-001',
      materialCode: 'mAb-2847-POOL',
      materialName: 'Purified mAb-2847 Pool',
      materialType: 'Intermediate',
      lotNumber: `${batchId}-POOL-001`,
      quantity: 45,
      unit: 'L',
    },
    flowType: 'Output',
    timestamp: new Date(batchStartTime.getTime() + 103 * 3600000),
    flowRate: 15,
    flowRateUnit: 'L/hr',
    phaseContext: 'PROC_mAb_2847_PROD.UP_PROTEIN_A_CHROM.OP_ELUTION.PH_ELUTION',
  });

  return flows;
}

// Calculate material balance for equipment
export function calculateMaterialBalance(
  equipmentId: string,
  flows: MaterialFlow[],
  timestamp: Date
): MaterialBalance {
  const inputs = flows.filter(
    f => f.toEquipment === equipmentId && f.timestamp <= timestamp
  );

  const outputs = flows.filter(
    f => f.fromEquipment === equipmentId && f.timestamp <= timestamp
  );

  const totalInput = inputs.reduce((sum, f) => sum + f.material.quantity, 0);
  const totalOutput = outputs.reduce((sum, f) => sum + f.material.quantity, 0);
  const accumulation = totalInput - totalOutput;

  // Simple balance check (±5% tolerance)
  const balanceStatus: MaterialBalance['balanceStatus'] =
    outputs.length === 0 ? 'Pending' :
    Math.abs(accumulation) / totalInput < 0.05 ? 'Balanced' : 'Unbalanced';

  return {
    equipmentId,
    timestamp,
    inputs,
    outputs,
    accumulation,
    unit: 'L',
    balanceStatus,
  };
}

// Build material genealogy tree
export function buildMaterialGenealogy(
  finalProductMaterialId: string,
  allFlows: MaterialFlow[]
): MaterialGenealogy {
  // Find the final product
  const finalProductFlow = allFlows.find(f => f.material.materialId === finalProductMaterialId);
  if (!finalProductFlow) {
    throw new Error('Final product not found');
  }

  const buildNode = (materialId: string, flows: MaterialFlow[]): MaterialNode | null => {
    const flow = flows.find(f => f.material.materialId === materialId);
    if (!flow) return null;

    const node: MaterialNode = {
      material: flow.material,
      sourceEquipment: flow.fromEquipment || flow.toEquipment,
      processPhase: flow.phaseContext,
      timestamp: flow.timestamp,
    };

    // Find parent materials (inputs to the equipment that produced this material)
    if (flow.fromEquipment) {
      const parentFlows = flows.filter(
        f => f.toEquipment === flow.fromEquipment && f.timestamp < flow.timestamp
      );

      if (parentFlows.length > 0) {
        node.parents = parentFlows
          .map(pf => buildNode(pf.material.materialId, flows))
          .filter((n): n is MaterialNode => n !== null);
      }
    }

    return node;
  };

  const rootNode = buildNode(finalProductMaterialId, allFlows);

  return {
    finalProduct: finalProductFlow.material,
    genealogyTree: rootNode ? [rootNode] : [],
  };
}

// Get material flow summary
export function getMaterialFlowSummary(flows: MaterialFlow[]): {
  totalInputs: number;
  totalOutputs: number;
  equipmentSummary: { [equipmentId: string]: { inputs: number; outputs: number } };
} {
  let totalInputs = 0;
  let totalOutputs = 0;
  const equipmentSummary: { [equipmentId: string]: { inputs: number; outputs: number } } = {};

  flows.forEach(flow => {
    if (flow.flowType === 'Input') {
      totalInputs += flow.material.quantity;

      if (!equipmentSummary[flow.toEquipment]) {
        equipmentSummary[flow.toEquipment] = { inputs: 0, outputs: 0 };
      }
      equipmentSummary[flow.toEquipment].inputs += flow.material.quantity;
    } else if (flow.flowType === 'Output') {
      totalOutputs += flow.material.quantity;

      if (flow.fromEquipment) {
        if (!equipmentSummary[flow.fromEquipment]) {
          equipmentSummary[flow.fromEquipment] = { inputs: 0, outputs: 0 };
        }
        equipmentSummary[flow.fromEquipment].outputs += flow.material.quantity;
      }
    }
  });

  return { totalInputs, totalOutputs, equipmentSummary };
}
