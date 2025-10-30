import type { User } from "@supabase/supabase-js";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { useModal } from "../../../../contexts/ModalContext";
import { TopicService } from "../../../../services/topicService";
import type { TopicWithChildren } from "../../../../types/database";
import TopicHierarchyItem from "./TopicHierarchyItem";

interface TopicsTabProps {
  topics: TopicWithChildren[];
  onTopicsChange: (topics: TopicWithChildren[]) => void;
  subjectId: string;
  user: User | null;
}

const TopicsTab: React.FC<TopicsTabProps> = ({
  topics,
  onTopicsChange,
  subjectId,
  user,
}) => {
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicDescription, setNewTopicDescription] = useState("");
  const modal = useModal();

  const handleAddTopic = async () => {
    if (!newTopicName.trim()) return;
    if (!user) {
      await modal.alert("You must be logged in to create topics.");
      return;
    }
    try {
      await TopicService.createTopic({
        subject_id: subjectId,
        name: newTopicName,
        description: newTopicDescription,
        level: 0,
        sort_order: topics.length + 1,
        created_by: user.id,
      });
      const updatedTopics = await TopicService.getTopicsBySubject(subjectId);
      onTopicsChange(updatedTopics);
      setIsAddingTopic(false);
      setNewTopicName("");
      setNewTopicDescription("");
    } catch (error) {
      console.error("Error creating topic:", error);
      await modal.alert("Error creating topic. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-dark-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white">
              Topic Hierarchy
            </h3>
            <p className="text-dark-400 mt-1">
              Organize your subject into topics, subtopics, and sub-subtopics
              with unlimited depth
            </p>
          </div>
          <button
            onClick={() => setIsAddingTopic(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Topic</span>
          </button>
        </div>

        {/* Add New Topic Form */}
        {isAddingTopic && (
          <div className="bg-dark-700 rounded-lg p-4 mb-5 border border-dark-600">
            <h4 className="text-white font-medium mb-3">Add New Topic</h4>
            <div className="space-y-3">
              <input
                type="text"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Topic name"
              />
              <input
                type="text"
                value={newTopicDescription}
                onChange={(e) => setNewTopicDescription(e.target.value)}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Topic description"
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleAddTopic}
                  disabled={!newTopicName.trim()}
                  className="px-3 py-1 bg-primary-500 text-white rounded text-sm hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Topic
                </button>
                <button
                  onClick={() => {
                    setIsAddingTopic(false);
                    setNewTopicName("");
                    setNewTopicDescription("");
                  }}
                  className="px-3 py-1 bg-dark-600 text-white rounded text-sm hover:bg-dark-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {topics.map((topic) => (
            <TopicHierarchyItem
              key={topic.id}
              topic={topic}
              onUpdate={onTopicsChange}
              allTopics={topics}
              subjectId={subjectId}
              user={user}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopicsTab;
