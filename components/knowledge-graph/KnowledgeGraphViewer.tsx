'use client';

import { useState } from 'react';
import EquipmentNetworkView from './EquipmentNetworkView';
import ProcessNetworkView from './ProcessNetworkView';
import MaterialNetworkView from './MaterialNetworkView';
import KnowledgeQueryView from './KnowledgeQueryView';
import DynamicGraphVisualization from './DynamicGraphVisualization';
import ProcessFlowDiagram from './ProcessFlowDiagram';

type GraphSection = 'visualization' | 'flowchart' | 'queries' | 'equipment' | 'process' | 'material';

export default function KnowledgeGraphViewer() {
  const [activeSection, setActiveSection] = useState<GraphSection>('visualization');

  const sections: { id: GraphSection; label: string; icon: string; description: string }[] = [
    {
      id: 'visualization',
      label: 'Graph Visualization',
      icon: '🔗',
      description: 'Interactive network diagram with material flow backbone',
    },
    {
      id: 'flowchart',
      label: 'Process Flowchart',
      icon: '📊',
      description: 'Mermaid diagram: Upstream → Downstream → Drug Substance',
    },
    {
      id: 'queries',
      label: 'Knowledge Queries',
      icon: '🔍',
      description: 'Ask complex questions across the knowledge graph',
    },
    {
      id: 'equipment',
      label: 'Equipment Network',
      icon: '🏭',
      description: 'Equipment relationships and connections',
    },
    {
      id: 'process',
      label: 'Process Network',
      icon: '⚙️',
      description: 'Process hierarchy and dependencies',
    },
    {
      id: 'material',
      label: 'Material Network',
      icon: '🧬',
      description: 'Material flow and genealogy',
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Manufacturing Knowledge Graph
        </h2>
        <p className="text-sm text-gray-700">
          Connected network of equipment, processes, and materials enabling intelligent queries
        </p>
      </div>

      {/* Section Navigation */}
      <div className="bg-white border border-gray-200 rounded-lg p-2">
        <div className="grid grid-cols-6 gap-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`p-4 rounded-lg text-left transition-all ${
                activeSection === section.id
                  ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="text-2xl mb-2">{section.icon}</div>
              <div className="font-semibold text-sm mb-1">{section.label}</div>
              <div className={`text-xs ${activeSection === section.id ? 'text-purple-100' : 'text-gray-600'}`}>
                {section.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Section Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 min-h-[600px]">
        {activeSection === 'visualization' && <DynamicGraphVisualization />}
        {activeSection === 'flowchart' && <ProcessFlowDiagram />}
        {activeSection === 'queries' && <KnowledgeQueryView />}
        {activeSection === 'equipment' && <EquipmentNetworkView />}
        {activeSection === 'process' && <ProcessNetworkView />}
        {activeSection === 'material' && <MaterialNetworkView />}
      </div>
    </div>
  );
}
