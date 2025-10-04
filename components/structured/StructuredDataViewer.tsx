'use client';

import { useState } from 'react';
import EquipmentHierarchyView from './EquipmentHierarchyView';
import ProcessStateView from './ProcessStateView';
import MaterialFlowView from './MaterialFlowView';
import ParameterHarmonizationView from './ParameterHarmonizationView';
import TransformationComparison from './TransformationComparison';

type StructuredSection =
  | 'equipment'
  | 'process'
  | 'material'
  | 'parameters'
  | 'transformation';

interface StructuredDataViewerProps {
  batchId: string;
  batchStartTime: Date;
}

export default function StructuredDataViewer({ batchId, batchStartTime }: StructuredDataViewerProps) {
  const [activeSection, setActiveSection] = useState<StructuredSection>('transformation');

  const sections: { id: StructuredSection; label: string; icon: string }[] = [
    { id: 'transformation', label: 'Transformation View', icon: '⚡' },
    { id: 'equipment', label: 'Equipment Model', icon: '🏭' },
    { id: 'process', label: 'Process Context', icon: '📊' },
    { id: 'material', label: 'Material Flow', icon: '🔄' },
    { id: 'parameters', label: 'Harmonized Parameters', icon: '📏' },
  ];

  return (
    <div className="w-full">
      {/* Section Navigation */}
      <div className="bg-white border-b border-gray-200 mb-6">
        <div className="flex gap-1 overflow-x-auto">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeSection === section.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{section.icon}</span>
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeSection === 'transformation' && (
          <TransformationComparison batchId={batchId} batchStartTime={batchStartTime} />
        )}
        {activeSection === 'equipment' && (
          <EquipmentHierarchyView />
        )}
        {activeSection === 'process' && (
          <ProcessStateView batchStartTime={batchStartTime} />
        )}
        {activeSection === 'material' && (
          <MaterialFlowView batchId={batchId} batchStartTime={batchStartTime} />
        )}
        {activeSection === 'parameters' && (
          <ParameterHarmonizationView />
        )}
      </div>
    </div>
  );
}
