/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Equipment Relationship Network
 * Defines equipment connections, class hierarchies, and cross-site relationships
 */

export type EquipmentConnectionType =
  | 'PhysicalFlow'      // Material flows between equipment
  | 'ProcessSequence'   // Process sequence connection
  | 'SameClass'        // Same equipment class at different sites
  | 'Hierarchy'        // Parent-child in ISA-95 hierarchy
  | 'Utility';         // Utility connection (e.g., CIP system)

export interface EquipmentNode {
  id: string;
  name: string;
  equipmentClass: string;
  site: string;
  area: string;
  status: 'Running' | 'Idle' | 'Maintenance' | 'Offline';
  currentProcess?: string;
  metadata?: {
    capacity?: string;
    manufacturer?: string;
    model?: string;
  };
}

export interface EquipmentConnection {
  from: string;
  to: string;
  connectionType: EquipmentConnectionType;
  label?: string;
  metadata?: {
    flowRate?: string;
    material?: string;
    direction?: 'unidirectional' | 'bidirectional';
  };
}

export interface EquipmentClassHierarchy {
  className: string;
  parentClass?: string;
  description: string;
  instances: EquipmentNode[];
}

// Equipment class taxonomy
export function getEquipmentClassHierarchy(): EquipmentClassHierarchy[] {
  return [
    {
      className: 'Manufacturing_Equipment',
      description: 'Root class for all manufacturing equipment',
      instances: [],
    },
    {
      className: 'USP_Equipment',
      parentClass: 'Manufacturing_Equipment',
      description: 'Upstream processing equipment',
      instances: [],
    },
    {
      className: 'Cell_Culture_Equipment',
      parentClass: 'USP_Equipment',
      description: 'Equipment for mammalian cell culture',
      instances: [],
    },
    {
      className: 'USP_Bioreactor',
      parentClass: 'Cell_Culture_Equipment',
      description: 'Bioreactor systems for cell culture',
      instances: [
        {
          id: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
          name: 'BR-2001-A',
          equipmentClass: 'USP_Bioreactor',
          site: 'Site_A',
          area: 'USP',
          status: 'Running',
          currentProcess: 'Fed-Batch Production',
          metadata: {
            capacity: '2000L',
            manufacturer: 'Cytiva',
            model: 'Xcellerex XDR-2000',
          },
        },
        {
          id: 'SITE_B.USP.BR_CELL_2.BR_UNIT_3002.BR-3002-B',
          name: 'BR-3002-B',
          equipmentClass: 'USP_Bioreactor',
          site: 'Site_B',
          area: 'USP',
          status: 'Idle',
          metadata: {
            capacity: '2000L',
            manufacturer: 'Cytiva',
            model: 'Xcellerex XDR-2000',
          },
        },
      ],
    },
    {
      className: 'DSP_Equipment',
      parentClass: 'Manufacturing_Equipment',
      description: 'Downstream processing equipment',
      instances: [],
    },
    {
      className: 'Chromatography_Equipment',
      parentClass: 'DSP_Equipment',
      description: 'Chromatography systems for purification',
      instances: [],
    },
    {
      className: 'DSP_Chromatography',
      parentClass: 'Chromatography_Equipment',
      description: 'Affinity chromatography systems',
      instances: [
        {
          id: 'SITE_A.DSP.CHR_CELL_1.CHR_UNIT_A01.CHR-A-01',
          name: 'CHR-A-01',
          equipmentClass: 'DSP_Chromatography',
          site: 'Site_A',
          area: 'DSP',
          status: 'Running',
          currentProcess: 'Protein A Load',
          metadata: {
            capacity: '20L',
            manufacturer: 'GE Healthcare',
            model: 'AKTA Ready',
          },
        },
        {
          id: 'SITE_A.DSP.CHR_CELL_1.CHR_UNIT_A02.CHR-A-02',
          name: 'CHR-A-02',
          equipmentClass: 'DSP_Chromatography',
          site: 'Site_A',
          area: 'DSP',
          status: 'Maintenance',
          metadata: {
            capacity: '20L',
            manufacturer: 'GE Healthcare',
            model: 'AKTA Ready',
          },
        },
      ],
    },
    {
      className: 'Storage_Equipment',
      parentClass: 'Manufacturing_Equipment',
      description: 'Storage and hold vessels',
      instances: [],
    },
    {
      className: 'Storage_Tank',
      parentClass: 'Storage_Equipment',
      description: 'Intermediate storage tanks',
      instances: [
        {
          id: 'SITE_A.STORAGE.TANK_001',
          name: 'Harvest Tank 001',
          equipmentClass: 'Storage_Tank',
          site: 'Site_A',
          area: 'Storage',
          status: 'Running',
          metadata: {
            capacity: '3000L',
          },
        },
        {
          id: 'SITE_A.STORAGE.TANK_002',
          name: 'Pool Tank 002',
          equipmentClass: 'Storage_Tank',
          site: 'Site_A',
          area: 'Storage',
          status: 'Idle',
          metadata: {
            capacity: '500L',
          },
        },
      ],
    },
  ];
}

// Get all equipment nodes
export function getAllEquipmentNodes(): EquipmentNode[] {
  const hierarchy = getEquipmentClassHierarchy();
  const nodes: EquipmentNode[] = [];

  hierarchy.forEach(classNode => {
    nodes.push(...classNode.instances);
  });

  return nodes;
}

// Define equipment connections
export function getEquipmentConnections(): EquipmentConnection[] {
  return [
    // Physical flow connections - Site A Production Line
    {
      from: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
      to: 'SITE_A.STORAGE.TANK_001',
      connectionType: 'PhysicalFlow',
      label: 'Harvest Transfer',
      metadata: {
        flowRate: '100 L/hr',
        material: 'Cell Culture Broth',
        direction: 'unidirectional',
      },
    },
    {
      from: 'SITE_A.STORAGE.TANK_001',
      to: 'SITE_A.DSP.CHR_CELL_1.CHR_UNIT_A01.CHR-A-01',
      connectionType: 'PhysicalFlow',
      label: 'Column Load',
      metadata: {
        flowRate: '80 L/hr',
        material: 'Clarified Harvest',
        direction: 'unidirectional',
      },
    },
    {
      from: 'SITE_A.DSP.CHR_CELL_1.CHR_UNIT_A01.CHR-A-01',
      to: 'SITE_A.STORAGE.TANK_002',
      connectionType: 'PhysicalFlow',
      label: 'Elution Pool',
      metadata: {
        flowRate: '15 L/hr',
        material: 'Purified mAb',
        direction: 'unidirectional',
      },
    },

    // Process sequence connections
    {
      from: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
      to: 'SITE_A.DSP.CHR_CELL_1.CHR_UNIT_A01.CHR-A-01',
      connectionType: 'ProcessSequence',
      label: 'USP → DSP',
    },

    // Same class connections (cross-site)
    {
      from: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
      to: 'SITE_B.USP.BR_CELL_2.BR_UNIT_3002.BR-3002-B',
      connectionType: 'SameClass',
      label: 'Same Equipment Class',
      metadata: {
        direction: 'bidirectional',
      },
    },
    {
      from: 'SITE_A.DSP.CHR_CELL_1.CHR_UNIT_A01.CHR-A-01',
      to: 'SITE_A.DSP.CHR_CELL_1.CHR_UNIT_A02.CHR-A-02',
      connectionType: 'SameClass',
      label: 'Parallel Units',
      metadata: {
        direction: 'bidirectional',
      },
    },
  ];
}

// Query functions
export function findEquipmentByClass(className: string): EquipmentNode[] {
  const hierarchy = getEquipmentClassHierarchy();
  const classNode = hierarchy.find(c => c.className === className);
  return classNode?.instances || [];
}

export function findEquipmentByStatus(status: EquipmentNode['status']): EquipmentNode[] {
  return getAllEquipmentNodes().filter(node => node.status === status);
}

export function findEquipmentInProcess(processName: string): EquipmentNode[] {
  return getAllEquipmentNodes().filter(
    node => node.currentProcess?.toLowerCase().includes(processName.toLowerCase())
  );
}

export function getEquipmentPath(fromId: string, toId: string): EquipmentNode[] {
  const connections = getEquipmentConnections();
  const nodes = getAllEquipmentNodes();
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  // Simple BFS to find path
  const queue: string[][] = [[fromId]];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const path = queue.shift()!;
    const current = path[path.length - 1];

    if (current === toId) {
      return path.map(id => nodeMap.get(id)!).filter(Boolean);
    }

    if (visited.has(current)) continue;
    visited.add(current);

    const nextConnections = connections.filter(
      c => c.from === current && c.connectionType === 'PhysicalFlow'
    );

    for (const conn of nextConnections) {
      queue.push([...path, conn.to]);
    }
  }

  return [];
}

// Get connected equipment (neighbors)
export function getConnectedEquipment(equipmentId: string): {
  upstream: EquipmentNode[];
  downstream: EquipmentNode[];
  sameClass: EquipmentNode[];
} {
  const connections = getEquipmentConnections();
  const nodes = getAllEquipmentNodes();
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  const upstream: EquipmentNode[] = [];
  const downstream: EquipmentNode[] = [];
  const sameClass: EquipmentNode[] = [];

  connections.forEach(conn => {
    if (conn.to === equipmentId && conn.connectionType === 'PhysicalFlow') {
      const node = nodeMap.get(conn.from);
      if (node) upstream.push(node);
    }
    if (conn.from === equipmentId && conn.connectionType === 'PhysicalFlow') {
      const node = nodeMap.get(conn.to);
      if (node) downstream.push(node);
    }
    if ((conn.from === equipmentId || conn.to === equipmentId) && conn.connectionType === 'SameClass') {
      const otherId = conn.from === equipmentId ? conn.to : conn.from;
      const node = nodeMap.get(otherId);
      if (node) sameClass.push(node);
    }
  });

  return { upstream, downstream, sameClass };
}

// Build equipment class tree
export function buildEquipmentClassTree() {
  const hierarchy = getEquipmentClassHierarchy();
  const tree: any = {};

  hierarchy.forEach(classNode => {
    const path = getClassPath(classNode.className, hierarchy);
    let current = tree;

    path.forEach((className, idx) => {
      if (!current[className]) {
        const node = hierarchy.find(h => h.className === className);
        current[className] = {
          info: node,
          children: {},
        };
      }
      current = current[className].children;
    });
  });

  return tree;
}

function getClassPath(className: string, hierarchy: EquipmentClassHierarchy[]): string[] {
  const path: string[] = [className];
  let current = hierarchy.find(h => h.className === className);

  while (current?.parentClass) {
    path.unshift(current.parentClass);
    current = hierarchy.find(h => h.className === current?.parentClass);
  }

  return path;
}
