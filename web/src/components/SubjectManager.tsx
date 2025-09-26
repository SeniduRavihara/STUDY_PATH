import { Edit, Plus, Trash2, X, Eye, CheckCircle, XCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DatabaseService } from "../lib/database";
import type { Subject } from "../lib/database";
import { useAuth } from "../contexts/AuthContext";

const SubjectManager: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "📚",
    color: "#00d4ff",
  });

  const colorPresets = [
    "#ff6b6b", // Red
    "#4ecdc4", // Teal
    "#45b7d1", // Blue
    "#96ceb4", // Green
    "#ff9ff3", // Pink
    "#a8e6cf", // Light Green
    "#ffaaa5", // Coral
    "#dcedc1", // Mint
    "#00d4ff", // Cyan
    "#667eea", // Purple
  ];

  const iconPresets = [
    "📚",
    "📐",
    "⚡",
    "🧪",
    "🧬",
    "🌍",
    "🔬",
    "💻",
    "🎨",
    "🎵",
    "🏛️",
    "📖",
    "✏️",
    "🔢",
    "📊",
    "🎯",
  ];

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      // Fetch ALL subjects from database (including unpublished ones for admin)
      const allSubjects = await DatabaseService.getAllSubjects();
      setSubjects(allSubjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("You must be logged in to create subjects.");
      return;
    }

    try {
      // Create subject in database
      const newSubject = await DatabaseService.createSubject({
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        color: formData.color,
        created_by: user.id,
      });

      // Refresh subjects list
      await fetchSubjects();
      setShowCreateForm(false);
      resetForm();

      // Redirect to SubjectBuilder for enhanced flow creation
      navigate(`/admin/subject-builder/${newSubject.id}`);
    } catch (error) {
      console.error("Error creating subject:", error);
      alert("Error creating subject. Please try again.");
    }
  };

  const handleUpdateSubject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingSubject) return;

    try {
      // Update subject in database
      await DatabaseService.updateSubject(editingSubject.id, {
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        color: formData.color,
      });

      // Refresh subjects list
      await fetchSubjects();
      setShowCreateForm(false);
      setEditingSubject(null);
      resetForm();

      alert("Subject updated successfully!");
    } catch (error) {
      console.error("Error updating subject:", error);
      alert("Error updating subject. Please try again.");
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this subject? This will also delete all associated topics and flows.",
      )
    )
      return;

    try {
      // Delete subject from database
      await DatabaseService.deleteSubject(id);

      // Refresh subjects list
      await fetchSubjects();
      alert("Subject deleted successfully!");
    } catch (error) {
      console.error("Error deleting subject:", error);
      alert("Error deleting subject. Please try again.");
    }
  };

  const handleEditSubject = (subject: Subject) => {
    // Redirect to SubjectBuilder for enhanced editing
    navigate(`/admin/subject-builder/${subject.id}`);
  };

  const handleReviewSubject = (subject: Subject) => {
    // Redirect to SubjectBuilder in review mode
    navigate(`/admin/subject-builder/${subject.id}?mode=review`);
  };

  const handlePublishSubject = async (subjectId: string) => {
    try {
      await DatabaseService.updateSubject(subjectId, { is_active: true });
      await fetchSubjects();
      alert("Subject published successfully!");
    } catch (error) {
      console.error("Error publishing subject:", error);
      alert("Error publishing subject. Please try again.");
    }
  };

  const handleUnpublishSubject = async (subjectId: string) => {
    try {
      await DatabaseService.updateSubject(subjectId, { is_active: false });
      await fetchSubjects();
      alert("Subject unpublished successfully!");
    } catch (error) {
      console.error("Error unpublishing subject:", error);
      alert("Error unpublishing subject. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      icon: "📚",
      color: "#00d4ff",
    });
    setEditingSubject(null);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Subject Manager</h1>
          <p className="text-dark-400 mt-2">
            Create and manage subjects for organizing educational content
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Subject</span>
        </button>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map(subject => (
          <div
            key={subject.id}
            className="card group hover:scale-105 transition-transform duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{
                    backgroundColor: subject.color,
                  }}
                >
                  {subject.icon}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {subject.name}
                  </h3>
                  <p className="text-dark-400 text-sm">
                    {subject.description || "No description"}
                  </p>
                  <p className="text-dark-500 text-xs mt-1">
                    Created by: {subject.created_by === user?.id ? "You" : "Other User"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {/* Review button - available for all subjects */}
                <button
                  onClick={() => handleReviewSubject(subject)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                  title="Review"
                >
                  <Eye className="w-4 h-4" />
                </button>
                
                {/* Owner-only buttons */}
                {subject.created_by === user?.id && (
                  <>
                <button
                  onClick={() => handleEditSubject(subject)}
                  className="text-dark-400 hover:text-white transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                    
                    {/* Publish/Unpublish buttons */}
                    {subject.is_active ? (
                      <button
                        onClick={() => handleUnpublishSubject(subject.id)}
                        className="text-orange-400 hover:text-orange-300 transition-colors"
                        title="Unpublish"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePublishSubject(subject.id)}
                        className="text-green-400 hover:text-green-300 transition-colors"
                        title="Publish"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    
                <button
                  onClick={() => handleDeleteSubject(subject.id)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                  </>
                )}
              </div>
            </div>

            {subject.description && (
              <p className="text-dark-300 text-sm mb-4 line-clamp-3">
                {subject.description}
              </p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
              <span
                  className={`px-2 py-1 rounded-full text-xs font-medium border ${
                    subject.is_active 
                      ? "bg-green-500/10 text-green-500 border-green-500/20" 
                      : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                  }`}
                >
                  {subject.is_active ? "Published" : "Draft"}
              </span>
              </div>
              <span className="text-dark-400 text-sm">
                {new Date(subject.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingSubject ? "Edit Subject" : "Create Subject"}
              </h2>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
                className="text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form
              onSubmit={
                editingSubject ? handleUpdateSubject : handleCreateSubject
              }
              className="space-y-6"
            >
              {/* Name */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter subject name"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 h-24 resize-none"
                  placeholder="Describe what this subject covers"
                />
              </div>

              {/* Icon */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-8 gap-2 p-4 bg-dark-800 border border-dark-700 rounded-lg">
                  {iconPresets.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon }))}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-colors ${
                        formData.icon === icon
                          ? "bg-primary-500 text-white"
                          : "bg-dark-700 text-dark-300 hover:bg-dark-600"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Color Theme
                </label>
                <div className="grid grid-cols-5 gap-2 p-4 bg-dark-800 border border-dark-700 rounded-lg">
                  {colorPresets.map((color, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-12 h-12 rounded-lg transition-transform ${
                        formData.color === color
                          ? "scale-110 ring-2 ring-white"
                          : "hover:scale-105"
                      }`}
                      style={{
                        backgroundColor: color,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Difficulty Level
                </label>
                <select
                  value={formData.difficulty}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      difficulty: e.target.value as
                        | "Beginner"
                        | "Intermediate"
                        | "Advanced",
                    }))
                  }
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Preview
                </label>
                <div className="p-4 bg-dark-800 border border-dark-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{
                        backgroundColor: formData.color,
                      }}
                    >
                      {formData.icon}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">
                        {formData.name || "Subject Name"}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(formData.difficulty)}`}
                      >
                        {formData.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                  className="px-6 py-3 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  {editingSubject ? "Update Subject" : "Create Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectManager;
