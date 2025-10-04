/**
 * ISA-88 Process Model
 * Defines process hierarchy and state contextualization
 */

export type ProcessLevel = 'Procedure' | 'UnitProcedure' | 'Operation' | 'Phase';

export interface ProcessState {
  level: ProcessLevel;
  id: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  status: 'Running' | 'Complete' | 'Held' | 'Aborted';
  parentId?: string;
}

export interface ProcessHierarchy {
  procedure: ProcessNode;
}

export interface ProcessNode {
  level: ProcessLevel;
  id: string;
  name: string;
  description: string;
  equipmentId?: string;
  expectedDuration?: { min: number; max: number; unit: string };
  children?: ProcessNode[];
}

export interface ProcessStateContext {
  timestamp: Date;
  currentProcedure: string;
  currentUnitProcedure: string;
  currentOperation: string;
  currentPhase: string;
  fullContext: string; // e.g., "Fed_Batch_mAb.Bioreactor_Culture.Exponential_Growth.Temperature_Control"
  equipmentId: string;
}

// Define the ISA-88 process hierarchy for mAb manufacturing
export function getProcessHierarchy(): ProcessHierarchy {
  return {
    procedure: {
      level: 'Procedure',
      id: 'PROC_mAb_2847_PROD',
      name: 'mAb-2847 Production Procedure',
      description: 'Complete production procedure for monoclonal antibody mAb-2847',
      children: [
        {
          level: 'UnitProcedure',
          id: 'UP_BIOREACTOR_PREP',
          name: 'Bioreactor Preparation',
          description: 'Vessel preparation and sterilization',
          equipmentId: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
          expectedDuration: { min: 3, max: 5, unit: 'hours' },
          children: [
            {
              level: 'Operation',
              id: 'OP_CIP',
              name: 'Clean-In-Place',
              description: 'Automated cleaning cycle',
              children: [
                {
                  level: 'Phase',
                  id: 'PH_CIP_RINSE',
                  name: 'Pre-Rinse',
                  description: 'Initial water rinse',
                },
                {
                  level: 'Phase',
                  id: 'PH_CIP_CAUSTIC',
                  name: 'Caustic Wash',
                  description: 'Hot caustic cleaning',
                },
                {
                  level: 'Phase',
                  id: 'PH_CIP_FINAL_RINSE',
                  name: 'Final Rinse',
                  description: 'WFI final rinse',
                },
              ],
            },
            {
              level: 'Operation',
              id: 'OP_SIP',
              name: 'Steam-In-Place',
              description: 'Steam sterilization',
              children: [
                {
                  level: 'Phase',
                  id: 'PH_SIP_HEATUP',
                  name: 'Heat Up',
                  description: 'Temperature ramp',
                },
                {
                  level: 'Phase',
                  id: 'PH_SIP_HOLD',
                  name: 'Sterilization Hold',
                  description: 'Hold at sterilization temperature',
                },
              ],
            },
          ],
        },
        {
          level: 'UnitProcedure',
          id: 'UP_FED_BATCH_CULTURE',
          name: 'Fed-Batch Cell Culture',
          description: 'Mammalian cell culture for antibody production',
          equipmentId: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
          expectedDuration: { min: 80, max: 100, unit: 'hours' },
          children: [
            {
              level: 'Operation',
              id: 'OP_INOCULATION',
              name: 'Inoculation',
              description: 'Media addition and seed culture transfer',
              children: [
                {
                  level: 'Phase',
                  id: 'PH_MEDIA_ADD',
                  name: 'Media Addition',
                  description: 'Base media and supplement addition',
                },
                {
                  level: 'Phase',
                  id: 'PH_SEED_TRANSFER',
                  name: 'Seed Transfer',
                  description: 'Inoculation with seed culture',
                },
                {
                  level: 'Phase',
                  id: 'PH_INOC_EQUILIBRATION',
                  name: 'Equilibration',
                  description: 'Temperature and pH stabilization',
                },
              ],
            },
            {
              level: 'Operation',
              id: 'OP_EXPONENTIAL_GROWTH',
              name: 'Exponential Growth Phase',
              description: 'Cell proliferation phase',
              children: [
                {
                  level: 'Phase',
                  id: 'PH_LAG_PHASE',
                  name: 'Lag Phase',
                  description: 'Initial adaptation period',
                },
                {
                  level: 'Phase',
                  id: 'PH_LOG_GROWTH',
                  name: 'Logarithmic Growth',
                  description: 'Exponential cell division',
                },
                {
                  level: 'Phase',
                  id: 'PH_FEED_INITIATION',
                  name: 'Feed Initiation',
                  description: 'Start of nutrient feeding',
                },
              ],
            },
            {
              level: 'Operation',
              id: 'OP_PRODUCTION_PHASE',
              name: 'Production Phase',
              description: 'Stationary phase with product accumulation',
              children: [
                {
                  level: 'Phase',
                  id: 'PH_TEMP_SHIFT',
                  name: 'Temperature Shift',
                  description: 'Reduce temperature to enhance productivity',
                },
                {
                  level: 'Phase',
                  id: 'PH_FED_BATCH_PRODUCTION',
                  name: 'Fed-Batch Production',
                  description: 'Continuous feeding with product accumulation',
                },
                {
                  level: 'Phase',
                  id: 'PH_LATE_PRODUCTION',
                  name: 'Late Production',
                  description: 'Final production period',
                },
              ],
            },
            {
              level: 'Operation',
              id: 'OP_HARVEST_PREP',
              name: 'Harvest Preparation',
              description: 'Prepare culture for harvest',
              children: [
                {
                  level: 'Phase',
                  id: 'PH_FEED_STOP',
                  name: 'Feed Termination',
                  description: 'Stop all feeding',
                },
                {
                  level: 'Phase',
                  id: 'PH_COOL_DOWN',
                  name: 'Cool Down',
                  description: 'Reduce temperature for harvest',
                },
              ],
            },
          ],
        },
        {
          level: 'UnitProcedure',
          id: 'UP_HARVEST',
          name: 'Cell Harvest',
          description: 'Separate cells from culture broth',
          equipmentId: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
          expectedDuration: { min: 6, max: 10, unit: 'hours' },
          children: [
            {
              level: 'Operation',
              id: 'OP_TRANSFER',
              name: 'Culture Transfer',
              description: 'Transfer to harvest vessel',
              children: [
                {
                  level: 'Phase',
                  id: 'PH_HARVEST_TRANSFER',
                  name: 'Transfer to Harvest',
                  description: 'Pump culture to harvest system',
                },
              ],
            },
          ],
        },
        {
          level: 'UnitProcedure',
          id: 'UP_PROTEIN_A_CHROM',
          name: 'Protein A Chromatography',
          description: 'Affinity capture of monoclonal antibody',
          equipmentId: 'SITE_A.DSP.CHR_CELL_1.CHR_UNIT_A01.CHR-A-01',
          expectedDuration: { min: 4, max: 8, unit: 'hours' },
          children: [
            {
              level: 'Operation',
              id: 'OP_COLUMN_PREP',
              name: 'Column Preparation',
              description: 'Equilibrate column with binding buffer',
              children: [
                {
                  level: 'Phase',
                  id: 'PH_SANITIZATION',
                  name: 'Column Sanitization',
                  description: 'NaOH sanitization',
                },
                {
                  level: 'Phase',
                  id: 'PH_EQUILIBRATION',
                  name: 'Equilibration',
                  description: 'Equilibrate with binding buffer',
                },
              ],
            },
            {
              level: 'Operation',
              id: 'OP_LOAD',
              name: 'Load Phase',
              description: 'Load clarified harvest onto column',
              children: [
                {
                  level: 'Phase',
                  id: 'PH_LOAD',
                  name: 'Product Load',
                  description: 'Load harvested material',
                },
              ],
            },
            {
              level: 'Operation',
              id: 'OP_WASH',
              name: 'Wash Phase',
              description: 'Remove unbound impurities',
              children: [
                {
                  level: 'Phase',
                  id: 'PH_WASH_1',
                  name: 'Wash Step 1',
                  description: 'Initial wash',
                },
                {
                  level: 'Phase',
                  id: 'PH_WASH_2',
                  name: 'Wash Step 2',
                  description: 'High salt wash',
                },
              ],
            },
            {
              level: 'Operation',
              id: 'OP_ELUTION',
              name: 'Elution',
              description: 'Elute bound antibody',
              children: [
                {
                  level: 'Phase',
                  id: 'PH_ELUTION',
                  name: 'Product Elution',
                  description: 'Low pH elution',
                },
                {
                  level: 'Phase',
                  id: 'PH_STRIP',
                  name: 'Strip',
                  description: 'Remove remaining bound material',
                },
              ],
            },
          ],
        },
      ],
    },
  };
}

// Get process state at a specific timestamp
export function getProcessStateAtTime(timestamp: Date, batchStartTime: Date): ProcessStateContext | null {
  const elapsedHours = (timestamp.getTime() - batchStartTime.getTime()) / 3600000;

  // Define time windows for each phase (simplified)
  if (elapsedHours < 0) return null;

  if (elapsedHours < 1) {
    return {
      timestamp,
      currentProcedure: 'mAb-2847 Production Procedure',
      currentUnitProcedure: 'Bioreactor Preparation',
      currentOperation: 'Clean-In-Place',
      currentPhase: 'Pre-Rinse',
      fullContext: 'PROC_mAb_2847_PROD.UP_BIOREACTOR_PREP.OP_CIP.PH_CIP_RINSE',
      equipmentId: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
    };
  } else if (elapsedHours < 4) {
    return {
      timestamp,
      currentProcedure: 'mAb-2847 Production Procedure',
      currentUnitProcedure: 'Bioreactor Preparation',
      currentOperation: 'Steam-In-Place',
      currentPhase: 'Sterilization Hold',
      fullContext: 'PROC_mAb_2847_PROD.UP_BIOREACTOR_PREP.OP_SIP.PH_SIP_HOLD',
      equipmentId: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
    };
  } else if (elapsedHours < 5) {
    return {
      timestamp,
      currentProcedure: 'mAb-2847 Production Procedure',
      currentUnitProcedure: 'Fed-Batch Cell Culture',
      currentOperation: 'Inoculation',
      currentPhase: 'Media Addition',
      fullContext: 'PROC_mAb_2847_PROD.UP_FED_BATCH_CULTURE.OP_INOCULATION.PH_MEDIA_ADD',
      equipmentId: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
    };
  } else if (elapsedHours < 7) {
    return {
      timestamp,
      currentProcedure: 'mAb-2847 Production Procedure',
      currentUnitProcedure: 'Fed-Batch Cell Culture',
      currentOperation: 'Inoculation',
      currentPhase: 'Seed Transfer',
      fullContext: 'PROC_mAb_2847_PROD.UP_FED_BATCH_CULTURE.OP_INOCULATION.PH_SEED_TRANSFER',
      equipmentId: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
    };
  } else if (elapsedHours < 12) {
    return {
      timestamp,
      currentProcedure: 'mAb-2847 Production Procedure',
      currentUnitProcedure: 'Fed-Batch Cell Culture',
      currentOperation: 'Exponential Growth Phase',
      currentPhase: 'Lag Phase',
      fullContext: 'PROC_mAb_2847_PROD.UP_FED_BATCH_CULTURE.OP_EXPONENTIAL_GROWTH.PH_LAG_PHASE',
      equipmentId: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
    };
  } else if (elapsedHours < 24) {
    return {
      timestamp,
      currentProcedure: 'mAb-2847 Production Procedure',
      currentUnitProcedure: 'Fed-Batch Cell Culture',
      currentOperation: 'Exponential Growth Phase',
      currentPhase: 'Logarithmic Growth',
      fullContext: 'PROC_mAb_2847_PROD.UP_FED_BATCH_CULTURE.OP_EXPONENTIAL_GROWTH.PH_LOG_GROWTH',
      equipmentId: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
    };
  } else if (elapsedHours < 31) {
    return {
      timestamp,
      currentProcedure: 'mAb-2847 Production Procedure',
      currentUnitProcedure: 'Fed-Batch Cell Culture',
      currentOperation: 'Exponential Growth Phase',
      currentPhase: 'Feed Initiation',
      fullContext: 'PROC_mAb_2847_PROD.UP_FED_BATCH_CULTURE.OP_EXPONENTIAL_GROWTH.PH_FEED_INITIATION',
      equipmentId: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
    };
  } else if (elapsedHours < 33) {
    return {
      timestamp,
      currentProcedure: 'mAb-2847 Production Procedure',
      currentUnitProcedure: 'Fed-Batch Cell Culture',
      currentOperation: 'Production Phase',
      currentPhase: 'Temperature Shift',
      fullContext: 'PROC_mAb_2847_PROD.UP_FED_BATCH_CULTURE.OP_PRODUCTION_PHASE.PH_TEMP_SHIFT',
      equipmentId: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
    };
  } else if (elapsedHours < 84) {
    return {
      timestamp,
      currentProcedure: 'mAb-2847 Production Procedure',
      currentUnitProcedure: 'Fed-Batch Cell Culture',
      currentOperation: 'Production Phase',
      currentPhase: 'Fed-Batch Production',
      fullContext: 'PROC_mAb_2847_PROD.UP_FED_BATCH_CULTURE.OP_PRODUCTION_PHASE.PH_FED_BATCH_PRODUCTION',
      equipmentId: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
    };
  } else if (elapsedHours < 87) {
    return {
      timestamp,
      currentProcedure: 'mAb-2847 Production Procedure',
      currentUnitProcedure: 'Fed-Batch Cell Culture',
      currentOperation: 'Harvest Preparation',
      currentPhase: 'Cool Down',
      fullContext: 'PROC_mAb_2847_PROD.UP_FED_BATCH_CULTURE.OP_HARVEST_PREP.PH_COOL_DOWN',
      equipmentId: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
    };
  } else if (elapsedHours < 95) {
    return {
      timestamp,
      currentProcedure: 'mAb-2847 Production Procedure',
      currentUnitProcedure: 'Cell Harvest',
      currentOperation: 'Culture Transfer',
      currentPhase: 'Transfer to Harvest',
      fullContext: 'PROC_mAb_2847_PROD.UP_HARVEST.OP_TRANSFER.PH_HARVEST_TRANSFER',
      equipmentId: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A',
    };
  } else if (elapsedHours < 97) {
    return {
      timestamp,
      currentProcedure: 'mAb-2847 Production Procedure',
      currentUnitProcedure: 'Protein A Chromatography',
      currentOperation: 'Column Preparation',
      currentPhase: 'Equilibration',
      fullContext: 'PROC_mAb_2847_PROD.UP_PROTEIN_A_CHROM.OP_COLUMN_PREP.PH_EQUILIBRATION',
      equipmentId: 'SITE_A.DSP.CHR_CELL_1.CHR_UNIT_A01.CHR-A-01',
    };
  } else if (elapsedHours < 100) {
    return {
      timestamp,
      currentProcedure: 'mAb-2847 Production Procedure',
      currentUnitProcedure: 'Protein A Chromatography',
      currentOperation: 'Load Phase',
      currentPhase: 'Product Load',
      fullContext: 'PROC_mAb_2847_PROD.UP_PROTEIN_A_CHROM.OP_LOAD.PH_LOAD',
      equipmentId: 'SITE_A.DSP.CHR_CELL_1.CHR_UNIT_A01.CHR-A-01',
    };
  } else if (elapsedHours < 101) {
    return {
      timestamp,
      currentProcedure: 'mAb-2847 Production Procedure',
      currentUnitProcedure: 'Protein A Chromatography',
      currentOperation: 'Wash Phase',
      currentPhase: 'Wash Step 1',
      fullContext: 'PROC_mAb_2847_PROD.UP_PROTEIN_A_CHROM.OP_WASH.PH_WASH_1',
      equipmentId: 'SITE_A.DSP.CHR_CELL_1.CHR_UNIT_A01.CHR-A-01',
    };
  } else {
    return {
      timestamp,
      currentProcedure: 'mAb-2847 Production Procedure',
      currentUnitProcedure: 'Protein A Chromatography',
      currentOperation: 'Elution',
      currentPhase: 'Product Elution',
      fullContext: 'PROC_mAb_2847_PROD.UP_PROTEIN_A_CHROM.OP_ELUTION.PH_ELUTION',
      equipmentId: 'SITE_A.DSP.CHR_CELL_1.CHR_UNIT_A01.CHR-A-01',
    };
  }
}

// Get all phase transitions for the batch
export function getPhaseTimeline(batchStartTime: Date, batchDurationHours: number): ProcessStateContext[] {
  const transitions: ProcessStateContext[] = [];
  const checkpoints = [0, 1, 4, 5, 7, 12, 24, 31, 33, 84, 87, 95, 97, 100, 101, 103];

  for (const hour of checkpoints) {
    if (hour <= batchDurationHours) {
      const timestamp = new Date(batchStartTime.getTime() + hour * 3600000);
      const state = getProcessStateAtTime(timestamp, batchStartTime);
      if (state) transitions.push(state);
    }
  }

  return transitions;
}
