/**
 * LIMS (Laboratory Information Management System) Data Generator
 * Simulates lab test results with different naming conventions and delays
 */

export interface LIMSSample {
  sample_id: string;
  sample_type: string;
  collection_datetime: string;
  location_code: string; // Often doesn't match equipment IDs
  collected_by: string;
  status: 'Pending' | 'In Progress' | 'Complete' | 'Failed';
}

export interface LIMSTestResult {
  result_id: string;
  sample_id: string;
  test_code: string;
  test_name: string;
  result_value: number | string;
  result_unit?: string;
  specification_min?: number;
  specification_max?: number;
  result_status: 'Pass' | 'Fail' | 'OOS' | 'Pending';
  analyst_id: string;
  analysis_date: string;
  approval_date?: string;
  approved_by?: string;
  comments?: string;
}

export interface LIMSExport {
  export_id: string;
  export_date: string;
  lab_site: string;
  batch_reference?: string;
  samples: LIMSSample[];
  analytical_results: LIMSTestResult[];
  microbiology_results: LIMSTestResult[];
  in_process_results: LIMSTestResult[];
}

// Different location codes per site (often cryptic and don't match DCS/eBR equipment IDs)
const LOCATION_CODES = {
  bioreactor: ['LOC-B7-R2001', 'AREA-USP-BR01', 'BLDG7-SUITE2-BR-A'],
  sampling_port: ['SP-R2001-TOP', 'PORT-BR01-MID', 'SAMPLE-USP-01'],
  chromatography: ['CHR-B7-PA01', 'DSP-AREA-PROTA', 'BLDG7-CHR-SUITE1'],
  hold_tank: ['TANK-DSP-01', 'HT-PROTA-OUT', 'VESSEL-CHR-POOL'],
};

function getRandomLocationCode(type: keyof typeof LOCATION_CODES): string {
  const codes = LOCATION_CODES[type];
  return codes[Math.floor(Math.random() * codes.length)];
}

function generateSampleId(sampleType: string, date: Date): string {
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000);

  const typePrefix: { [key: string]: string } = {
    'In-Process': 'IP',
    'Bioburden': 'BB',
    'Endotoxin': 'ET',
    'Cell Count': 'CC',
    'Product Titer': 'PT',
    'Metabolite': 'MB',
    'Purity': 'PU',
    'Aggregate': 'AG',
  };

  const prefix = typePrefix[sampleType] || 'GN';
  return `${prefix}${year}${month}${random.toString().padStart(4, '0')}`;
}

function generateAnalystId(): string {
  const analysts = ['AN-2847', 'AN-1092', 'AN-3341', 'AN-2156', 'AN-4782'];
  return analysts[Math.floor(Math.random() * analysts.length)];
}

export function generateLIMSExport(
  batchId: string,
  batchStartDate: Date,
  batchEndDate: Date
): LIMSExport {
  const samples: LIMSSample[] = [];
  const analyticalResults: LIMSTestResult[] = [];
  const microbiologyResults: LIMSTestResult[] = [];
  const inProcessResults: LIMSTestResult[] = [];

  // In-Process Samples (collected during batch at various timepoints)
  const samplingTimepoints = [
    { hours: 4, phase: 'inoculation' },
    { hours: 12, phase: 'growth' },
    { hours: 24, phase: 'growth' },
    { hours: 48, phase: 'production' },
    { hours: 72, phase: 'production' },
    { hours: 84, phase: 'harvest' },
  ];

  samplingTimepoints.forEach((timepoint, index) => {
    const sampleTime = new Date(batchStartDate.getTime() + timepoint.hours * 3600000);

    // Cell count sample
    const ccSampleId = generateSampleId('Cell Count', sampleTime);
    samples.push({
      sample_id: ccSampleId,
      sample_type: 'In-Process Cell Count',
      collection_datetime: sampleTime.toISOString(),
      location_code: getRandomLocationCode('sampling_port'),
      collected_by: 'OP-1247',
      status: 'Complete',
    });

    // Cell count - Viable Cell Density (VCD)
    const vcdValue = 0.3 * Math.pow(2, timepoint.hours / 20) * (Math.random() * 0.2 + 0.9);
    const analysisDelay = 2 + Math.random() * 4; // 2-6 hours delay
    inProcessResults.push({
      result_id: `R-${ccSampleId}-VCD`,
      sample_id: ccSampleId,
      test_code: 'VCD-TRYPAN',
      test_name: 'Viable Cell Density',
      result_value: parseFloat(vcdValue.toFixed(2)),
      result_unit: 'E6 cells/mL',
      specification_min: 0.2,
      specification_max: 20.0,
      result_status: 'Pass',
      analyst_id: generateAnalystId(),
      analysis_date: new Date(sampleTime.getTime() + analysisDelay * 3600000).toISOString(),
      approval_date: new Date(sampleTime.getTime() + (analysisDelay + 1) * 3600000).toISOString(),
      approved_by: 'SUP-1847',
    });

    // Cell viability
    const viability = 85 + Math.random() * 10;
    inProcessResults.push({
      result_id: `R-${ccSampleId}-VIAB`,
      sample_id: ccSampleId,
      test_code: 'VIAB-TRYPAN',
      test_name: 'Cell Viability',
      result_value: parseFloat(viability.toFixed(1)),
      result_unit: 'percent',
      specification_min: 80,
      result_status: viability >= 80 ? 'Pass' : 'Fail',
      analyst_id: generateAnalystId(),
      analysis_date: new Date(sampleTime.getTime() + analysisDelay * 3600000).toISOString(),
      approval_date: new Date(sampleTime.getTime() + (analysisDelay + 1) * 3600000).toISOString(),
      approved_by: 'SUP-1847',
    });

    // Metabolite sample (Glucose, Lactate)
    if (timepoint.hours >= 12) {
      const mbSampleId = generateSampleId('Metabolite', sampleTime);
      samples.push({
        sample_id: mbSampleId,
        sample_type: 'Metabolite Analysis',
        collection_datetime: sampleTime.toISOString(),
        location_code: getRandomLocationCode('sampling_port'),
        collected_by: 'OP-1247',
        status: 'Complete',
      });

      const metabDelay = 6 + Math.random() * 18; // 6-24 hours delay

      // Glucose
      const glucose = Math.max(0.5, 4.5 - (timepoint.hours / 84) * 3.5 + (Math.random() - 0.5));
      inProcessResults.push({
        result_id: `R-${mbSampleId}-GLU`,
        sample_id: mbSampleId,
        test_code: 'METAB-GLU',
        test_name: 'Glucose Concentration',
        result_value: parseFloat(glucose.toFixed(2)),
        result_unit: 'g/L',
        specification_min: 0.5,
        specification_max: 6.0,
        result_status: 'Pass',
        analyst_id: generateAnalystId(),
        analysis_date: new Date(sampleTime.getTime() + metabDelay * 3600000).toISOString(),
      });

      // Lactate
      const lactate = (timepoint.hours / 84) * 2.5 + Math.random() * 0.5;
      inProcessResults.push({
        result_id: `R-${mbSampleId}-LAC`,
        sample_id: mbSampleId,
        test_code: 'METAB-LAC',
        test_name: 'Lactate Concentration',
        result_value: parseFloat(lactate.toFixed(2)),
        result_unit: 'g/L',
        specification_max: 3.5,
        result_status: lactate <= 3.5 ? 'Pass' : 'Fail',
        analyst_id: generateAnalystId(),
        analysis_date: new Date(sampleTime.getTime() + metabDelay * 3600000).toISOString(),
      });
    }

    // Product titer (from production phase onwards)
    if (timepoint.hours >= 48) {
      const ptSampleId = generateSampleId('Product Titer', sampleTime);
      samples.push({
        sample_id: ptSampleId,
        sample_type: 'Product Titer',
        collection_datetime: sampleTime.toISOString(),
        location_code: getRandomLocationCode('bioreactor'),
        collected_by: 'OP-2891',
        status: 'Complete',
      });

      const titerDelay = 24 + Math.random() * 48; // 1-3 days delay
      const titer = 0.5 + ((timepoint.hours - 48) / 36) * 2.5 + (Math.random() - 0.5) * 0.3;

      inProcessResults.push({
        result_id: `R-${ptSampleId}-TITER`,
        sample_id: ptSampleId,
        test_code: 'TITER-ELISA',
        test_name: 'Product Titer by ELISA',
        result_value: parseFloat(titer.toFixed(3)),
        result_unit: 'g/L',
        specification_min: 0.5,
        result_status: titer >= 0.5 ? 'Pass' : 'Fail',
        analyst_id: generateAnalystId(),
        analysis_date: new Date(sampleTime.getTime() + titerDelay * 3600000).toISOString(),
        approval_date: new Date(sampleTime.getTime() + (titerDelay + 4) * 3600000).toISOString(),
        approved_by: 'SUP-2941',
      });
    }
  });

  // Microbiology samples (less frequent)
  const microTimepoints = [
    { hours: 0, phase: 'pre-batch' },
    { hours: 48, phase: 'mid-batch' },
    { hours: 84, phase: 'harvest' },
  ];

  microTimepoints.forEach(timepoint => {
    const sampleTime = new Date(batchStartDate.getTime() + timepoint.hours * 3600000);

    // Bioburden
    const bbSampleId = generateSampleId('Bioburden', sampleTime);
    samples.push({
      sample_id: bbSampleId,
      sample_type: 'Bioburden',
      collection_datetime: sampleTime.toISOString(),
      location_code: getRandomLocationCode('sampling_port'),
      collected_by: 'OP-1653',
      status: 'Complete',
    });

    const microDelay = 48 + Math.random() * 72; // 2-5 days delay
    microbiologyResults.push({
      result_id: `R-${bbSampleId}-BB`,
      sample_id: bbSampleId,
      test_code: 'MICRO-BB-TSA',
      test_name: 'Bioburden - Total Aerobic Count',
      result_value: Math.floor(Math.random() * 5),
      result_unit: 'CFU/mL',
      specification_max: 10,
      result_status: 'Pass',
      analyst_id: generateAnalystId(),
      analysis_date: new Date(sampleTime.getTime() + microDelay * 3600000).toISOString(),
      approval_date: new Date(sampleTime.getTime() + (microDelay + 24) * 3600000).toISOString(),
      approved_by: 'SUP-MICRO-01',
    });

    // Endotoxin
    const etSampleId = generateSampleId('Endotoxin', sampleTime);
    samples.push({
      sample_id: etSampleId,
      sample_type: 'Endotoxin',
      collection_datetime: sampleTime.toISOString(),
      location_code: getRandomLocationCode('sampling_port'),
      collected_by: 'OP-1653',
      status: 'Complete',
    });

    microbiologyResults.push({
      result_id: `R-${etSampleId}-ET`,
      sample_id: etSampleId,
      test_code: 'ENDO-LAL',
      test_name: 'Endotoxin by LAL',
      result_value: parseFloat((Math.random() * 0.05).toFixed(3)),
      result_unit: 'EU/mL',
      specification_max: 0.5,
      result_status: 'Pass',
      analyst_id: generateAnalystId(),
      analysis_date: new Date(sampleTime.getTime() + 24 * 3600000).toISOString(),
      approval_date: new Date(sampleTime.getTime() + 30 * 3600000).toISOString(),
      approved_by: 'SUP-MICRO-01',
    });
  });

  // Final product analytical testing (after purification)
  const purificationEnd = new Date(batchEndDate.getTime());

  // Purity by SEC-HPLC
  const puSampleId = generateSampleId('Purity', purificationEnd);
  samples.push({
    sample_id: puSampleId,
    sample_type: 'Final Product - Purity',
    collection_datetime: purificationEnd.toISOString(),
    location_code: getRandomLocationCode('hold_tank'),
    collected_by: 'OP-2891',
    status: 'Complete',
  });

  const purityDelay = 48 + Math.random() * 24;
  analyticalResults.push({
    result_id: `R-${puSampleId}-PURITY`,
    sample_id: puSampleId,
    test_code: 'PURITY-SEC-HPLC',
    test_name: 'Purity by SEC-HPLC (Monomer)',
    result_value: parseFloat((96 + Math.random() * 2).toFixed(2)),
    result_unit: 'percent',
    specification_min: 95,
    result_status: 'Pass',
    analyst_id: generateAnalystId(),
    analysis_date: new Date(purificationEnd.getTime() + purityDelay * 3600000).toISOString(),
    approval_date: new Date(purificationEnd.getTime() + (purityDelay + 8) * 3600000).toISOString(),
    approved_by: 'SUP-ANAL-02',
  });

  // Aggregate content
  const agSampleId = generateSampleId('Aggregate', purificationEnd);
  samples.push({
    sample_id: agSampleId,
    sample_type: 'Final Product - Aggregates',
    collection_datetime: purificationEnd.toISOString(),
    location_code: getRandomLocationCode('hold_tank'),
    collected_by: 'OP-2891',
    status: 'Complete',
  });

  analyticalResults.push({
    result_id: `R-${agSampleId}-HMW`,
    sample_id: agSampleId,
    test_code: 'AGG-SEC-HPLC-HMW',
    test_name: 'High Molecular Weight Species',
    result_value: parseFloat((1.5 + Math.random() * 1).toFixed(2)),
    result_unit: 'percent',
    specification_max: 3.0,
    result_status: 'Pass',
    analyst_id: generateAnalystId(),
    analysis_date: new Date(purificationEnd.getTime() + purityDelay * 3600000).toISOString(),
    approval_date: new Date(purificationEnd.getTime() + (purityDelay + 8) * 3600000).toISOString(),
    approved_by: 'SUP-ANAL-02',
  });

  return {
    export_id: `LIMS-EXP-${Date.now()}`,
    export_date: new Date().toISOString(),
    lab_site: 'QC Laboratory - Building 5',
    batch_reference: batchId,
    samples: samples,
    analytical_results: analyticalResults,
    microbiology_results: microbiologyResults,
    in_process_results: inProcessResults,
  };
}

// Format as CSV (common LIMS export)
export function formatLIMSAsCSV(lims: LIMSExport, resultType: 'analytical' | 'microbiology' | 'in_process'): string {
  const results =
    resultType === 'analytical' ? lims.analytical_results :
    resultType === 'microbiology' ? lims.microbiology_results :
    lims.in_process_results;

  let csv = '# LIMS Export\n';
  csv += `# Export ID: ${lims.export_id}\n`;
  csv += `# Lab Site: ${lims.lab_site}\n`;
  csv += `# Export Date: ${lims.export_date}\n`;
  csv += `# Result Type: ${resultType.toUpperCase()}\n`;
  csv += 'ResultID,SampleID,TestCode,TestName,Value,Unit,SpecMin,SpecMax,Status,Analyst,AnalysisDate,ApprovedBy,ApprovalDate\n';

  results.forEach(r => {
    csv += `${r.result_id},${r.sample_id},${r.test_code},${r.test_name},${r.result_value},${r.result_unit || ''},${r.specification_min || ''},${r.specification_max || ''},${r.result_status},${r.analyst_id},${r.analysis_date},${r.approved_by || ''},${r.approval_date || ''}\n`;
  });

  return csv;
}
