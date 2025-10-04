'use client';

import { useState } from 'react';
import { getDCSSample } from '@/lib/generators/dcs-generator';
import { getSampleBatchData } from '@/lib/generators/batch-data';
import { findEquipmentByRawId } from '@/lib/structured/isa95-equipment';
import { getProcessStateAtTime } from '@/lib/structured/isa88-process';
import { findStandardParameter } from '@/lib/structured/parameter-harmonization';

interface TransformationComparisonProps {
  batchId: string;
  batchStartTime: Date;
}

export default function TransformationComparison({ batchId, batchStartTime }: TransformationComparisonProps) {
  const [selectedExample, setSelectedExample] = useState<number>(0);

  const batchData = getSampleBatchData();
  const sampleData = getDCSSample(batchData.dcs, 20);

  // Create example transformations
  const examples = [
    {
      title: 'Temperature Data Point',
      raw: {
        system: 'DCS',
        timestamp: sampleData[0]?.timestamp || '',
        tagId: 'BR001_PV_TEMP',
        value: 37.1,
        quality: 'GOOD',
      },
      structured: {
        equipmentPath: 'Site_A → USP → BR_Cell_1 → BR_Unit_2001 → BR-2001-A',
        equipmentClass: 'USP_Bioreactor',
        parameterName: 'Culture Temperature',
        value: 37.1,
        unit: 'degC',
        classification: 'Critical',
        processContext: 'Fed-Batch Cell Culture → Exponential Growth Phase → Logarithmic Growth',
        inSpec: true,
        specRange: '36.5 - 37.5 degC',
      },
    },
    {
      title: 'LIMS Test Result',
      raw: {
        system: 'LIMS',
        sampleId: 'CC230224847',
        testCode: 'VCD-TRYPAN',
        testName: 'Viable Cell Density by Trypan Blue',
        value: 8.42,
        unit: 'E6 cells/mL',
        locationCode: 'LOC-B7-R2001',
        analysisDate: '2024-03-17T14:23:00Z',
      },
      structured: {
        equipmentPath: 'Site_A → USP → BR_Cell_1 → BR_Unit_2001 → BR-2001-A',
        equipmentClass: 'USP_Bioreactor',
        parameterName: 'Viable Cell Density',
        value: 8.42,
        unit: 'E6 cells/mL',
        classification: 'Critical',
        processContext: 'Fed-Batch Cell Culture → Production Phase → Fed-Batch Production',
        inSpec: true,
        specRange: '> 0.2 E6 cells/mL',
      },
    },
    {
      title: 'Multiple Tag Names → Single Parameter',
      raw: {
        system: 'DCS',
        tags: [
          { id: 'BR001_PH_PV', value: 7.08, source: 'Emerson DeltaV' },
          { id: 'PH_AI_2001', value: 7.09, source: 'Rockwell ControlLogix' },
        ],
      },
      structured: {
        equipmentPath: 'Site_A → USP → BR_Cell_1 → BR_Unit_2001 → BR-2001-A',
        equipmentClass: 'USP_Bioreactor',
        parameterName: 'pH',
        standardizedId: 'PARAM_PH',
        description: 'All pH measurements from different DCS systems map to single standardized parameter',
        classification: 'Critical',
        specRange: '7.0 - 7.2 pH',
      },
    },
  ];

  const currentExample = examples[selectedExample];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Raw → Structured Data Transformation
        </h2>
        <p className="text-sm text-gray-600">
          See how the same data looks before and after ISA-95/88 semantic transformation
        </p>
      </div>

      {/* Example Selector */}
      <div className="flex gap-2">
        {examples.map((example, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedExample(idx)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedExample === idx
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Example {idx + 1}
          </button>
        ))}
      </div>

      {/* Comparison View */}
      <div className="grid grid-cols-2 gap-6">
        {/* RAW DATA */}
        <div className="border-2 border-red-200 rounded-lg p-6 bg-red-50">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <h3 className="text-lg font-bold text-red-900">RAW DATA</h3>
            <span className="ml-auto text-xs bg-red-200 text-red-800 px-2 py-1 rounded">
              As Exported from System
            </span>
          </div>

          <div className="bg-white rounded p-4 font-mono text-xs space-y-3">
            {currentExample.title === 'Temperature Data Point' && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">System:</span>
                  <span className="text-gray-900 font-semibold">{currentExample.raw.system}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Timestamp:</span>
                  <span className="text-gray-900">{new Date(currentExample.raw.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Tag ID:</span>
                  <span className="text-blue-700 font-bold">{currentExample.raw.tagId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Value:</span>
                  <span className="text-gray-900 font-semibold">{currentExample.raw.value}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quality:</span>
                  <span className="text-green-700">{currentExample.raw.quality}</span>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs text-yellow-800">
                    ⚠️ <strong>Problems:</strong>
                  </p>
                  <ul className="text-xs text-yellow-700 mt-1 space-y-1 ml-4">
                    <li>• No equipment context</li>
                    <li>• Cryptic tag name</li>
                    <li>• No process state</li>
                    <li>• No spec limits</li>
                  </ul>
                </div>
              </>
            )}

            {currentExample.title === 'LIMS Test Result' && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sample ID:</span>
                  <span className="text-purple-700 font-bold">{currentExample.raw.sampleId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Test Code:</span>
                  <span className="text-gray-900 font-semibold">{currentExample.raw.testCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Test Name:</span>
                  <span className="text-gray-900 text-xs">{currentExample.raw.testName}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Result:</span>
                  <span className="text-gray-900 font-semibold">{currentExample.raw.value} {currentExample.raw.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="text-gray-900 font-mono text-xs">{currentExample.raw.locationCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Analysis Date:</span>
                  <span className="text-gray-900 text-xs">{new Date(currentExample.raw.analysisDate).toLocaleString()}</span>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs text-yellow-800">
                    ⚠️ <strong>Problems:</strong>
                  </p>
                  <ul className="text-xs text-yellow-700 mt-1 space-y-1 ml-4">
                    <li>• Location code doesn't match DCS/eBR</li>
                    <li>• No link to batch or equipment</li>
                    <li>• Analysis delayed from collection</li>
                  </ul>
                </div>
              </>
            )}

            {currentExample.title === 'Multiple Tag Names → Single Parameter' && (
              <>
                <div className="space-y-3">
                  {currentExample.raw.tags?.map((tag, idx) => (
                    <div key={idx} className="p-2 bg-gray-50 rounded border">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600 text-xs">Tag {idx + 1}:</span>
                        <span className="text-blue-700 font-bold">{tag.id}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600 text-xs">Value:</span>
                        <span className="text-gray-900">{tag.value}</span>
                      </div>
                      <div className="text-xs text-gray-500">{tag.source}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs text-yellow-800">
                    ⚠️ <strong>Problems:</strong>
                  </p>
                  <ul className="text-xs text-yellow-700 mt-1 space-y-1 ml-4">
                    <li>• Different naming per vendor/site</li>
                    <li>• Can't compare across batches</li>
                    <li>• Difficult to query or analyze</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>

        {/* STRUCTURED DATA */}
        <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <h3 className="text-lg font-bold text-green-900">STRUCTURED DATA</h3>
            <span className="ml-auto text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
              ISA-95/88 Semantic Layer
            </span>
          </div>

          <div className="bg-white rounded p-4 space-y-4">
            {/* Equipment Context */}
            <div className="border-b pb-3">
              <div className="text-xs font-semibold text-gray-600 mb-2">EQUIPMENT CONTEXT</div>
              <div className="text-xs text-gray-700 mb-1">Hierarchy:</div>
              <div className="font-mono text-xs text-blue-700 mb-2">
                {currentExample.structured.equipmentPath}
              </div>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium">
                  {currentExample.structured.equipmentClass}
                </span>
              </div>
            </div>

            {/* Parameter Info */}
            <div className="border-b pb-3">
              <div className="text-xs font-semibold text-gray-600 mb-2">STANDARDIZED PARAMETER</div>
              <div className="text-base font-bold text-gray-900 mb-1">
                {currentExample.structured.parameterName}
              </div>
              {currentExample.structured.standardizedId && (
                <div className="text-xs text-gray-600 font-mono mb-2">
                  ID: {currentExample.structured.standardizedId}
                </div>
              )}
              {currentExample.structured.value && (
                <div className="text-lg font-bold text-gray-900">
                  {currentExample.structured.value} <span className="text-sm text-gray-600">{currentExample.structured.unit}</span>
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <span className={`px-2 py-1 text-xs rounded font-medium ${
                  currentExample.structured.classification === 'Critical'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {currentExample.structured.classification}
                </span>
                {currentExample.structured.inSpec !== undefined && (
                  <span className={`px-2 py-1 text-xs rounded font-medium ${
                    currentExample.structured.inSpec
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {currentExample.structured.inSpec ? 'In Spec' : 'Out of Spec'}
                  </span>
                )}
              </div>
              {currentExample.structured.specRange && (
                <div className="text-xs text-gray-600 mt-2">
                  Spec: {currentExample.structured.specRange}
                </div>
              )}
            </div>

            {/* Process Context */}
            <div className="border-b pb-3">
              <div className="text-xs font-semibold text-gray-600 mb-2">PROCESS CONTEXT</div>
              <div className="text-xs text-gray-700 font-mono">
                {currentExample.structured.processContext}
              </div>
            </div>

            {currentExample.structured.description && (
              <div className="text-xs text-gray-700 italic">
                {currentExample.structured.description}
              </div>
            )}

            <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded">
              <p className="text-xs text-green-900 font-semibold mb-1">
                ✓ Benefits of Structure:
              </p>
              <ul className="text-xs text-green-800 space-y-1 ml-4">
                <li>• Full equipment and process context</li>
                <li>• Standardized naming across sites</li>
                <li>• Automatic spec checking</li>
                <li>• Queryable and analyzable</li>
                <li>• Cross-batch comparable</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Transformation Arrow */}
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-100 to-green-100 border-2 border-blue-300 rounded-lg">
          <span className="text-sm font-semibold text-gray-700">Semantic Transformation</span>
          <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <span className="text-sm font-semibold text-gray-700">Adds Context & Meaning</span>
        </div>
      </div>
    </div>
  );
}
