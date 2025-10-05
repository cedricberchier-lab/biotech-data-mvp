/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import DataExportViewer from '@/components/raw-data/DataExportViewer';
import RawDataDisplay from '@/components/raw-data/RawDataDisplay';
import StructuredDataViewer from '@/components/structured/StructuredDataViewer';
import KnowledgeGraphViewer from '@/components/knowledge-graph/KnowledgeGraphViewer';
import LiveDataDashboard from '@/components/mvp/LiveDataDashboard';
import { getSampleBatchData } from '@/lib/generators/batch-data';
import { getDCSSample } from '@/lib/generators/dcs-generator';

type MainPhase = 'ideation' | 'mvp';
type IdeationPhase = 'phase1' | 'phase2' | 'phase3';

export default function Home() {
  const [mainPhase, setMainPhase] = useState<MainPhase>('ideation');
  const [ideationPhase, setIdeationPhase] = useState<IdeationPhase>('phase1');
  const [selectedExport, setSelectedExport] = useState<string | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<'DCS' | 'eBR' | 'LIMS' | null>(null);

  // Generate sample batch data
  const batchData = getSampleBatchData();

  // Map export IDs to actual data
  const getExportData = (exportId: string, system: string) => {
    switch (exportId) {
      case 'dcs-001':
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                BioTech Data Integration Platform
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                mAb Manufacturing Intelligence System
              </p>
            </div>

            {/* Main Phase Toggle */}
            <div className="flex gap-3">
              <button
                onClick={() => setMainPhase('ideation')}
                className={`px-8 py-4 rounded-xl font-bold transition-all transform ${
                  mainPhase === 'ideation'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl scale-105'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-purple-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💡</span>
                  <div className="text-left">
                    <div className="text-lg">IDEATION</div>
                    <div className="text-xs opacity-80">Concept & Prototypes</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setMainPhase('mvp')}
                className={`px-8 py-4 rounded-xl font-bold transition-all transform ${
                  mainPhase === 'mvp'
                    ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-xl scale-105'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🚀</span>
                  <div className="text-left">
                    <div className="text-lg">MVP</div>
                    <div className="text-xs opacity-80">Production Ready</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {mainPhase === 'ideation' ? (
          <div className="space-y-6">
            {/* Ideation Phase Navigation */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                💡 Ideation Phase - Concept Exploration
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => {
                    setIdeationPhase('phase1');
                    setSelectedExport(null);
                  }}
                  className={`p-6 rounded-xl font-medium transition-all ${
                    ideationPhase === 'phase1'
                      ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg'
                      : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">📁</span>
                    <div className="text-left">
                      <div className="text-sm font-bold">PHASE 1</div>
                      <div className="text-xs opacity-90">Raw Data Extraction</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setIdeationPhase('phase2')}
                  className={`p-6 rounded-xl font-medium transition-all ${
                    ideationPhase === 'phase2'
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg'
                      : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🏗️</span>
                    <div className="text-left">
                      <div className="text-sm font-bold">PHASE 2</div>
                      <div className="text-xs opacity-90">Structured Data</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setIdeationPhase('phase3')}
                  className={`p-6 rounded-xl font-medium transition-all ${
                    ideationPhase === 'phase3'
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🔗</span>
                    <div className="text-left">
                      <div className="text-sm font-bold">PHASE 3</div>
                      <div className="text-xs opacity-90">Knowledge Graph</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Ideation Content */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {ideationPhase === 'phase1' && (
                <>
                  {!selectedExport ? (
                    <DataExportViewer onSelectExport={handleSelectExport} />
                  ) : (
                    <RawDataDisplay
                      data={getExportData(selectedExport, selectedSystem || '')}
                      system={selectedSystem || 'DCS'}
                      onBack={handleBack}
                    />
                  )}
                </>
              )}

              {ideationPhase === 'phase2' && <StructuredDataViewer />}

              {ideationPhase === 'phase3' && <KnowledgeGraphViewer />}
            </div>
          </div>
        ) : (
          /* MVP Phase - Live Data Dashboard */
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <LiveDataDashboard />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
