'use client';

import { getProcessHierarchy, getPhaseTimeline, type ProcessNode } from '@/lib/structured/isa88-process';
import { useState } from 'react';

interface ProcessStateViewProps {
  batchStartTime: Date;
}

export default function ProcessStateView({ batchStartTime }: ProcessStateViewProps) {
  const processHierarchy = getProcessHierarchy();
  const timeline = getPhaseTimeline(batchStartTime, 105);
  const [selectedPhase, setSelectedPhase] = useState(0);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Procedure': return 'bg-purple-600 text-white';
      case 'UnitProcedure': return 'bg-blue-600 text-white';
      case 'Operation': return 'bg-green-600 text-white';
      case 'Phase': return 'bg-orange-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const renderProcessNode = (node: ProcessNode, depth: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const indent = depth * 16;

    return (
      <div key={node.id} style={{ marginLeft: `${indent}px` }}>
        <div className="flex items-start gap-2 py-2">
          <span className={`px-2 py-1 text-xs font-bold rounded ${getLevelColor(node.level)}`}>
            {node.level}
          </span>
          <div className="flex-1">
            <div className="font-semibold text-gray-900">{node.name}</div>
            <div className="text-xs text-gray-600">{node.description}</div>
            {node.equipmentId && (
              <div className="text-xs text-blue-700 font-mono mt-1">Equipment: {node.equipmentId}</div>
            )}
            {node.expectedDuration && (
              <div className="text-xs text-gray-500 mt-1">
                Duration: {node.expectedDuration.min}-{node.expectedDuration.max} {node.expectedDuration.unit}
              </div>
            )}
          </div>
        </div>

        {hasChildren && (
          <div className="ml-4 border-l-2 border-gray-200 pl-2">
            {node.children!.map(child => renderProcessNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ISA-88 Process State Contextualization
        </h2>
        <p className="text-sm text-gray-600">
          Process hierarchy: Procedure → Unit Procedure → Operation → Phase
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left: Process Hierarchy */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Process Hierarchy</h3>
          <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-[600px] overflow-y-auto">
            {renderProcessNode(processHierarchy.procedure)}
          </div>
        </div>

        {/* Right: Phase Timeline */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Phase Timeline</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {timeline.map((state, idx) => {
              const isSelected = selectedPhase === idx;
              const hoursSinceStart = (state.timestamp.getTime() - batchStartTime.getTime()) / 3600000;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedPhase(idx)}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-600">
                      T+{hoursSinceStart.toFixed(0)}h
                    </span>
                    <span className="text-xs text-gray-500">
                      {state.timestamp.toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                        UP
                      </span>
                      <span className="text-xs text-gray-900 font-medium">{state.currentUnitProcedure}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                        OP
                      </span>
                      <span className="text-xs text-gray-900">{state.currentOperation}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                        PH
                      </span>
                      <span className="text-xs text-gray-900 font-semibold">{state.currentPhase}</span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <div className="text-xs text-gray-700 font-mono bg-gray-50 p-2 rounded">
                        {state.fullContext}
                      </div>
                      <div className="text-xs text-gray-600 mt-2">
                        Equipment: {state.equipmentId}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Example Context */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-green-900 mb-3">
          Example: How Process Context Enriches Data
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-3 rounded border border-red-200">
            <div className="text-xs font-semibold text-red-800 mb-2">❌ Without Context:</div>
            <div className="text-xs text-gray-700 font-mono">
              2024-03-17 14:23:00<br/>
              BR001_PV_TEMP: 33.2°C
            </div>
            <div className="text-xs text-gray-600 mt-2 italic">
              "Why is temperature lower than target?"
            </div>
          </div>
          <div className="bg-white p-3 rounded border border-green-200">
            <div className="text-xs font-semibold text-green-800 mb-2">✓ With Process Context:</div>
            <div className="text-xs text-gray-700 font-mono">
              2024-03-17 14:23:00<br/>
              BR-2001-A Culture Temperature: 33.2°C<br/>
              <span className="text-green-700 font-semibold">
                Phase: Temperature Shift (Production)
              </span>
            </div>
            <div className="text-xs text-green-700 mt-2 italic">
              "Temperature is intentionally reduced during production phase to enhance productivity - this is expected!"
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Benefits of Process Contextualization:</h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-4">
          <li>• Every data point knows which process phase it was collected during</li>
          <li>• Enables phase-specific analysis and troubleshooting</li>
          <li>• Automatic phase timing and duration tracking</li>
          <li>• Compare same phases across different batches</li>
          <li>• Understand why parameters changed (intentional process step vs. deviation)</li>
        </ul>
      </div>
    </div>
  );
}
