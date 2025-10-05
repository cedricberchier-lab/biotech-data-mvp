/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Knowledge Graph Query Engine
 * Enables complex queries across equipment, process, and material networks
 */

import { getAllEquipmentNodes, getConnectedEquipment, findEquipmentByStatus, type EquipmentNode } from './equipment-network';
import { getProcessNetwork, getProcessesByEquipment, getProcessesByStatus, type ProcessNode } from './process-network';
import { getMaterialNodes, traceMaterialGenealogy, findMaterialsByQualityStatus, type MaterialNode, getMaterialTransformations } from './material-network';

export interface QueryResult {
  queryName: string;
  description: string;
  results: any[];
  executionTime: number;
  resultCount: number;
}

export type QueryType =
  | 'equipment_in_production'
  | 'trace_batch'
  | 'find_quality_issues'
  | 'compare_sites'
  | 'process_bottlenecks'
  | 'material_genealogy';

// Query: Show all bioreactors currently in production phase
export function queryEquipmentInProduction(): QueryResult {
  const startTime = performance.now();

  const equipmentNodes = getAllEquipmentNodes();
  const processNodes = getProcessNetwork();

  // Find all equipment in "Running" status with production-related processes
  const results = equipmentNodes
    .filter(eq => eq.status === 'Running')
    .filter(eq => {
      const processes = processNodes.filter(p => p.equipmentId === eq.id && p.status === 'Running');
      return processes.some(p =>
        p.name.toLowerCase().includes('production') ||
        p.name.toLowerCase().includes('culture') ||
        p.name.toLowerCase().includes('batch')
      );
    })
    .map(eq => {
      const activeProcesses = processNodes.filter(
        p => p.equipmentId === eq.id && p.status === 'Running'
      );

      return {
        equipment: eq,
        activeProcesses: activeProcesses,
        currentPhase: activeProcesses.find(p => p.level === 'Phase')?.name || 'Unknown',
      };
    });

  const executionTime = performance.now() - startTime;

  return {
    queryName: 'Equipment in Production',
    description: 'All bioreactors and equipment currently running production processes',
    results,
    executionTime,
    resultCount: results.length,
  };
}

// Query: Trace batch from seed culture to final product
export function queryTraceBatch(batchId: string): QueryResult {
  const startTime = performance.now();

  const materials = getMaterialNodes();
  const transformations = getMaterialTransformations();

  // Find all materials with this batch ID
  const batchMaterials = materials.filter(m =>
    m.lotNumber?.includes(batchId) || m.materialCode?.includes(batchId)
  );

  // Build complete genealogy
  const genealogy: any[] = [];
  const visited = new Set<string>();

  const buildPath = (materialId: string, depth: number = 0) => {
    if (visited.has(materialId)) return;
    visited.add(materialId);

    const material = materials.find(m => m.id === materialId);
    if (!material) return;

    const { ancestors, descendants, transformations: trans } = traceMaterialGenealogy(materialId);

    genealogy.push({
      depth,
      material,
      ancestors: ancestors.map(a => a.materialName),
      descendants: descendants.map(d => d.materialName),
      transformations: trans.map(t => ({
        type: t.transformationType,
        equipment: t.equipmentId,
        process: t.processId,
        yield: t.yieldPercentage,
        qualityGate: t.qualityGate?.status,
      })),
    });

    // Recursively build ancestors
    ancestors.forEach(anc => buildPath(anc.id, depth - 1));
    // Recursively build descendants
    descendants.forEach(desc => buildPath(desc.id, depth + 1));
  };

  batchMaterials.forEach(mat => buildPath(mat.id));

  // Sort by depth (raw materials first, final product last)
  genealogy.sort((a, b) => a.depth - b.depth);

  const executionTime = performance.now() - startTime;

  return {
    queryName: 'Trace Batch',
    description: `Complete material genealogy for batch ${batchId}`,
    results: genealogy,
    executionTime,
    resultCount: genealogy.length,
  };
}

// Query: Find equipment that processed material with quality issue
export function queryFindQualityIssues(): QueryResult {
  const startTime = performance.now();

  const materials = getMaterialNodes();
  const transformations = getMaterialTransformations();
  const equipment = getAllEquipmentNodes();

  // Find materials with quality issues
  const problematicMaterials = materials.filter(
    m => m.qualityStatus === 'OutOfSpec' || m.qualityStatus === 'Quarantine'
  );

  // Find transformations that created these materials
  const results = problematicMaterials.map(mat => {
    const transformation = transformations.find(t => t.outputMaterials.includes(mat.id));

    const equipmentNode = transformation
      ? equipment.find(eq => eq.id === transformation.equipmentId)
      : undefined;

    const inputMaterials = transformation
      ? transformation.inputMaterials.map(id => materials.find(m => m.id === id))
      : [];

    return {
      material: mat,
      failedSpecifications: mat.specifications?.filter(s => s.result === 'Fail'),
      transformation: transformation
        ? {
            type: transformation.transformationType,
            equipment: equipmentNode?.name,
            equipmentId: equipmentNode?.id,
            process: transformation.processId,
            qualityGate: transformation.qualityGate,
          }
        : undefined,
      inputMaterials: inputMaterials.filter(Boolean),
      rootCause: 'Analysis Required',
    };
  });

  const executionTime = performance.now() - startTime;

  return {
    queryName: 'Quality Issues',
    description: 'Materials with quality issues and the equipment/processes that created them',
    results,
    executionTime,
    resultCount: results.length,
  };
}

// Query: Compare process flows between sites
export function queryCompareSites(): QueryResult {
  const startTime = performance.now();

  const equipment = getAllEquipmentNodes();

  // Group equipment by site and class
  const siteMap = new Map<string, Map<string, EquipmentNode[]>>();

  equipment.forEach(eq => {
    if (!siteMap.has(eq.site)) {
      siteMap.set(eq.site, new Map());
    }

    const siteEquipment = siteMap.get(eq.site)!;
    if (!siteEquipment.has(eq.equipmentClass)) {
      siteEquipment.set(eq.equipmentClass, []);
    }

    siteEquipment.get(eq.equipmentClass)!.push(eq);
  });

  // Compare sites
  const results: any[] = [];

  siteMap.forEach((classMap, site) => {
    classMap.forEach((equipmentList, equipmentClass) => {
      results.push({
        site,
        equipmentClass,
        count: equipmentList.length,
        equipment: equipmentList.map(eq => ({
          name: eq.name,
          status: eq.status,
          capacity: eq.metadata?.capacity,
          currentProcess: eq.currentProcess,
        })),
      });
    });
  });

  const executionTime = performance.now() - startTime;

  return {
    queryName: 'Cross-Site Comparison',
    description: 'Equipment capabilities and utilization across all sites',
    results,
    executionTime,
    resultCount: results.length,
  };
}

// Query: Identify process bottlenecks
export function queryProcessBottlenecks(): QueryResult {
  const startTime = performance.now();

  const processes = getProcessNetwork();

  // Find processes that are delayed or have long durations
  const bottlenecks = processes
    .filter(p => p.duration?.expected && p.duration?.actual)
    .filter(p => {
      const expected = p.duration!.expected;
      const actual = p.duration!.actual!;
      return actual > expected * 1.1; // More than 10% over expected time
    })
    .map(p => {
      const delay = p.duration!.actual! - p.duration!.expected;
      const delayPercentage = ((delay / p.duration!.expected) * 100).toFixed(1);

      return {
        process: p,
        expectedDuration: p.duration!.expected,
        actualDuration: p.duration!.actual,
        delay,
        delayPercentage: `${delayPercentage}%`,
        equipmentId: p.equipmentId,
        critical: p.metadata?.criticalStep,
      };
    })
    .sort((a, b) => b.delay - a.delay);

  const executionTime = performance.now() - startTime;

  return {
    queryName: 'Process Bottlenecks',
    description: 'Processes running longer than expected duration',
    results: bottlenecks,
    executionTime,
    resultCount: bottlenecks.length,
  };
}

// Query: Complete material genealogy for a specific material
export function queryMaterialGenealogy(materialId: string): QueryResult {
  const startTime = performance.now();

  const materials = getMaterialNodes();
  const material = materials.find(m => m.id === materialId);

  if (!material) {
    return {
      queryName: 'Material Genealogy',
      description: `Material ${materialId} not found`,
      results: [],
      executionTime: performance.now() - startTime,
      resultCount: 0,
    };
  }

  const { ancestors, descendants, transformations } = traceMaterialGenealogy(materialId);

  const results = {
    targetMaterial: material,
    ancestors: ancestors.map(a => ({
      material: a,
      specifications: a.specifications,
      qualityStatus: a.qualityStatus,
    })),
    descendants: descendants.map(d => ({
      material: d,
      specifications: d.specifications,
      qualityStatus: d.qualityStatus,
    })),
    transformations: transformations.map(t => ({
      type: t.transformationType,
      equipment: t.equipmentId,
      process: t.processId,
      yield: t.yieldPercentage,
      qualityGate: t.qualityGate,
      timestamp: t.timestamp,
    })),
  };

  const executionTime = performance.now() - startTime;

  return {
    queryName: 'Material Genealogy',
    description: `Complete genealogy for ${material.materialName}`,
    results: [results],
    executionTime,
    resultCount: ancestors.length + descendants.length + 1,
  };
}

// Execute query by type
export function executeQuery(queryType: QueryType, params?: any): QueryResult {
  switch (queryType) {
    case 'equipment_in_production':
      return queryEquipmentInProduction();
    case 'trace_batch':
      return queryTraceBatch(params?.batchId || 'B-2024-0342');
    case 'find_quality_issues':
      return queryFindQualityIssues();
    case 'compare_sites':
      return queryCompareSites();
    case 'process_bottlenecks':
      return queryProcessBottlenecks();
    case 'material_genealogy':
      return queryMaterialGenealogy(params?.materialId || 'MAT_CULTURE_001');
    default:
      return {
        queryName: 'Unknown Query',
        description: 'Query type not found',
        results: [],
        executionTime: 0,
        resultCount: 0,
      };
  }
}

// Get available queries
export function getAvailableQueries(): {
  id: QueryType;
  name: string;
  description: string;
  params?: string[];
}[] {
  return [
    {
      id: 'equipment_in_production',
      name: 'Equipment in Production',
      description: 'Show all bioreactors currently in production phase',
    },
    {
      id: 'trace_batch',
      name: 'Trace Batch',
      description: 'Trace batch from seed culture to final product',
      params: ['batchId'],
    },
    {
      id: 'find_quality_issues',
      name: 'Quality Issues',
      description: 'Find equipment that processed material with quality issues',
    },
    {
      id: 'compare_sites',
      name: 'Compare Sites',
      description: 'Compare process flows and equipment between sites',
    },
    {
      id: 'process_bottlenecks',
      name: 'Process Bottlenecks',
      description: 'Identify processes running longer than expected',
    },
    {
      id: 'material_genealogy',
      name: 'Material Genealogy',
      description: 'Complete material genealogy for a specific material',
      params: ['materialId'],
    },
  ];
}
