import React, { useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  Edit,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { TopicService } from "../../services";
import type { TopicWithChildren } from "../../types/database";

interface TopicHierarchyItemProps {
  topic: TopicWithChildren;
  onUpdate: (topics: TopicWithChildren[]) => void;
  allTopics: TopicWithChildren[];
  subjectId: string;
  user: any; // Add user prop
}

const TopicHierarchyItem: React.FC<TopicHierarchyItemProps> = ({
  topic,
  onUpdate,
  allTopics,
  subjectId,
  user,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [isAddingChildLoading, setIsAddingChildLoading] = useState(false);
  const [editName, setEditName] = useState(topic.name);
  const [editDescription, setEditDescription] = useState(
    topic.description || ""
  );
  const [newChildName, setNewChildName] = useState("");
  const [newChildDescription, setNewChildDescription] = useState("");
  const [isExpanded, setIsExpanded] = useState(topic.isExpanded || false);

  const updateTopic = async (
    topicId: string,
    updates: Partial<TopicWithChildren>
  ) => {
    try {
      await TopicService.updateTopic(topicId, updates);
      // Reload topics from database
      const updatedTopics = await TopicService.getTopicsBySubject(subjectId);
      onUpdate(updatedTopics);
    } catch (error) {
      console.error("Error updating topic:", error);
      alert("Error updating topic. Please try again.");
    }
  };

  const addChildTopic = async (parentId: string) => {
    if (!user) {
      alert("You must be logged in to create topics.");
      return;
    }

    setIsAddingChildLoading(true);
    try {
      await TopicService.createTopic({
        subject_id: subjectId,
        parent_id: parentId,
        name: newChildName,
        description: newChildDescription,
        level: (topic.level || 0) + 1,
        sort_order: (topic.children?.length || 0) + 1,
        created_by: user.id,
      });

      // Reload topics from database
      const updatedTopics = await TopicService.getTopicsBySubject(subjectId);
      onUpdate(updatedTopics);

      setIsAddingChild(false);
      setNewChildName("");
      setNewChildDescription("");
    } catch (error) {
      console.error("Error creating topic:", error);
      alert("Error creating topic. Please try again.");
    } finally {
      setIsAddingChildLoading(false);
    }
  };

  const deleteTopic = async (topicId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this topic? This action cannot be undone."
      )
    ) {
      try {
        await TopicService.deleteTopic(topicId);

        // Reload topics from database
        const updatedTopics = await TopicService.getTopicsBySubject(subjectId);
        onUpdate(updatedTopics);
      } catch (error) {
        console.error("Error deleting topic:", error);
        alert("Error deleting topic. Please try again.");
      }
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const saveEdit = () => {
    updateTopic(topic.id, {
      name: editName,
      description: editDescription,
    });
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditName(topic.name);
    setEditDescription(topic.description || "");
    setIsEditing(false);
  };

  const getIndentStyle = () => {
    return {
      marginLeft: `${topic.level * 24}px`,
      borderLeft: topic.level > 0 ? `2px solid #374151` : "none",
      paddingLeft: topic.level > 0 ? "16px" : "0",
    };
  };

  return (
    <div style={getIndentStyle()} className="relative">
      {/* Topic Card */}
      <div className="bg-dark-700 rounded-lg p-4 hover:bg-dark-600 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {/* Expand/Collapse Button */}
            {topic.children && topic.children.length > 0 && (
              <button
                onClick={toggleExpanded}
                className="text-dark-400 hover:text-white transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Topic Icon */}
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                topic.has_flow
                  ? "bg-green-500/20 text-green-400"
                  : "bg-dark-600 text-dark-400"
              }`}
            >
              {topic.has_flow ? (
                <Check className="w-4 h-4" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
            </div>

            {/* Topic Content */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-1 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="Topic name"
                  />
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-3 py-1 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="Topic description"
                  />
                </div>
              ) : (
                <div>
                  <h4 className="text-white font-medium">{topic.name}</h4>
                  <p className="text-dark-400 text-sm">{topic.description}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-dark-500">
                      Level {topic.level}
                    </span>
                    {topic.has_flow && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                        Has Flow
                      </span>
                    )}
                    {topic.children && topic.children.length > 0 && (
                      <span className="text-xs text-dark-500">
                        {topic.children.length} children
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={saveEdit}
                  className="text-green-400 hover:text-green-300 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={cancelEdit}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                  title="Edit topic"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsAddingChild(true)}
                  className="text-primary-400 hover:text-primary-300 transition-colors"
                  title="Add subtopic"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteTopic(topic.id)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                  title="Delete topic"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Add Child Form */}
        {isAddingChild && (
          <div className="mt-4 p-3 bg-dark-800 rounded border border-dark-600">
            <div className="space-y-2">
              <input
                type="text"
                value={newChildName}
                onChange={(e) => setNewChildName(e.target.value)}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Subtopic name"
              />
              <input
                type="text"
                value={newChildDescription}
                onChange={(e) => setNewChildDescription(e.target.value)}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Subtopic description"
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => addChildTopic(topic.id)}
                  disabled={!newChildName.trim() || isAddingChildLoading}
                  className="px-3 py-1 bg-primary-500 text-white rounded text-sm hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isAddingChildLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>
                    {isAddingChildLoading ? "Adding..." : "Add Subtopic"}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setIsAddingChild(false);
                    setNewChildName("");
                    setNewChildDescription("");
                  }}
                  className="px-3 py-1 bg-dark-600 text-white rounded text-sm hover:bg-dark-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Children */}
      {isExpanded && topic.children && topic.children.length > 0 && (
        <div className="mt-2 space-y-2">
          {topic.children.map((child) => (
            <TopicHierarchyItem
              key={child.id}
              topic={child}
              onUpdate={onUpdate}
              allTopics={allTopics}
              subjectId={subjectId}
              user={user}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TopicHierarchyItem;
