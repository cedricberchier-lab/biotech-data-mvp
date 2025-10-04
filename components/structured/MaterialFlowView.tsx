'use client';

import { generateMaterialFlows, getMaterialFlowSummary, type MaterialFlow } from '@/lib/structured/material-flow';

interface MaterialFlowViewProps {
  batchId: string;
  batchStartTime: Date;
}

export default function MaterialFlowView({ batchId, batchStartTime }: MaterialFlowViewProps) {
  const flows = generateMaterialFlows(batchId, batchStartTime);
  const summary = getMaterialFlowSummary(flows);

  const getMaterialTypeColor = (type: string) => {
    switch (type) {
      case 'RawMaterial': return 'bg-blue-100 text-blue-800';
      case 'Intermediate': return 'bg-purple-100 text-purple-800';
      case 'FinalProduct': return 'bg-green-100 text-green-800';
      case 'Buffer': return 'bg-yellow-100 text-yellow-800';
      case 'Consumable': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFlowTypeIcon = (type: string) => {
    switch (type) {
      case 'Input': return '→';
      case 'Output': return '←';
      case 'Transfer': return '↔';
      default: return '•';
    }
  };

  // Group flows by equipment
  const flowsByEquipment = flows.reduce((acc, flow) => {
    const key = flow.toEquipment;
    if (!acc[key]) acc[key] = [];
    acc[key].push(flow);
    return acc;
  }, {} as { [key: string]: MaterialFlow[] });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Material Flow Tracking
        </h2>
        <p className="text-sm text-gray-600">
          Track materials through the manufacturing process with genealogy and mass balance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-700 font-medium mb-1">Total Inputs</div>
          <div className="text-2xl font-bold text-blue-900">{summary.totalInputs.toFixed(0)} L</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-700 font-medium mb-1">Total Outputs</div>
          <div className="text-2xl font-bold text-green-900">{summary.totalOutputs.toFixed(0)} L</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm text-purple-700 font-medium mb-1">Material Flows</div>
          <div className="text-2xl font-bold text-purple-900">{flows.length}</div>
        </div>
      </div>

      {/* Material Flow Diagram */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Material Genealogy Flow</h3>

        <div className="space-y-4">
          {/* Seed Culture → Bioreactor */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-xs text-blue-700 font-medium mb-1">Raw Materials</div>
              <div className="font-mono text-sm text-gray-900">CHO Basal Medium</div>
              <div className="font-mono text-sm text-gray-900">Growth Supplement</div>
              <div className="font-mono text-sm text-gray-900">Seed Culture</div>
              <div className="text-xs text-gray-600 mt-1">~1,700 L</div>
            </div>
            <div className="flex flex-col items-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="text-xs text-gray-600 mt-1">Input</span>
            </div>
            <div className="flex-1 bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="text-xs text-purple-700 font-medium mb-1">Bioreactor</div>
              <div className="font-semibold text-gray-900">BR-2001-A</div>
              <div className="text-xs text-gray-600 mt-1">Fed-Batch Culture</div>
              <div className="text-xs text-gray-600">84 hours</div>
            </div>
            <div className="flex flex-col items-center">
              <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="text-xs text-gray-600 mt-1">Output</span>
            </div>
            <div className="flex-1 bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="text-xs text-purple-700 font-medium mb-1">Intermediate</div>
              <div className="font-mono text-sm text-gray-900">HCCCF</div>
              <div className="text-xs text-gray-600 mt-1">1,820 L</div>
              <div className="text-xs text-gray-600">Harvested Culture</div>
            </div>
          </div>

          {/* Harvest → Chromatography */}
          <div className="flex items-center gap-3 ml-12">
            <div className="flex-1"></div>
            <div className="flex-1"></div>
            <div className="flex flex-col items-center">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="text-xs text-gray-600 mt-1">Transfer</span>
            </div>
            <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-xs text-green-700 font-medium mb-1">Chromatography</div>
              <div className="font-semibold text-gray-900">CHR-A-01</div>
              <div className="text-xs text-gray-600 mt-1">Protein A Capture</div>
              <div className="text-xs text-gray-600">6 hours</div>
            </div>
            <div className="flex flex-col items-center">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="text-xs text-gray-600 mt-1">Output</span>
            </div>
            <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-xs text-green-700 font-medium mb-1">Purified Product</div>
              <div className="font-mono text-sm text-gray-900">mAb-2847 Pool</div>
              <div className="text-xs text-gray-600 mt-1">45 L</div>
              <div className="text-xs font-semibold text-green-700">~2.5 g/L titer</div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="text-xs font-semibold text-blue-900 mb-1">Material Recovery:</div>
          <div className="text-sm text-blue-800">
            <strong>97.5% volume reduction</strong> (1,820 L → 45 L) with{' '}
            <strong>~40x concentration</strong> of target product
          </div>
        </div>
      </div>

      {/* Detailed Flow List */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Material Flows</h3>

        <div className="space-y-3">
          {flows.slice(0, 12).map((flow, idx) => {
            const hoursSinceStart = (flow.timestamp.getTime() - batchStartTime.getTime()) / 3600000;

            return (
              <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                  {getFlowTypeIcon(flow.flowType)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getMaterialTypeColor(flow.material.materialType)}`}>
                      {flow.material.materialType}
                    </span>
                    <span className="text-xs text-gray-500">T+{hoursSinceStart.toFixed(0)}h</span>
                  </div>

                  <div className="font-semibold text-gray-900 truncate">{flow.material.materialName}</div>
                  <div className="text-xs text-gray-600 font-mono">{flow.material.materialCode}</div>

                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                    <span>
                      <strong>{flow.material.quantity}</strong> {flow.material.unit}
                    </span>
                    {flow.flowRate && (
                      <span className="text-blue-700">
                        @ {flow.flowRate} {flow.flowRateUnit}
                      </span>
                    )}
                    {flow.material.lotNumber && (
                      <span className="font-mono">Lot: {flow.material.lotNumber}</span>
                    )}
                  </div>

                  {flow.phaseContext && (
                    <div className="mt-2 text-xs text-gray-500 font-mono truncate">
                      {flow.phaseContext.split('.').pop()}
                    </div>
                  )}
                </div>

                <div className="text-right text-xs text-gray-600">
                  <div className="font-medium">{flow.flowType}</div>
                  <div className="mt-1 truncate max-w-[200px]">
                    {flow.fromEquipment && `From: ${flow.fromEquipment.split('.').pop()}`}
                    {flow.toEquipment && `To: ${flow.toEquipment.split('.').pop()}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {flows.length > 12 && (
          <div className="mt-3 text-center text-sm text-gray-600">
            Showing 12 of {flows.length} material flows
          </div>
        )}
      </div>

      {/* Benefits */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Benefits of Material Flow Tracking:</h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-4">
          <li>• Complete material genealogy from raw materials to final product</li>
          <li>• Material balance calculations for quality and compliance</li>
          <li>• Track lot numbers and traceability through entire process</li>
          <li>• Identify material losses and optimize yield</li>
          <li>• Link materials to specific process phases and equipment</li>
        </ul>
      </div>
    </div>
  );
}
