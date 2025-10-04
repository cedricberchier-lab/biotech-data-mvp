/**
 * Process Hierarchy Network
 * Defines process relationships, dependencies, and equipment assignments
 */

export interface ProcessNode {
  id: string;
  name: string;
  level: 'Procedure' | 'UnitProcedure' | 'Operation' | 'Phase';
  parentId?: string;
  equipmentId?: string;
  status: 'NotStarted' | 'Running' | 'Complete' | 'Paused' | 'Failed';
  dependencies?: string[]; // IDs of processes that must complete first
  duration?: {
    expected: number;
    actual?: number;
    unit: string;
  };
  metadata?: {
    criticalStep?: boolean;
    qcRequired?: boolean;
    operatorSignatureRequired?: boolean;
  };
}

export interface ProcessConnection {
  from: string;
  to: string;
  connectionType: 'Sequence' | 'Parallel' | 'Conditional' | 'Hierarchy';
  condition?: string;
}

// Get full process network
export function getProcessNetwork(): ProcessNode[] {
  return [
    // Procedure level
    {
      id: 'PROC_mAb_2847',
      name: 'mAb-2847 Production',
      level: 'Procedure',
      status: 'Running',
      duration: { expected: 105, unit: 'hours' },
    },

    // Unit Procedures
    {
      id: 'UP_PREP',
      name: 'Bioreactor Preparation',
      level: 'UnitProcedure',
      parentId: 'PROC_mAb_2847',
      equipmentId: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
      status: 'Complete',
      duration: { expected: 4, actual: 4.2, unit: 'hours' },
      metadata: { criticalStep: true },
    },
    {
      id: 'UP_CULTURE',
      name: 'Fed-Batch Cell Culture',
      level: 'UnitProcedure',
      parentId: 'PROC_mAb_2847',
      equipmentId: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
      status: 'Running',
      dependencies: ['UP_PREP'],
      duration: { expected: 84, actual: 82, unit: 'hours' },
      metadata: { criticalStep: true, qcRequired: true },
    },
    {
      id: 'UP_HARVEST',
      name: 'Cell Harvest',
      level: 'UnitProcedure',
      parentId: 'PROC_mAb_2847',
      equipmentId: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
      status: 'NotStarted',
      dependencies: ['UP_CULTURE'],
      duration: { expected: 8, unit: 'hours' },
    },
    {
      id: 'UP_CHROM',
      name: 'Protein A Chromatography',
      level: 'UnitProcedure',
      parentId: 'PROC_mAb_2847',
      equipmentId: 'SITE_A.DSP.CHR_CELL_1.CHR_UNIT_A01.CHR-A-01',
      status: 'NotStarted',
      dependencies: ['UP_HARVEST'],
      duration: { expected: 6, unit: 'hours' },
      metadata: { criticalStep: true },
    },

    // Operations under Culture
    {
      id: 'OP_INOC',
      name: 'Inoculation',
      level: 'Operation',
      parentId: 'UP_CULTURE',
      equipmentId: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
      status: 'Complete',
      duration: { expected: 3, actual: 2.8, unit: 'hours' },
    },
    {
      id: 'OP_GROWTH',
      name: 'Exponential Growth',
      level: 'Operation',
      parentId: 'UP_CULTURE',
      equipmentId: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
      status: 'Complete',
      dependencies: ['OP_INOC'],
      duration: { expected: 24, actual: 23.5, unit: 'hours' },
    },
    {
      id: 'OP_PROD',
      name: 'Production Phase',
      level: 'Operation',
      parentId: 'UP_CULTURE',
      equipmentId: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
      status: 'Running',
      dependencies: ['OP_GROWTH'],
      duration: { expected: 60, actual: 58, unit: 'hours' },
      metadata: { qcRequired: true },
    },

    // Phases under Production
    {
      id: 'PH_TEMP_SHIFT',
      name: 'Temperature Shift',
      level: 'Phase',
      parentId: 'OP_PROD',
      equipmentId: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
      status: 'Complete',
      duration: { expected: 2, actual: 1.8, unit: 'hours' },
      metadata: { criticalStep: true },
    },
    {
      id: 'PH_FED_BATCH',
      name: 'Fed-Batch Production',
      level: 'Phase',
      parentId: 'OP_PROD',
      equipmentId: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
      status: 'Running',
      dependencies: ['PH_TEMP_SHIFT'],
      duration: { expected: 51, actual: 50, unit: 'hours' },
    },

    // Operations under Chromatography
    {
      id: 'OP_CHR_PREP',
      name: 'Column Preparation',
      level: 'Operation',
      parentId: 'UP_CHROM',
      equipmentId: 'SITE_A.DSP.CHR_CELL_1.CHR_UNIT_A01.CHR-A-01',
      status: 'NotStarted',
      duration: { expected: 1, unit: 'hours' },
    },
    {
      id: 'OP_CHR_LOAD',
      name: 'Load Phase',
      level: 'Operation',
      parentId: 'UP_CHROM',
      equipmentId: 'SITE_A.DSP.CHR_CELL_1.CHR_UNIT_A01.CHR-A-01',
      status: 'NotStarted',
      dependencies: ['OP_CHR_PREP'],
      duration: { expected: 3, unit: 'hours' },
    },
    {
      id: 'OP_CHR_ELUTION',
      name: 'Elution',
      level: 'Operation',
      parentId: 'UP_CHROM',
      equipmentId: 'SITE_A.DSP.CHR_CELL_1.CHR_UNIT_A01.CHR-A-01',
      status: 'NotStarted',
      dependencies: ['OP_CHR_LOAD'],
      duration: { expected: 2, unit: 'hours' },
      metadata: { criticalStep: true, qcRequired: true },
    },
  ];
}

// Get process connections
export function getProcessConnections(): ProcessConnection[] {
  const processes = getProcessNetwork();
  const connections: ProcessConnection[] = [];

  // Add hierarchy connections
  processes.forEach(proc => {
    if (proc.parentId) {
      connections.push({
        from: proc.parentId,
        to: proc.id,
        connectionType: 'Hierarchy',
      });
    }
  });

  // Add sequence connections based on dependencies
  processes.forEach(proc => {
    proc.dependencies?.forEach(depId => {
      connections.push({
        from: depId,
        to: proc.id,
        connectionType: 'Sequence',
      });
    });
  });

  return connections;
}

// Query functions
export function getProcessesByEquipment(equipmentId: string): ProcessNode[] {
  return getProcessNetwork().filter(p => p.equipmentId === equipmentId);
}

export function getProcessesByStatus(status: ProcessNode['status']): ProcessNode[] {
  return getProcessNetwork().filter(p => p.status === status);
}

export function getCriticalProcesses(): ProcessNode[] {
  return getProcessNetwork().filter(p => p.metadata?.criticalStep);
}

export function getProcessChildren(processId: string): ProcessNode[] {
  return getProcessNetwork().filter(p => p.parentId === processId);
}

export function getProcessPath(processId: string): ProcessNode[] {
  const processes = getProcessNetwork();
  const processMap = new Map(processes.map(p => [p.id, p]));
  const path: ProcessNode[] = [];

  let current = processMap.get(processId);
  while (current) {
    path.unshift(current);
    current = current.parentId ? processMap.get(current.parentId) : undefined;
  }

  return path;
}

// Get process timeline
export function getProcessTimeline(): {
  processId: string;
  processName: string;
  startTime: number;
  endTime: number;
  status: string;
}[] {
  const processes = getProcessNetwork();
  let currentTime = 0;

  return processes
    .filter(p => p.level === 'UnitProcedure' || p.level === 'Operation')
    .map(proc => {
      const duration = proc.duration?.actual || proc.duration?.expected || 0;
      const start = currentTime;
      const end = start + duration;

      if (proc.status === 'Complete' || proc.status === 'Running') {
        currentTime = end;
      }

      return {
        processId: proc.id,
        processName: proc.name,
        startTime: start,
        endTime: end,
        status: proc.status,
      };
    });
}

// Check if process is ready to start (all dependencies met)
export function isProcessReady(processId: string): boolean {
  const processes = getProcessNetwork();
  const processMap = new Map(processes.map(p => [p.id, p]));
  const process = processMap.get(processId);

  if (!process || process.status !== 'NotStarted') return false;

  if (!process.dependencies || process.dependencies.length === 0) return true;

  return process.dependencies.every(depId => {
    const dep = processMap.get(depId);
    return dep?.status === 'Complete';
  });
}
