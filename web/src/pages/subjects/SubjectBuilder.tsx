import {
  ArrowLeft,
  BookOpen,
  Eye,
  FileText,
  Plus,
  Save,
  Settings,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useSidebar } from "../../contexts/SidebarContext";
import { SubjectService, TopicService } from "../../services";
import type {
  FlowNode,
  Subject,
  TopicWithChildren,
} from "../../types/database";
import FlowTab from "./FlowTab";
import OverviewTab from "./OverviewTab";
import PreviewTab from "./PreviewTab";
import SettingsTab from "./SettingsTab";
import TopicsTab from "./TopicsTab";

const SubjectBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { sidebarCollapsed } = useSidebar();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "overview"
  );
  // Removed stepper logic, only tab view is used
  const [subject, setSubject] = useState<Subject | null>(null);
  const [flowNodes, setFlowNodes] = useState<FlowNode[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [topics, setTopics] = useState<TopicWithChildren[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicDescription, setNewTopicDescription] = useState("");

  // Sync activeTab with URL parameter
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Load subject and topics data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        if (subjectId) {
          // Check if subjectId is a valid UUID format
          const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(subjectId)) {
            console.log(
              "Invalid subject ID format, loading available subjects"
            );
            // Load all available subjects instead
            const allSubjects = await SubjectService.getSubjects();
            setAvailableSubjects(allSubjects);
            setSubject(null);
            setTopics([]);
            setIsLoading(false);
            return;
          }

          // Save this subject as the currently working one
          localStorage.setItem("lastSelectedSubject", subjectId);

          // Load subject data
          const subjectData = await SubjectService.getSubjectById(subjectId);
          if (subjectData) {
            setSubject(subjectData);

            // Load topics for this subject
            const topicsData = await TopicService.getTopicsBySubject(subjectId);
            setTopics(topicsData);
          }
        } else {
          // Load all available subjects for selection
          const allSubjects = await SubjectService.getSubjects();
          setAvailableSubjects(allSubjects);

          // Check if we have a last selected subject
          const lastSubjectId = localStorage.getItem("lastSelectedSubject");
          if (
            lastSubjectId &&
            allSubjects.some((s) => s.id === lastSubjectId)
          ) {
            // Automatically navigate to the last selected subject
            navigate(`/admin/subject-builder/${lastSubjectId}`);
            return;
          }

          setSubject(null);
          setTopics([]);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [subjectId]);

  // Removed steps for stepper view

  const tabs = [
    { id: "overview", name: "Overview", icon: BookOpen, stepId: 1 },
    { id: "topics", name: "Topics", icon: FileText, stepId: 2 },
    { id: "flow", name: "Flow Builder", icon: FileText, stepId: 3 },
    { id: "preview", name: "Preview", icon: Eye, stepId: 4 },
    { id: "settings", name: "Settings", icon: Settings, stepId: 5 },
  ];

  // Synchronize tab navigation
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Update URL with tab parameter
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("tab", tabId);
    setSearchParams(newSearchParams);
  };

  const handleSave = async () => {
    if (!subject) return;

    setIsSaving(true);
    try {
      if (subjectId) {
        // Update existing subject
        await SubjectService.updateSubject(subjectId, {
          name: subject.name,
          description: subject.description,
          icon: subject.icon,
          color: subject.color,
        });
      } else {
        // Create new subject
        const newSubject = await SubjectService.createSubject({
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
      console.error("Error saving subject:", error);
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
    try {
      // Update subject status in the database
      await SubjectService.updateSubject(subjectId, { status: "published" });
      // Optionally: save flowNodes to the database here

      setIsSaving(false);
      alert("Subject published successfully!");
      navigate("/admin/subjects");
    } catch (error) {
      setIsSaving(false);
      alert("Error publishing subject. Please try again.");
    }
  };

  const addNewTopic = async () => {
    if (!subject || !newTopicName.trim()) return;

    if (!user) {
      alert("You must be logged in to create topics.");
      return;
    }

    try {
      await TopicService.createTopic({
        subject_id: subject.id,
        name: newTopicName,
        description: newTopicDescription,
        level: 0,
        sort_order: topics.length + 1,
        created_by: user.id,
      });

      // Reload topics from database
      const updatedTopics = await TopicService.getTopicsBySubject(subject.id);
      setTopics(updatedTopics);

      setIsAddingTopic(false);
      setNewTopicName("");
      setNewTopicDescription("");
    } catch (error) {
      console.error("Error creating topic:", error);
      alert("Error creating topic. Please try again.");
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            subject={subject}
            onSubjectChange={setSubject}
            onSave={handleSave}
            isSaving={isSaving}
            onPublish={handlePublish}
          />
        );

      case "topics":
        return (
          <TopicsTab
            topics={topics}
            onTopicsChange={setTopics}
            isAddingTopic={isAddingTopic}
            setIsAddingTopic={setIsAddingTopic}
            newTopicName={newTopicName}
            setNewTopicName={setNewTopicName}
            newTopicDescription={newTopicDescription}
            setNewTopicDescription={setNewTopicDescription}
            onAddTopic={addNewTopic}
            subjectId={subject?.id || ""}
            user={user}
          />
        );

      case "flow":
        return (
          <FlowTab
            nodes={flowNodes}
            onNodesChange={setFlowNodes}
            subjectName={subject?.name || ""}
            sidebarCollapsed={sidebarCollapsed}
            topics={topics}
            onTopicsChange={setTopics}
            subjectId={subject?.id || ""}
            onSubjectChange={(topicId) => {
              console.log("Topic changed to:", topicId);
            }}
          />
        );

      case "settings":
        return <SettingsTab />;

      case "preview":
        return <PreviewTab />;

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
                <h1 className="text-2xl font-bold text-white">
                  Select a Subject
                </h1>
                <p className="text-dark-400">
                  Choose a subject to edit or create a new one
                </p>
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
                    <h3 className="text-lg font-semibold text-white">
                      {subj.name}
                    </h3>
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
                <h3 className="text-lg font-semibold text-white mb-1">
                  Create New Subject
                </h3>
                <p className="text-dark-400 text-sm">
                  Start building a new learning path
                </p>
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
              {/* Removed view mode toggle, only tabs are shown */}

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

      {/* Tabs UI */}
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

      {/* Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default SubjectBuilder;
