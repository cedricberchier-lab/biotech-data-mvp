'use client';

import { useState } from 'react';

interface DataExport {
  id: string;
  system: 'DCS' | 'eBR' | 'LIMS';
  filename: string;
  exportDate: string;
  format: string;
  size: string;
  recordCount: number;
}

interface DataExportViewerProps {
  onSelectExport: (exportId: string, system: string) => void;
}

export default function DataExportViewer({ onSelectExport }: DataExportViewerProps) {
  const [selectedSystem, setSelectedSystem] = useState<'all' | 'DCS' | 'eBR' | 'LIMS'>('all');

  // Simulated export files
  const exports: DataExport[] = [
    {
      id: 'dcs-001',
      system: 'DCS',
      filename: 'DeltaV_Historian_Export_2024-03-15_BR2001.csv',
      exportDate: '2024-03-15 14:23:11',
      format: 'CSV',
      size: '45.2 MB',
      recordCount: 276480,
    },
    {
      id: 'ebr-001',
      system: 'eBR',
      filename: 'Syncade_BatchRecord_B-2024-0342.xml',
      exportDate: '2024-03-19 09:15:42',
      format: 'XML',
      size: '2.8 MB',
      recordCount: 847,
    },
    {
      id: 'lims-001',
      system: 'LIMS',
      filename: 'LIMS_InProcess_Results_B-2024-0342.csv',
      exportDate: '2024-03-20 16:47:23',
      format: 'CSV',
      size: '124 KB',
      recordCount: 42,
    },
    {
      id: 'lims-002',
      system: 'LIMS',
      filename: 'LIMS_Analytical_Results_B-2024-0342.csv',
      exportDate: '2024-03-22 11:22:09',
      format: 'CSV',
      size: '18 KB',
      recordCount: 8,
    },
    {
      id: 'lims-003',
      system: 'LIMS',
      filename: 'LIMS_Microbiology_Results_B-2024-0342.csv',
      exportDate: '2024-03-25 14:33:51',
      format: 'CSV',
      size: '12 KB',
      recordCount: 6,
    },
  ];

  const filteredExports = selectedSystem === 'all'
    ? exports
    : exports.filter(e => e.system === selectedSystem);

  const getSystemColor = (system: string) => {
    switch (system) {
      case 'DCS': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'eBR': return 'bg-green-100 text-green-800 border-green-300';
      case 'LIMS': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="w-full">
      {/* System Filter */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setSelectedSystem('all')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            selectedSystem === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Systems
        </button>
        <button
          onClick={() => setSelectedSystem('DCS')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            selectedSystem === 'DCS'
              ? 'bg-blue-600 text-white'
              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
          }`}
        >
          DCS
        </button>
        <button
          onClick={() => setSelectedSystem('eBR')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            selectedSystem === 'eBR'
              ? 'bg-green-600 text-white'
              : 'bg-green-50 text-green-700 hover:bg-green-100'
          }`}
        >
          eBR
        </button>
        <button
          onClick={() => setSelectedSystem('LIMS')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            selectedSystem === 'LIMS'
              ? 'bg-purple-600 text-white'
              : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
          }`}
        >
          LIMS
        </button>
      </div>

      {/* Export Files List */}
      <div className="space-y-3">
        {filteredExports.map(exp => (
          <div
            key={exp.id}
            onClick={() => onSelectExport(exp.id, exp.system)}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded border ${getSystemColor(exp.system)}`}>
                    {exp.system}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">{exp.format}</span>
                </div>
                <h3 className="font-mono text-sm font-medium text-gray-900 mb-1">
                  {exp.filename}
                </h3>
                <div className="flex gap-4 text-xs text-gray-600">
                  <span>Exported: {exp.exportDate}</span>
                  <span>•</span>
                  <span>{exp.recordCount.toLocaleString()} records</span>
                  <span>•</span>
                  <span>{exp.size}</span>
                </div>
              </div>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {filteredExports.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No exports found for selected system
        </div>
      )}
    </div>
  );
}
