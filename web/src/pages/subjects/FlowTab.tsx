import React from "react";
import FlowBuilder from "../../components/flow/FlowBuilder";
import type { FlowNode, TopicWithChildren } from "../../types/database";

interface FlowTabProps {
  nodes: FlowNode[];
  onNodesChange: (nodes: FlowNode[]) => void;
  subjectName: string;
  sidebarCollapsed: boolean;
  topics: TopicWithChildren[];
  onTopicsChange: (topics: TopicWithChildren[]) => void;
  subjectId: string;
  onSubjectChange: (topicId: string) => void;
}

const FlowTab: React.FC<FlowTabProps> = ({
  nodes,
  onNodesChange,
  subjectName,
  sidebarCollapsed,
  topics,
  onTopicsChange,
  subjectId,
  onSubjectChange,
}) => {
  return (
    <FlowBuilder
      nodes={nodes}
      onNodesChange={onNodesChange}
      subjectName={subjectName}
      sidebarCollapsed={sidebarCollapsed}
      topics={topics}
      onTopicsChange={onTopicsChange}
      subjectId={subjectId}
      onSubjectChange={onSubjectChange}
      currentFlowId={undefined} // Will be set when flow is created
    />
  );
};

export default FlowTab;
