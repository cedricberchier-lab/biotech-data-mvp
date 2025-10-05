-- Full Schema and Seed for Multi-Site Biotech Manufacturing (mAb-2847)
-- Systems: DCS (DeltaV, Experion, PCS7), MES (Werum PAS-X), LIMS (LabWare), PI (OSIsoft PI)
-- Sites: Site A (STA), Site B (STB)

-- ============================================
-- 1. SCHEMA: Tables
-- ============================================

-- Sites table
CREATE TABLE IF NOT EXISTS sites (
  site_id VARCHAR(10) PRIMARY KEY,
  site_name VARCHAR(100) NOT NULL,
  location VARCHAR(200),
  timezone VARCHAR(50) DEFAULT 'UTC'
);

-- Equipment table
CREATE TABLE IF NOT EXISTS equipment (
  equipment_id VARCHAR(50) PRIMARY KEY,
  site_id VARCHAR(10) REFERENCES sites(site_id),
  equipment_name VARCHAR(200) NOT NULL,
  equipment_type VARCHAR(50), -- Bioreactor, Centrifuge, Column, Tank
  equipment_class VARCHAR(100),
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  capacity_value NUMERIC,
  capacity_unit VARCHAR(20),
  status VARCHAR(20) DEFAULT 'Idle', -- Running, Idle, Maintenance, Offline
  last_updated TIMESTAMP DEFAULT NOW()
);

-- DCS Data (Time-series process values)
CREATE TABLE IF NOT EXISTS dcs_data (
  id BIGSERIAL PRIMARY KEY,
  site_id VARCHAR(10) REFERENCES sites(site_id),
  equipment_id VARCHAR(50) REFERENCES equipment(equipment_id),
  tag_name VARCHAR(100) NOT NULL, -- BR001_PV_TEMP, REACTOR_1_AGIT_SPEED, etc.
  timestamp TIMESTAMP NOT NULL,
  value NUMERIC,
  unit VARCHAR(20),
  quality VARCHAR(20) DEFAULT 'GOOD', -- GOOD, BAD, UNCERTAIN
  system_source VARCHAR(50), -- DeltaV, Experion, PCS7
  batch_id VARCHAR(50)
);
CREATE INDEX idx_dcs_timestamp ON dcs_data(timestamp);
CREATE INDEX idx_dcs_batch ON dcs_data(batch_id);
CREATE INDEX idx_dcs_tag ON dcs_data(tag_name);

-- MES Data (Batch records from Werum PAS-X)
CREATE TABLE IF NOT EXISTS mes_batch_records (
  batch_id VARCHAR(50) PRIMARY KEY,
  site_id VARCHAR(10) REFERENCES sites(site_id),
  product_code VARCHAR(50) DEFAULT 'mAb-2847',
  batch_status VARCHAR(50), -- In_Progress, Complete, Released, Quarantine
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  total_yield_kg NUMERIC,
  target_yield_kg NUMERIC,
  operator VARCHAR(100),
  reviewer VARCHAR(100),
  release_date DATE,
  equipment_train VARCHAR(200) -- BR-2001-A → CENT-001 → CHR-A-01
);

-- MES Process Steps
CREATE TABLE IF NOT EXISTS mes_process_steps (
  step_id BIGSERIAL PRIMARY KEY,
  batch_id VARCHAR(50) REFERENCES mes_batch_records(batch_id),
  step_name VARCHAR(200) NOT NULL, -- Inoculation, Fed-Batch Culture, Harvest, Protein A Capture
  step_type VARCHAR(50), -- UnitProcedure, Operation, Phase
  parent_step_id BIGINT REFERENCES mes_process_steps(step_id),
  equipment_id VARCHAR(50) REFERENCES equipment(equipment_id),
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  duration_hours NUMERIC,
  status VARCHAR(50), -- NotStarted, Running, Complete, Failed
  critical_step BOOLEAN DEFAULT FALSE,
  operator_signature VARCHAR(100),
  qc_required BOOLEAN DEFAULT FALSE
);

-- LIMS Data (Global shared across sites)
CREATE TABLE IF NOT EXISTS lims_samples (
  sample_id VARCHAR(50) PRIMARY KEY,
  batch_id VARCHAR(50),
  site_id VARCHAR(10) REFERENCES sites(site_id),
  sample_type VARCHAR(50), -- In-Process, Analytical, Micro, Raw Material
  material_code VARCHAR(100),
  material_name VARCHAR(200),
  lot_number VARCHAR(100),
  collection_time TIMESTAMP,
  location VARCHAR(200),
  sampler VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Pending' -- Pending, Testing, Approved, Rejected
);

-- LIMS Test Results
CREATE TABLE IF NOT EXISTS lims_test_results (
  result_id BIGSERIAL PRIMARY KEY,
  sample_id VARCHAR(50) REFERENCES lims_samples(sample_id),
  test_name VARCHAR(200) NOT NULL, -- Viability, VCD, Titer, pH, Purity, Endotoxin
  test_method VARCHAR(100),
  result_value NUMERIC,
  result_unit VARCHAR(50),
  specification_min NUMERIC,
  specification_max NUMERIC,
  result_status VARCHAR(20), -- Pass, Fail, OOS
  test_date TIMESTAMP,
  analyst VARCHAR(100),
  instrument VARCHAR(100)
);

-- PI Historian (OSIsoft PI - aggregated/calculated values)
CREATE TABLE IF NOT EXISTS pi_calculated_data (
  id BIGSERIAL PRIMARY KEY,
  site_id VARCHAR(10) REFERENCES sites(site_id),
  batch_id VARCHAR(50),
  equipment_id VARCHAR(50) REFERENCES equipment(equipment_id),
  calculated_tag VARCHAR(100), -- VCD_AVG_24H, YIELD_CUMULATIVE, TITER_TREND
  timestamp TIMESTAMP NOT NULL,
  value NUMERIC,
  unit VARCHAR(50),
  calculation_type VARCHAR(50) -- Average, Sum, Trend, Prediction
);
CREATE INDEX idx_pi_timestamp ON pi_calculated_data(timestamp);
CREATE INDEX idx_pi_batch ON pi_calculated_data(batch_id);

-- Material Genealogy
CREATE TABLE IF NOT EXISTS material_genealogy (
  material_id VARCHAR(50) PRIMARY KEY,
  material_code VARCHAR(100),
  material_name VARCHAR(200),
  material_type VARCHAR(50), -- RawMaterial, Intermediate, FinalProduct, Waste
  lot_number VARCHAR(100),
  batch_id VARCHAR(50),
  quantity NUMERIC,
  unit VARCHAR(20),
  quality_status VARCHAR(50), -- InSpec, OutOfSpec, Pending, Quarantine
  location VARCHAR(200),
  parent_material_id VARCHAR(50), -- For traceability
  created_time TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 2. SEED DATA
-- ============================================

-- Insert Sites
INSERT INTO sites (site_id, site_name, location, timezone) VALUES
('STA', 'Site A - Boulder', 'Boulder, Colorado, USA', 'America/Denver'),
('STB', 'Site B - Singapore', 'Singapore Science Park', 'Asia/Singapore');

-- Insert Equipment (Site A)
INSERT INTO equipment (equipment_id, site_id, equipment_name, equipment_type, equipment_class, manufacturer, model, capacity_value, capacity_unit, status) VALUES
('STA.BR-2001-A', 'STA', 'Bioreactor BR-2001-A', 'Bioreactor', 'USP_Bioreactor', 'Cytiva', 'Xcellerex XDR-2000', 2000, 'L', 'Running'),
('STA.CENT-001', 'STA', 'Harvest Centrifuge CENT-001', 'Centrifuge', 'Harvest_Equipment', 'GEA', 'westfalia CSC20', 100, 'L/min', 'Idle'),
('STA.TK-001', 'STA', 'Harvest Tank TK-001', 'Storage Tank', 'Storage_Tank', 'DCI', 'ST-2000', 2000, 'L', 'Running'),
('STA.CHR-A-01', 'STA', 'Protein A Column CHR-A-01', 'Chromatography Column', 'Protein_A_Column', 'Cytiva', 'MabSelect SuRe', 20, 'L', 'Running'),
('STA.CHR-A-02', 'STA', 'Protein A Column CHR-A-02', 'Chromatography Column', 'Protein_A_Column', 'Cytiva', 'MabSelect SuRe', 20, 'L', 'Idle'),
('STA.TK-002', 'STA', 'Pool Tank TK-002', 'Storage Tank', 'Storage_Tank', 'DCI', 'ST-500', 500, 'L', 'Running'),
('STA.UF-001', 'STA', 'UF/DF System UF-001', 'UF/DF System', 'Polishing_Equipment', 'Sartorius', 'Sartocon Slice', 50, 'L', 'Idle');

-- Insert Equipment (Site B - Parallel capacity)
INSERT INTO equipment (equipment_id, site_id, equipment_name, equipment_type, equipment_class, manufacturer, model, capacity_value, capacity_unit, status) VALUES
('STB.BR-3002-B', 'STB', 'Bioreactor BR-3002-B', 'Bioreactor', 'USP_Bioreactor', 'Cytiva', 'Xcellerex XDR-2000', 2000, 'L', 'Idle'),
('STB.CHR-B-01', 'STB', 'Protein A Column CHR-B-01', 'Chromatography Column', 'Protein_A_Column', 'Cytiva', 'MabSelect SuRe', 20, 'L', 'Idle');

-- Insert MES Batch Record (mAb-2847 Batch B-2024-0342)
INSERT INTO mes_batch_records (batch_id, site_id, product_code, batch_status, start_time, end_time, total_yield_kg, target_yield_kg, operator, reviewer, equipment_train) VALUES
('B-2024-0342', 'STA', 'mAb-2847', 'In_Progress', '2024-03-15 08:00:00', NULL, NULL, 3.5, 'John Smith', NULL, 'BR-2001-A → CENT-001 → CHR-A-01 → TK-002');

-- Insert MES Process Steps
INSERT INTO mes_process_steps (batch_id, step_name, step_type, equipment_id, start_time, end_time, duration_hours, status, critical_step, qc_required) VALUES
('B-2024-0342', 'Bioreactor Preparation', 'UnitProcedure', 'STA.BR-2001-A', '2024-03-15 08:00:00', '2024-03-15 12:00:00', 4, 'Complete', TRUE, FALSE),
('B-2024-0342', 'Inoculation', 'Operation', 'STA.BR-2001-A', '2024-03-15 12:00:00', '2024-03-15 15:00:00', 3, 'Complete', TRUE, TRUE),
('B-2024-0342', 'Fed-Batch Cell Culture', 'UnitProcedure', 'STA.BR-2001-A', '2024-03-15 15:00:00', '2024-03-19 15:00:00', 96, 'Running', TRUE, TRUE),
('B-2024-0342', 'Cell Harvest', 'UnitProcedure', 'STA.CENT-001', NULL, NULL, 8, 'NotStarted', TRUE, TRUE),
('B-2024-0342', 'Protein A Chromatography', 'UnitProcedure', 'STA.CHR-A-01', NULL, NULL, 6, 'NotStarted', TRUE, TRUE);

-- Insert DCS Data (Sample time-series for Bioreactor BR-2001-A)
-- Temperature data
INSERT INTO dcs_data (site_id, equipment_id, tag_name, timestamp, value, unit, quality, system_source, batch_id) VALUES
('STA', 'STA.BR-2001-A', 'BR001_PV_TEMP', '2024-03-15 15:00:00', 36.8, '°C', 'GOOD', 'DeltaV', 'B-2024-0342'),
('STA', 'STA.BR-2001-A', 'BR001_PV_TEMP', '2024-03-15 15:30:00', 36.9, '°C', 'GOOD', 'DeltaV', 'B-2024-0342'),
('STA', 'STA.BR-2001-A', 'BR001_PV_TEMP', '2024-03-15 16:00:00', 37.0, '°C', 'GOOD', 'DeltaV', 'B-2024-0342'),
('STA', 'STA.BR-2001-A', 'BR001_PV_TEMP', '2024-03-15 16:30:00', 37.0, '°C', 'GOOD', 'DeltaV', 'B-2024-0342'),
('STA', 'STA.BR-2001-A', 'BR001_PV_TEMP', '2024-03-15 17:00:00', 37.1, '°C', 'GOOD', 'DeltaV', 'B-2024-0342');

-- pH data
INSERT INTO dcs_data (site_id, equipment_id, tag_name, timestamp, value, unit, quality, system_source, batch_id) VALUES
('STA', 'STA.BR-2001-A', 'PH_2001_PV', '2024-03-15 15:00:00', 7.10, 'pH', 'GOOD', 'DeltaV', 'B-2024-0342'),
('STA', 'STA.BR-2001-A', 'PH_2001_PV', '2024-03-15 15:30:00', 7.08, 'pH', 'GOOD', 'DeltaV', 'B-2024-0342'),
('STA', 'STA.BR-2001-A', 'PH_2001_PV', '2024-03-15 16:00:00', 7.12, 'pH', 'GOOD', 'DeltaV', 'B-2024-0342'),
('STA', 'STA.BR-2001-A', 'PH_2001_PV', '2024-03-15 16:30:00', 7.15, 'pH', 'GOOD', 'DeltaV', 'B-2024-0342'),
('STA', 'STA.BR-2001-A', 'PH_2001_PV', '2024-03-15 17:00:00', 7.11, 'pH', 'GOOD', 'DeltaV', 'B-2024-0342');

-- Agitation speed
INSERT INTO dcs_data (site_id, equipment_id, tag_name, timestamp, value, unit, quality, system_source, batch_id) VALUES
('STA', 'STA.BR-2001-A', 'REACTOR_1_AGIT_SPEED', '2024-03-15 15:00:00', 85, 'RPM', 'GOOD', 'DeltaV', 'B-2024-0342'),
('STA', 'STA.BR-2001-A', 'REACTOR_1_AGIT_SPEED', '2024-03-15 15:30:00', 85, 'RPM', 'GOOD', 'DeltaV', 'B-2024-0342'),
('STA', 'STA.BR-2001-A', 'REACTOR_1_AGIT_SPEED', '2024-03-15 16:00:00', 90, 'RPM', 'GOOD', 'DeltaV', 'B-2024-0342'),
('STA', 'STA.BR-2001-A', 'REACTOR_1_AGIT_SPEED', '2024-03-15 16:30:00', 90, 'RPM', 'GOOD', 'DeltaV', 'B-2024-0342'),
('STA', 'STA.BR-2001-A', 'REACTOR_1_AGIT_SPEED', '2024-03-15 17:00:00', 90, 'RPM', 'GOOD', 'DeltaV', 'B-2024-0342');

-- Insert LIMS Samples
INSERT INTO lims_samples (sample_id, batch_id, site_id, sample_type, material_code, material_name, lot_number, collection_time, location, sampler, status) VALUES
('LIMS-2024-001523', 'B-2024-0342', 'STA', 'In-Process', 'CULTURE-B2024-0342', 'Production Culture', 'B-2024-0342-CULTURE', '2024-03-17 10:00:00', 'BR-2001-A', 'Jane Doe', 'Approved'),
('LIMS-2024-001524', 'B-2024-0342', 'STA', 'In-Process', 'CULTURE-B2024-0342', 'Production Culture', 'B-2024-0342-CULTURE', '2024-03-18 10:00:00', 'BR-2001-A', 'Jane Doe', 'Approved'),
('LIMS-2024-001525', 'B-2024-0342', 'STA', 'In-Process', 'CULTURE-B2024-0342', 'Production Culture', 'B-2024-0342-CULTURE', '2024-03-19 10:00:00', 'BR-2001-A', 'Jane Doe', 'Testing');

-- Insert LIMS Test Results
INSERT INTO lims_test_results (sample_id, test_name, test_method, result_value, result_unit, specification_min, specification_max, result_status, test_date, analyst, instrument) VALUES
('LIMS-2024-001523', 'Viability', 'Trypan Blue', 92.5, 'percent', 90, NULL, 'Pass', '2024-03-17 12:00:00', 'Sarah Chen', 'ViCell XR'),
('LIMS-2024-001523', 'VCD', 'ViCell', 8.2, 'E6 cells/mL', 5.0, NULL, 'Pass', '2024-03-17 12:00:00', 'Sarah Chen', 'ViCell XR'),
('LIMS-2024-001523', 'Titer', 'HPLC', 1.8, 'g/L', 1.5, NULL, 'Pass', '2024-03-17 13:30:00', 'Mike Johnson', 'Agilent 1290'),
('LIMS-2024-001524', 'Viability', 'Trypan Blue', 89.0, 'percent', 80, NULL, 'Pass', '2024-03-18 12:00:00', 'Sarah Chen', 'ViCell XR'),
('LIMS-2024-001524', 'VCD', 'ViCell', 12.3, 'E6 cells/mL', 8.0, NULL, 'Pass', '2024-03-18 12:00:00', 'Sarah Chen', 'ViCell XR'),
('LIMS-2024-001524', 'Titer', 'HPLC', 2.5, 'g/L', 1.5, NULL, 'Pass', '2024-03-18 13:30:00', 'Mike Johnson', 'Agilent 1290'),
('LIMS-2024-001525', 'Viability', 'Trypan Blue', 88.0, 'percent', 80, NULL, 'Pass', '2024-03-19 12:00:00', 'Sarah Chen', 'ViCell XR'),
('LIMS-2024-001525', 'VCD', 'ViCell', 12.5, 'E6 cells/mL', 8.0, NULL, 'Pass', '2024-03-19 12:00:00', 'Sarah Chen', 'ViCell XR');

-- Insert PI Calculated Data (Aggregated from DCS)
INSERT INTO pi_calculated_data (site_id, batch_id, equipment_id, calculated_tag, timestamp, value, unit, calculation_type) VALUES
('STA', 'B-2024-0342', 'STA.BR-2001-A', 'VCD_AVG_24H', '2024-03-17 10:00:00', 8.1, 'E6 cells/mL', 'Average'),
('STA', 'B-2024-0342', 'STA.BR-2001-A', 'VCD_AVG_24H', '2024-03-18 10:00:00', 12.0, 'E6 cells/mL', 'Average'),
('STA', 'B-2024-0342', 'STA.BR-2001-A', 'VCD_AVG_24H', '2024-03-19 10:00:00', 12.4, 'E6 cells/mL', 'Average'),
('STA', 'B-2024-0342', 'STA.BR-2001-A', 'TITER_TREND', '2024-03-17 10:00:00', 1.8, 'g/L', 'Trend'),
('STA', 'B-2024-0342', 'STA.BR-2001-A', 'TITER_TREND', '2024-03-18 10:00:00', 2.5, 'g/L', 'Trend'),
('STA', 'B-2024-0342', 'STA.BR-2001-A', 'TITER_TREND', '2024-03-19 10:00:00', 2.8, 'g/L', 'Trend');

-- Insert Material Genealogy
INSERT INTO material_genealogy (material_id, material_code, material_name, material_type, lot_number, batch_id, quantity, unit, quality_status, location) VALUES
('MAT-MEDIA-001', 'MED-CHO-001', 'CHO Basal Medium', 'RawMaterial', 'LOT-847261', NULL, 1500, 'L', 'InSpec', 'Raw Material Storage'),
('MAT-SEED-001', 'SEED-CHO-001', 'CHO Seed Culture', 'Intermediate', 'SEED-2024-0341', 'B-2024-0342', 150, 'L', 'InSpec', 'Seed Bioreactor'),
('MAT-CULTURE-001', 'CULTURE-B2024-0342', 'Production Culture', 'Intermediate', 'B-2024-0342-CULTURE', 'B-2024-0342', 1820, 'L', 'InSpec', 'BR-2001-A'),
('MAT-HCCF-001', 'HCCCF-001', 'Harvested Cell Culture Fluid', 'Intermediate', 'B-2024-0342-HCCCF', 'B-2024-0342', 1820, 'L', 'InSpec', 'TK-001'),
('MAT-POOL-001', 'mAb-2847-POOL', 'Purified mAb Pool', 'Intermediate', 'B-2024-0342-POOL-001', 'B-2024-0342', 45, 'L', 'Pending', 'TK-002'),
('MAT-DS-001', 'mAb-2847-DS', 'mAb-2847 Drug Substance', 'FinalProduct', 'B-2024-0342-DS', 'B-2024-0342', 40, 'L', 'Pending', 'Final Storage');

-- Set parent-child relationships for genealogy
UPDATE material_genealogy SET parent_material_id = 'MAT-MEDIA-001' WHERE material_id = 'MAT-SEED-001';
UPDATE material_genealogy SET parent_material_id = 'MAT-SEED-001' WHERE material_id = 'MAT-CULTURE-001';
UPDATE material_genealogy SET parent_material_id = 'MAT-CULTURE-001' WHERE material_id = 'MAT-HCCF-001';
UPDATE material_genealogy SET parent_material_id = 'MAT-HCCF-001' WHERE material_id = 'MAT-POOL-001';
UPDATE material_genealogy SET parent_material_id = 'MAT-POOL-001' WHERE material_id = 'MAT-DS-001';

-- ============================================
-- 3. VERIFICATION QUERIES
-- ============================================

-- Count records in each table
SELECT 'sites' AS table_name, COUNT(*) AS record_count FROM sites
UNION ALL
SELECT 'equipment', COUNT(*) FROM equipment
UNION ALL
SELECT 'dcs_data', COUNT(*) FROM dcs_data
UNION ALL
SELECT 'mes_batch_records', COUNT(*) FROM mes_batch_records
UNION ALL
SELECT 'mes_process_steps', COUNT(*) FROM mes_process_steps
UNION ALL
SELECT 'lims_samples', COUNT(*) FROM lims_samples
UNION ALL
SELECT 'lims_test_results', COUNT(*) FROM lims_test_results
UNION ALL
SELECT 'pi_calculated_data', COUNT(*) FROM pi_calculated_data
UNION ALL
SELECT 'material_genealogy', COUNT(*) FROM material_genealogy
ORDER BY table_name;
