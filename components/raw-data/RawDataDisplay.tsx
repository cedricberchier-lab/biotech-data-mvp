'use client';

import { useState, useMemo } from 'react';

interface RawDataDisplayProps {
  system: 'DCS' | 'eBR' | 'LIMS';
  data: any;
  format: 'CSV' | 'XML' | 'JSON';
}

export default function RawDataDisplay({ system, data, format }: RawDataDisplayProps) {
  const [viewMode, setViewMode] = useState<'raw' | 'table'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // For CSV/table data
  const tableData = useMemo(() => {
    if (system === 'DCS' && Array.isArray(data)) {
      return data;
    } else if (system === 'LIMS' && data.results) {
      return data.results;
    }
    return [];
  }, [system, data]);

  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const paginatedData = tableData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // System-specific header info
  const getSystemInfo = () => {
    switch (system) {
      case 'DCS':
        return {
          title: 'DCS Historian Export',
          description: 'Raw time-series data from Distributed Control System',
          warning: 'Note: Tag names are system-specific. No batch context provided.',
          color: 'blue',
        };
      case 'eBR':
        return {
          title: 'Electronic Batch Record',
          description: 'Structured manufacturing execution data with operator entries',
          warning: 'Note: Equipment IDs and phase names may vary by site.',
          color: 'green',
        };
      case 'LIMS':
        return {
          title: 'LIMS Test Results',
          description: 'Laboratory analytical and microbiological test results',
          warning: 'Note: Sample location codes often don\'t match DCS/eBR equipment IDs. Results delayed from collection time.',
          color: 'purple',
        };
    }
  };

  const info = getSystemInfo();

  const renderDCSTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm font-mono">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
              Timestamp
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
              Tag ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
              Value
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
              Quality
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginatedData.map((row: any, idx: number) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="px-4 py-2 text-xs text-gray-600">
                {new Date(row.timestamp).toLocaleString()}
              </td>
              <td className="px-4 py-2 text-xs text-blue-700 font-semibold">
                {row.tag_id}
              </td>
              <td className="px-4 py-2 text-xs text-gray-900">
                {row.value}
              </td>
              <td className="px-4 py-2 text-xs">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  row.quality_flag === 'GOOD' ? 'bg-green-100 text-green-800' :
                  row.quality_flag === 'BAD' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {row.quality_flag}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderLIMSTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm font-mono">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
              Sample ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
              Test Code
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
              Test Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
              Result
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
              Analysis Date
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginatedData.map((row: any, idx: number) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="px-4 py-2 text-xs text-purple-700 font-semibold">
                {row.sample_id}
              </td>
              <td className="px-4 py-2 text-xs text-gray-600">
                {row.test_code}
              </td>
              <td className="px-4 py-2 text-xs text-gray-900">
                {row.test_name}
              </td>
              <td className="px-4 py-2 text-xs text-gray-900">
                {row.result_value} {row.result_unit || ''}
              </td>
              <td className="px-4 py-2 text-xs">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  row.result_status === 'Pass' ? 'bg-green-100 text-green-800' :
                  row.result_status === 'Fail' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {row.result_status}
                </span>
              </td>
              <td className="px-4 py-2 text-xs text-gray-600">
                {new Date(row.analysis_date).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderEBRPhases = () => {
    if (!data.phases) return null;

    return (
      <div className="space-y-4">
        {data.phases.map((phase: any, idx: number) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{phase.phase_name}</h3>
                <p className="text-xs text-gray-600 font-mono mt-1">
                  Phase ID: {phase.phase_id} | Equipment: {phase.equipment_id}
                </p>
              </div>
              <span className={`px-3 py-1 rounded text-xs font-medium ${
                phase.status === 'Completed' ? 'bg-green-100 text-green-800' :
                phase.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}>
                {phase.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div>
                <span className="text-gray-600">Start:</span>
                <span className="ml-2 text-gray-900 font-mono">
                  {new Date(phase.start_time).toLocaleString()}
                </span>
              </div>
              {phase.end_time && (
                <div>
                  <span className="text-gray-600">End:</span>
                  <span className="ml-2 text-gray-900 font-mono">
                    {new Date(phase.end_time).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {phase.parameters && phase.parameters.length > 0 && (
              <div className="mt-3">
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Parameters</h4>
                <div className="bg-gray-50 rounded p-3 space-y-2">
                  {phase.parameters.map((param: any, pIdx: number) => (
                    <div key={pIdx} className="flex items-center justify-between text-xs">
                      <span className="text-gray-700">{param.parameter_name}</span>
                      <div className="flex items-center gap-3">
                        {param.set_point !== undefined && (
                          <span className="text-gray-600">
                            SP: {param.set_point} {param.unit}
                          </span>
                        )}
                        {param.actual_value !== undefined && (
                          <span className="text-gray-900 font-semibold">
                            Actual: {param.actual_value} {param.unit}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded ${
                          param.in_spec ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {param.in_spec ? 'In Spec' : 'OOS'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {phase.materials && phase.materials.length > 0 && (
              <div className="mt-3">
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Materials Added</h4>
                <div className="bg-blue-50 rounded p-3 space-y-1">
                  {phase.materials.map((mat: any, mIdx: number) => (
                    <div key={mIdx} className="text-xs text-gray-700">
                      <span className="font-mono text-blue-700">{mat.material_code}</span>
                      {' - '}
                      <span>{mat.material_name}</span>
                      {' - '}
                      <span className="font-semibold">{mat.quantity} {mat.unit}</span>
                      {' - '}
                      <span className="text-gray-600">Lot: {mat.lot_number}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderRawView = () => (
    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono">
      {JSON.stringify(data, null, 2)}
    </pre>
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className={`bg-${info.color}-50 border border-${info.color}-200 rounded-lg p-4 mb-4`}>
        <h2 className={`text-lg font-bold text-${info.color}-900 mb-1`}>{info.title}</h2>
        <p className="text-sm text-gray-700 mb-2">{info.description}</p>
        <p className={`text-xs text-${info.color}-800 font-medium`}>⚠️ {info.warning}</p>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'table'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {system === 'eBR' ? 'Structured View' : 'Table View'}
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'raw'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Raw Data
          </button>
        </div>

        {viewMode === 'table' && tableData.length > 0 && (
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, tableData.length)} of {tableData.length} records
          </div>
        )}
      </div>

      {/* Data Display */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {viewMode === 'raw' ? (
          renderRawView()
        ) : system === 'DCS' ? (
          renderDCSTable()
        ) : system === 'LIMS' ? (
          renderLIMSTable()
        ) : system === 'eBR' ? (
          <div className="p-4">
            {renderEBRPhases()}
          </div>
        ) : null}
      </div>

      {/* Pagination */}
      {viewMode === 'table' && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
