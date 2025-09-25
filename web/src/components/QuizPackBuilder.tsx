import {
  BookOpen,
  Edit,
  HelpCircle,
  Layers,
  Plus,
  Search,
  Trash2,
  X,
  CheckCircle,
  Clock,
  Target,
  Eye,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DatabaseService } from "../lib/database";
import type { TopicWithChildren, Subject } from "../lib/database";
import { useAuth } from "../contexts/AuthContext";

interface MCQ {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  topic_id?: string;
  subject_id: string;
}

interface QuizPack {
  id: string;
  title: string;
  description: string;
  topic_id: string;
  subject_id: string;
  difficulty: "easy" | "medium" | "hard";
  mcq_count: number;
  mcq_ids: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface QuizPackBuilderProps {
  subject: Subject;
  topics: TopicWithChildren[];
  onTopicsChange: (topics: TopicWithChildren[]) => void;
  sidebarCollapsed: boolean;
}

const QuizPackBuilder: React.FC<QuizPackBuilderProps> = ({
  subject,
  topics,
  onTopicsChange,
  sidebarCollapsed,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [quizPacks, setQuizPacks] = useState<QuizPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPack, setEditingPack] = useState<QuizPack | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedTopicForPack, setSelectedTopicForPack] = useState<TopicWithChildren | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    topic_id: "",
    difficulty: "medium" as "easy" | "medium" | "hard",
    selectedMcqs: [] as string[],
  });


  useEffect(() => {
    fetchData();
  }, [subject.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch MCQs for this subject
      const mcqsData = await DatabaseService.getMCQsBySubject(subject.id);
      setMcqs(mcqsData);
      
      // Fetch quiz packs for this subject
      const quizPacksData = await DatabaseService.getQuizPacksBySubject(subject.id);
      setQuizPacks(quizPacksData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePack = async () => {
    if (!user?.id) {
      alert("You must be logged in to create quiz packs.");
      return;
    }

    try {
      console.log("Creating quiz pack with data:", {
        title: formData.title,
        description: formData.description,
        topic_id: formData.topic_id,
        subject_id: subject.id,
        difficulty: formData.difficulty,
        mcq_ids: [],
        created_by: user.id,
      });
      
      const newPack = await DatabaseService.createQuizPack({
        title: formData.title,
        description: formData.description,
        topic_id: formData.topic_id,
        subject_id: subject.id,
        difficulty: formData.difficulty,
        mcq_ids: [], // Start with empty MCQs
        created_by: user.id, // Use actual user ID
      });
      
      console.log("Quiz pack created successfully:", newPack);
      setQuizPacks([...quizPacks, newPack]);
      setShowCreateForm(false);
      resetForm();
    } catch (error) {
      console.error("Error creating quiz pack:", error);
      console.error("Full error details:", JSON.stringify(error, null, 2));
      alert(`Error creating quiz pack: ${error.message || 'Unknown error'}`);
    }
  };

  const handleUpdatePack = async () => {
    if (!editingPack) return;
    
    try {
      const updatedPack = await DatabaseService.updateQuizPack(editingPack.id, {
        title: formData.title,
        description: formData.description,
        topic_id: formData.topic_id,
        difficulty: formData.difficulty,
        mcq_ids: formData.selectedMcqs,
      });
      
      setQuizPacks(quizPacks.map(pack => 
        pack.id === editingPack.id ? updatedPack : pack
      ));
      setEditingPack(null);
      resetForm();
    } catch (error) {
      console.error("Error updating quiz pack:", error);
      alert("Error updating quiz pack. Please try again.");
    }
  };

  const handleDeletePack = async (packId: string) => {
    if (confirm("Are you sure you want to delete this quiz pack?")) {
      try {
        await DatabaseService.deleteQuizPack(packId);
        setQuizPacks(quizPacks.filter(pack => pack.id !== packId));
      } catch (error) {
        console.error("Error deleting quiz pack:", error);
        alert("Error deleting quiz pack. Please try again.");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      topic_id: "",
      difficulty: "medium",
      selectedMcqs: [],
    });
    setSelectedTopicForPack(null);
  };


  const startEditing = (pack: QuizPack) => {
    setEditingPack(pack);
    setFormData({
      title: pack.title,
      description: pack.description,
      topic_id: pack.topic_id,
      difficulty: pack.difficulty,
      selectedMcqs: pack.mcq_ids,
    });
    
    // Find the topic for this pack
    const topic = findTopicById(topics, pack.topic_id);
    setSelectedTopicForPack(topic);
    setShowCreateForm(true);
  };

  const findTopicById = (topics: TopicWithChildren[], topicId: string): TopicWithChildren | null => {
    for (const topic of topics) {
      if (topic.id === topicId) return topic;
      if (topic.children.length > 0) {
        const found = findTopicById(topic.children, topicId);
        if (found) return found;
      }
    }
    return null;
  };

  const getTopicPath = (topicId: string): string => {
    const topic = findTopicById(topics, topicId);
    if (!topic) return "Unknown Topic";
    
    const path = [topic.name];
    let current = topic;
    
    // Build path from root to current topic
    while (current.parent_id) {
      const parent = findTopicById(topics, current.parent_id);
      if (parent) {
        path.unshift(parent.name);
        current = parent;
      } else {
        break;
      }
    }
    
    return path.join(" → ");
  };

  const filteredQuizPacks = quizPacks.filter(pack => {
    const matchesSearch = pack.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pack.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = !selectedTopic || pack.topic_id === selectedTopic;
    const matchesDifficulty = !selectedDifficulty || pack.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesTopic && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-400 bg-green-500/20";
      case "medium": return "text-yellow-400 bg-yellow-500/20";
      case "hard": return "text-red-400 bg-red-500/20";
      default: return "text-gray-400 bg-gray-500/20";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Quiz Packs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">Quiz Pack Builder</h3>
          <p className="text-dark-400 mt-1">
            Create quiz packs for topics in {subject.name}
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreateForm(true);
            setEditingPack(null);
            resetForm();
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Quiz Pack</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-dark-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm">Total Quiz Packs</p>
              <p className="text-2xl font-bold text-white">{quizPacks.length}</p>
            </div>
            <HelpCircle className="w-8 h-8 text-primary-500" />
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm">Available MCQs</p>
              <p className="text-2xl font-bold text-white">{mcqs.length}</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm">Topics</p>
              <p className="text-2xl font-bold text-white">{topics.length}</p>
            </div>
            <Layers className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm">Total Questions</p>
              <p className="text-2xl font-bold text-white">
                {quizPacks.reduce((sum, pack) => sum + pack.mcq_count, 0)}
              </p>
            </div>
            <Target className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-dark-800 rounded-xl p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search quiz packs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Topics</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Quiz Packs List */}
      <div className="space-y-4">
        {filteredQuizPacks.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Quiz Packs Found
            </h3>
            <p className="text-dark-400">
              {quizPacks.length === 0 
                ? "Create your first quiz pack to get started."
                : "Try adjusting your search filters."
              }
            </p>
          </div>
        ) : (
          filteredQuizPacks.map((pack) => (
            <div key={pack.id} className="bg-dark-800 rounded-xl p-6 hover:bg-dark-700 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-white">{pack.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(pack.difficulty)}`}>
                      {pack.difficulty}
                    </span>
                  </div>
                  <p className="text-dark-400 mb-3">{pack.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-dark-500">
                    <div className="flex items-center space-x-1">
                      <Layers className="w-4 h-4" />
                      <span>{getTopicPath(pack.topic_id)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target className="w-4 h-4" />
                      <span>{pack.mcq_count} questions</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Updated {new Date(pack.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      console.log("Navigating to quiz pack:", pack.id);
                      console.log("Navigation URL:", `/admin/quiz-pack/${pack.id}`);
                      navigate(`/admin/quiz-pack/${pack.id}`);
                    }}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center space-x-1"
                    title="Customize this quiz pack"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Customize</span>
                  </button>
                  <button
                    onClick={() => startEditing(pack)}
                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors"
                    title="Edit quiz pack"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePack(pack.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                    title="Delete quiz pack"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                {editingPack ? "Edit Quiz Pack" : "Create New Quiz Pack"}
              </h3>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingPack(null);
                  resetForm();
                }}
                className="text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter quiz pack title"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 h-24 resize-none"
                  placeholder="Describe this quiz pack"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Topic *</label>
                  <select
                    value={formData.topic_id}
                    onChange={(e) => {
                      setFormData({ ...formData, topic_id: e.target.value });
                      const topic = findTopicById(topics, e.target.value);
                      setSelectedTopicForPack(topic);
                    }}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select a topic</option>
                    {topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Difficulty *</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as "easy" | "medium" | "hard" })}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>


              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingPack(null);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingPack ? handleUpdatePack : handleCreatePack}
                  disabled={!formData.title || !formData.topic_id}
                  className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{editingPack ? "Update Pack" : "Create Pack"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default QuizPackBuilder;
