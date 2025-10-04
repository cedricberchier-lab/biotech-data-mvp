'use client';

import { useState } from 'react';
import { getEquipmentHierarchy, type EquipmentHierarchyNode } from '@/lib/structured/isa95-equipment';

export default function EquipmentHierarchyView() {
  const hierarchy = getEquipmentHierarchy();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['SITE_A', 'SITE_A.USP', 'SITE_A.USP.BR_CELL_1']));

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Site': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Area': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ProcessCell': return 'bg-green-100 text-green-800 border-green-300';
      case 'Unit': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'EquipmentModule': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const renderNode = (node: EquipmentHierarchyNode, depth: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const indent = depth * 24;

    return (
      <div key={node.id}>
        <div
          className="flex items-start gap-3 py-2 px-3 hover:bg-gray-50 rounded cursor-pointer"
          style={{ paddingLeft: `${indent + 12}px` }}
          onClick={() => hasChildren && toggleNode(node.id)}
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

          {/* Node Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${getLevelColor(node.level)}`}>
                {node.level}
              </span>
              {node.equipmentClass && (
                <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-800 rounded">
                  {node.equipmentClass}
                </span>
              )}
            </div>

            <div className="font-semibold text-gray-900">{node.name}</div>
            <div className="text-sm text-gray-600">{node.description}</div>

            {/* Metadata */}
            {node.metadata && (
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                {node.metadata.manufacturer && (
                  <div>
                    <span className="text-gray-500">Manufacturer:</span>{' '}
                    <span className="text-gray-900">{node.metadata.manufacturer}</span>
                  </div>
                )}
                {node.metadata.model && (
                  <div>
                    <span className="text-gray-500">Model:</span>{' '}
                    <span className="text-gray-900">{node.metadata.model}</span>
                  </div>
                )}
                {node.metadata.capacity && (
                  <div>
                    <span className="text-gray-500">Capacity:</span>{' '}
                    <span className="text-gray-900">{node.metadata.capacity.value} {node.metadata.capacity.unit}</span>
                  </div>
                )}
                {node.metadata.workingVolume && (
                  <div>
                    <span className="text-gray-500">Working Volume:</span>{' '}
                    <span className="text-gray-900">
                      {node.metadata.workingVolume.min} - {node.metadata.workingVolume.max} {node.metadata.workingVolume.unit}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Raw System Mappings */}
            {node.rawMappings && (
              <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                <div className="text-xs font-semibold text-gray-700 mb-1">Raw System Mappings:</div>
                {node.rawMappings.dcsPrefix && (
                  <div className="text-xs mb-1">
                    <span className="text-blue-700 font-medium">DCS Tags:</span>{' '}
                    <span className="text-gray-600 font-mono">{node.rawMappings.dcsPrefix.slice(0, 3).join(', ')}...</span>
                  </div>
                )}
                {node.rawMappings.ebrEquipmentId && (
                  <div className="text-xs mb-1">
                    <span className="text-green-700 font-medium">eBR Equipment ID:</span>{' '}
                    <span className="text-gray-600 font-mono">{node.rawMappings.ebrEquipmentId}</span>
                  </div>
                )}
                {node.rawMappings.limsLocationCodes && (
                  <div className="text-xs">
                    <span className="text-purple-700 font-medium">LIMS Location Codes:</span>{' '}
                    <span className="text-gray-600 font-mono">{node.rawMappings.limsLocationCodes.slice(0, 2).join(', ')}...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ISA-95 Equipment Hierarchy
        </h2>
        <p className="text-sm text-gray-600">
          Standardized equipment model showing Site → Area → Process Cell → Unit → Equipment Module
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg border">
        <div className="text-xs font-semibold text-gray-700 w-full mb-1">ISA-95 Levels:</div>
        {['Site', 'Area', 'ProcessCell', 'Unit', 'EquipmentModule'].map(level => (
          <span key={level} className={`px-3 py-1 text-xs font-semibold rounded border ${getLevelColor(level)}`}>
            {level}
          </span>
        ))}
      </div>

      {/* Hierarchy Tree */}
      <div className="bg-white border border-gray-200 rounded-lg">
        {renderNode(hierarchy)}
      </div>

      {/* Key Benefits */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Benefits of Standardized Equipment Model:</h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-4">
          <li>• Consistent equipment identification across all systems</li>
          <li>• Clear parent-child relationships and context</li>
          <li>• Standardized equipment classes enable cross-site comparison</li>
          <li>• Maps all raw system IDs (DCS tags, eBR IDs, LIMS locations) to single equipment instance</li>
        </ul>
      </div>
    </div>
  );
}
