'use client';

import { useState } from 'react';
import { getParameterMappings, groupParametersByCategory, getCriticalParameters } from '@/lib/structured/parameter-harmonization';

export default function ParameterHarmonizationView() {
  const allMappings = getParameterMappings();
  const categorizedParams = groupParametersByCategory();
  const criticalParams = getCriticalParameters();

  const [filterCategory, setFilterCategory] = useState<'all' | 'Process' | 'Equipment' | 'Quality' | 'Material'>('all');
  const [filterCritical, setFilterCritical] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Get unique standard parameters
  const uniqueStandardParams = Array.from(
    new Map(allMappings.map(m => [m.standardParameter.standardId, m.standardParameter])).values()
  );

  // Filter parameters
  const filteredParams = uniqueStandardParams.filter(param => {
    if (filterCategory !== 'all' && param.category !== filterCategory) return false;
    if (filterCritical && param.classification !== 'Critical') return false;
    if (searchTerm && !param.standardName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'NonCritical': return 'bg-yellow-100 text-yellow-800';
      case 'Informational': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Process': return 'bg-blue-100 text-blue-800';
      case 'Equipment': return 'bg-green-100 text-green-800';
      case 'Quality': return 'bg-purple-100 text-purple-800';
      case 'Material': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Harmonized Parameter Naming
        </h2>
        <p className="text-sm text-gray-600">
          Standardized parameter names across all sites and systems
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-700 font-medium mb-1">Total Parameters</div>
          <div className="text-2xl font-bold text-blue-900">{uniqueStandardParams.length}</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-700 font-medium mb-1">Critical</div>
          <div className="text-2xl font-bold text-red-900">{criticalParams.length}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-700 font-medium mb-1">Raw Mappings</div>
          <div className="text-2xl font-bold text-green-900">{allMappings.length}</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm text-purple-700 font-medium mb-1">Categories</div>
          <div className="text-2xl font-bold text-purple-900">4</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search parameters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                filterCategory === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {(['Process', 'Equipment', 'Quality', 'Material'] as const).map(category => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  filterCategory === category ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filterCritical}
              onChange={(e) => setFilterCritical(e.target.checked)}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <span className="text-sm font-medium text-gray-700">Critical Only</span>
          </label>
        </div>
      </div>

      {/* Example: Before & After */}
      <div className="bg-gradient-to-r from-red-50 to-green-50 border border-gray-300 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Transformation Example: pH Measurement
        </h3>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4 border-2 border-red-300">
            <div className="text-sm font-semibold text-red-800 mb-3">❌ Before Harmonization</div>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 bg-red-50 rounded">
                <div className="text-red-700 font-bold">PH_AI_2001</div>
                <div className="text-gray-600">Site A - Emerson DeltaV</div>
              </div>
              <div className="p-2 bg-red-50 rounded">
                <div className="text-red-700 font-bold">BR001_PH_PV</div>
                <div className="text-gray-600">Site A - Different naming</div>
              </div>
              <div className="p-2 bg-red-50 rounded">
                <div className="text-red-700 font-bold">pH_REACTOR_B</div>
                <div className="text-gray-600">Site B - Rockwell</div>
              </div>
            </div>
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
              ⚠️ Cannot compare across sites or analyze trends
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border-2 border-green-300">
            <div className="text-sm font-semibold text-green-800 mb-3">✓ After Harmonization</div>
            <div className="p-3 bg-green-50 rounded">
              <div className="text-lg font-bold text-green-900 mb-1">pH</div>
              <div className="text-xs text-gray-600 font-mono mb-2">PARAM_PH</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-semibold">Process</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Classification:</span>
                  <span className="font-semibold text-red-700">Critical</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Standard Unit:</span>
                  <span className="font-semibold">pH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Spec Range:</span>
                  <span className="font-semibold">7.0 - 7.2</span>
                </div>
              </div>
            </div>
            <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded text-xs text-green-800">
              ✓ All systems map to single parameter - comparable everywhere
            </div>
          </div>
        </div>
      </div>

      {/* Parameter List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Standard Parameters ({filteredParams.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredParams.map((param) => {
            const rawMappings = allMappings.filter(m => m.standardParameter.standardId === param.standardId);

            return (
              <div key={param.standardId} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-base font-semibold text-gray-900">{param.standardName}</h4>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getCategoryColor(param.category)}`}>
                        {param.category}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getClassificationColor(param.classification)}`}>
                        {param.classification}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{param.description}</p>

                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span className="font-mono">
                        <strong>Unit:</strong> {param.standardUnit}
                      </span>
                      {param.criticalRanges && (
                        <span>
                          <strong>Range:</strong>{' '}
                          {param.criticalRanges.min !== undefined && `${param.criticalRanges.min} - `}
                          {param.criticalRanges.max !== undefined && param.criticalRanges.max}
                          {param.criticalRanges.target !== undefined && ` (target: ${param.criticalRanges.target})`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {rawMappings.length > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                    <div className="text-xs font-semibold text-gray-700 mb-2">
                      Raw System Mappings ({rawMappings.length}):
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {rawMappings.map((mapping, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <span className={`px-2 py-0.5 rounded font-medium ${
                            mapping.system === 'DCS' ? 'bg-blue-100 text-blue-800' :
                            mapping.system === 'eBR' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {mapping.system}
                          </span>
                          <span className="text-gray-900 font-mono">{mapping.rawSystemId}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Benefits of Parameter Harmonization:</h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-4">
          <li>• Single standardized name for each parameter across all systems and sites</li>
          <li>• Automatic unit conversions to standard engineering units</li>
          <li>• Clear parameter classification (Critical, Non-Critical, Informational)</li>
          <li>• Built-in specification ranges for automated checking</li>
          <li>• Enables cross-site comparison and benchmarking</li>
          <li>• Simplifies queries: "SELECT Culture_Temperature" instead of remembering BR001_PV_TEMP vs REACTOR_1_TEMP_AI</li>
        </ul>
      </div>
    </div>
  );
}
