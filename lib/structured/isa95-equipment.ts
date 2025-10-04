/**
 * ISA-95 Equipment Model
 * Defines hierarchical equipment structure and standardized classes
 */

export type EquipmentClass =
  | 'USP_Bioreactor'
  | 'DSP_Chromatography'
  | 'Storage_Tank'
  | 'Filter'
  | 'Mixer'
  | 'CIP_System';

export type EquipmentLevel = 'Site' | 'Area' | 'ProcessCell' | 'Unit' | 'EquipmentModule';

export interface EquipmentHierarchyNode {
  id: string;
  level: EquipmentLevel;
  name: string;
  equipmentClass?: EquipmentClass;
  description: string;
  parentId?: string;
  children?: EquipmentHierarchyNode[];
  metadata?: {
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    installDate?: string;
    capacity?: { value: number; unit: string };
    workingVolume?: { min: number; max: number; unit: string };
  };
  // Raw system mappings
  rawMappings?: {
    dcsPrefix?: string[];
    ebrEquipmentId?: string;
    limsLocationCodes?: string[];
  };
}

export interface EquipmentInstance {
  equipmentId: string;
  equipmentClass: EquipmentClass;
  fullPath: string; // e.g., "Site_A.USP.BR_Cell_1.BR_Unit_2001.BR-2001-A"
  standardizedName: string;
  rawSystemIds: {
    dcs: string[];
    ebr: string;
    lims: string[];
  };
}

// Build the equipment hierarchy for the manufacturing site
export function getEquipmentHierarchy(): EquipmentHierarchyNode {
  return {
    id: 'SITE_A',
    level: 'Site',
    name: 'Manufacturing Site A',
    description: 'Biologics Manufacturing Facility - Building 7',
    children: [
      {
        id: 'SITE_A.USP',
        level: 'Area',
        name: 'Upstream Processing',
        description: 'Cell culture and fermentation area',
        parentId: 'SITE_A',
        children: [
          {
            id: 'SITE_A.USP.BR_CELL_1',
            level: 'ProcessCell',
            name: 'Bioreactor Cell 1',
            description: 'Fed-batch bioreactor production cell',
            parentId: 'SITE_A.USP',
            children: [
              {
                id: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001',
                level: 'Unit',
                name: 'Bioreactor Unit 2001',
                description: '2000L single-use bioreactor system',
                parentId: 'SITE_A.USP.BR_CELL_1',
                children: [
                  {
                    id: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
                    level: 'EquipmentModule',
                    name: 'BR-2001-A',
                    equipmentClass: 'USP_Bioreactor',
                    description: '2000L Single-Use Bioreactor',
                    parentId: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001',
                    metadata: {
                      manufacturer: 'Cytiva',
                      model: 'Xcellerex XDR-2000',
                      serialNumber: 'XDR2K-2024-0847',
                      installDate: '2023-01-15',
                      capacity: { value: 2000, unit: 'L' },
                      workingVolume: { min: 1400, max: 1800, unit: 'L' },
                    },
                    rawMappings: {
                      dcsPrefix: ['BR001_', 'REACTOR_1_', 'BR001', 'TI_2001', 'PH_AI_2001', 'DO_2001', 'LI_2001', 'O2_FLOW_FI_2001', 'CO2_FLOW_2001', 'FEED_FLOW_2001'],
                      ebrEquipmentId: 'BR-2001-A',
                      limsLocationCodes: ['LOC-B7-R2001', 'AREA-USP-BR01', 'BLDG7-SUITE2-BR-A', 'SP-R2001-TOP', 'PORT-BR01-MID', 'SAMPLE-USP-01'],
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'SITE_A.DSP',
        level: 'Area',
        name: 'Downstream Processing',
        description: 'Purification and formulation area',
        parentId: 'SITE_A',
        children: [
          {
            id: 'SITE_A.DSP.CHR_CELL_1',
            level: 'ProcessCell',
            name: 'Chromatography Cell 1',
            description: 'Protein A capture chromatography',
            parentId: 'SITE_A.DSP',
            children: [
              {
                id: 'SITE_A.DSP.CHR_CELL_1.CHR_UNIT_A01',
                level: 'Unit',
                name: 'Chromatography Unit A01',
                description: 'Automated protein A purification system',
                parentId: 'SITE_A.DSP.CHR_CELL_1',
                children: [
                  {
                    id: 'SITE_A.DSP.CHR_CELL_1.CHR_UNIT_A01.CHR-A-01',
                    level: 'EquipmentModule',
                    name: 'CHR-A-01',
                    equipmentClass: 'DSP_Chromatography',
                    description: 'Protein A Chromatography Column',
                    parentId: 'SITE_A.DSP.CHR_CELL_1.CHR_UNIT_A01',
                    metadata: {
                      manufacturer: 'GE Healthcare',
                      model: 'AKTA Ready',
                      serialNumber: 'AKTA-2023-1247',
                      installDate: '2023-03-20',
                      capacity: { value: 20, unit: 'L' },
                    },
                    rawMappings: {
                      dcsPrefix: ['CHR_A_', 'COLUMN_01_'],
                      ebrEquipmentId: 'CHR-A-01',
                      limsLocationCodes: ['CHR-B7-PA01', 'DSP-AREA-PROTA', 'BLDG7-CHR-SUITE1', 'TANK-DSP-01', 'HT-PROTA-OUT', 'VESSEL-CHR-POOL'],
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
}

// Get flattened equipment list
export function getEquipmentInstances(): EquipmentInstance[] {
  return [
    {
      equipmentId: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
      equipmentClass: 'USP_Bioreactor',
      fullPath: 'Site_A.USP.BR_Cell_1.BR_Unit_2001.BR-2001-A',
      standardizedName: 'Bioreactor BR-2001-A',
      rawSystemIds: {
        dcs: ['BR001_PV_TEMP', 'BR001_STIR_PV', 'BR001_DO_MEAS', 'BR001_PH_PV', 'BR001_LVL_PERCENT', 'REACTOR_1_AGIT_SPEED', 'REACTOR_1_TEMP_AI', 'TI_2001_JACKET', 'PH_AI_2001', 'DO_2001_PV', 'LI_2001_VESSEL', 'O2_FLOW_FI_2001', 'CO2_FLOW_2001', 'FEED_FLOW_2001'],
        ebr: 'BR-2001-A',
        lims: ['LOC-B7-R2001', 'AREA-USP-BR01', 'BLDG7-SUITE2-BR-A', 'SP-R2001-TOP', 'PORT-BR01-MID', 'SAMPLE-USP-01'],
      },
    },
    {
      equipmentId: 'SITE_A.DSP.CHR_CELL_1.CHR_UNIT_A01.CHR-A-01',
      equipmentClass: 'DSP_Chromatography',
      fullPath: 'Site_A.DSP.CHR_Cell_1.CHR_Unit_A01.CHR-A-01',
      standardizedName: 'Chromatography CHR-A-01',
      rawSystemIds: {
        dcs: ['CHR_A_PRESS_01', 'CHR_A_FLOW_FI', 'COLUMN_01_PI'],
        ebr: 'CHR-A-01',
        lims: ['CHR-B7-PA01', 'DSP-AREA-PROTA', 'BLDG7-CHR-SUITE1', 'TANK-DSP-01', 'HT-PROTA-OUT', 'VESSEL-CHR-POOL'],
      },
    },
  ];
}

// Get equipment by ID
export function getEquipmentById(equipmentId: string): EquipmentInstance | undefined {
  return getEquipmentInstances().find(e => e.equipmentId === equipmentId);
}

// Find equipment from raw system ID
export function findEquipmentByRawId(system: 'dcs' | 'ebr' | 'lims', rawId: string): EquipmentInstance | undefined {
  const instances = getEquipmentInstances();

  for (const instance of instances) {
    if (system === 'dcs') {
      // For DCS, check if any tag starts with the raw ID prefix
      const matches = instance.rawSystemIds.dcs.some(tag => rawId.includes(tag) || tag.includes(rawId.split('_')[0]));
      if (matches) return instance;
    } else if (system === 'ebr') {
      if (instance.rawSystemIds.ebr === rawId) return instance;
    } else if (system === 'lims') {
      if (instance.rawSystemIds.lims.includes(rawId)) return instance;
    }
  }

  return undefined;
}

// Traverse hierarchy to get full path
export function getEquipmentPath(node: EquipmentHierarchyNode, targetId: string, path: string[] = []): string[] | null {
  const currentPath = [...path, node.name];

  if (node.id === targetId) {
    return currentPath;
  }

  if (node.children) {
    for (const child of node.children) {
      const result = getEquipmentPath(child, targetId, currentPath);
      if (result) return result;
    }
  }

  return null;
}
