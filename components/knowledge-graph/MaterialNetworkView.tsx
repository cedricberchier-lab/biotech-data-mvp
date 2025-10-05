/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { getMaterialNodes, getMaterialTransformations, buildMaterialFlowGraph } from '@/lib/knowledge-graph/material-network';
import { useState } from 'react';

export default function MaterialNetworkView() {
  const { nodes, edges } = buildMaterialFlowGraph();
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);

  const selectedNode = nodes.find(n => n.id === selectedMaterial);
  const selectedEdges = edges.filter(e => e.from === selectedMaterial || e.to === selectedMaterial);

  const getMaterialTypeColor = (type: string) => {
    switch (type) {
      case 'RawMaterial': return 'border-blue-300 bg-blue-50';
      case 'Intermediate': return 'border-purple-300 bg-purple-50';
      case 'FinalProduct': return 'border-green-300 bg-green-50';
      case 'Waste': return 'border-gray-300 bg-gray-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getQualityColor = (status: string) => {
    switch (status) {
      case 'InSpec': return 'bg-green-500';
      case 'OutOfSpec': return 'bg-red-500';
      case 'Pending': return 'bg-yellow-500';
      case 'Quarantine': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Material Flow Network</h2>
        <p className="text-sm text-gray-600">
          Material transformations, quality gates, and genealogy tracking
        </p>
      </div>

      {/* Flow Diagram */}
      <div className="bg-gradient-to-br from-green-50 via-purple-50 to-blue-50 border border-green-200 rounded-lg p-8">
        <div className="space-y-8">
          {/* Raw Materials */}
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-3">RAW MATERIALS</div>
            <div className="flex gap-3">
              {nodes.filter(n => n.materialType === 'RawMaterial').map(mat => (
                <div
                  key={mat.id}
                  onClick={() => setSelectedMaterial(mat.id)}
                  className={`flex-1 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedMaterial === mat.id
                      ? 'ring-4 ring-blue-400 shadow-lg'
                      : 'hover:shadow-md'
                  } ${getMaterialTypeColor(mat.materialType)}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${getQualityColor(mat.qualityStatus)}`}></div>
                    <span className="font-semibold text-sm text-gray-900">{mat.materialName}</span>
                  </div>
                  <div className="text-xs text-gray-600">{mat.quantity} {mat.unit}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Transformation Arrow */}
          <div className="flex items-center justify-center">
            <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

          {/* Intermediates */}
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-3">INTERMEDIATES</div>
            <div className="flex gap-3">
              {nodes.filter(n => n.materialType === 'Intermediate').map(mat => (
                <div
                  key={mat.id}
                  onClick={() => setSelectedMaterial(mat.id)}
                  className={`flex-1 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedMaterial === mat.id
                      ? 'ring-4 ring-purple-400 shadow-lg'
                      : 'hover:shadow-md'
                  } ${getMaterialTypeColor(mat.materialType)}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${getQualityColor(mat.qualityStatus)}`}></div>
                    <span className="font-semibold text-sm text-gray-900">{mat.materialName}</span>
                  </div>
                  <div className="text-xs text-gray-600">{mat.quantity} {mat.unit}</div>
                  <div className="text-xs text-purple-700 mt-1 font-mono truncate">
                    {mat.location.split('.').pop()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transformation Arrow */}
          <div className="flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

          {/* Final Products */}
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-3">FINAL PRODUCT</div>
            <div className="flex gap-3 justify-center">
              {nodes.filter(n => n.materialType === 'FinalProduct').map(mat => (
                <div
                  key={mat.id}
                  onClick={() => setSelectedMaterial(mat.id)}
                  className={`w-64 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedMaterial === mat.id
                      ? 'ring-4 ring-green-400 shadow-lg'
                      : 'hover:shadow-md'
                  } ${getMaterialTypeColor(mat.materialType)}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${getQualityColor(mat.qualityStatus)}`}></div>
                    <span className="font-semibold text-gray-900">{mat.materialName}</span>
                  </div>
                  <div className="text-xs text-gray-600">{mat.quantity} {mat.unit}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Material Details */}
      {selectedNode && (
        <div className="bg-white border-2 border-purple-300 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Material Details: {selectedNode.materialName}
          </h3>

          <div className="grid grid-cols-2 gap-6">
            {/* Material Info */}
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-600">Material Code</div>
                <div className="font-mono text-sm text-gray-900">{selectedNode.materialCode}</div>
              </div>
              {selectedNode.lotNumber && (
                <div>
                  <div className="text-xs text-gray-600">Lot Number</div>
                  <div className="font-mono text-sm text-gray-900">{selectedNode.lotNumber}</div>
                </div>
              )}
              <div>
                <div className="text-xs text-gray-600">Type</div>
                <div className="text-sm font-semibold text-gray-900">{selectedNode.materialType}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Quantity</div>
                <div className="text-lg font-bold text-purple-700">
                  {selectedNode.quantity} {selectedNode.unit}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Quality Status</div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getQualityColor(selectedNode.qualityStatus)}`}></div>
                  <span className="text-sm font-semibold text-gray-900">{selectedNode.qualityStatus}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Location</div>
                <div className="text-sm text-gray-900">{selectedNode.location}</div>
              </div>
            </div>

            {/* Specifications */}
            {selectedNode.specifications && selectedNode.specifications.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-2">Quality Specifications</div>
                <div className="space-y-2">
                  {selectedNode.specifications.map((spec, idx) => (
                    <div key={idx} className="bg-gray-50 rounded p-2 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-700">{spec.parameter}</span>
                        <span className={`px-2 py-0.5 rounded font-semibold ${
                          spec.result === 'Pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {spec.result}
                        </span>
                      </div>
                      <div className="text-gray-600">
                        Value: {spec.value} {spec.unit} | Spec: {spec.spec}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Transformations */}
          {selectedEdges.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm font-semibold text-gray-700 mb-3">Material Transformations</div>
              <div className="space-y-3">
                {selectedEdges.map((edge, idx) => (
                  <div key={idx} className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-indigo-600 text-white text-xs font-semibold rounded">
                        {edge.transformation.transformationType}
                      </span>
                      {edge.transformation.yieldPercentage && (
                        <span className="text-xs text-gray-700">
                          Yield: {edge.transformation.yieldPercentage}%
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-gray-700 space-y-1">
                      <div>
                        <strong>From:</strong> {nodes.find(n => n.id === edge.from)?.materialName}
                      </div>
                      <div>
                        <strong>To:</strong> {nodes.find(n => n.id === edge.to)?.materialName}
                      </div>
                      <div>
                        <strong>Equipment:</strong> {edge.transformation.equipmentId.split('.').pop()}
                      </div>
                      {edge.transformation.qualityGate && (
                        <div className="mt-2 pt-2 border-t border-indigo-300">
                          <strong>Quality Gate:</strong>{' '}
                          <span className={`px-2 py-0.5 rounded font-semibold ${
                            edge.transformation.qualityGate.status === 'Passed' ? 'bg-green-100 text-green-800' :
                            edge.transformation.qualityGate.status === 'Failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {edge.transformation.qualityGate.status}
                          </span>
                        </div>
                      )}
                    </div>
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
          <div className="text-sm text-blue-700 font-medium">Raw Materials</div>
          <div className="text-2xl font-bold text-blue-900">
            {nodes.filter(n => n.materialType === 'RawMaterial').length}
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm text-purple-700 font-medium">Intermediates</div>
          <div className="text-2xl font-bold text-purple-900">
            {nodes.filter(n => n.materialType === 'Intermediate').length}
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-700 font-medium">Transformations</div>
          <div className="text-2xl font-bold text-green-900">{edges.length}</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-sm text-orange-700 font-medium">Quality Gates</div>
          <div className="text-2xl font-bold text-orange-900">
            {getMaterialTransformations().filter(t => t.qualityGate?.required).length}
          </div>
        </div>
      </div>
    </div>
  );
}
