/**
 * Generate complete batch data for mAb manufacturing
 * Coordinates DCS, eBR, and LIMS data generation for a single batch
 */

import { generateDCSExport, getDCSSample, type DCSExport } from './dcs-generator';
import { generateEBRExport, type eBRExport } from './ebr-generator';
import { generateLIMSExport, type LIMSExport } from './lims-generator';

export interface CompleteBatchData {
  batchId: string;
  startDate: Date;
  endDate: Date;
  dcs: DCSExport;
  ebr: eBRExport;
  lims: LIMSExport;
}

export function generateCompleteBatch(batchId?: string): CompleteBatchData {
  // Use provided batch ID or generate one
  const finalBatchId = batchId || `B-2024-${Math.floor(Math.random() * 9000 + 1000)}`;

  // Batch starts on a Monday at 6:00 AM
  const startDate = new Date('2024-03-15T06:00:00Z');

  // Total batch duration: ~4 days (96 hours)
  // Prep: 4h, Inoc: 3h, Growth: 24h, Production: 60h, Harvest: 8h, Chrom: 6h = ~105h
  const durationHours = 105;
  const endDate = new Date(startDate.getTime() + durationHours * 3600000);

  // Generate DCS data (30-second intervals for entire batch)
  const dcs = generateDCSExport(startDate, durationHours, 30);

  // Generate eBR data
  const ebr = generateEBRExport(finalBatchId, startDate);

  // Generate LIMS data
  const lims = generateLIMSExport(finalBatchId, startDate, endDate);

  return {
    batchId: finalBatchId,
    startDate,
    endDate,
    dcs,
    ebr,
    lims,
  };
}

// Pre-generate a sample batch for the demo
export function getSampleBatchData() {
  return generateCompleteBatch('B-2024-0342');
}

// Get sample data for quick preview (first 100 DCS points)
export function getSampleBatchPreview() {
  const batch = getSampleBatchData();
  return {
    ...batch,
    dcs: {
      ...batch.dcs,
      data: getDCSSample(batch.dcs, 100),
    },
  };
}
