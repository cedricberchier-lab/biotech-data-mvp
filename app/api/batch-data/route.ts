import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Get batch info
    const batch = await sql`
      SELECT batch_id, product_code, batch_status, start_time, end_time,
             total_yield_kg, target_yield_kg, operator, equipment_train
      FROM mes_batch_records
      WHERE batch_id = 'B-2024-0342'
    `;

    // Get DCS data (recent)
    const dcsData = await sql`
      SELECT tag_name, timestamp, value, unit, quality, system_source
      FROM dcs_data
      WHERE batch_id = 'B-2024-0342'
      ORDER BY timestamp DESC
      LIMIT 50
    `;

    // Get LIMS samples and results
    const limsResults = await sql`
      SELECT s.sample_id, s.sample_type, s.collection_time, s.status,
             t.test_name, t.result_value, t.result_unit, t.result_status,
             t.specification_min, t.specification_max
      FROM lims_samples s
      LEFT JOIN lims_test_results t ON s.sample_id = t.sample_id
      WHERE s.batch_id = 'B-2024-0342'
      ORDER BY s.collection_time DESC, t.test_name
    `;

    // Get process steps
    const processSteps = await sql`
      SELECT step_name, step_type, equipment_id, start_time, end_time,
             duration_hours, status, critical_step, qc_required
      FROM mes_process_steps
      WHERE batch_id = 'B-2024-0342'
      ORDER BY start_time
    `;

    // Get equipment status
    const equipment = await sql`
      SELECT equipment_id, equipment_name, equipment_type, status,
             site_id, capacity_value, capacity_unit
      FROM equipment
      WHERE site_id = 'STA'
      ORDER BY equipment_type
    `;

    // Get PI calculated data
    const piData = await sql`
      SELECT calculated_tag, timestamp, value, unit, calculation_type
      FROM pi_calculated_data
      WHERE batch_id = 'B-2024-0342'
      ORDER BY timestamp DESC
    `;

    return NextResponse.json({
      success: true,
      batch: batch[0] || null,
      dcsData,
      limsResults,
      processSteps,
      equipment,
      piData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch batch data' },
      { status: 500 }
    );
  }
}
