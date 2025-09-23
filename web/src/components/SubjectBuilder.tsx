import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Eye,
  FileText,
  Play,
  Plus,
  Save,
  Settings,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSidebar } from "../contexts/SidebarContext";
import FlowBuilder from "./FlowBuilder";
import { DatabaseService } from "../lib/database";
import type { TopicWithChildren, Subject, SubjectInsert } from "../lib/database";
import { useAuth } from "../contexts/AuthContext";

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

interface TopicHierarchyItemProps {
  topic: TopicWithChildren;
  onUpdate: (topics: TopicWithChildren[]) => void;
  allTopics: TopicWithChildren[];
  subjectId: string;
  user: any; // Add user prop
}

const TopicHierarchyItem: React.FC<TopicHierarchyItemProps> = ({ topic, onUpdate, allTopics, subjectId, user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [isAddingChildLoading, setIsAddingChildLoading] = useState(false);
  const [editName, setEditName] = useState(topic.name);
  const [editDescription, setEditDescription] = useState(topic.description);
  const [newChildName, setNewChildName] = useState("");
  const [newChildDescription, setNewChildDescription] = useState("");
  const [isExpanded, setIsExpanded] = useState(topic.isExpanded || false);

  const updateTopic = async (topicId: string, updates: Partial<TopicWithChildren>) => {
    try {
      await DatabaseService.updateTopic(topicId, updates);
      // Reload topics from database
      const updatedTopics = await DatabaseService.getTopicsBySubject(subjectId);
      onUpdate(updatedTopics);
    } catch (error) {
      console.error('Error updating topic:', error);
      alert('Error updating topic. Please try again.');
    }
  };

  const addChildTopic = async (parentId: string) => {
    if (!user) {
      alert("You must be logged in to create topics.");
      return;
    }

    setIsAddingChildLoading(true);
    try {
      await DatabaseService.createTopic({
        subject_id: subjectId,
        parent_id: parentId,
        name: newChildName,
        description: newChildDescription,
        level: topic.level + 1,
        sort_order: topic.children.length + 1,
        created_by: user.id,
      });
      
      // Reload topics from database
      const updatedTopics = await DatabaseService.getTopicsBySubject(subjectId);
      onUpdate(updatedTopics);
      
      setIsAddingChild(false);
      setNewChildName("");
      setNewChildDescription("");
    } catch (error) {
      console.error('Error creating topic:', error);
      alert('Error creating topic. Please try again.');
    } finally {
      setIsAddingChildLoading(false);
    }
  };

  const deleteTopic = async (topicId: string) => {
    if (confirm('Are you sure you want to delete this topic? This action cannot be undone.')) {
      try {
        await DatabaseService.deleteTopic(topicId);
        
        // Reload topics from database
        const updatedTopics = await DatabaseService.getTopicsBySubject(subjectId);
        onUpdate(updatedTopics);
      } catch (error) {
        console.error('Error deleting topic:', error);
        alert('Error deleting topic. Please try again.');
      }
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const saveEdit = () => {
    updateTopic(topic.id, { 
      name: editName, 
      description: editDescription 
    });
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditName(topic.name);
    setEditDescription(topic.description);
    setIsEditing(false);
  };

  const getIndentStyle = () => {
    return {
      marginLeft: `${topic.level * 24}px`,
      borderLeft: topic.level > 0 ? `2px solid #374151` : 'none',
      paddingLeft: topic.level > 0 ? '16px' : '0'
    };
  };

  return (
    <div style={getIndentStyle()} className="relative">
      {/* Topic Card */}
      <div className="bg-dark-700 rounded-lg p-4 hover:bg-dark-600 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {/* Expand/Collapse Button */}
            {topic.children.length > 0 && (
              <button
                onClick={toggleExpanded}
                className="text-dark-400 hover:text-white transition-colors"
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            )}
            
            {/* Topic Icon */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              topic.hasFlow ? 'bg-green-500/20 text-green-400' : 'bg-dark-600 text-dark-400'
            }`}>
              {topic.hasFlow ? '✓' : '○'}
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
                    <span className="text-xs text-dark-500">Level {topic.level}</span>
                    {topic.hasFlow && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                        Has Flow
                      </span>
                    )}
                    {topic.children.length > 0 && (
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
                  ✓
                </button>
                <button
                  onClick={cancelEdit}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  ✕
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                  title="Edit topic"
                >
                  ✏️
                </button>
                <button
                  onClick={() => setIsAddingChild(true)}
                  className="text-primary-400 hover:text-primary-300 transition-colors"
                  title="Add subtopic"
                >
                  ➕
                </button>
                <button
                  onClick={() => deleteTopic(topic.id)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                  title="Delete topic"
                >
                  🗑️
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
                  <span>{isAddingChildLoading ? 'Adding...' : 'Add Subtopic'}</span>
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
      {isExpanded && topic.children.length > 0 && (
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

const SubjectBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const { sidebarCollapsed } = useSidebar();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [currentStep, setCurrentStep] = useState(1);
  const [viewMode, setViewMode] = useState<"tabs" | "stepper">("tabs");
  const [subject, setSubject] = useState<Subject | null>(null);
  const [flowNodes, setFlowNodes] = useState<FlowNode[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [topics, setTopics] = useState<TopicWithChildren[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicDescription, setNewTopicDescription] = useState("");


  // Load subject and topics data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
    if (subjectId) {
          // Check if subjectId is a valid UUID format
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(subjectId)) {
            console.log('Invalid subject ID format, loading available subjects');
            // Load all available subjects instead
            const allSubjects = await DatabaseService.getSubjects();
            setAvailableSubjects(allSubjects);
            setSubject(null);
            setTopics([]);
            setIsLoading(false);
            return;
          }
          
          // Load subject data
          const subjectData = await DatabaseService.getSubjectById(subjectId);
          if (subjectData) {
            setSubject(subjectData);
            
            // Load topics for this subject
            const topicsData = await DatabaseService.getTopicsBySubject(subjectId);
            setTopics(topicsData);
          }
        } else {
          // Load all available subjects for selection
          const allSubjects = await DatabaseService.getSubjects();
          setAvailableSubjects(allSubjects);
          setSubject(null);
          setTopics([]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
    setIsLoading(false);
      }
    };

    loadData();
  }, [subjectId]);

  const steps = [
    { id: 1, name: "Subject Basics", icon: BookOpen, tabId: "overview" },
    { id: 2, name: "Topic Structure", icon: FileText, tabId: "topics" },
    { id: 3, name: "Flow Structure", icon: FileText, tabId: "flow" },
    { id: 4, name: "Content Creation", icon: Play, tabId: "content" },
    { id: 5, name: "Testing & Preview", icon: Eye, tabId: "preview" },
    { id: 6, name: "Publish", icon: CheckCircle, tabId: "settings" },
  ];

  const tabs = [
    { id: "overview", name: "Overview", icon: BookOpen, stepId: 1 },
    { id: "topics", name: "Topics", icon: FileText, stepId: 2 },
    { id: "flow", name: "Flow Builder", icon: FileText, stepId: 3 },
    { id: "content", name: "Content Library", icon: Play, stepId: 4 },
    { id: "settings", name: "Settings", icon: Settings, stepId: 6 },
    { id: "preview", name: "Preview", icon: Eye, stepId: 5 },
  ];

  // Synchronize tab and step navigation
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      setCurrentStep(tab.stepId);
    }
  };

  const handleStepChange = (stepId: number) => {
    setCurrentStep(stepId);
    const step = steps.find(s => s.id === stepId);
    if (step) {
      setActiveTab(step.tabId);
    }
  };

  const handleSave = async () => {
    if (!subject) return;
    
    setIsSaving(true);
    try {
      if (subjectId) {
        // Update existing subject
        await DatabaseService.updateSubject(subjectId, {
          name: subject.name,
          description: subject.description,
          icon: subject.icon,
          color: subject.color,
        });
      } else {
        // Create new subject
        const newSubject = await DatabaseService.createSubject({
          name: subject.name,
          description: subject.description,
          icon: subject.icon,
          color: subject.color,
        });
        setSubject(newSubject);
        // Navigate to the new subject
        navigate(`/admin/subject-builder/${newSubject.id}`);
      }
      alert("Subject saved successfully!");
    } catch (error) {
      console.error('Error saving subject:', error);
      alert("Error saving subject. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (flowNodes.length === 0) {
      alert("Please create at least one learning node before publishing.");
      return;
    }
    
    setIsSaving(true);
    // Simulate publish operation
    setTimeout(() => {
      setIsSaving(false);
      alert("Subject published successfully! (Local state only)");
      navigate("/admin/subjects");
    }, 1500);
  };

  const addNewTopic = async () => {
    if (!subject || !newTopicName.trim()) return;
    
    if (!user) {
      alert("You must be logged in to create topics.");
      return;
    }
    
    try {
      await DatabaseService.createTopic({
        subject_id: subject.id,
        name: newTopicName,
        description: newTopicDescription,
        level: 0,
        sort_order: topics.length + 1,
        created_by: user.id,
      });
      
      // Reload topics from database
      const updatedTopics = await DatabaseService.getTopicsBySubject(subject.id);
      setTopics(updatedTopics);
      
      setIsAddingTopic(false);
      setNewTopicName("");
      setNewTopicDescription("");
    } catch (error) {
      console.error('Error creating topic:', error);
      alert('Error creating topic. Please try again.');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="bg-dark-800 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    value={subject.name}
                    onChange={(e) =>
                      setSubject({ ...subject, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter subject name"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">
                    Category *
                  </label>
                  <select
                    value={subject.category}
                    onChange={(e) =>
                      setSubject({ ...subject, category: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select category</option>
                    <option value="programming">Programming</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="science">Science</option>
                    <option value="language">Language</option>
                    <option value="business">Business</option>
                    <option value="design">Design</option>
                    <option value="marketing">Marketing</option>
                    <option value="data-science">Data Science</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-white font-medium mb-2">
                  Description *
                </label>
                <textarea
                  value={subject.description}
                  onChange={(e) =>
                    setSubject({ ...subject, description: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 h-32 resize-none"
                  placeholder="Describe what students will learn in this subject"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Difficulty Level *
                  </label>
                  <select
                    value={subject.difficulty}
                    onChange={(e) =>
                      setSubject({ ...subject, difficulty: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">
                    Subject Icon
                  </label>
                  <div className="flex space-x-2">
                    {["📚", "💻", "🧮", "🔬", "🌍", "🎨", "📊", "🚀"].map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setSubject({ ...subject, icon })}
                        className={`w-12 h-12 text-2xl rounded-lg border-2 ${
                          subject.icon === icon ? "border-primary-500 bg-primary-500/20" : "border-dark-600 hover:border-dark-500"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Branding */}
            <div className="bg-dark-800 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Visual Branding</h3>
              
              <div>
                <label className="block text-white font-medium mb-4">
                  Subject Color Theme *
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {[
                    ["#667eea", "#764ba2"],
                    ["#f093fb", "#f5576c"],
                    ["#4ecdc4", "#44a08d"],
                    ["#ff6b6b", "#ee5a24"],
                    ["#45b7d1", "#96ceb4"],
                    ["#f7df1e", "#000000"],
                    ["#61dafb", "#282c34"],
                    ["#339933", "#ffffff"],
                    ["#ff6b35", "#f7931e"],
                    ["#667eea", "#f093fb"],
                  ].map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSubject({ ...subject, color })}
                      className={`w-16 h-16 rounded-xl border-2 ${
                        subject.color[0] === color[0] ? "border-white scale-110" : "border-dark-600 hover:border-dark-500"
                      } transition-all duration-200`}
                      style={{
                        background: `linear-gradient(135deg, ${color[0]}, ${color[1]})`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-dark-800 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Preview</h3>
              
              <div className="max-w-md">
                <div
                  className="p-6 rounded-2xl text-white"
                  style={{
                    background: `linear-gradient(135deg, ${subject.color[0]}, ${subject.color[1]})`,
                  }}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">{subject.icon}</span>
                    <div>
                      <h4 className="text-lg font-semibold">{subject.name}</h4>
                      <p className="text-white/80 text-sm">{subject.category}</p>
                    </div>
                  </div>
                  <p className="text-white/90 text-sm mb-3">{subject.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                      {subject.difficulty}
                    </span>
                    <span className="text-xs text-white/70">
                      {flowNodes.length} learning nodes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "topics":
        return (
          <div className="space-y-6">
            <div className="bg-dark-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-white">Topic Hierarchy</h3>
                  <p className="text-dark-400 mt-1">
                    Organize your subject into topics, subtopics, and sub-subtopics with unlimited depth
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
                <div className="bg-dark-700 rounded-lg p-4 border border-dark-600">
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
                        onClick={addNewTopic}
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
                    onUpdate={setTopics}
                    allTopics={topics}
                    subjectId={subject?.id || ""}
                    user={user}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case "flow":
        return (
          <FlowBuilder
            nodes={flowNodes}
            onNodesChange={setFlowNodes}
            subjectName={subject?.name || ""}
            sidebarCollapsed={sidebarCollapsed}
            topics={topics}
            onTopicsChange={setTopics}
            subjectId={subject?.id || ""}
            onSubjectChange={(topicId) => {
              // Handle topic change - you can update the subject name or other properties
              console.log("Topic changed to:", topicId);
            }}
            currentFlowId={undefined} // Will be set when flow is created
          />
        );

      case "content":
        return (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Content Library
            </h3>
            <p className="text-dark-400">
              Manage reusable content assets, media files, and templates.
            </p>
          </div>
        );

      case "settings":
        return (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Advanced Settings
            </h3>
            <p className="text-dark-400">
              Configure advanced subject settings, prerequisites, and analytics.
            </p>
          </div>
        );

      case "preview":
        return (
          <div className="text-center py-12">
            <Eye className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Student Preview
            </h3>
            <p className="text-dark-400">
              Preview how students will experience this subject.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Subject Builder...</p>
        </div>
      </div>
    );
  }

  // Show subject selection if no subject is selected
  if (!subject && availableSubjects.length > 0) {
    return (
      <div className="min-h-screen bg-dark-950">
        <div className="bg-dark-900 border-b border-dark-800">
          <div className="px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/admin/subjects")}
                className="text-dark-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Select a Subject</h1>
                <p className="text-dark-400">Choose a subject to edit or create a new one</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableSubjects.map((subj) => (
              <div
                key={subj.id}
                onClick={() => navigate(`/admin/subject-builder/${subj.id}`)}
                className="bg-dark-800 rounded-xl p-6 cursor-pointer hover:bg-dark-700 transition-colors border border-dark-700 hover:border-primary-500"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: subj.color }}
                  >
                    {subj.icon || "📚"}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{subj.name}</h3>
                    <p className="text-dark-400 text-sm">{subj.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-dark-500">
                    {subj.is_active ? "Active" : "Inactive"}
                  </span>
                  <button className="text-primary-500 hover:text-primary-400 text-sm font-medium">
                    Edit Subject →
                  </button>
                </div>
              </div>
            ))}
            
            {/* Create New Subject Card */}
            <div
              onClick={() => navigate("/admin/subject-builder")}
              className="bg-dark-800 rounded-xl p-6 cursor-pointer hover:bg-dark-700 transition-colors border-2 border-dashed border-dark-600 hover:border-primary-500 flex items-center justify-center"
            >
              <div className="text-center">
                <Plus className="w-8 h-8 text-dark-400 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-white mb-1">Create New Subject</h3>
                <p className="text-dark-400 text-sm">Start building a new learning path</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <div className="bg-dark-900 border-b border-dark-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/admin/subjects")}
                className="text-dark-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {subject?.name || "New Subject"}
                </h1>
                <p className="text-dark-400">
                  Build your learning flow and content
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* View Mode Toggle */}
              <div className="flex bg-dark-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("tabs")}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    viewMode === "tabs" 
                      ? "bg-primary-500 text-white" 
                      : "text-dark-400 hover:text-white"
                  }`}
                >
                  Tabs
                </button>
                <button
                  onClick={() => setViewMode("stepper")}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    viewMode === "stepper" 
                      ? "bg-primary-500 text-white" 
                      : "text-dark-400 hover:text-white"
                  }`}
                >
                  Stepper
                </button>
              </div>
              
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </div>
                )}
              </button>
              <button
                onClick={handlePublish}
                disabled={isSaving}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper - Only show when in stepper mode */}
      {viewMode === "stepper" && (
        <div className="bg-dark-900 border-b border-dark-800">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <button
                      onClick={() => handleStepChange(step.id)}
                      className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                        isActive
                          ? "bg-primary-500 text-white"
                          : isCompleted
                          ? "bg-green-500 text-white hover:bg-green-600"
                          : "bg-dark-800 text-dark-400 hover:bg-dark-700 hover:text-white"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{step.name}</span>
                    </button>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-0.5 bg-dark-700 mx-2" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tabs - Only show when in tabs mode */}
      {viewMode === "tabs" && (
        <div className="bg-dark-900 border-b border-dark-800">
          <div className="px-6">
            <div className="flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-dark-800 text-white border-b-2 border-primary-500"
                        : "text-dark-400 hover:text-white hover:bg-dark-800"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {renderTabContent()}
        </div>
      </div>

      {/* Stepper Navigation - Only show when in stepper mode */}
      {viewMode === "stepper" && (
        <div className="bg-dark-900 border-t border-dark-800">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  if (currentStep > 1) {
                    handleStepChange(currentStep - 1);
                  }
                }}
                disabled={currentStep === 1}
                className="flex items-center space-x-2 px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="text-center">
                <p className="text-white font-medium">
                  Step {currentStep} of {steps.length}
                </p>
                <p className="text-dark-400 text-sm">
                  {steps.find(s => s.id === currentStep)?.name}
                </p>
              </div>

              <button
                onClick={() => {
                  if (currentStep < steps.length) {
                    handleStepChange(currentStep + 1);
                  }
                }}
                disabled={currentStep === steps.length}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectBuilder;
