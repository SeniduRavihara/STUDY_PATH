import React from "react";
import FlowBuilder from "../../../components/flow/FlowBuilder";
import type { FlowNode, TopicWithChildren } from "../../../types/database";

interface FlowTabProps {
  nodes: FlowNode[];
  onNodesChange: (nodes: FlowNode[]) => void;
  subjectName: string;
  topics: TopicWithChildren[];
  onTopicsChange: (topics: TopicWithChildren[]) => void;
  subjectId: string;
}

const FlowTab: React.FC<FlowTabProps> = ({
  nodes,
  onNodesChange,
  subjectName,
  topics,
  onTopicsChange,
  subjectId,
}) => {
  return (
    <FlowBuilder
      nodes={nodes}
      onNodesChange={onNodesChange}
      subjectName={subjectName}
      topics={topics}
      onTopicsChange={onTopicsChange}
      subjectId={subjectId}
      currentFlowId={undefined} // Will be set when flow is created
    />
  );
};

export default FlowTab;
