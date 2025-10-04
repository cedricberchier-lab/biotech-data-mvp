'use client';

import { useState } from 'react';
import DataExportViewer from '@/components/raw-data/DataExportViewer';
import RawDataDisplay from '@/components/raw-data/RawDataDisplay';
import StructuredDataViewer from '@/components/structured/StructuredDataViewer';
import KnowledgeGraphViewer from '@/components/knowledge-graph/KnowledgeGraphViewer';
import { getSampleBatchData } from '@/lib/generators/batch-data';
import { getDCSSample } from '@/lib/generators/dcs-generator';

type ViewMode = 'raw' | 'structured' | 'knowledge';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('raw');
  const [selectedExport, setSelectedExport] = useState<string | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<'DCS' | 'eBR' | 'LIMS' | null>(null);

  // Generate sample batch data
  const batchData = getSampleBatchData();

  // Map export IDs to actual data
  const getExportData = (exportId: string, system: string) => {
    switch (exportId) {
      case 'dcs-001':
        // Return first 500 DCS points for display
        return getDCSSample(batchData.dcs, 500);
      case 'ebr-001':
        return batchData.ebr;
      case 'lims-001':
        return {
          ...batchData.lims,
          results: batchData.lims.in_process_results,
        };
      case 'lims-002':
        return {
          ...batchData.lims,
          results: batchData.lims.analytical_results,
        };
      case 'lims-003':
        return {
          ...batchData.lims,
          results: batchData.lims.microbiology_results,
        };
      default:
        return null;
    }
  };

  const handleSelectExport = (exportId: string, system: string) => {
    setSelectedExport(exportId);
    setSelectedSystem(system as 'DCS' | 'eBR' | 'LIMS');
  };

  const handleBack = () => {
    setSelectedExport(null);
    setSelectedSystem(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Manufacturing Data Integration Platform
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Batch {batchData.batchId} - mAb Production Process
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setViewMode('raw');
                  setSelectedExport(null);
                }}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  viewMode === 'raw'
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>📁</span>
                  <div className="text-left">
                    <div className="text-sm font-bold">PHASE 1</div>
                    <div className="text-xs">Raw Data</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setViewMode('structured')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  viewMode === 'structured'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>✨</span>
                  <div className="text-left">
                    <div className="text-sm font-bold">PHASE 2</div>
                    <div className="text-xs">Structured Data</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setViewMode('knowledge')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  viewMode === 'knowledge'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>🔗</span>
                  <div className="text-left">
                    <div className="text-sm font-bold">PHASE 3</div>
                    <div className="text-xs">Knowledge Graph</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'knowledge' ? (
          <KnowledgeGraphViewer />
        ) : viewMode === 'structured' ? (
          <StructuredDataViewer
            batchId={batchData.batchId}
            batchStartTime={batchData.startDate}
          />
        ) : selectedExport && selectedSystem ? (
          <div>
            <button
              onClick={handleBack}
              className="mb-6 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to exports
            </button>
            <RawDataDisplay
              system={selectedSystem}
              data={getExportData(selectedExport, selectedSystem)}
              format={selectedSystem === 'eBR' ? 'XML' : 'CSV'}
            />
          </div>
        ) : (
          <div>
            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-2">DCS (Distributed Control System)</h3>
                <p className="text-sm text-gray-700">
                  Time-series process data with cryptic tag names, 30-second intervals, no batch context
                </p>
                <div className="mt-3 text-xs text-blue-800 font-mono">
                  ~276,000 records
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-900 mb-2">eBR (Electronic Batch Record)</h3>
                <p className="text-sm text-gray-700">
                  Structured manufacturing execution data with phases, parameters, and operator entries
                </p>
                <div className="mt-3 text-xs text-green-800 font-mono">
                  6 phases, 847 entries
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="font-semibold text-purple-900 mb-2">LIMS (Lab Information System)</h3>
                <p className="text-sm text-gray-700">
                  Lab results with different naming conventions, mismatched location codes, delayed timestamps
                </p>
                <div className="mt-3 text-xs text-purple-800 font-mono">
                  3 result tables
                </div>
              </div>
            </div>

            {/* Key Challenges */}
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Key Data Integration Challenges
              </h3>
              <ul className="text-sm text-gray-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600">•</span>
                  <span><strong>No common identifiers:</strong> DCS uses tag names (BR001_PV_TEMP), eBR uses equipment IDs (BR-2001-A), LIMS uses location codes (LOC-B7-R2001)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600">•</span>
                  <span><strong>Time misalignment:</strong> DCS is real-time, LIMS results delayed by hours/days from sample collection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600">•</span>
                  <span><strong>Different granularity:</strong> DCS has 276k records at 30-sec intervals, eBR has 6 phases, LIMS has 42 test results</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600">•</span>
                  <span><strong>Inconsistent naming:</strong> Parameter names vary by site, vendor, and system (pH vs PH_AI_2001 vs METAB-GLU)</span>
                </li>
              </ul>
            </div>

            {/* Export Files */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                System Export Files
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Click on any export file to view its raw structure and data
              </p>
              <DataExportViewer onSelectExport={handleSelectExport} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
