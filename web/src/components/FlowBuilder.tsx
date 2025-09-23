import {
  BookOpen,
  CheckCircle,
  FileText,
  HelpCircle,
  Play,
  Plus,
  Settings,
  Trash2,
  Video,
  Heart,
  Diamond,
  Flame,
  Trophy,
  Menu,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { DatabaseService } from "../lib/database";

interface FlowNode {
  id: string;
  type: "quiz" | "study" | "video" | "assignment" | "assessment" | "start" | "end";
  title: string;
  description: string;
  sort_order: number; // Use sort_order instead of position
  config: any;
  connections: string[];
  status: "locked" | "available" | "completed" | "current";
  difficulty: "easy" | "medium" | "hard";
  xp: number;
  icon: string;
  color: [string, string];
  estimatedTime?: string;
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

interface FlowBuilderProps {
  nodes: FlowNode[];
  onNodesChange: (nodes: FlowNode[]) => void;
  subjectName: string;
  sidebarCollapsed?: boolean;
  topics: Topic[];
  onTopicsChange: (topics: Topic[]) => void;
  subjectId: string;
  onSubjectChange?: (subjectId: string) => void;
  currentFlowId?: string; // Add current flow ID
}

interface TopicHierarchySelectorProps {
  topic: Topic;
  currentTopicId: string;
  onTopicSelect: (topicId: string) => void;
  allTopics: Topic[];
}

const TopicHierarchySelector: React.FC<TopicHierarchySelectorProps> = ({ 
  topic, 
  currentTopicId, 
  onTopicSelect, 
  allTopics 
}) => {
  const [isExpanded, setIsExpanded] = useState(topic.level === 0); // Auto-expand top level

  const getIndentStyle = () => {
    return {
      marginLeft: `${topic.level * 20}px`,
      borderLeft: topic.level > 0 ? `2px solid #374151` : 'none',
      paddingLeft: topic.level > 0 ? '12px' : '0'
    };
  };

  const isSelected = currentTopicId === topic.id;
  const hasChildren = topic.children.length > 0;
  const isLeafTopic = !hasChildren; // Only leaf topics (no children) can be selected

  return (
    <div style={getIndentStyle()} className="relative">
      {/* Topic Card */}
      <div className={`rounded-lg p-3 transition-colors ${
        isLeafTopic ? 'cursor-pointer' : 'cursor-default'
      } ${
        isSelected 
          ? "bg-primary-500 text-white" 
          : topic.hasFlow
          ? "bg-green-500/20 border border-green-500/30 text-white hover:bg-green-500/30"
          : isLeafTopic
          ? "bg-dark-800 hover:bg-dark-700 text-white"
          : "bg-dark-700 text-dark-400" // Non-selectable topics are dimmed
      }`} onClick={() => isLeafTopic && onTopicSelect(topic.id)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {/* Expand/Collapse Button */}
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="text-dark-400 hover:text-white transition-colors"
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            )}
            
            {/* Topic Icon */}
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
              topic.hasFlow ? 'bg-green-500/20 text-green-400' : 
              isLeafTopic ? 'bg-blue-500/20 text-blue-400' : 'bg-dark-600 text-dark-400'
            }`}>
              {topic.hasFlow ? '✓' : isLeafTopic ? '●' : '○'}
            </div>

            {/* Topic Content */}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold">{topic.name}</h4>
                {topic.hasFlow && (
                  <span className="text-green-400 text-xs">✓ Has Flow</span>
                )}
                {isLeafTopic && !topic.hasFlow && (
                  <span className="text-blue-400 text-xs">● Selectable</span>
                )}
                {!isLeafTopic && (
                  <span className="text-dark-500 text-xs">○ Not Selectable</span>
                )}
              </div>
              <p className={`text-sm ${
                isSelected ? "text-white/80" : "text-dark-400"
              }`}>
                {topic.description}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-dark-500">Level {topic.level}</span>
                {hasChildren && (
                  <span className="text-xs text-dark-500">
                    {topic.children.length} children
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Selection Indicator */}
          {isSelected && (
            <div className="text-white text-sm font-bold">
              SELECTED
            </div>
          )}
        </div>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="mt-2 space-y-2">
          {topic.children.map((child) => (
            <TopicHierarchySelector
              key={child.id}
              topic={child}
              currentTopicId={currentTopicId}
              onTopicSelect={onTopicSelect}
              allTopics={allTopics}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// 3-Column Grid System Configuration (matching mobile app)
const FLOW_CONFIG = {
  nodeSpacing: 140, // Vertical spacing between nodes
  leftColumnX: 0.2, // 20% from left edge (left column)
  centerColumnX: 0.5, // 50% from left edge (center column)
  rightColumnX: 0.8, // 80% from left edge (right column)
  startY: 100, // Start 100px from top
  nodeSize: 110, // Node diameter for positioning
  connectionOffset: 25, // Vertical offset for L-shaped connections
};

// Calculate node position using simple switch case based on node position
const calculateNodePosition = (sortOrder: number, containerWidth: number) => {
  // Validate and provide default sort_order
  const validSortOrder = isNaN(sortOrder) || sortOrder === undefined || sortOrder === null ? 1 : sortOrder;
  
  // Calculate Y position (vertical) - fixed spacing
  const y = FLOW_CONFIG.startY + (validSortOrder - 1) * FLOW_CONFIG.nodeSpacing;
  
  // Calculate X position (horizontal) using simple switch case
  let x: number;
  
  switch (validSortOrder) {
    case 1: // 1st node → Center
      x = containerWidth * FLOW_CONFIG.centerColumnX;
      break;
    case 2: // 2nd node → Right
      x = containerWidth * FLOW_CONFIG.rightColumnX;
      break;
    case 3: // 3rd node → Center
      x = containerWidth * FLOW_CONFIG.centerColumnX;
      break;
    case 4: // 4th node → Left
      x = containerWidth * FLOW_CONFIG.leftColumnX;
      break;
    case 5: // 5th node → Center
      x = containerWidth * FLOW_CONFIG.centerColumnX;
      break;
    case 6: // 6th node → Right
      x = containerWidth * FLOW_CONFIG.rightColumnX;
      break;
    case 7: // 7th node → Center
      x = containerWidth * FLOW_CONFIG.centerColumnX;
      break;
    case 8: // 8th node → Left
      x = containerWidth * FLOW_CONFIG.leftColumnX;
      break;
    default: // For nodes beyond 8, repeat the pattern
      const patternIndex = ((validSortOrder - 1) % 4) + 1;
      switch (patternIndex) {
        case 1: x = containerWidth * FLOW_CONFIG.centerColumnX; break;
        case 2: x = containerWidth * FLOW_CONFIG.rightColumnX; break;
        case 3: x = containerWidth * FLOW_CONFIG.centerColumnX; break;
        case 4: x = containerWidth * FLOW_CONFIG.leftColumnX; break;
        default: x = containerWidth * FLOW_CONFIG.centerColumnX;
      }
  }
  
  console.log(`POSITION DEBUG: sortOrder=${sortOrder}, validSortOrder=${validSortOrder}, x=${x}, y=${y}`);
  
  return { x, y };
};

// Generate flow positions using sort_order + presentation logic
const generateFlowPositions = (
  nodes: FlowNode[],
  containerWidth: number = 800, // Use fixed width for consistent positioning
): FlowNode[] => {
  return nodes.map((node) => {
    // Calculate position using sort_order
    const position = calculateNodePosition(node.sort_order, containerWidth);

    return {
      ...node,
      position: position,
    };
  });
};

// Get node anchor point based on position and direction
const getNodeAnchorPoint = (
  node: FlowNode,
  direction: "top" | "bottom" | "left" | "right" | "center",
): { x: number; y: number } => {
  const centerX = node.position.x;
  const centerY = node.position.y;
  const halfSize = FLOW_CONFIG.nodeSize / 2;

  switch (direction) {
    case "top":
      return { x: centerX, y: centerY - halfSize };
    case "bottom":
      return { x: centerX, y: centerY + halfSize };
    case "left":
      return { x: centerX - halfSize, y: centerY };
    case "right":
      return { x: centerX + halfSize, y: centerY };
    case "center":
      return { x: centerX, y: centerY };
    default:
      return { x: centerX, y: centerY };
  }
};

// Get connection points based on node positions and flow direction
const getConnectionPoints = (
  currentNode: FlowNode,
  nextNode: FlowNode,
): { start: { x: number; y: number }; end: { x: number; y: number } } => {
  const currentPosIndex = ((currentNode.sort_order || 1) - 1) % 4;
  const nextPosIndex = ((nextNode.sort_order || 1) - 1) % 4;

  let startPoint: { x: number; y: number };
  let endPoint: { x: number; y: number };

  // Determine connection direction based on position pattern: Center → Right → Center → Left
  if (currentPosIndex === 0 && nextPosIndex === 1) { // Center to Right
    startPoint = getNodeAnchorPoint(currentNode, "right");
    endPoint = getNodeAnchorPoint(nextNode, "top");
  } else if (currentPosIndex === 1 && nextPosIndex === 2) { // Right to Center
    startPoint = getNodeAnchorPoint(currentNode, "bottom");
    endPoint = getNodeAnchorPoint(nextNode, "left");
  } else if (currentPosIndex === 2 && nextPosIndex === 3) { // Center to Left
    startPoint = getNodeAnchorPoint(currentNode, "left");
    endPoint = getNodeAnchorPoint(nextNode, "top");
  } else if (currentPosIndex === 3 && nextPosIndex === 0) { // Left to Center
    startPoint = getNodeAnchorPoint(currentNode, "bottom");
    endPoint = getNodeAnchorPoint(nextNode, "right");
  } else {
    // Default vertical connection
    startPoint = getNodeAnchorPoint(currentNode, "bottom");
    endPoint = getNodeAnchorPoint(nextNode, "top");
  }

  return { start: startPoint, end: endPoint };
};

// Create proper L-shaped path with correct orientation
const createVerticalFlowPath = (
  startNode: FlowNode,
  endNode: FlowNode,
): string => {
  const points = getConnectionPoints(startNode, endNode);
  const start = points.start;
  const end = points.end;

  const currentPosIndex = ((startNode.sort_order || 1) - 1) % 4;
  const nextPosIndex = ((endNode.sort_order || 1) - 1) % 4;

  let path: string;
  const cornerRadius = 8; // Small radius to smooth the sharp turns

  // Create smooth L-shaped connections based on position pattern: Center → Right → Center → Left
  if (currentPosIndex === 0 && nextPosIndex === 1) { // Center to Right
    const cornerX = end.x - cornerRadius;
    const cornerY = start.y + cornerRadius;
    path = `M ${start.x} ${start.y} L ${cornerX} ${start.y} Q ${end.x} ${start.y} ${end.x} ${cornerY} L ${end.x} ${end.y}`;
  } else if (currentPosIndex === 1 && nextPosIndex === 2) { // Right to Center
    const cornerX = start.x - cornerRadius;
    const cornerY = end.y - cornerRadius;
    path = `M ${start.x} ${start.y} L ${start.x} ${cornerY} Q ${start.x} ${end.y} ${cornerX} ${end.y} L ${end.x} ${end.y}`;
  } else if (currentPosIndex === 2 && nextPosIndex === 3) { // Center to Left
    const cornerX = end.x + cornerRadius;
    const cornerY = start.y + cornerRadius;
    path = `M ${start.x} ${start.y} L ${cornerX} ${start.y} Q ${end.x} ${start.y} ${end.x} ${cornerY} L ${end.x} ${end.y}`;
  } else if (currentPosIndex === 3 && nextPosIndex === 0) { // Left to Center
    const cornerX = start.x + cornerRadius;
    const cornerY = end.y - cornerRadius;
    path = `M ${start.x} ${start.y} L ${start.x} ${cornerY} Q ${start.x} ${end.y} ${cornerX} ${end.y} L ${end.x} ${end.y}`;
  } else {
    // Default vertical connection
    path = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  }

  return path;
};

// Generate all vertical flow paths between consecutive nodes
const generateVerticalFlowPaths = (nodes: FlowNode[]): string[] => {
  if (nodes.length < 2) return [];

  const paths: string[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const currentPath = createVerticalFlowPath(nodes[i], nodes[i + 1]);
    paths.push(currentPath);
  }
  return paths;
};

// Sri Lankan AL Physics Topics
const AL_PHYSICS_TOPICS = [
  { id: "mechanics", name: "Mechanics", description: "Motion, forces, and energy" },
  { id: "waves", name: "Waves", description: "Wave properties and behavior" },
  { id: "electricity", name: "Electricity", description: "Electric fields and circuits" },
  { id: "magnetism", name: "Magnetism", description: "Magnetic fields and electromagnetic induction" },
  { id: "thermodynamics", name: "Thermodynamics", description: "Heat, temperature, and energy transfer" },
  { id: "optics", name: "Optics", description: "Light, reflection, and refraction" },
  { id: "atomic", name: "Atomic Physics", description: "Atomic structure and quantum mechanics" },
  { id: "nuclear", name: "Nuclear Physics", description: "Nuclear reactions and radioactivity" },
  { id: "particles", name: "Particle Physics", description: "Fundamental particles and interactions" },
  { id: "astrophysics", name: "Astrophysics", description: "Stars, galaxies, and cosmology" },
  { id: "electronics", name: "Electronics", description: "Electronic devices and circuits" },
  { id: "practical", name: "Practical Physics", description: "Laboratory work and experiments" },
];

const FlowBuilder: React.FC<FlowBuilderProps> = ({
  nodes,
  onNodesChange,
  subjectName,
  sidebarCollapsed = false,
  topics,
  onTopicsChange,
  onSubjectChange,
  currentFlowId,
}) => {
  // Debug: Log received props
  console.log("FlowBuilder received topics:", topics);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [showNodeCreator, setShowNodeCreator] = useState(false);
  const [showTopicSelector, setShowTopicSelector] = useState(false);
  const [currentTopicId, setCurrentTopicId] = useState("");
  const [flowId, setFlowId] = useState<string | null>(currentFlowId || null);
  const [isSaving, setIsSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get all leaf topics (topics without children) for flow assignment
  const getLeafTopics = (topics: Topic[]): Topic[] => {
    const leafTopics: Topic[] = [];
    
    const traverse = (topicList: Topic[]) => {
      topicList.forEach(topic => {
        console.log(`Checking topic: ${topic.name}, level: ${topic.level}, children: ${topic.children.length}`);
        if (topic.children.length === 0) {
          console.log(`Found leaf topic: ${topic.name}`);
          leafTopics.push(topic);
        } else {
          traverse(topic.children);
        }
      });
    };
    
    traverse(topics);
    console.log(`Total leaf topics found: ${leafTopics.length}`);
    return leafTopics;
  };

  const leafTopics = getLeafTopics(topics);
  
  // Debug: Log the topics and leaf topics
  console.log("All topics:", topics);
  console.log("Leaf topics:", leafTopics);

  const nodeTypes = [
    { 
      type: "start", 
      name: "Start", 
      icon: Play, 
      color: ["#10b981", "#059669"],
      xp: 0,
      difficulty: "easy" as const
    },
    { 
      type: "study", 
      name: "Study", 
      icon: BookOpen, 
      color: ["#3b82f6", "#1d4ed8"],
      xp: 25,
      difficulty: "medium" as const
    },
    { 
      type: "quiz", 
      name: "Quiz", 
      icon: HelpCircle, 
      color: ["#f59e0b", "#d97706"],
      xp: 30,
      difficulty: "medium" as const
    },
    { 
      type: "video", 
      name: "Video", 
      icon: Video, 
      color: ["#8b5cf6", "#7c3aed"],
      xp: 20,
      difficulty: "easy" as const
    },
    { 
      type: "assignment", 
      name: "Assignment", 
      icon: FileText, 
      color: ["#6366f1", "#4f46e5"],
      xp: 40,
      difficulty: "hard" as const
    },
    { 
      type: "assessment", 
      name: "Assessment", 
      icon: CheckCircle, 
      color: ["#ef4444", "#dc2626"],
      xp: 50,
      difficulty: "hard" as const
    },
    { 
      type: "end", 
      name: "End", 
      icon: Settings, 
      color: ["#6b7280", "#4b5563"],
      xp: 0,
      difficulty: "easy" as const
    },
  ];


  const getNodeIcon = (type: string) => {
    const nodeType = nodeTypes.find(nt => nt.type === type);
    return nodeType ? nodeType.icon : BookOpen;
  };

  const getNodeColor = (type: string) => {
    const nodeType = nodeTypes.find(nt => nt.type === type);
    return nodeType ? nodeType.color : ["#6b7280", "#4b5563"];
  };

  const addNode = (type: string) => {
    const nodeType = nodeTypes.find(nt => nt.type === type);
    if (!nodeType) return;

    // Get the highest sort_order from existing nodes and add 1
    const maxSortOrder = nodes.length > 0 ? Math.max(...nodes.map(n => n.sort_order || 1)) : 0;
    const newSortOrder = maxSortOrder + 1;

    console.log(`ADDING NODE: maxSortOrder=${maxSortOrder}, newSortOrder=${newSortOrder}, nodes.length=${nodes.length}`);

    const newNode: FlowNode = {
      id: `node-${Date.now()}`,
      type: type as any,
      title: `New ${nodeType.name}`,
      description: `Description for ${nodeType.name} node`,
      sort_order: newSortOrder, // Use unique sort_order
      config: {},
      connections: [],
      status: nodes.length === 0 ? "current" : "available", // First node is current, others are available
      difficulty: nodeType.difficulty,
      xp: nodeType.xp,
      icon: nodeType.icon.name,
      color: nodeType.color,
      estimatedTime: "5 min",
    };

    console.log(`NEW NODE CREATED:`, newNode);
    onNodesChange([...nodes, newNode]);
    setShowNodeCreator(false);
  };

  const updateNode = (nodeId: string, updates: Partial<FlowNode>) => {
    const updatedNodes = nodes.map(node =>
      node.id === nodeId ? { ...node, ...updates } : node
    );
    onNodesChange(updatedNodes);
  };

  const deleteNode = (nodeId: string) => {
    const updatedNodes = nodes.filter(node => node.id !== nodeId);
    // Remove connections to this node
    const cleanedNodes = updatedNodes.map(node => ({
      ...node,
      connections: node.connections.filter(conn => conn !== nodeId),
    }));
    onNodesChange(cleanedNodes);
    setSelectedNode(null);
  };

  const handleTopicChange = (topicId: string) => {
    setCurrentTopicId(topicId);
    setShowTopicSelector(false);
    
    // Mark the topic as having a flow
    const updateTopicFlow = (topicList: Topic[]): Topic[] => {
      return topicList.map(topic => {
        if (topic.id === topicId) {
          return { ...topic, hasFlow: true, flowId: `flow-${topicId}` };
        }
        if (topic.children.length > 0) {
          return { ...topic, children: updateTopicFlow(topic.children) };
        }
        return topic;
      });
    };
    
    onTopicsChange(updateTopicFlow(topics));
    
    if (onSubjectChange) {
      onSubjectChange(topicId);
    }
  };

  // Save flow to database
  const saveFlow = async () => {
    if (!currentTopicId || nodes.length === 0) {
      alert("Please select a topic and add some nodes before saving.");
      return;
    }

    setIsSaving(true);
    try {
      const user = await DatabaseService.getCurrentUser();
      if (!user) {
        alert("Please log in to save flows.");
        return;
      }

      let currentFlowId = flowId;

      // Create flow if it doesn't exist
      if (!currentFlowId) {
        const flow = await DatabaseService.createFlow({
          topicId: currentTopicId,
          name: `${getCurrentTopic()?.name || 'Topic'} Flow`,
          description: `Learning flow for ${getCurrentTopic()?.name || 'topic'}`,
          createdBy: user.id
        });
        currentFlowId = flow.id;
        setFlowId(currentFlowId);
      }

      // Save flow nodes
      await DatabaseService.saveFlowNodes(currentFlowId, nodes);
      
      alert("Flow saved successfully!");
    } catch (error) {
      console.error("Error saving flow:", error);
      alert("Error saving flow. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Load flow from database
  const loadFlow = async (flowId: string) => {
    try {
      const flowWithNodes = await DatabaseService.loadFlowWithNodes(flowId);
      if (flowWithNodes) {
        // Convert database nodes back to FlowNode format
        const convertedNodes: FlowNode[] = flowWithNodes.nodes.map((node: any) => ({
          id: node.id,
          type: node.node_type,
          title: node.title,
          description: node.description,
          sort_order: node.sort_order,
          config: node.config,
          connections: node.connections,
          status: node.status,
          difficulty: node.difficulty,
          xp: node.xp_reward,
          icon: getNodeIcon(node.node_type).name,
          color: getNodeColor(node.node_type),
          estimatedTime: `${node.estimated_time} min`
        }));

        onNodesChange(convertedNodes);
        setFlowId(flowId);
        alert("Flow loaded successfully!");
      }
    } catch (error) {
      console.error("Error loading flow:", error);
      alert("Error loading flow. Please try again.");
    }
  };

  const getCurrentTopic = () => {
    if (!currentTopicId) return null;
    
    const findTopic = (topicList: Topic[]): Topic | null => {
      for (const topic of topicList) {
        if (topic.id === currentTopicId) return topic;
        if (topic.children.length > 0) {
          const found = findTopic(topic.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    return findTopic(topics);
  };

  const currentTopic = getCurrentTopic();

  // Sort nodes by sort_order first, then generate positioned nodes and paths
  const sortedNodes = [...nodes].sort((a, b) => {
    const aOrder = a.sort_order || 1;
    const bOrder = b.sort_order || 1;
    return aOrder - bOrder;
  });
  
  // Fix nodes that don't have sort_order by assigning them based on their position in the array
  const fixedNodes = sortedNodes.map((node, index) => ({
    ...node,
    sort_order: node.sort_order || (index + 1)
  }));
  
  console.log("FIXED NODES:", fixedNodes);
  
  const flowNodes = generateFlowPositions(fixedNodes, 800); // Fixed width for consistent positioning
  
  const verticalPaths = generateVerticalFlowPaths(flowNodes);
  
  // Calculate total content height
  const totalContentHeight = flowNodes.length > 0 
    ? flowNodes[flowNodes.length - 1].position.y + FLOW_CONFIG.nodeSpacing + 300
    : 600;

  // Calculate course progress
  const completedNodes = flowNodes.filter(node => node.status === "completed").length;
  const totalNodes = flowNodes.length;
  const courseProgress = totalNodes > 0 ? (completedNodes / totalNodes) * 100 : 0;

  // Mock user stats
  const userStats = {
    hearts: 5,
    coins: 200,
    streak: 7,
    totalXp: 1250,
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Learning Flow Builder</h2>
          <p className="text-dark-400">
            Design the learning path for "{subjectName}"
            {sidebarCollapsed && (
              <span className="ml-2 text-xs bg-primary-500/20 text-primary-400 px-2 py-1 rounded">
                Sidebar Collapsed - Flow Centered
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={saveFlow}
            disabled={isSaving || !currentTopicId || nodes.length === 0}
            className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              !currentTopicId 
                ? "Please select a topic first" 
                : nodes.length === 0 
                  ? "Please add some nodes first" 
                  : "Save flow to database"
            }
          >
            <Settings className="w-5 h-5" />
            <span>
              {isSaving 
                ? "Saving..." 
                : !currentTopicId 
                  ? "Select Topic First" 
                  : nodes.length === 0 
                    ? "Add Nodes First" 
                    : "Save Flow"
              }
            </span>
          </button>
          <button
            onClick={() => setShowNodeCreator(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Node</span>
          </button>
        </div>
      </div>

      {/* Flow Container - Responsive to sidebar state */}
      <div className={`bg-dark-800 rounded-2xl overflow-hidden transition-all duration-300 ${
        sidebarCollapsed 
          ? 'max-w-7xl mx-auto w-full' 
          : 'max-w-6xl mx-auto w-full'
      }`}>
        {/* Header Section (matching mobile app) */}
        <div 
          className="px-6 pt-6 pb-6"
          style={{
            background: "linear-gradient(135deg, #0f0f23, #1a1a2e)"
          }}
        >
          {/* User Stats */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-4">
              {/* Hearts */}
              <div className="bg-red-500 bg-opacity-20 px-4 py-2 rounded-full flex items-center">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="text-white font-bold ml-2">{userStats.hearts}</span>
              </div>

              {/* Coins */}
              <div className="bg-yellow-500 bg-opacity-20 px-4 py-2 rounded-full flex items-center">
                <Diamond className="w-5 h-5 text-yellow-500" />
                <span className="text-white font-bold ml-2">{userStats.coins}</span>
              </div>

              {/* Streak */}
              <div className="bg-orange-500 bg-opacity-20 px-4 py-2 rounded-full flex items-center">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="text-white font-bold ml-2">{userStats.streak}</span>
              </div>
            </div>

            {/* Menu */}
            <button className="bg-dark-700 p-3 rounded-full">
              <Menu className="w-6 h-6 text-primary-500" />
            </button>
          </div>

          {/* Course Title */}
          <div className="bg-dark-700 bg-opacity-50 px-6 py-4 rounded-2xl mb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <button
                  onClick={() => {
                    console.log("Topic selector button clicked!");
                    setShowTopicSelector(true);
                  }}
                  className="text-left hover:bg-dark-600 rounded-lg p-2 -m-2 transition-colors group"
                >
                  <h3 className="text-white text-2xl font-bold group-hover:text-primary-400 transition-colors">
                    {currentTopic ? currentTopic.name : "Select a Topic"}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {currentTopic ? `${Math.round(courseProgress)}% Complete` : "Choose a topic to build flow"}
                  </p>
                  <p className="text-primary-400 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to {currentTopic ? "change topic" : "select topic"}
                  </p>
                  {showTopicSelector && (
                    <p className="text-green-400 text-xs mt-1">
                      Modal is open! (Debug)
                    </p>
                  )}
                </button>
              </div>
              <div className="text-right">
                <p className="text-white text-xl font-bold">{userStats.totalXp}</p>
                <p className="text-gray-400 text-xs">Total XP</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-dark-600 rounded-full h-3 mt-3">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-full h-3 transition-all duration-300"
                style={{ width: `${courseProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Flow Canvas */}
        <div 
          ref={containerRef}
          className="relative overflow-auto flex justify-center"
          style={{ 
            height: "600px",
            background: "radial-gradient(circle, #374151 1px, transparent 1px)",
            backgroundSize: "20px 20px"
          }}
        >
          <div
            className="relative mx-auto"
            style={{
              minHeight: totalContentHeight,
              width: "800px", // Fixed width for consistent centering
              maxWidth: "100%",
            }}
          >
            {/* SVG Connections */}
            <svg
              height={totalContentHeight}
              width="800"
              style={{ position: "absolute", top: 0, left: 0 }}
            >
              {verticalPaths.map((path, index) => (
                <path
                  key={index}
                  d={path}
                  stroke="#666666"
                  strokeWidth="6"
                  fill="none"
                  opacity={0.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
            </svg>

            {/* Learning Nodes */}
            {flowNodes.map((node, index) => {
              const Icon = getNodeIcon(node.type);
              const nodeColor = getNodeColor(node.type);
              
              const getNodeSize = () => {
                const baseSize = FLOW_CONFIG.nodeSize;
                switch (node.status) {
                  case "current":
                    return baseSize;
                  case "completed":
                    return baseSize * 0.9;
                  case "available":
                    return baseSize * 0.85;
                  case "locked":
                    return baseSize * 0.8;
                  default:
                    return baseSize * 0.85;
                }
              };

              const getNodeIconName = () => {
                switch (node.status) {
                  case "completed":
                    return CheckCircle;
                  case "locked":
                    return Settings; // Lock icon
                  case "current":
                    return Play;
                  default:
                    return Icon;
                }
              };

              const getStatusColor = () => {
                switch (node.status) {
                  case "completed":
                    return ["#10b981", "#059669"];
                  case "current":
                    return ["#8b5cf6", "#7c3aed"];
                  case "locked":
                    return ["#6b7280", "#4b5563"];
                  default:
                    return nodeColor;
                }
              };

              const nodeSize = getNodeSize();
              const StatusIcon = getNodeIconName();
              const statusColor = getStatusColor();
              const isDisabled = node.status === "locked";

              return (
                <div
                  key={node.id}
                  className={`absolute select-none ${
                    selectedNode?.id === node.id ? "ring-2 ring-primary-500" : ""
                  }`}
                  style={{
                    left: node.position.x - nodeSize / 2,
                    top: node.position.y - nodeSize / 2,
                  }}
                  onClick={() => setSelectedNode(node)}
                >
                  <button
                    disabled={isDisabled}
                    className="relative group"
                  >
                    {/* Node Circle */}
                    <div
                      className="flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105"
                      style={{
                        width: nodeSize,
                        height: nodeSize,
                        borderRadius: 16,
                        background: `linear-gradient(135deg, ${statusColor[0]}, ${statusColor[1]})`,
                        boxShadow: `0 4px 8px rgba(0, 0, 0, 0.3), 0 0 0 0 ${statusColor[0]}40`,
                      }}
                    >
                      <StatusIcon className="w-8 h-8 text-white" />
                    </div>

                    {/* Node Label */}
                    <div
                      className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center"
                      style={{ minWidth: 100 }}
                    >
                      <p
                        className="text-xs font-semibold"
                        style={{
                          color: node.status === "locked" ? "#6b7280" : "#ffffff",
                        }}
                      >
                        {node.title}
                      </p>
                      {node.xp > 0 && (
                        <p
                          className="text-xs mt-1"
                          style={{
                            color: node.status === "locked" ? "#6b7280" : "#fbbf24",
                          }}
                        >
                          +{node.xp} XP
                        </p>
                      )}
                    </div>

                    {/* Difficulty Indicator */}
                    {node.status !== "locked" && (
                      <div className="absolute -top-2 -right-2 bg-white rounded-full px-2 py-1 min-w-[20px]">
                        <p
                          className="text-xs font-bold text-center"
                          style={{
                            color:
                              node.difficulty === "easy"
                                ? "#10b981"
                                : node.difficulty === "medium"
                                ? "#f59e0b"
                                : "#ef4444",
                          }}
                        >
                          {node.difficulty === "easy"
                            ? "E"
                            : node.difficulty === "medium"
                            ? "M"
                            : "H"}
                        </p>
                      </div>
                    )}
                  </button>
                </div>
              );
            })}

            {/* Empty state */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-dark-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-dark-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Start Building Your Learning Flow
                  </h3>
                  <p className="text-dark-400 mb-6">
                    Add nodes to create an interactive learning path
                  </p>
                  <button
                    onClick={() => setShowNodeCreator(true)}
                    className="btn-primary"
                  >
                    Add Your First Node
                  </button>
                </div>
              </div>
            )}
          </div>
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

      {/* Node Creator Modal */}
      {showNodeCreator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-2xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                Add New Node
              </h3>
              <button
                onClick={() => setShowNodeCreator(false)}
                className="text-dark-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {nodeTypes.map((nodeType) => {
                const Icon = nodeType.icon;
                return (
                  <button
                    key={nodeType.type}
                    onClick={() => addNode(nodeType.type)}
                    className="p-4 bg-dark-800 rounded-xl hover:bg-dark-700 transition-colors text-left"
                  >
                    <div className={`w-12 h-12 ${nodeType.color} rounded-xl flex items-center justify-center mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-white font-medium">{nodeType.name}</h4>
                    <p className="text-dark-400 text-sm mt-1">
                      {nodeType.type === "start" && "Starting point of the flow"}
                      {nodeType.type === "study" && "Learning content and lessons"}
                      {nodeType.type === "quiz" && "Interactive questions and assessments"}
                      {nodeType.type === "video" && "Video content and tutorials"}
                      {nodeType.type === "assignment" && "Practical exercises and projects"}
                      {nodeType.type === "assessment" && "Formal evaluations and tests"}
                      {nodeType.type === "end" && "Ending point of the flow"}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Node Properties Panel */}
      {selectedNode && (
        <div className="bg-dark-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Node Properties
            </h3>
            <button
              onClick={() => deleteNode(selectedNode.id)}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">
                Node Title
              </label>
              <input
                type="text"
                value={selectedNode.title}
                onChange={(e) =>
                  updateNode(selectedNode.id, { title: e.target.value })
                }
                className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Description
              </label>
              <textarea
                value={selectedNode.description}
                onChange={(e) =>
                  updateNode(selectedNode.id, { description: e.target.value })
                }
                className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 h-24 resize-none"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 ${getNodeColor(selectedNode.type)} rounded`} />
                <span className="text-white text-sm">
                  {selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)} Node
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Topic Selector Modal */}
      {showTopicSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" style={{ zIndex: 9999 }}>
          <div className="bg-dark-900 rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Select Topic for Flow
                </h3>
                <p className="text-dark-400 text-sm mt-1">
                  Only the latest/deepest topics (leaf topics) can have flows assigned. Each leaf topic gets its own separate flow.
                </p>
                <div className="mt-2">
                  <button
                    onClick={() => {
                      console.log("All topics:", topics);
                      console.log("Leaf topics:", leafTopics);
                    }}
                    className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded"
                  >
                    Debug: Check Console
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowTopicSelector(false)}
                className="text-dark-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {topics.map((topic) => (
                <TopicHierarchySelector
                  key={topic.id}
                  topic={topic}
                  currentTopicId={currentTopicId}
                  onTopicSelect={handleTopicChange}
                  allTopics={topics}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowBuilder;
