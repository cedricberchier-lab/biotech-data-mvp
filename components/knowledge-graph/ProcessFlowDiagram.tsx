'use client';

import { useEffect } from 'react';

export default function ProcessFlowDiagram() {
  useEffect(() => {
    // Initialize Mermaid when component mounts
    if (typeof window !== 'undefined' && (window as any).mermaid) {
      (window as any).mermaid.contentLoaded();
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          mAb Manufacturing Process Flow
        </h2>
        <p className="text-sm text-gray-600">
          Standard monoclonal antibody production process from upstream through drug substance
        </p>
      </div>

      {/* Mermaid Diagram */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
        <pre className="mermaid text-center">
{`flowchart LR
  %% Classes
  classDef equip fill:#2ecc71,stroke:#1e824c,color:#000;
  classDef proc  fill:#3498db,stroke:#1f5f8b,color:#000;
  classDef mat   fill:#9b59b6,stroke:#5e3370,color:#fff;
  classDef alt   fill:#bdc3c7,stroke:#7f8c8d,color:#000,stroke-dasharray: 5 5;

  %% Upstream
  subgraph UPSTREAM
    direction LR
    CHO[CHO Medium]:::mat
    Prep[Preparation]:::proc
    Seed[Seed Culture]:::proc
    BR[BR-2001-A Bioreactor]:::equip
    Fed[Fed-Batch Culture]:::proc
    HCCF[Harvested HCCF]:::mat
    Harv[Harvest]:::proc

    CHO --> Seed --> Prep --> BR --> Fed --> Harv --> HCCF
  end

  %% Downstream
  subgraph DOWNSTREAM
    direction LR
    ProtA[Protein A Capture]:::proc
    CHR[CHR-A-01 Column]:::equip
    Pool[Purified mAb Pool]:::mat

    HCCF --> ProtA --> CHR --> Pool
  end

  %% Drug Substance
  subgraph DRUG_SUBSTANCE [Drug Substance]
    direction LR
    TK[TK-002 Bulk Storage]:::equip
    DS[Drug Substance]:::mat

    Pool --> TK --> DS
  end

  %% Alternates (off main flow)
  BR_alt[BR-3002-B Site B]:::alt
  CHR_alt[CHR-A-02 alt]:::alt

  BR -.-> BR_alt
  CHR -.-> CHR_alt`}
        </pre>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="text-sm font-semibold text-gray-700 mb-3">Legend:</div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-12 h-6 rounded" style={{backgroundColor: '#2ecc71', border: '2px solid #1e824c'}}></div>
            <span className="text-gray-700 font-semibold">Equipment (Active)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-6 rounded" style={{backgroundColor: '#3498db', border: '2px solid #1f5f8b'}}></div>
            <span className="text-gray-700 font-semibold">Process Operations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-6 rounded" style={{backgroundColor: '#9b59b6', border: '2px solid #5e3370'}}></div>
            <span className="text-gray-700 font-semibold">Materials</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-6 rounded border-2 border-dashed" style={{backgroundColor: '#bdc3c7', borderColor: '#7f8c8d'}}></div>
            <span className="text-gray-700 font-semibold">Alternate Equipment</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm text-blue-900">
          <strong>💡 Process Flow:</strong> Left-to-right material flow through three phases: Upstream (cell culture) → Downstream (purification) → Drug Substance (final storage). Dashed boxes show alternate equipment units.
        </div>
      </div>

    </div>
  );
}
