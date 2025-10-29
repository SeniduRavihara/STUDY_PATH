import {
  BookOpen,
  CheckCircle,
  FileText,
  HelpCircle,
  Play,
  Plus,
  Settings,
  Video,
  Heart,
  Trophy,
} from "lucide-react";
import React, { useState, useRef } from "react";

interface FlowNode {
  id: string;
  type: "quiz" | "study" | "video" | "assignment" | "assessment" | "start" | "end";
  title: string;
  description: string;
  sort_order: number;
  config: any;
  connections: string[];
  status: "locked" | "available" | "completed" | "current";
  difficulty: "easy" | "medium" | "hard";
  xp: number;
  icon: string;
  color: [string, string];
  estimatedTime?: string;
  position?: { x: number; y: number };
}

interface Topic {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  level: number;
  hasFlow: boolean;
  flowId?: string;
  children: Topic[];
  isExpanded?: boolean;
}

interface FlowCanvasProps {
  flowNodes: FlowNode[];
  selectedNode: FlowNode | null;
  onNodeSelect: (node: FlowNode) => void;
  onNodeUpdate: (nodeId: string, updates: Partial<FlowNode>) => void;
  onNodeDelete: (nodeId: string) => void;
  onAddNode: (type: string) => void;
  showNodeCreator: boolean;
  onShowNodeCreator: (show: boolean) => void;
  topics: Topic[];
  currentTopicId: string | null;
  onTopicSelect: (topicId: string) => void;
  isLoading: boolean;
}

const FlowCanvas: React.FC<FlowCanvasProps> = ({
  flowNodes,
  selectedNode,
  onNodeSelect,
  onNodeUpdate,
  onShowNodeCreator,
  isLoading,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Node types configuration
  const nodeTypes = [
    {
      type: "start",
      name: "Start",
      icon: Play,
      color: "bg-gradient-to-br from-green-500 to-green-600",
    },
    {
      type: "study",
      name: "Study",
      icon: BookOpen,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
    },
    {
      type: "quiz",
      name: "Quiz",
      icon: HelpCircle,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
    },
    {
      type: "video",
      name: "Video",
      icon: Video,
      color: "bg-gradient-to-br from-red-500 to-red-600",
    },
    {
      type: "assignment",
      name: "Assignment",
      icon: FileText,
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
    },
    {
      type: "assessment",
      name: "Assessment",
      icon: CheckCircle,
      color: "bg-gradient-to-br from-indigo-500 to-indigo-600",
    },
    {
      type: "end",
      name: "End",
      icon: Trophy,
      color: "bg-gradient-to-br from-yellow-500 to-yellow-600",
    },
  ];

  // Helper functions
  const getNodeColor = (type: string) => {
    const nodeType = nodeTypes.find(nt => nt.type === type);
    return nodeType?.color || "bg-gradient-to-br from-gray-500 to-gray-600";
  };

  const getNodeIcon = (type: string) => {
    const nodeType = nodeTypes.find(nt => nt.type === type);
    return nodeType?.icon || Settings;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-green-500 bg-green-500/20";
      case "current":
        return "border-blue-500 bg-blue-500/20";
      case "available":
        return "border-yellow-500 bg-yellow-500/20";
      case "locked":
        return "border-gray-500 bg-gray-500/20";
      default:
        return "border-gray-500 bg-gray-500/20";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-400";
      case "medium":
        return "text-yellow-400";
      case "hard":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  // Calculate course progress
  const courseProgress = flowNodes.length > 0 
    ? (flowNodes.filter(n => n.status === "completed").length / flowNodes.length) * 100 
    : 0;

  // Handle node drag start
  const handleNodeDragStart = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const nodeRect = e.currentTarget.getBoundingClientRect();
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - nodeRect.left,
      y: e.clientY - nodeRect.top,
    });
  };

  // Handle node drag
  const handleNodeDrag = (e: React.MouseEvent, node: FlowNode) => {
    if (!isDragging || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;
    
    onNodeUpdate(node.id, {
      position: { x: newX, y: newY }
    });
  };

  // Handle node drag end
  const handleNodeDragEnd = () => {
    setIsDragging(false);
  };

  // Render flow nodes
  const renderFlowNodes = () => {
    return flowNodes.map((node, index) => {
      const Icon = getNodeIcon(node.type);
      const isSelected = selectedNode?.id === node.id;
      
      return (
        <div
          key={node.id}
          className={`absolute cursor-move select-none transition-all duration-200 ${
            isSelected ? "scale-105 z-10" : "hover:scale-102"
          }`}
          style={{
            left: node.position?.x || (index * 200) + 50,
            top: node.position?.y || 100,
          }}
          onMouseDown={handleNodeDragStart}
          onMouseMove={(e) => handleNodeDrag(e, node)}
          onMouseUp={handleNodeDragEnd}
          onMouseLeave={handleNodeDragEnd}
          onClick={(e) => {
            e.stopPropagation();
            onNodeSelect(node);
          }}
        >
          <div
            className={`w-48 h-32 rounded-2xl border-2 ${getStatusColor(node.status)} ${getNodeColor(node.type)} p-4 flex flex-col justify-between shadow-lg hover:shadow-xl transition-all duration-200`}
          >
            {/* Node Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon className="w-5 h-5 text-white" />
                <span className="text-white text-sm font-medium">
                  {node.type.charAt(0).toUpperCase() + node.type.slice(1)}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-white text-xs">{node.xp}</span>
              </div>
            </div>

            {/* Node Content */}
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                {node.title}
              </h3>
              <p className="text-white/80 text-xs line-clamp-2">
                {node.description}
              </p>
            </div>

            {/* Node Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getDifficultyColor(node.difficulty)}`} />
                <span className={`text-xs ${getDifficultyColor(node.difficulty)}`}>
                  {node.difficulty}
                </span>
              </div>
              {node.estimatedTime && (
                <span className="text-white/60 text-xs">
                  {node.estimatedTime}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-dark-900 rounded-2xl p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading flow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-dark-900 rounded-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-dark-800 p-6 border-b border-dark-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Flow Builder</h2>
            <p className="text-dark-400">Design your learning journey</p>
          </div>
          <button
            onClick={() => onShowNodeCreator(true)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Node</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-dark-700 rounded-full h-2 mb-4">
          <div
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${courseProgress}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-dark-400">
          <span>{Math.round(courseProgress)}% Complete</span>
          <span>{flowNodes.filter(n => n.status === "completed").length} of {flowNodes.length} nodes</span>
        </div>
      </div>

      {/* Flow Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-auto bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900"
        style={{ minHeight: "600px" }}
        onClick={() => onNodeSelect(null as any)}
      >
        {flowNodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-dark-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Plus className="w-12 h-12 text-dark-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Start Building Your Flow</h3>
              <p className="text-dark-400 mb-6">Click "Add Node" to begin creating your learning path</p>
              <button
                onClick={() => onShowNodeCreator(true)}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Create First Node
              </button>
            </div>
          </div>
        ) : (
          renderFlowNodes()
        )}
      </div>

      {/* Bottom Info Panel */}
      <div className="bg-dark-700 bg-opacity-95 p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white font-semibold">
              Next: {flowNodes.find(n => n.status === "current")?.title || "Complete the course!"}
            </p>
            <p className="text-gray-400 text-sm">
              {flowNodes.filter(n => n.status === "completed").length} of {flowNodes.length} completed
            </p>
          </div>
          <div className="flex items-center">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-yellow-400 font-bold ml-1">
              {Math.round(courseProgress)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowCanvas;
