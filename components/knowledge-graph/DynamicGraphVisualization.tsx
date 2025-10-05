'use client';

import { useState, useEffect, useRef } from 'react';
import { getAllEquipmentNodes, getEquipmentConnections } from '@/lib/knowledge-graph/equipment-network';
import { getProcessNetwork } from '@/lib/knowledge-graph/process-network';
import { getMaterialNodes, getMaterialTransformations } from '@/lib/knowledge-graph/material-network';

type NodeType = 'equipment' | 'process' | 'material';
type GraphNode = {
  id: string;
  label: string;
  type: NodeType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  metadata?: any;
  stage?: string; // Stage marker: Upstream, Midstream, Downstream, Drug Substance
  isParallel?: boolean; // Mark parallel/alternative units
};

type GraphEdge = {
  source: string;
  target: string;
  type: string;
  color: string;
};

export default function DynamicGraphVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNode, setDraggedNode] = useState<GraphNode | null>(null);
  const [showEquipment, setShowEquipment] = useState(true);
  const [showProcess, setShowProcess] = useState(true);
  const [showMaterial, setShowMaterial] = useState(true);
  const animationFrameRef = useRef<number>();

  // Initialize graph data with strategic layout
  useEffect(() => {
    const equipment = getAllEquipmentNodes();
    const equipmentConnections = getEquipmentConnections();
    const processes = getProcessNetwork();
    const materials = getMaterialNodes();
    const materialTransformations = getMaterialTransformations();

    const graphNodes: GraphNode[] = [];
    const graphEdges: GraphEdge[] = [];

    // Material flow backbone (horizontal, left to right) - THE CENTRAL SPINE
    // Stage markers: Upstream → Midstream → Downstream → Drug Substance
    const materialFlow = [
      { id: 'MAT_MEDIA_001', name: 'CHO Medium', x: 120, y: 350, stage: 'Upstream' },
      { id: 'MAT_SEED_001', name: 'Seed Culture', x: 280, y: 350, stage: 'Upstream' },
      { id: 'MAT_CULTURE_001', name: 'Production Culture', x: 480, y: 350, stage: 'Upstream' },
      { id: 'MAT_HARVEST_001', name: 'Harvested HCCF', x: 680, y: 350, stage: 'Midstream' },
      { id: 'MAT_POOL_001', name: 'Purified mAb Pool', x: 920, y: 350, stage: 'Downstream' },
      { id: 'MAT_FINAL_001', name: 'Drug Substance', x: 1120, y: 350, stage: 'Drug Substance' },
    ];

    // Add material nodes along backbone
    materialFlow.forEach((mat) => {
      const materialData = materials.find(m => m.id === mat.id);
      if (materialData) {
        graphNodes.push({
          id: mat.id,
          label: mat.name,
          type: 'material',
          x: mat.x,
          y: mat.y,
          vx: 0,
          vy: 0,
          radius: 24,
          color: materialData.qualityStatus === 'InSpec' ? '#8b5cf6' : materialData.qualityStatus === 'Pending' ? '#eab308' : '#ef4444',
          metadata: materialData,
          stage: mat.stage,
        });
      }
    });

    // Equipment positioned ABOVE material nodes (uniform y=200 for primary, y=230 for parallel units)
    const equipmentLayout = [
      // UPSTREAM: Bioreactor Class
      { id: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A', name: 'BR-2001-A', x: 380, y: 200, stage: 'Upstream', class: 'Bioreactor' },
      { id: 'SITE_B.USP.BR_CELL_2.BR_UNIT_3002.BR-3002-B', name: 'BR-3002-B (Site B)', x: 540, y: 200, stage: 'Upstream', class: 'Bioreactor', isParallel: true },

      // MIDSTREAM: Storage Tanks
      { id: 'SITE_A.STORAGE.TANK_001', name: 'TK-001 (Harvest)', x: 680, y: 200, stage: 'Midstream', class: 'Storage Tank' },

      // DOWNSTREAM: Chromatography Class (Protein A)
      { id: 'SITE_A.DSP.CHR_CELL_1.CHR_UNIT_A01.CHR-A-01', name: 'CHR-A-01', x: 840, y: 200, stage: 'Downstream', class: 'Protein A' },
      { id: 'SITE_A.DSP.CHR_CELL_1.CHR_UNIT_A02.CHR-A-02', name: 'CHR-A-02', x: 980, y: 200, stage: 'Downstream', class: 'Protein A', isParallel: true },

      // FINAL: Storage
      { id: 'SITE_A.STORAGE.TANK_002', name: 'TK-002 (Pool)', x: 1120, y: 200, stage: 'Drug Substance', class: 'Storage Tank' },
    ];

    // Add equipment nodes
    equipmentLayout.forEach((eq: any) => {
      const equipmentData = equipment.find(e => e.id === eq.id);
      if (equipmentData) {
        graphNodes.push({
          id: eq.id,
          label: eq.name,
          type: 'equipment',
          x: eq.x,
          y: eq.y,
          vx: 0,
          vy: 0,
          radius: eq.isParallel ? 16 : 20, // Parallel units slightly smaller
          color: equipmentData.status === 'Running' ? '#10b981' : equipmentData.status === 'Idle' ? '#6b7280' : '#f59e0b',
          metadata: { ...equipmentData, equipmentClass: eq.class },
          stage: eq.stage,
          isParallel: eq.isParallel,
        });
      }
    });

    // Process nodes positioned BELOW material flow (uniform y=500)
    const processLayout = [
      { id: 'UP_PREP', name: 'Preparation', x: 280, y: 500, stage: 'Upstream' },
      { id: 'UP_CULTURE', name: 'Fed-Batch Culture', x: 480, y: 500, stage: 'Upstream' },
      { id: 'UP_HARVEST', name: 'Harvest', x: 680, y: 500, stage: 'Midstream' },
      { id: 'UP_CHROM', name: 'Protein A Capture', x: 910, y: 500, stage: 'Downstream' },
    ];

    // Add process nodes
    const allProcesses = getProcessNetwork();
    processLayout.forEach((proc: any) => {
      const processData = allProcesses.find(p => p.id === proc.id);
      if (processData) {
        graphNodes.push({
          id: proc.id,
          label: proc.name,
          type: 'process',
          x: proc.x,
          y: proc.y,
          vx: 0,
          vy: 0,
          radius: 18,
          color: processData.status === 'Running' ? '#3b82f6' : processData.status === 'Complete' ? '#10b981' : '#9ca3af',
          metadata: processData,
          stage: proc.stage,
        });
      }
    });

    // GREEN edges: Physical Flow (main material backbone)
    for (let i = 0; i < materialFlow.length - 1; i++) {
      graphEdges.push({
        source: materialFlow[i].id,
        target: materialFlow[i + 1].id,
        type: 'physicalFlow',
        color: '#10b981',
      });
    }

    // PURPLE edges: Material Transformation (inline, process → material)
    const materialTransforms = [
      { from: 'UP_PREP', to: 'MAT_SEED_001' },
      { from: 'UP_CULTURE', to: 'MAT_CULTURE_001' },
      { from: 'UP_HARVEST', to: 'MAT_HARVEST_001' },
      { from: 'UP_CHROM', to: 'MAT_POOL_001' },
    ];

    materialTransforms.forEach(({ from, to }) => {
      if (graphNodes.some(n => n.id === from) && graphNodes.some(n => n.id === to)) {
        graphEdges.push({
          source: from,
          target: to,
          type: 'materialTransform',
          color: '#a855f7',
        });
      }
    });

    // BLUE edges: Process Uses Equipment (connect equipment to processes)
    const processEquipmentLinks = [
      { process: 'UP_PREP', equipment: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A' },
      { process: 'UP_CULTURE', equipment: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A' },
      { process: 'UP_HARVEST', equipment: 'SITE_A.STORAGE.TANK_001' },
      { process: 'UP_CHROM', equipment: 'SITE_A.DSP.CHR_CELL_1.CHR_UNIT_A01.CHR-A-01' },
    ];

    processEquipmentLinks.forEach(({ process, equipment }) => {
      if (graphNodes.some(n => n.id === process) && graphNodes.some(n => n.id === equipment)) {
        graphEdges.push({
          source: process,
          target: equipment,
          type: 'processUses',
          color: '#3b82f6',
        });
      }
    });

    // ORANGE edges: Same Equipment Class (Protein A columns & cross-site bioreactors)
    const sameClassLinks = [
      { from: 'SITE_A.DSP.CHR_CELL_1.CHR_UNIT_A01.CHR-A-01', to: 'SITE_A.DSP.CHR_CELL_1.CHR_UNIT_A02.CHR-A-02' },
      { from: 'SITE_A.USP.BR_CELL_1.BR_UNIT_2001.BR-2001-A', to: 'SITE_B.USP.BR_CELL_2.BR_UNIT_3002.BR-3002-B' },
    ];

    sameClassLinks.forEach(({ from, to }) => {
      if (graphNodes.some(n => n.id === from) && graphNodes.some(n => n.id === to)) {
        graphEdges.push({
          source: from,
          target: to,
          type: 'sameClass',
          color: '#f97316',
        });
      }
    });

    setNodes(graphNodes);
    setEdges(graphEdges);
  }, []);

  // No physics simulation - using fixed strategic layout

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw stage markers (background labels)
      const stages = [
        { name: 'UPSTREAM', x: 280, color: '#dbeafe' },
        { name: 'MIDSTREAM', x: 680, color: '#e0e7ff' },
        { name: 'DOWNSTREAM', x: 910, color: '#f3e8ff' },
        { name: 'DRUG SUBSTANCE', x: 1120, color: '#fce7f3' },
      ];

      stages.forEach(stage => {
        ctx.fillStyle = stage.color;
        ctx.fillRect(stage.x - 80, 50, 160, 600);

        ctx.fillStyle = '#6b7280';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(stage.name, stage.x, 70);
      });

      // Filter nodes based on toggle
      const visibleNodes = nodes.filter(node => {
        if (node.type === 'equipment' && !showEquipment) return false;
        if (node.type === 'process' && !showProcess) return false;
        if (node.type === 'material' && !showMaterial) return false;
        return true;
      });

      const visibleNodeIds = new Set(visibleNodes.map(n => n.id));

      // Draw edges
      edges.forEach(edge => {
        if (!visibleNodeIds.has(edge.source) || !visibleNodeIds.has(edge.target)) return;

        const source = visibleNodes.find(n => n.id === edge.source);
        const target = visibleNodes.find(n => n.id === edge.target);
        if (!source || !target) return;

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        // Set line style based on edge type
        if (edge.type === 'physicalFlow') {
          ctx.strokeStyle = edge.color;
          ctx.lineWidth = 3;
          ctx.setLineDash([]);
        } else if (edge.type === 'materialTransform') {
          ctx.strokeStyle = edge.color;
          ctx.lineWidth = 2;
          ctx.setLineDash([]);
        } else if (edge.type === 'processUses') {
          ctx.strokeStyle = edge.color;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([]);
        } else if (edge.type === 'sameClass') {
          ctx.strokeStyle = edge.color;
          ctx.lineWidth = 1;
          ctx.setLineDash([5, 5]);
        } else {
          ctx.strokeStyle = edge.color + '40';
          ctx.lineWidth = 1;
          ctx.setLineDash([]);
        }
        ctx.stroke();

        // Arrow
        const angle = Math.atan2(target.y - source.y, target.x - source.x);
        const arrowX = target.x - Math.cos(angle) * target.radius;
        const arrowY = target.y - Math.sin(angle) * target.radius;
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(
          arrowX - 8 * Math.cos(angle - Math.PI / 6),
          arrowY - 8 * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          arrowX - 8 * Math.cos(angle + Math.PI / 6),
          arrowY - 8 * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = edge.color + '80';
        ctx.fill();
      });

      // Draw nodes
      visibleNodes.forEach(node => {
        const isHovered = hoveredNode?.id === node.id;
        const isSelected = selectedNode?.id === node.id;

        // Draw equipment class grouping indicator
        if (node.type === 'equipment' && node.metadata?.equipmentClass && !node.isParallel) {
          ctx.strokeStyle = '#9ca3af40';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.strokeRect(node.x - 35, node.y - 30, 70, 50);
          ctx.setLineDash([]);

          // Class label
          ctx.fillStyle = '#6b7280';
          ctx.font = '9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(node.metadata.equipmentClass, node.x, node.y - 35);
        }

        // Shadow for hovered/selected
        if (isHovered || isSelected) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = node.color;
        } else {
          ctx.shadowBlur = 0;
        }

        // Node circle with border for parallel units
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        if (node.isParallel) {
          ctx.strokeStyle = '#f97316';
          ctx.lineWidth = 2;
          ctx.setLineDash([2, 2]);
        } else {
          ctx.strokeStyle = isSelected ? '#ffffff' : node.color;
          ctx.lineWidth = isSelected ? 3 : 2;
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = '#1f2937';
        ctx.font = isHovered || isSelected ? 'bold 11px sans-serif' : '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + node.radius + 15);

        // Parallel unit indicator
        if (node.isParallel) {
          ctx.fillStyle = '#f97316';
          ctx.font = '8px sans-serif';
          ctx.fillText('(alt)', node.x, node.y + node.radius + 26);
        }
      });

      requestAnimationFrame(render);
    };

    render();
  }, [nodes, edges, hoveredNode, selectedNode, showEquipment, showProcess, showMaterial]);

  // Mouse interactions
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging && draggedNode) {
      setNodes(prevNodes =>
        prevNodes.map(node =>
          node.id === draggedNode.id
            ? { ...node, x, y, vx: 0, vy: 0 }
            : node
        )
      );
      setDraggedNode({ ...draggedNode, x, y });
    } else {
      const hovered = nodes.find(node => {
        const dx = node.x - x;
        const dy = node.y - y;
        return Math.sqrt(dx * dx + dy * dy) < node.radius;
      });
      setHoveredNode(hovered || null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredNode) {
      setIsDragging(true);
      setDraggedNode(hoveredNode);
      setSelectedNode(hoveredNode);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedNode(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Manufacturing Process Flow Visualization
        </h2>
        <p className="text-sm text-gray-600">
          Material flow backbone from CHO Seed to mAb Drug Substance with process and equipment integration
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-gray-700">Show:</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showEquipment}
              onChange={(e) => setShowEquipment(e.target.checked)}
              className="w-4 h-4 text-green-600 rounded"
            />
            <span className="text-sm text-gray-700">Equipment</span>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showProcess}
              onChange={(e) => setShowProcess(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700">Processes</span>
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showMaterial}
              onChange={(e) => setShowMaterial(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <span className="text-sm text-gray-700">Materials</span>
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          </label>
        </div>
      </div>

      {/* Canvas */}
      <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={1200}
          height={700}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="cursor-pointer"
          style={{ width: '100%', height: 'auto' }}
        />
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="bg-white border-2 border-purple-300 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{selectedNode.label}</h3>
              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded mt-1 ${
                selectedNode.type === 'equipment' ? 'bg-green-100 text-green-800' :
                selectedNode.type === 'process' ? 'bg-blue-100 text-blue-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {selectedNode.type.toUpperCase()}
              </span>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {selectedNode.type === 'equipment' && (
            <div className="space-y-2 text-sm">
              <div><strong>Status:</strong> {selectedNode.metadata.status}</div>
              <div><strong>Site:</strong> {selectedNode.metadata.site}</div>
              <div><strong>Class:</strong> {selectedNode.metadata.equipmentClass}</div>
              {selectedNode.metadata.currentProcess && (
                <div><strong>Current Process:</strong> {selectedNode.metadata.currentProcess}</div>
              )}
            </div>
          )}

          {selectedNode.type === 'process' && (
            <div className="space-y-2 text-sm">
              <div><strong>Level:</strong> {selectedNode.metadata.level}</div>
              <div><strong>Status:</strong> {selectedNode.metadata.status}</div>
              {selectedNode.metadata.equipmentId && (
                <div><strong>Equipment:</strong> {selectedNode.metadata.equipmentId.split('.').pop()}</div>
              )}
              {selectedNode.metadata.duration && (
                <div><strong>Duration:</strong> {selectedNode.metadata.duration.expected} {selectedNode.metadata.duration.unit}</div>
              )}
            </div>
          )}

          {selectedNode.type === 'material' && (
            <div className="space-y-2 text-sm">
              <div><strong>Type:</strong> {selectedNode.metadata.materialType}</div>
              <div><strong>Quality:</strong> {selectedNode.metadata.qualityStatus}</div>
              <div><strong>Quantity:</strong> {selectedNode.metadata.quantity} {selectedNode.metadata.unit}</div>
              <div><strong>Location:</strong> {selectedNode.metadata.location}</div>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="text-sm font-semibold text-gray-700 mb-3">Edge Legend:</div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-12 h-1 bg-green-500"></div>
            <span className="text-gray-700 font-semibold">GREEN: Physical Flow (backbone)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-0.5 bg-purple-500" style={{height: '2px'}}></div>
            <span className="text-gray-700 font-semibold">PURPLE: Material Transform</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-0.5 bg-blue-500" style={{height: '1.5px'}}></div>
            <span className="text-gray-700 font-semibold">BLUE: Process Uses Equipment</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 border-t-2 border-dashed border-orange-500"></div>
            <span className="text-gray-700 font-semibold">ORANGE: Same Equipment Class</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm text-blue-900">
          <strong>💡 Process Flow:</strong> Follows material from left (CHO Seed) to right (Drug Substance). Equipment above, processes below. Click nodes for details, drag to reposition.
        </div>
      </div>
    </div>
  );
}
