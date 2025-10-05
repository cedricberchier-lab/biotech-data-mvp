'use client';

import { useState } from 'react';
import { executeQuery, getAvailableQueries, type QueryType, type QueryResult } from '@/lib/knowledge-graph/knowledge-queries';

export default function KnowledgeQueryView() {
  const [selectedQuery, setSelectedQuery] = useState<QueryType>('equipment_in_production');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const availableQueries = getAvailableQueries();

  const handleExecuteQuery = async () => {
    setIsExecuting(true);

    // Simulate async execution
    setTimeout(() => {
      const result = executeQuery(selectedQuery);
      setQueryResult(result);
      setIsExecuting(false);
    }, 300);
  };

  const renderQueryResults = () => {
    if (!queryResult) return null;

    return (
      <div className="space-y-4">
        {/* Query Info */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-green-900">{queryResult.queryName}</h3>
              <p className="text-sm text-gray-700 mt-1">{queryResult.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-700">{queryResult.resultCount}</div>
              <div className="text-xs text-gray-600">results in {queryResult.executionTime.toFixed(2)}ms</div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          {selectedQuery === 'equipment_in_production' && renderEquipmentResults()}
          {selectedQuery === 'trace_batch' && renderTraceBatchResults()}
          {selectedQuery === 'find_quality_issues' && renderQualityIssuesResults()}
          {selectedQuery === 'compare_sites' && renderCompareSitesResults()}
          {selectedQuery === 'process_bottlenecks' && renderBottlenecksResults()}
          {selectedQuery === 'material_genealogy' && renderGenealogyResults()}
        </div>
      </div>
    );
  };

  const renderEquipmentResults = () => {
    if (!queryResult?.results.length) {
      return <div className="text-center py-8 text-gray-500">No equipment in production</div>;
    }

    return queryResult.results.map((item: { equipment: { name: string; equipmentClass: string; status: string }; currentPhase: string; activeProcesses: { name: string }[] }, idx: number) => (
      <div key={idx} className="border border-blue-200 bg-blue-50 rounded-lg p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="font-semibold text-blue-900">{item.equipment.name}</div>
            <div className="text-xs text-gray-600 font-mono">{item.equipment.equipmentClass}</div>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
            {item.equipment.status}
          </span>
        </div>
        <div className="text-sm text-gray-700">
          <strong>Current Phase:</strong> {item.currentPhase}
        </div>
        <div className="text-xs text-gray-600 mt-2">
          Active Processes: {item.activeProcesses.map((p: { name: string }) => p.name).join(', ')}
        </div>
      </div>
    ));
  };

  const renderTraceBatchResults = () => {
    if (!queryResult?.results.length) {
      return <div className="text-center py-8 text-gray-500">No batch data found</div>;
    }

    return (
      <div className="space-y-3">
        {queryResult.results.map((item: unknown, idx: number) => (
          <div
            key={idx}
            className="border border-purple-200 bg-purple-50 rounded-lg p-4"
            style={{ marginLeft: `${Math.max(0, item.depth + 3) * 20}px` }}
          >
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white text-xs font-bold">
                {idx + 1}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-purple-900">{item.material.materialName}</div>
                <div className="text-xs text-gray-600 font-mono mb-2">{item.material.materialCode}</div>

                {item.transformations.length > 0 && (
                  <div className="bg-white rounded p-2 text-xs space-y-1">
                    {item.transformations.map((trans: unknown, tIdx: number) => (
                      <div key={tIdx} className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-medium">
                          {trans.type}
                        </span>
                        <span className="text-gray-700">
                          Yield: {trans.yield}% | QC: {trans.qualityGate || 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {item.ancestors.length > 0 && (
                  <div className="text-xs text-gray-600 mt-2">
                    ← From: {item.ancestors.join(', ')}
                  </div>
                )}
                {item.descendants.length > 0 && (
                  <div className="text-xs text-gray-600 mt-1">
                    → To: {item.descendants.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderQualityIssuesResults = () => {
    if (!queryResult?.results.length) {
      return (
        <div className="text-center py-8 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-green-700 font-semibold mb-2">✓ No Quality Issues Found</div>
          <div className="text-sm text-gray-600">All materials are within specification</div>
        </div>
      );
    }

    return queryResult.results.map((item: unknown, idx: number) => (
      <div key={idx} className="border-2 border-red-300 bg-red-50 rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="font-semibold text-red-900">{item.material.materialName}</div>
            <div className="text-xs text-gray-600 font-mono">{item.material.lotNumber}</div>
          </div>
          <span className="px-3 py-1 bg-red-200 text-red-900 text-xs font-bold rounded">
            {item.material.qualityStatus}
          </span>
        </div>

        {item.failedSpecifications?.length > 0 && (
          <div className="bg-white rounded p-3 mb-3">
            <div className="text-xs font-semibold text-gray-700 mb-2">Failed Specifications:</div>
            {item.failedSpecifications.map((spec: unknown, sIdx: number) => (
              <div key={sIdx} className="flex items-center justify-between text-xs py-1">
                <span className="text-gray-700">{spec.parameter}</span>
                <span className="font-mono text-red-700">
                  {spec.value} {spec.unit} (Spec: {spec.spec})
                </span>
              </div>
            ))}
          </div>
        )}

        {item.transformation && (
          <div className="text-xs text-gray-700">
            <strong>Produced by:</strong> {item.transformation.equipment} ({item.transformation.type})
          </div>
        )}
      </div>
    ));
  };

  const renderCompareSitesResults = () => {
    if (!queryResult?.results.length) {
      return <div className="text-center py-8 text-gray-500">No site data available</div>;
    }

    return (
      <div className="grid grid-cols-2 gap-4">
        {queryResult.results.map((item: unknown, idx: number) => (
          <div key={idx} className="border border-blue-200 bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold text-blue-900">{item.site}</div>
                <div className="text-xs text-gray-600">{item.equipmentClass}</div>
              </div>
              <div className="text-2xl font-bold text-blue-700">{item.count}</div>
            </div>

            <div className="space-y-2">
              {item.equipment.map((eq: unknown, eIdx: number) => (
                <div key={eIdx} className="bg-white rounded p-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{eq.name}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      eq.status === 'Running' ? 'bg-green-100 text-green-800' :
                      eq.status === 'Idle' ? 'bg-gray-100 text-gray-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {eq.status}
                    </span>
                  </div>
                  {eq.currentProcess && (
                    <div className="text-gray-600 mt-1">{eq.currentProcess}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderBottlenecksResults = () => {
    if (!queryResult?.results.length) {
      return (
        <div className="text-center py-8 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-green-700 font-semibold mb-2">✓ No Bottlenecks Detected</div>
          <div className="text-sm text-gray-600">All processes running within expected timeframes</div>
        </div>
      );
    }

    return queryResult.results.map((item: unknown, idx: number) => (
      <div key={idx} className="border border-orange-200 bg-orange-50 rounded-lg p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="font-semibold text-orange-900">{item.process.name}</div>
            <div className="text-xs text-gray-600 font-mono">{item.process.id}</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-orange-700">+{item.delayPercentage}</div>
            <div className="text-xs text-gray-600">delayed</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="bg-white rounded p-2">
            <div className="text-gray-600">Expected</div>
            <div className="font-semibold text-gray-900">
              {item.expectedDuration} {item.process.duration.unit}
            </div>
          </div>
          <div className="bg-white rounded p-2">
            <div className="text-gray-600">Actual</div>
            <div className="font-semibold text-orange-700">
              {item.actualDuration} {item.process.duration.unit}
            </div>
          </div>
          <div className="bg-white rounded p-2">
            <div className="text-gray-600">Delay</div>
            <div className="font-semibold text-red-700">
              +{item.delay} {item.process.duration.unit}
            </div>
          </div>
        </div>

        {item.critical && (
          <div className="mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded inline-block">
            ⚠️ CRITICAL STEP
          </div>
        )}
      </div>
    ));
  };

  const renderGenealogyResults = () => {
    if (!queryResult?.results.length) {
      return <div className="text-center py-8 text-gray-500">No genealogy data available</div>;
    }

    const data = queryResult.results[0];

    return (
      <div className="space-y-4">
        {/* Target Material */}
        <div className="border-2 border-purple-300 bg-purple-50 rounded-lg p-4">
          <div className="text-xs text-purple-700 font-semibold mb-2">TARGET MATERIAL</div>
          <div className="font-bold text-lg text-purple-900">{data.targetMaterial.materialName}</div>
          <div className="text-sm text-gray-700 mt-1">
            {data.targetMaterial.quantity} {data.targetMaterial.unit} • {data.targetMaterial.qualityStatus}
          </div>
        </div>

        {/* Ancestors */}
        {data.ancestors.length > 0 && (
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-2">← ANCESTORS (Source Materials)</div>
            <div className="space-y-2">
              {data.ancestors.map((anc: unknown, idx: number) => (
                <div key={idx} className="border border-blue-200 bg-blue-50 rounded p-3">
                  <div className="font-medium text-blue-900">{anc.material.materialName}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {anc.material.quantity} {anc.material.unit} • {anc.qualityStatus}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Descendants */}
        {data.descendants.length > 0 && (
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-2">→ DESCENDANTS (Derived Materials)</div>
            <div className="space-y-2">
              {data.descendants.map((desc: unknown, idx: number) => (
                <div key={idx} className="border border-green-200 bg-green-50 rounded p-3">
                  <div className="font-medium text-green-900">{desc.material.materialName}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {desc.material.quantity} {desc.material.unit} • {desc.qualityStatus}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transformations */}
        {data.transformations.length > 0 && (
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-2">⚙️ TRANSFORMATIONS</div>
            <div className="space-y-2">
              {data.transformations.map((trans: unknown, idx: number) => (
                <div key={idx} className="border border-gray-200 bg-gray-50 rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded">
                      {trans.type}
                    </span>
                    <span className="text-xs text-gray-600">Yield: {trans.yield}%</span>
                  </div>
                  <div className="text-xs text-gray-700">
                    Equipment: {trans.equipment.split('.').pop()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Knowledge Graph Queries</h2>
        <p className="text-sm text-gray-600">
          Ask complex questions that span equipment, processes, and materials
        </p>
      </div>

      {/* Query Selector */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Select Query:
        </label>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {availableQueries.map(query => (
            <button
              key={query.id}
              onClick={() => setSelectedQuery(query.id)}
              className={`p-4 rounded-lg text-left transition-all ${
                selectedQuery === query.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="font-semibold text-sm mb-1">{query.name}</div>
              <div className={`text-xs ${selectedQuery === query.id ? 'text-purple-100' : 'text-gray-600'}`}>
                {query.description}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handleExecuteQuery}
          disabled={isExecuting}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {isExecuting ? 'Executing Query...' : '🔍 Execute Query'}
        </button>
      </div>

      {/* Query Results */}
      {queryResult && renderQueryResults()}

      {/* Benefits */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          Why Knowledge Graphs Enable These Queries:
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-4">
          <li>• <strong>Connected data</strong> - Equipment, processes, and materials linked together</li>
          <li>• <strong>Graph traversal</strong> - Follow relationships to find answers</li>
          <li>• <strong>Context aware</strong> - Every node knows its connections and history</li>
          <li>• <strong>Cross-domain</strong> - Query across systems that were previously siloed</li>
          <li>• <strong>Impossible with raw data</strong> - These queries require semantic understanding</li>
        </ul>
      </div>
    </div>
  );
}
