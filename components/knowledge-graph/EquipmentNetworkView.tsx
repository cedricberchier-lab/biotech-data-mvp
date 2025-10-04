'use client';

import { getAllEquipmentNodes, getEquipmentConnections, getConnectedEquipment } from '@/lib/knowledge-graph/equipment-network';
import { useState } from 'react';

export default function EquipmentNetworkView() {
  const equipment = getAllEquipmentNodes();
  const connections = getEquipmentConnections();
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);

  const selectedNode = equipment.find(eq => eq.id === selectedEquipment);
  const connectedEquipment = selectedEquipment ? getConnectedEquipment(selectedEquipment) : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Running': return 'bg-green-500';
      case 'Idle': return 'bg-gray-400';
      case 'Maintenance': return 'bg-orange-500';
      case 'Offline': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Equipment Relationship Network</h2>
        <p className="text-sm text-gray-600">
          Equipment connections, class hierarchies, and cross-site relationships
        </p>
      </div>

      {/* Network Visualization */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-8">
        <div className="relative">
          {/* Equipment Nodes */}
          <div className="grid grid-cols-3 gap-8">
            {/* Bioreactors */}
            <div className="space-y-4">
              <div className="text-xs font-semibold text-gray-600 mb-2">BIOREACTORS</div>
              {equipment.filter(eq => eq.equipmentClass === 'USP_Bioreactor').map((eq, idx) => (
                <div
                  key={eq.id}
                  onClick={() => setSelectedEquipment(eq.id)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedEquipment === eq.id
                      ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-300'
                      : 'bg-white hover:bg-blue-50 border-2 border-blue-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(eq.status)}`}></div>
                    <span className="font-semibold">{eq.name}</span>
                  </div>
                  <div className={`text-xs ${selectedEquipment === eq.id ? 'text-blue-100' : 'text-gray-600'}`}>
                    {eq.site} • {eq.metadata?.capacity}
                  </div>
                  {eq.currentProcess && (
                    <div className={`text-xs mt-1 ${selectedEquipment === eq.id ? 'text-blue-200' : 'text-gray-700'}`}>
                      {eq.currentProcess}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Storage */}
            <div className="space-y-4">
              <div className="text-xs font-semibold text-gray-600 mb-2">STORAGE TANKS</div>
              {equipment.filter(eq => eq.equipmentClass === 'Storage_Tank').map(eq => (
                <div
                  key={eq.id}
                  onClick={() => setSelectedEquipment(eq.id)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedEquipment === eq.id
                      ? 'bg-green-600 text-white shadow-lg ring-4 ring-green-300'
                      : 'bg-white hover:bg-green-50 border-2 border-green-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(eq.status)}`}></div>
                    <span className="font-semibold">{eq.name}</span>
                  </div>
                  <div className={`text-xs ${selectedEquipment === eq.id ? 'text-green-100' : 'text-gray-600'}`}>
                    {eq.metadata?.capacity}
                  </div>
                </div>
              ))}
            </div>

            {/* Chromatography */}
            <div className="space-y-4">
              <div className="text-xs font-semibold text-gray-600 mb-2">CHROMATOGRAPHY</div>
              {equipment.filter(eq => eq.equipmentClass === 'DSP_Chromatography').map(eq => (
                <div
                  key={eq.id}
                  onClick={() => setSelectedEquipment(eq.id)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedEquipment === eq.id
                      ? 'bg-purple-600 text-white shadow-lg ring-4 ring-purple-300'
                      : 'bg-white hover:bg-purple-50 border-2 border-purple-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(eq.status)}`}></div>
                    <span className="font-semibold">{eq.name}</span>
                  </div>
                  <div className={`text-xs ${selectedEquipment === eq.id ? 'text-purple-100' : 'text-gray-600'}`}>
                    {eq.site} • {eq.metadata?.capacity}
                  </div>
                  {eq.currentProcess && (
                    <div className={`text-xs mt-1 ${selectedEquipment === eq.id ? 'text-purple-200' : 'text-gray-700'}`}>
                      {eq.currentProcess}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Connection Lines Overlay */}
          <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="#3B82F6" />
              </marker>
            </defs>
          </svg>
        </div>
      </div>

      {/* Selected Equipment Details */}
      {selectedNode && connectedEquipment && (
        <div className="bg-white border-2 border-blue-300 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {selectedNode.name} - Connection Network
          </h3>

          <div className="grid grid-cols-3 gap-4">
            {/* Upstream */}
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-2">← Upstream Equipment</div>
              {connectedEquipment.upstream.length > 0 ? (
                <div className="space-y-2">
                  {connectedEquipment.upstream.map(eq => (
                    <div key={eq.id} className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                      <div className="font-medium text-blue-900">{eq.name}</div>
                      <div className="text-xs text-gray-600">{eq.equipmentClass}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">No upstream equipment</div>
              )}
            </div>

            {/* Current */}
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-2">Current Equipment</div>
              <div className="bg-gradient-to-br from-purple-100 to-blue-100 border-2 border-purple-300 rounded-lg p-4">
                <div className="font-bold text-purple-900 mb-2">{selectedNode.name}</div>
                <div className="text-xs space-y-1">
                  <div><strong>Class:</strong> {selectedNode.equipmentClass}</div>
                  <div><strong>Site:</strong> {selectedNode.site}</div>
                  <div><strong>Status:</strong> <span className={`px-2 py-0.5 rounded text-white ${getStatusColor(selectedNode.status)}`}>{selectedNode.status}</span></div>
                  {selectedNode.currentProcess && (
                    <div><strong>Process:</strong> {selectedNode.currentProcess}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Downstream */}
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-2">Downstream Equipment →</div>
              {connectedEquipment.downstream.length > 0 ? (
                <div className="space-y-2">
                  {connectedEquipment.downstream.map(eq => (
                    <div key={eq.id} className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                      <div className="font-medium text-green-900">{eq.name}</div>
                      <div className="text-xs text-gray-600">{eq.equipmentClass}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">No downstream equipment</div>
              )}
            </div>
          </div>

          {/* Same Class Equipment */}
          {connectedEquipment.sameClass.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm font-semibold text-gray-700 mb-2">↔ Same Equipment Class (Cross-Site)</div>
              <div className="flex gap-2">
                {connectedEquipment.sameClass.map(eq => (
                  <div key={eq.id} className="bg-orange-50 border border-orange-200 rounded p-3 text-sm">
                    <div className="font-medium text-orange-900">{eq.name}</div>
                    <div className="text-xs text-gray-600">{eq.site}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Network Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-700 font-medium">Total Equipment</div>
          <div className="text-2xl font-bold text-blue-900">{equipment.length}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-700 font-medium">Physical Connections</div>
          <div className="text-2xl font-bold text-green-900">
            {connections.filter(c => c.connectionType === 'PhysicalFlow').length}
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm text-purple-700 font-medium">Process Sequences</div>
          <div className="text-2xl font-bold text-purple-900">
            {connections.filter(c => c.connectionType === 'ProcessSequence').length}
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-sm text-orange-700 font-medium">Cross-Site Links</div>
          <div className="text-2xl font-bold text-orange-900">
            {connections.filter(c => c.connectionType === 'SameClass').length}
          </div>
        </div>
      </div>
    </div>
  );
}
