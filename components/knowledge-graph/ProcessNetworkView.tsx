'use client';

import { getProcessNetwork, getProcessChildren } from '@/lib/knowledge-graph/process-network';
import { useState } from 'react';

export default function ProcessNetworkView() {
  const processes = getProcessNetwork();
  const [expandedProcesses, setExpandedProcesses] = useState<Set<string>>(
    new Set(['PROC_mAb_2847', 'UP_CULTURE'])
  );

  const toggleProcess = (processId: string) => {
    const newExpanded = new Set(expandedProcesses);
    if (newExpanded.has(processId)) {
      newExpanded.delete(processId);
    } else {
      newExpanded.add(processId);
    }
    setExpandedProcesses(newExpanded);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Procedure': return 'bg-purple-600 text-white';
      case 'UnitProcedure': return 'bg-blue-600 text-white';
      case 'Operation': return 'bg-green-600 text-white';
      case 'Phase': return 'bg-orange-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return 'bg-green-500';
      case 'Running': return 'bg-blue-500 animate-pulse';
      case 'NotStarted': return 'bg-gray-300';
      case 'Paused': return 'bg-yellow-500';
      case 'Failed': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const renderProcess = (processId: string, depth: number = 0) => {
    const process = processes.find(p => p.id === processId);
    if (!process) return null;

    const children = getProcessChildren(processId);
    const hasChildren = children.length > 0;
    const isExpanded = expandedProcesses.has(processId);

    return (
      <div key={processId} style={{ marginLeft: `${depth * 24}px` }}>
        <div
          onClick={() => hasChildren && toggleProcess(processId)}
          className={`flex items-start gap-3 p-3 mb-2 rounded-lg transition-all ${
            hasChildren ? 'cursor-pointer hover:bg-gray-50' : ''
          } ${process.status === 'Running' ? 'bg-blue-50 border-2 border-blue-400' : 'bg-white border border-gray-200'}`}
        >
          {/* Expand/Collapse Icon */}
          <div className="mt-1 w-4 h-4 flex items-center justify-center">
            {hasChildren && (
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'transform rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>

          {/* Process Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 text-xs font-bold rounded ${getLevelColor(process.level)}`}>
                {process.level}
              </span>
              <div className={`w-3 h-3 rounded-full ${getStatusColor(process.status)}`}></div>
              <span className="font-semibold text-gray-900">{process.name}</span>
              {process.metadata?.criticalStep && (
                <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-semibold rounded">
                  CRITICAL
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span className="font-mono">{process.id}</span>
              <span className={`px-2 py-0.5 rounded font-medium ${
                process.status === 'Complete' ? 'bg-green-100 text-green-800' :
                process.status === 'Running' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-600'
              }`}>
                {process.status}
              </span>
              {process.duration && (
                <span>
                  {process.duration.actual ? (
                    <>
                      {process.duration.actual} / {process.duration.expected} {process.duration.unit}
                    </>
                  ) : (
                    <>
                      {process.duration.expected} {process.duration.unit} expected
                    </>
                  )}
                </span>
              )}
            </div>

            {process.equipmentId && (
              <div className="text-xs text-blue-700 mt-1 font-mono">
                Equipment: {process.equipmentId.split('.').pop()}
              </div>
            )}

            {process.dependencies && process.dependencies.length > 0 && (
              <div className="text-xs text-purple-700 mt-1">
                Depends on: {process.dependencies.map(d => processes.find(p => p.id === d)?.name).join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="border-l-2 border-gray-300 ml-6">
            {children.map(child => renderProcess(child.id, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootProcesses = processes.filter(p => !p.parentId);
  const stats = {
    total: processes.length,
    running: processes.filter(p => p.status === 'Running').length,
    complete: processes.filter(p => p.status === 'Complete').length,
    critical: processes.filter(p => p.metadata?.criticalStep).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Process Hierarchy Network</h2>
        <p className="text-sm text-gray-600">
          ISA-88 process tree showing dependencies and equipment assignments
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm text-purple-700 font-medium">Total Processes</div>
          <div className="text-2xl font-bold text-purple-900">{stats.total}</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-700 font-medium">Running</div>
          <div className="text-2xl font-bold text-blue-900">{stats.running}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-700 font-medium">Complete</div>
          <div className="text-2xl font-bold text-green-900">{stats.complete}</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-700 font-medium">Critical Steps</div>
          <div className="text-2xl font-bold text-red-900">{stats.critical}</div>
        </div>
      </div>

      {/* Process Tree */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {rootProcesses.map(proc => renderProcess(proc.id))}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="text-sm font-semibold text-gray-700 mb-3">Legend:</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-2">ISA-88 Levels:</div>
            <div className="flex flex-wrap gap-2">
              {['Procedure', 'UnitProcedure', 'Operation', 'Phase'].map(level => (
                <span key={level} className={`px-2 py-1 text-xs font-bold rounded ${getLevelColor(level)}`}>
                  {level}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-2">Status:</div>
            <div className="flex flex-wrap gap-2">
              {['Complete', 'Running', 'NotStarted'].map(status => (
                <div key={status} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
                  <span className="text-xs text-gray-700">{status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
