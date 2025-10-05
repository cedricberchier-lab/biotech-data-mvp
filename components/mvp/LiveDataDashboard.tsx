'use client';

import { useState, useEffect } from 'react';

interface BatchData {
  batch: {
    batch_id: string;
    product_code: string;
    batch_status: string;
    start_time: string;
    operator: string;
    equipment_train: string;
  };
  dcsData: Array<{
    tag_name: string;
    timestamp: string;
    value: number;
    unit: string;
    quality: string;
    system_source: string;
  }>;
  limsResults: Array<{
    sample_id: string;
    sample_type: string;
    collection_time: string;
    status: string;
    test_name: string;
    result_value: number;
    result_unit: string;
    result_status: string;
    specification_min: number;
    specification_max: number;
  }>;
  processSteps: Array<{
    step_name: string;
    step_type: string;
    equipment_id: string;
    start_time: string;
    end_time: string;
    duration_hours: number;
    status: string;
    critical_step: boolean;
  }>;
  equipment: Array<{
    equipment_id: string;
    equipment_name: string;
    equipment_type: string;
    status: string;
    site_id: string;
  }>;
  piData: Array<{
    calculated_tag: string;
    timestamp: string;
    value: number;
    unit: string;
    calculation_type: string;
  }>;
}

export default function LiveDataDashboard() {
  const [data, setData] = useState<BatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'dcs' | 'lims' | 'process' | 'equipment'>('dcs');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/batch-data');
      const result = await response.json();

      if (result.success) {
        setData(result);
        setError(null);
      } else {
        setError(result.error || 'Failed to load data');
      }
    } catch (err) {
      setError('Network error: Unable to connect to database');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">⚡</div>
          <div className="text-xl font-bold text-gray-700">Loading Live Data...</div>
          <div className="text-sm text-gray-500 mt-2">Connecting to Neon Database</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-xl p-8 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <div className="text-xl font-bold text-red-900 mb-2">Database Connection Error</div>
        <div className="text-sm text-red-700">{error}</div>
        <button
          onClick={fetchData}
          className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (!data || !data.batch) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-8 text-center">
        <div className="text-6xl mb-4">📭</div>
        <div className="text-xl font-bold text-yellow-900">No Active Batch Found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Batch Header */}
      <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold opacity-90">LIVE FROM NEON DATABASE</div>
            <h2 className="text-3xl font-bold mt-1">Batch {data.batch.batch_id}</h2>
            <div className="mt-2 text-sm opacity-90">{data.batch.product_code} • {data.batch.equipment_train}</div>
          </div>
          <div className="text-right">
            <div className="inline-block px-4 py-2 bg-white bg-opacity-20 rounded-lg">
              <div className="text-xs font-semibold">STATUS</div>
              <div className="text-lg font-bold">{data.batch.batch_status}</div>
            </div>
            <div className="mt-2 text-xs opacity-75">Operator: {data.batch.operator}</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border-2 border-blue-200 rounded-xl p-4">
          <div className="text-sm text-gray-600">DCS Data Points</div>
          <div className="text-3xl font-bold text-blue-600">{data.dcsData.length}</div>
        </div>
        <div className="bg-white border-2 border-purple-200 rounded-xl p-4">
          <div className="text-sm text-gray-600">LIMS Tests</div>
          <div className="text-3xl font-bold text-purple-600">{data.limsResults.length}</div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-xl p-4">
          <div className="text-sm text-gray-600">Process Steps</div>
          <div className="text-3xl font-bold text-green-600">{data.processSteps.length}</div>
        </div>
        <div className="bg-white border-2 border-orange-200 rounded-xl p-4">
          <div className="text-sm text-gray-600">Equipment Online</div>
          <div className="text-3xl font-bold text-orange-600">
            {data.equipment.filter(e => e.status === 'Running').length}
          </div>
        </div>
      </div>

      {/* View Selector */}
      <div className="bg-white border border-gray-200 rounded-xl p-2">
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setSelectedView('dcs')}
            className={`p-4 rounded-lg font-semibold transition-all ${
              selectedView === 'dcs'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            📊 DCS Time-Series
          </button>
          <button
            onClick={() => setSelectedView('lims')}
            className={`p-4 rounded-lg font-semibold transition-all ${
              selectedView === 'lims'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            🧪 LIMS Results
          </button>
          <button
            onClick={() => setSelectedView('process')}
            className={`p-4 rounded-lg font-semibold transition-all ${
              selectedView === 'process'
                ? 'bg-green-500 text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            ⚙️ Process Steps
          </button>
          <button
            onClick={() => setSelectedView('equipment')}
            className={`p-4 rounded-lg font-semibold transition-all ${
              selectedView === 'equipment'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            🏭 Equipment Status
          </button>
        </div>
      </div>

      {/* Data Display */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        {selectedView === 'dcs' && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">DCS Historian Data</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Tag Name</th>
                    <th className="px-4 py-2 text-left font-semibold">Timestamp</th>
                    <th className="px-4 py-2 text-right font-semibold">Value</th>
                    <th className="px-4 py-2 text-left font-semibold">Unit</th>
                    <th className="px-4 py-2 text-left font-semibold">Quality</th>
                    <th className="px-4 py-2 text-left font-semibold">System</th>
                  </tr>
                </thead>
                <tbody>
                  {data.dcsData.map((row, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-xs">{row.tag_name}</td>
                      <td className="px-4 py-2 text-xs">{new Date(row.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-2 text-right font-semibold">{row.value}</td>
                      <td className="px-4 py-2 text-gray-600">{row.unit}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          row.quality === 'GOOD' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {row.quality}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-xs text-gray-600">{row.system_source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedView === 'lims' && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">LIMS Test Results</h3>
            <div className="space-y-4">
              {Array.from(new Set(data.limsResults.map(r => r.sample_id))).map(sampleId => {
                const sampleTests = data.limsResults.filter(r => r.sample_id === sampleId);
                const sample = sampleTests[0];
                return (
                  <div key={sampleId} className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-bold text-gray-900">{sampleId}</div>
                        <div className="text-sm text-gray-600">
                          {sample.sample_type} • {new Date(sample.collection_time).toLocaleString()}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded font-semibold text-sm ${
                        sample.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        sample.status === 'Testing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {sample.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {sampleTests.filter(t => t.test_name).map((test, idx) => (
                        <div key={idx} className="bg-white rounded p-3 border border-purple-100">
                          <div className="text-xs text-gray-600 mb-1">{test.test_name}</div>
                          <div className="text-lg font-bold text-gray-900">
                            {test.result_value} <span className="text-sm text-gray-600">{test.result_unit}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Spec: {test.specification_min || '—'} - {test.specification_max || '—'}
                          </div>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold ${
                            test.result_status === 'Pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {test.result_status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedView === 'process' && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">MES Process Steps</h3>
            <div className="space-y-3">
              {data.processSteps.map((step, idx) => (
                <div key={idx} className="border-l-4 border-green-500 bg-green-50 rounded-r-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-gray-900">{step.step_name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {step.equipment_id} • {step.step_type}
                        {step.critical_step && <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs font-semibold">CRITICAL</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded font-semibold text-sm ${
                        step.status === 'Complete' ? 'bg-green-500 text-white' :
                        step.status === 'Running' ? 'bg-blue-500 text-white' :
                        'bg-gray-300 text-gray-700'
                      }`}>
                        {step.status}
                      </span>
                      {step.duration_hours && (
                        <div className="text-xs text-gray-600 mt-1">{step.duration_hours}h duration</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedView === 'equipment' && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Equipment Status (Site A)</h3>
            <div className="grid grid-cols-2 gap-4">
              {data.equipment.map((eq, idx) => (
                <div key={idx} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-gray-900">{eq.equipment_name}</div>
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${
                      eq.status === 'Running' ? 'bg-green-500 text-white' :
                      eq.status === 'Idle' ? 'bg-gray-400 text-white' :
                      'bg-yellow-500 text-white'
                    }`}>
                      {eq.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">{eq.equipment_type}</div>
                  <div className="text-xs text-gray-500 mt-1 font-mono">{eq.equipment_id}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
