import React, { useState } from "react";

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
      {hasChildren && isExpanded && (
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

export default TopicHierarchySelector;
