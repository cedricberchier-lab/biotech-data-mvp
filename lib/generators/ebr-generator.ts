/**
 * eBR (Electronic Batch Record) Data Generator
 * Simulates structured batch record exports with nested hierarchy and operator entries
 */

export interface OperatorEntry {
  timestamp: string;
  operator_id: string;
  operator_name: string;
  entry_type: 'signature' | 'verification' | 'deviation' | 'comment';
  value?: string;
}

export interface MaterialAddition {
  material_code: string;
  material_name: string;
  lot_number: string;
  quantity: number;
  unit: string;
  added_by: string;
  timestamp: string;
  verified_by?: string;
  verification_timestamp?: string;
}

export interface PhaseParameter {
  parameter_name: string;
  set_point?: number;
  actual_value?: number;
  unit: string;
  in_spec: boolean;
  lower_limit?: number;
  upper_limit?: number;
}

export interface BatchPhase {
  phase_id: string;
  phase_name: string;
  equipment_id: string;
  start_time: string;
  end_time?: string;
  status: 'In Progress' | 'Completed' | 'Deviation' | 'Aborted';
  parameters: PhaseParameter[];
  materials?: MaterialAddition[];
  operator_entries: OperatorEntry[];
}

export interface eBRExport {
  batch_id: string;
  product_code: string;
  product_name: string;
  recipe_version: string;
  site_name: string;
  start_date: string;
  end_date?: string;
  batch_status: string;
  batch_size: number;
  batch_size_unit: string;
  phases: BatchPhase[];
  metadata: {
    export_date: string;
    export_system: string;
    format_version: string;
  };
}

function generateOperatorEntry(
  timestamp: Date,
  type: OperatorEntry['entry_type']
): OperatorEntry {
  const operators = [
    { id: 'OP-1247', name: 'Sarah Chen' },
    { id: 'OP-2891', name: 'Michael Rodriguez' },
    { id: 'OP-1653', name: 'Jessica Kumar' },
  ];

  const operator = operators[Math.floor(Math.random() * operators.length)];

  const entry: OperatorEntry = {
    timestamp: timestamp.toISOString(),
    operator_id: operator.id,
    operator_name: operator.name,
    entry_type: type,
  };

  if (type === 'comment') {
    const comments = [
      'Inoculation completed successfully',
      'pH control stable throughout phase',
      'Slight foaming observed, antifoam added',
      'Temperature within acceptable range',
      'Sampling completed for QC analysis',
    ];
    entry.value = comments[Math.floor(Math.random() * comments.length)];
  }

  return entry;
}

function generateMaterialAddition(
  timestamp: Date,
  materialType: 'media' | 'feed' | 'buffer' | 'reagent'
): MaterialAddition {
  const materials = {
    media: [
      { code: 'MED-CHO-001', name: 'CHO Basal Medium', qty: 1500, unit: 'L' },
      { code: 'MED-SUP-042', name: 'Growth Supplement', qty: 50, unit: 'L' },
    ],
    feed: [
      { code: 'FEED-GLU-01', name: 'Glucose Feed Solution', qty: 100, unit: 'L' },
      { code: 'FEED-AA-MIX', name: 'Amino Acid Concentrate', qty: 25, unit: 'L' },
    ],
    buffer: [
      { code: 'BUF-PBS-7.2', name: 'Phosphate Buffered Saline pH 7.2', qty: 500, unit: 'L' },
      { code: 'BUF-TRIS-01', name: 'Tris-HCl Buffer', qty: 200, unit: 'L' },
    ],
    reagent: [
      { code: 'REG-PROTA-01', name: 'Protein A Resin', qty: 20, unit: 'L' },
      { code: 'REG-NAOH-2M', name: 'Sodium Hydroxide 2M', qty: 50, unit: 'L' },
    ],
  };

  const materialList = materials[materialType];
  const material = materialList[Math.floor(Math.random() * materialList.length)];

  return {
    material_code: material.code,
    material_name: material.name,
    lot_number: `LOT-${Math.floor(Math.random() * 900000 + 100000)}`,
    quantity: material.qty,
    unit: material.unit,
    added_by: 'OP-1247',
    timestamp: timestamp.toISOString(),
    verified_by: 'OP-2891',
    verification_timestamp: new Date(timestamp.getTime() + 300000).toISOString(), // 5 min later
  };
}

export function generateEBRExport(batchId: string, startDate: Date): eBRExport {
  const phases: BatchPhase[] = [];

  // Phase 1: Vessel Preparation
  const prepStart = new Date(startDate);
  phases.push({
    phase_id: 'PREP-001',
    phase_name: 'Bioreactor Preparation & CIP',
    equipment_id: 'BR-2001-A',
    start_time: prepStart.toISOString(),
    end_time: new Date(prepStart.getTime() + 4 * 3600000).toISOString(),
    status: 'Completed',
    parameters: [
      {
        parameter_name: 'CIP Temperature',
        set_point: 80,
        actual_value: 79.8,
        unit: 'degC',
        in_spec: true,
        lower_limit: 78,
        upper_limit: 82,
      },
      {
        parameter_name: 'CIP Duration',
        set_point: 60,
        actual_value: 62,
        unit: 'minutes',
        in_spec: true,
        lower_limit: 60,
        upper_limit: 90,
      },
    ],
    operator_entries: [
      generateOperatorEntry(prepStart, 'signature'),
      generateOperatorEntry(new Date(prepStart.getTime() + 2 * 3600000), 'verification'),
    ],
  });

  // Phase 2: Media Addition & Inoculation
  const inocStart = new Date(prepStart.getTime() + 4 * 3600000);
  phases.push({
    phase_id: 'INOC-001',
    phase_name: 'Media Addition and Inoculation',
    equipment_id: 'BR-2001-A',
    start_time: inocStart.toISOString(),
    end_time: new Date(inocStart.getTime() + 3 * 3600000).toISOString(),
    status: 'Completed',
    parameters: [
      {
        parameter_name: 'Working Volume',
        set_point: 1500,
        actual_value: 1487,
        unit: 'L',
        in_spec: true,
        lower_limit: 1450,
        upper_limit: 1550,
      },
      {
        parameter_name: 'Inoculation Density',
        set_point: 0.3,
        actual_value: 0.28,
        unit: 'E6 cells/mL',
        in_spec: true,
        lower_limit: 0.2,
        upper_limit: 0.4,
      },
      {
        parameter_name: 'Temperature Set Point',
        set_point: 37.0,
        actual_value: 37.1,
        unit: 'degC',
        in_spec: true,
        lower_limit: 36.5,
        upper_limit: 37.5,
      },
    ],
    materials: [
      generateMaterialAddition(inocStart, 'media'),
      generateMaterialAddition(new Date(inocStart.getTime() + 1800000), 'media'),
    ],
    operator_entries: [
      generateOperatorEntry(inocStart, 'signature'),
      generateOperatorEntry(new Date(inocStart.getTime() + 1.5 * 3600000), 'comment'),
      generateOperatorEntry(new Date(inocStart.getTime() + 3 * 3600000), 'verification'),
    ],
  });

  // Phase 3: Growth Phase
  const growthStart = new Date(inocStart.getTime() + 3 * 3600000);
  phases.push({
    phase_id: 'GROW-001',
    phase_name: 'Exponential Growth Phase',
    equipment_id: 'BR-2001-A',
    start_time: growthStart.toISOString(),
    end_time: new Date(growthStart.getTime() + 24 * 3600000).toISOString(),
    status: 'Completed',
    parameters: [
      {
        parameter_name: 'pH Control',
        set_point: 7.1,
        actual_value: 7.08,
        unit: 'pH',
        in_spec: true,
        lower_limit: 7.0,
        upper_limit: 7.2,
      },
      {
        parameter_name: 'DO Control',
        set_point: 35,
        actual_value: 34.2,
        unit: 'percent',
        in_spec: true,
        lower_limit: 30,
        upper_limit: 40,
      },
      {
        parameter_name: 'Agitation',
        set_point: 50,
        actual_value: 49.8,
        unit: 'RPM',
        in_spec: true,
        lower_limit: 45,
        upper_limit: 55,
      },
    ],
    materials: [
      generateMaterialAddition(new Date(growthStart.getTime() + 6 * 3600000), 'feed'),
      generateMaterialAddition(new Date(growthStart.getTime() + 12 * 3600000), 'feed'),
    ],
    operator_entries: [
      generateOperatorEntry(growthStart, 'signature'),
      generateOperatorEntry(new Date(growthStart.getTime() + 8 * 3600000), 'comment'),
      generateOperatorEntry(new Date(growthStart.getTime() + 16 * 3600000), 'comment'),
    ],
  });

  // Phase 4: Production Phase
  const prodStart = new Date(growthStart.getTime() + 24 * 3600000);
  phases.push({
    phase_id: 'PROD-001',
    phase_name: 'Production Phase',
    equipment_id: 'BR-2001-A',
    start_time: prodStart.toISOString(),
    end_time: new Date(prodStart.getTime() + 60 * 3600000).toISOString(),
    status: 'Completed',
    parameters: [
      {
        parameter_name: 'Temperature Shift',
        set_point: 33.0,
        actual_value: 33.2,
        unit: 'degC',
        in_spec: true,
        lower_limit: 32.5,
        upper_limit: 33.5,
      },
      {
        parameter_name: 'Feed Rate',
        set_point: 15,
        actual_value: 14.8,
        unit: 'L/day',
        in_spec: true,
        lower_limit: 12,
        upper_limit: 18,
      },
    ],
    materials: [
      generateMaterialAddition(new Date(prodStart.getTime() + 12 * 3600000), 'feed'),
      generateMaterialAddition(new Date(prodStart.getTime() + 24 * 3600000), 'feed'),
      generateMaterialAddition(new Date(prodStart.getTime() + 36 * 3600000), 'feed'),
      generateMaterialAddition(new Date(prodStart.getTime() + 48 * 3600000), 'feed'),
    ],
    operator_entries: [
      generateOperatorEntry(prodStart, 'signature'),
      generateOperatorEntry(new Date(prodStart.getTime() + 24 * 3600000), 'comment'),
    ],
  });

  // Phase 5: Harvest
  const harvestStart = new Date(prodStart.getTime() + 60 * 3600000);
  phases.push({
    phase_id: 'HARV-001',
    phase_name: 'Harvest and Transfer to Purification',
    equipment_id: 'BR-2001-A',
    start_time: harvestStart.toISOString(),
    end_time: new Date(harvestStart.getTime() + 8 * 3600000).toISOString(),
    status: 'Completed',
    parameters: [
      {
        parameter_name: 'Final Volume',
        actual_value: 1820,
        unit: 'L',
        in_spec: true,
        lower_limit: 1700,
        upper_limit: 1900,
      },
      {
        parameter_name: 'Harvest Temperature',
        set_point: 4,
        actual_value: 4.2,
        unit: 'degC',
        in_spec: true,
        lower_limit: 2,
        upper_limit: 8,
      },
    ],
    operator_entries: [
      generateOperatorEntry(harvestStart, 'signature'),
      generateOperatorEntry(new Date(harvestStart.getTime() + 4 * 3600000), 'comment'),
      generateOperatorEntry(new Date(harvestStart.getTime() + 8 * 3600000), 'verification'),
    ],
  });

  // Phase 6: Protein A Chromatography
  const chromStart = new Date(harvestStart.getTime() + 12 * 3600000);
  phases.push({
    phase_id: 'CHR-PROTA-001',
    phase_name: 'Protein A Affinity Chromatography',
    equipment_id: 'CHR-A-01',
    start_time: chromStart.toISOString(),
    end_time: new Date(chromStart.getTime() + 6 * 3600000).toISOString(),
    status: 'Completed',
    parameters: [
      {
        parameter_name: 'Load Flow Rate',
        set_point: 80,
        actual_value: 78.5,
        unit: 'L/hr',
        in_spec: true,
        lower_limit: 70,
        upper_limit: 90,
      },
      {
        parameter_name: 'Max Pressure',
        actual_value: 2.2,
        unit: 'bar',
        in_spec: true,
        upper_limit: 2.5,
      },
      {
        parameter_name: 'Column Bed Height',
        set_point: 20,
        actual_value: 19.8,
        unit: 'cm',
        in_spec: true,
        lower_limit: 19,
        upper_limit: 21,
      },
    ],
    materials: [
      generateMaterialAddition(chromStart, 'buffer'),
      generateMaterialAddition(new Date(chromStart.getTime() + 1 * 3600000), 'buffer'),
      generateMaterialAddition(new Date(chromStart.getTime() + 3 * 3600000), 'reagent'),
    ],
    operator_entries: [
      generateOperatorEntry(chromStart, 'signature'),
      generateOperatorEntry(new Date(chromStart.getTime() + 3 * 3600000), 'comment'),
      generateOperatorEntry(new Date(chromStart.getTime() + 6 * 3600000), 'verification'),
    ],
  });

  return {
    batch_id: batchId,
    product_code: 'mAb-2847',
    product_name: 'Monoclonal Antibody Alpha-2847',
    recipe_version: 'R-mAb-2847-v3.2',
    site_name: 'Manufacturing Site A - Building 7',
    start_date: startDate.toISOString(),
    end_date: new Date(chromStart.getTime() + 6 * 3600000).toISOString(),
    batch_status: 'Completed',
    batch_size: 1500,
    batch_size_unit: 'L',
    phases: phases,
    metadata: {
      export_date: new Date().toISOString(),
      export_system: 'Syncade_MES_v8.2',
      format_version: '2.1',
    },
  };
}

// Format as XML (common eBR export format)
export function formatEBRAsXML(ebr: eBRExport): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<BatchRecord>\n';
  xml += `  <BatchID>${ebr.batch_id}</BatchID>\n`;
  xml += `  <ProductCode>${ebr.product_code}</ProductCode>\n`;
  xml += `  <ProductName>${ebr.product_name}</ProductName>\n`;
  xml += `  <RecipeVersion>${ebr.recipe_version}</RecipeVersion>\n`;
  xml += `  <Site>${ebr.site_name}</Site>\n`;
  xml += `  <StartDate>${ebr.start_date}</StartDate>\n`;
  xml += `  <EndDate>${ebr.end_date}</EndDate>\n`;
  xml += `  <Status>${ebr.batch_status}</Status>\n`;
  xml += '  <Phases>\n';

  for (const phase of ebr.phases) {
    xml += `    <Phase id="${phase.phase_id}">\n`;
    xml += `      <Name>${phase.phase_name}</Name>\n`;
    xml += `      <Equipment>${phase.equipment_id}</Equipment>\n`;
    xml += `      <StartTime>${phase.start_time}</StartTime>\n`;
    xml += `      <EndTime>${phase.end_time}</EndTime>\n`;
    xml += `      <Status>${phase.status}</Status>\n`;
    xml += '      <Parameters>\n';

    for (const param of phase.parameters) {
      xml += `        <Parameter name="${param.parameter_name}" unit="${param.unit}">\n`;
      if (param.set_point !== undefined) xml += `          <SetPoint>${param.set_point}</SetPoint>\n`;
      if (param.actual_value !== undefined) xml += `          <ActualValue>${param.actual_value}</ActualValue>\n`;
      xml += `          <InSpec>${param.in_spec}</InSpec>\n`;
      xml += '        </Parameter>\n';
    }

    xml += '      </Parameters>\n';
    xml += '    </Phase>\n';
  }

  xml += '  </Phases>\n';
  xml += '</BatchRecord>\n';

  return xml;
}
