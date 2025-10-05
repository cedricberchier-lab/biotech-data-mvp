// Query result types for KnowledgeQueryView
export interface EquipmentInProductionResult {
  equipment: {
    name: string;
    equipmentClass: string;
    status: string;
  };
  currentPhase: string;
  activeProcesses: { name: string }[];
}

export interface TraceBatchResult {
  batchId: string;
  materials: { name: string; id: string }[];
  equipment: { name: string; id: string }[];
  processes: { name: string; status: string }[];
}

export interface QualityIssueResult {
  material: { name: string; lotNumber: string };
  issue: string;
  rootCause: {
    equipment?: string;
    process?: string;
    parameter?: string;
  };
}

export interface SiteComparisonResult {
  metric: string;
  siteA: number;
  siteB: number;
  difference: number;
}

export interface BottleneckResult {
  process: { name: string; id: string };
  bottleneckType: string;
  impact: string;
  duration: { expected: number; actual: number };
}

export interface GenealogyResult {
  material: { name: string; id: string };
  ancestors: { name: string }[];
  descendants: { name: string }[];
}
