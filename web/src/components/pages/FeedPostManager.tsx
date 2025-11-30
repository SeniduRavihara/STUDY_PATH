import {
  BookOpen,
  Edit,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  MessageSquare,
  Plus,
  Star,
  Trash2,
  Trophy,
  Upload,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import { AuthService } from "../../services/authService";
import { FeedService, type PostContext } from "../../services/feedService";
import { SubjectService } from "../../services/subjectService";

interface FeedPost {
  id: string;
  content: string;
  type:
    | "achievement"
    | "question"
    | "milestone"
    | "tip"
    | "quiz_pack"
    | "lesson_pack";
  subject: string | null;
  achievement: string | null;
  points_earned: number;
  likes: number;
  comments: number;
  media_url: string | null;
  pack_data: Record<string, unknown> | null;
  priority?: number;
  post_context?: PostContext | null;
  created_at: string;
  users: {
    id: string;
    email: string;
    name: string;
  };
}

interface Subject {
  id: string;
  name: string;
  color: string | null;
}

const FeedPostManager: React.FC = () => {
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPost, setEditingPost] = useState<FeedPost | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    content: "",
    type: "tip" as FeedPost["type"],
    subject: "",
    achievement: "",
    points_earned: 0,
    media_url: "",
    priority: 0,
    activity_type: "post" as string,
    activity_data: {} as any,
    post_context: {
      target_subjects: [] as string[],
      target_topics: [] as string[],
      difficulty: null as "easy" | "medium" | "hard" | null,
      learning_stage: null as "beginner" | "intermediate" | "advanced" | null,
      node_types: [] as string[],
      show_to_all: true,
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [feedPostsRes, subjectsRes] = await Promise.all([
        FeedService.getFeedPosts(),
        SubjectService.getSubjects(),
      ]);

      if (feedPostsRes.data) {
        setFeedPosts(feedPostsRes.data);
      }
      if (subjectsRes) {
        setSubjects(subjectsRes);
        // Load all topics for all subjects
        const allTopics: any[] = [];
        for (const subject of subjectsRes) {
          const topicsData = await SubjectService.getSubjectTopics(subject.id);
          if (topicsData) {
            allTopics.push(
              ...topicsData.map((t: any) => ({
                ...t,
                subject_id: subject.id,
                subject_name: subject.name,
              }))
            );
          }
        }
        setTopics(allTopics);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      // Upload to Supabase storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `feed-posts/${fileName}`;

      const { error } = await supabase.storage
        .from("feed-media")
        .upload(filePath, file);

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("feed-media").getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, media_url: publicUrl }));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error("User not authenticated");

      const postData = {
        content: formData.content,
        type: formData.type,
        subject: formData.subject || null,
        achievement: formData.achievement || null,
        points_earned: formData.points_earned,
        media_url: formData.media_url || null,
        user_id: user.id,
        likes: 0,
        comments: 0,
        priority: formData.priority,
        post_context: formData.post_context,
        activity_type: formData.activity_type,
        activity_data: formData.activity_data,
      };

      const { data, error } = await FeedService.createFeedPost(postData);
      if (error) throw error;
      setFeedPosts((prev) => [data, ...prev]);

      setShowCreateForm(false);
      resetForm();

      alert("Post created successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Error creating post. Please try again.");
    }
  };

  const handleEditPost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingPost) return;

    try {
      const updates = {
        content: formData.content,
        type: formData.type,
        subject: formData.subject || null,
        achievement: formData.achievement || null,
        points_earned: formData.points_earned,
        media_url: formData.media_url || null,
      };

      const { data, error } = await FeedService.updateFeedPost(
        editingPost.id,
        updates
      );
      if (error) throw error;

      setFeedPosts((prev) =>
        prev.map((post) => (post.id === editingPost.id ? data : post))
      );

      setEditingPost(null);
      resetForm();

      alert("Post updated successfully!");
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Error updating post. Please try again.");
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const { error } = await FeedService.deleteFeedPost(id);
      if (error) throw error;
      setFeedPosts((prev) => prev.filter((post) => post.id !== id));

      alert("Post deleted successfully!");
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Error deleting post. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      content: "",
      type: "tip",
      subject: "",
      achievement: "",
      points_earned: 0,
      media_url: "",
      priority: 0,
      activity_type: "post",
      activity_data: {},
      post_context: {
        target_subjects: [],
        target_topics: [],
        difficulty: null,
        learning_stage: null,
        node_types: [],
        show_to_all: true,
      },
    });
    setEditingPost(null);
  };

  const startEdit = (post: FeedPost) => {
    setFormData({
      content: post.content,
      type: post.type,
      subject: post.subject || "",
      achievement: post.achievement || "",
      points_earned: post.points_earned,
      media_url: post.media_url || "",
      priority: post.priority || 0,
      activity_type: (post as any).activity_type || "post",
      activity_data: (post as any).activity_data || {},
      post_context: {
        target_subjects: post.post_context?.target_subjects || [],
        target_topics: post.post_context?.target_topics || [],
        difficulty: post.post_context?.difficulty || null,
        learning_stage: post.post_context?.learning_stage || null,
        node_types: post.post_context?.node_types || [],
        show_to_all: post.post_context?.show_to_all ?? true,
      },
    });
    setEditingPost(post);
    setShowCreateForm(true);
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case "achievement":
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case "question":
        return <HelpCircle className="w-5 h-5 text-blue-500" />;
      case "milestone":
        return <Star className="w-5 h-5 text-green-500" />;
      case "tip":
        return <BookOpen className="w-5 h-5 text-purple-500" />;
      case "quiz_pack":
        return <HelpCircle className="w-5 h-5 text-orange-500" />;
      case "lesson_pack":
        return <FileText className="w-5 h-5 text-indigo-500" />;
      default:
        return <MessageSquare className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case "achievement":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "question":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "milestone":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "tip":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "quiz_pack":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "lesson_pack":
        return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const filteredPosts =
    filterType === "all"
      ? feedPosts
      : feedPosts.filter((post) => post.type === filterType);

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Feed Posts Management
          </h1>
          <p className="text-dark-300 mt-1">
            Create and manage feed posts for the learning platform
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateForm(true);
          }}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Post
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterType("all")}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filterType === "all"
              ? "bg-primary-600 text-white"
              : "bg-dark-700 text-dark-300 hover:bg-dark-600"
          }`}
        >
          All
        </button>
        {[
          "achievement",
          "question",
          "milestone",
          "tip",
          "quiz_pack",
          "lesson_pack",
        ].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filterType === type
                ? "bg-primary-600 text-white"
                : "bg-dark-700 text-dark-300 hover:bg-dark-600"
            }`}
          >
            {type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingPost ? "Edit Post" : "Create New Post"}
              </h2>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
                className="text-dark-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form
              onSubmit={editingPost ? handleEditPost : handleCreatePost}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white placeholder-dark-400 focus:outline-none focus:border-primary-500"
                  rows={4}
                  placeholder="Enter post content..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as FeedPost["type"],
                      })
                    }
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="tip">Tip</option>
                    <option value="achievement">Achievement</option>
                    <option value="question">Question</option>
                    <option value="milestone">Milestone</option>
                    <option value="quiz_pack">Quiz Pack</option>
                    <option value="lesson_pack">Lesson Pack</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.name}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Achievement
                  </label>
                  <input
                    type="text"
                    value={formData.achievement}
                    onChange={(e) =>
                      setFormData({ ...formData, achievement: e.target.value })
                    }
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white placeholder-dark-400 focus:outline-none focus:border-primary-500"
                    placeholder="Achievement title (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Points Earned
                  </label>
                  <input
                    type="number"
                    value={formData.points_earned}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        points_earned: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white placeholder-dark-400 focus:outline-none focus:border-primary-500"
                    min="0"
                  />
                </div>
              </div>

              {/* Activity Type Selector */}
              <div className="bg-dark-700 p-4 rounded-lg">
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Activity Type
                </label>
                <select
                  value={formData.activity_type}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      activity_type: e.target.value,
                      activity_data: {},
                    });
                  }}
                  className="w-full bg-dark-600 border border-dark-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                >
                  <option value="post">Regular Post</option>
                  <option value="poll">Poll</option>
                  <option value="mcq_single">Single MCQ</option>
                  <option value="quiz">Quiz (Multiple Questions)</option>
                  <option value="flashcard">Flashcard</option>
                  <option value="flashcard_deck">Flashcard Deck</option>
                </select>

                {/* Poll Builder */}
                {formData.activity_type === "poll" && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-dark-300 mb-1">
                        Poll Question
                      </label>
                      <input
                        type="text"
                        value={formData.activity_data.question || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            activity_data: {
                              ...formData.activity_data,
                              question: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-dark-600 border border-dark-500 rounded px-2 py-1 text-white text-sm"
                        placeholder="What's your question?"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-dark-300 mb-1">
                        Options (one per line)
                      </label>
                      <textarea
                        value={(formData.activity_data.options || [])
                          .map((o: any) => o.text)
                          .join("\n")}
                        onChange={(e) => {
                          const lines = e.target.value
                            .split("\n")
                            .filter((l) => l.trim());
                          setFormData({
                            ...formData,
                            activity_data: {
                              ...formData.activity_data,
                              options: lines.map((text, idx) => ({
                                id: `opt_${idx}`,
                                text,
                              })),
                            },
                          });
                        }}
                        className="w-full bg-dark-600 border border-dark-500 rounded px-2 py-1 text-white text-sm"
                        rows={4}
                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                      />
                    </div>
                  </div>
                )}

                {/* MCQ Builder */}
                {formData.activity_type === "mcq_single" && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-dark-300 mb-1">
                        Question
                      </label>
                      <input
                        type="text"
                        value={formData.activity_data.question || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            activity_data: {
                              ...formData.activity_data,
                              question: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-dark-600 border border-dark-500 rounded px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-dark-300 mb-1">
                        Options (one per line)
                      </label>
                      <textarea
                        value={(formData.activity_data.options || [])
                          .map((o: any) => o.text)
                          .join("\n")}
                        onChange={(e) => {
                          const lines = e.target.value
                            .split("\n")
                            .filter((l) => l.trim());
                          setFormData({
                            ...formData,
                            activity_data: {
                              ...formData.activity_data,
                              options: lines.map((text, idx) => ({
                                id: `opt_${idx}`,
                                text,
                              })),
                            },
                          });
                        }}
                        className="w-full bg-dark-600 border border-dark-500 rounded px-2 py-1 text-white text-sm"
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-dark-300 mb-1">
                        Correct Answer (index, starting from 0)
                      </label>
                      <input
                        type="number"
                        value={
                          formData.activity_data.correct_answer
                            ? parseInt(
                                formData.activity_data.correct_answer.replace(
                                  "opt_",
                                  ""
                                )
                              )
                            : 0
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            activity_data: {
                              ...formData.activity_data,
                              correct_answer: `opt_${e.target.value}`,
                            },
                          })
                        }
                        className="w-full bg-dark-600 border border-dark-500 rounded px-2 py-1 text-white text-sm"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-dark-300 mb-1">
                        Explanation (optional)
                      </label>
                      <textarea
                        value={formData.activity_data.explanation || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            activity_data: {
                              ...formData.activity_data,
                              explanation: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-dark-600 border border-dark-500 rounded px-2 py-1 text-white text-sm"
                        rows={2}
                      />
                    </div>
                  </div>
                )}

                {/* Flashcard Builder */}
                {(formData.activity_type === "flashcard" ||
                  formData.activity_type === "flashcard_deck") && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-dark-300 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={formData.activity_data.title || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            activity_data: {
                              ...formData.activity_data,
                              title: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-dark-600 border border-dark-500 rounded px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-dark-300 mb-1">
                        Cards (Format: Front | Back | Hint, one per line)
                      </label>
                      <textarea
                        value={(formData.activity_data.cards || [])
                          .map(
                            (c: any) =>
                              `${c.front} | ${c.back}${
                                c.hint ? " | " + c.hint : ""
                              }`
                          )
                          .join("\n")}
                        onChange={(e) => {
                          const lines = e.target.value
                            .split("\n")
                            .filter((l) => l.trim());
                          setFormData({
                            ...formData,
                            activity_data: {
                              ...formData.activity_data,
                              cards: lines.map((line, idx) => {
                                const [front, back, hint] = line
                                  .split("|")
                                  .map((s) => s.trim());
                                return { id: `card_${idx}`, front, back, hint };
                              }),
                            },
                          });
                        }}
                        className="w-full bg-dark-600 border border-dark-500 rounded px-2 py-1 text-white text-sm"
                        rows={6}
                        placeholder="sin(30°) | 1/2 | Memorize special angles&#10;cos(60°) | 1/2&#10;tan(45°) | 1"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Post Targeting Section */}
              <div className="border-t border-dark-600 pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-white">
                    📍 Post Targeting
                  </h4>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.post_context.show_to_all}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          post_context: {
                            ...formData.post_context,
                            show_to_all: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-dark-300">Show to All</span>
                  </label>
                </div>

                {!formData.post_context.show_to_all && (
                  <div className="space-y-4 bg-dark-750 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Target Subjects */}
                      <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">
                          Target Subjects
                        </label>
                        <select
                          multiple
                          value={formData.post_context.target_subjects || []}
                          onChange={(e) => {
                            const selected = Array.from(
                              e.target.selectedOptions,
                              (option) => option.value
                            );
                            setFormData({
                              ...formData,
                              post_context: {
                                ...formData.post_context,
                                target_subjects: selected,
                              },
                            });
                          }}
                          className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500 h-24"
                        >
                          {subjects.map((subject) => (
                            <option key={subject.id} value={subject.id}>
                              {subject.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-dark-400 mt-1">
                          Hold Ctrl/Cmd to select multiple
                        </p>
                      </div>

                      {/* Target Topics */}
                      <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">
                          Target Topics
                        </label>
                        <select
                          multiple
                          value={formData.post_context.target_topics || []}
                          onChange={(e) => {
                            const selected = Array.from(
                              e.target.selectedOptions,
                              (option) => option.value
                            );
                            setFormData({
                              ...formData,
                              post_context: {
                                ...formData.post_context,
                                target_topics: selected,
                              },
                            });
                          }}
                          className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500 h-24"
                        >
                          {topics.map((topic) => (
                            <option key={topic.id} value={topic.id}>
                              {topic.subject_name} - {topic.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-dark-400 mt-1">
                          Hold Ctrl/Cmd to select multiple
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {/* Difficulty */}
                      <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">
                          Difficulty
                        </label>
                        <select
                          value={formData.post_context.difficulty || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              post_context: {
                                ...formData.post_context,
                                difficulty: e.target.value as any,
                              },
                            })
                          }
                          className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                        >
                          <option value="">Any</option>
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>

                      {/* Learning Stage */}
                      <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">
                          Learning Stage
                        </label>
                        <select
                          value={formData.post_context.learning_stage || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              post_context: {
                                ...formData.post_context,
                                learning_stage: e.target.value as any,
                              },
                            })
                          }
                          className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                        >
                          <option value="">Any</option>
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>

                      {/* Priority */}
                      <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">
                          Priority
                        </label>
                        <input
                          type="number"
                          value={formData.priority}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              priority: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                          min="0"
                          max="100"
                        />
                        <p className="text-xs text-dark-400 mt-1">
                          0=normal, higher=important
                        </p>
                      </div>
                    </div>

                    {/* Node Types */}
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">
                        Node Types (when to show)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "lesson",
                          "quiz",
                          "practice",
                          "project",
                          "milestone",
                        ].map((type) => (
                          <label
                            key={type}
                            className="flex items-center gap-2 px-3 py-2 bg-dark-700 rounded-lg cursor-pointer hover:bg-dark-600"
                          >
                            <input
                              type="checkbox"
                              checked={(
                                formData.post_context.node_types || []
                              ).includes(type)}
                              onChange={(e) => {
                                const currentTypes =
                                  formData.post_context.node_types || [];
                                const updated = e.target.checked
                                  ? [...currentTypes, type]
                                  : currentTypes.filter((t) => t !== type);
                                setFormData({
                                  ...formData,
                                  post_context: {
                                    ...formData.post_context,
                                    node_types: updated,
                                  },
                                });
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-sm text-white capitalize">
                              {type}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Media
                </label>
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {uploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {uploading ? "Uploading..." : "Upload Image"}
                  </button>
                  {formData.media_url && (
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-500">
                        Image uploaded
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, media_url: "" }))
                        }
                        className="text-red-500 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-dark-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  {editingPost ? "Update Post" : "Create Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-dark-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-dark-300 mb-2">
              No posts found
            </h3>
            <p className="text-dark-400">
              {filterType === "all"
                ? "Create your first feed post to get started."
                : `No ${filterType.replace("_", " ")} posts found.`}
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-dark-800 rounded-lg p-6 border border-dark-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {getPostTypeIcon(post.type)}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getPostTypeColor(
                        post.type
                      )}`}
                    >
                      {post.type
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                    {post.subject && (
                      <span className="text-sm text-dark-400">
                        Subject: {post.subject}
                      </span>
                    )}
                  </div>

                  <p className="text-white mb-3">{post.content}</p>

                  {post.achievement && (
                    <p className="text-sm text-yellow-400 mb-2">
                      Achievement: {post.achievement}
                    </p>
                  )}

                  {post.points_earned > 0 && (
                    <p className="text-sm text-green-400 mb-2">
                      Points: {post.points_earned}
                    </p>
                  )}

                  {post.media_url && (
                    <div className="mb-3">
                      <img
                        src={post.media_url}
                        alt="Post media"
                        className="max-w-md rounded-lg"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-dark-400">
                    <span>By: {post.users?.name || post.users?.email}</span>
                    <span>Likes: {post.likes}</span>
                    <span>Comments: {post.comments}</span>
                    <span>
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => startEdit(post)}
                    className="p-2 text-dark-400 hover:text-blue-400 transition-colors"
                    title="Edit post"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="p-2 text-dark-400 hover:text-red-400 transition-colors"
                    title="Delete post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FeedPostManager;

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-white">Feed Post Manager</h1>
//           <p className="text-dark-400 mt-2">
//             Create and manage all types of feed posts for the mobile app
//           </p>
//         </div>
//         <button
//           onClick={() => setShowCreateForm(true)}
//           className="btn-primary flex items-center space-x-2"
//         >
//           <Plus className="w-5 h-5" />
//           <span>Create Post</span>
//         </button>
//       </div>

//       {/* Filter Tabs */}
//       <div className="flex flex-wrap gap-2">
//         <button
//           onClick={() => setFilterType("all")}
//           className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
//             filterType === "all"
//               ? "bg-primary-500 text-white"
//               : "bg-dark-800 text-dark-300 hover:bg-dark-700"
//           }`}
//         >
//           All Posts ({feedPosts.length})
//         </button>
//         {[
//           "achievement",
//           "question",
//           "milestone",
//           "tip",
//           "quiz_pack",
//           "lesson_pack",
//         ].map((type) => {
//           const count = feedPosts.filter((post) => post.type === type).length;
//           return (
//             <button
//               key={type}
//               onClick={() => setFilterType(type)}
//               className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
//                 filterType === type
//                   ? "bg-primary-500 text-white"
//                   : "bg-dark-800 text-dark-300 hover:bg-dark-700"
//               }`}
//             >
//               {type.replace("_", " ")} ({count})
//             </button>
//           );
//         })}
//       </div>

//       {/* Posts Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {filteredPosts.map((post) => (
//           <div
//             key={post.id}
//             className="card group hover:scale-105 transition-transform duration-200"
//           >
//             <div className="flex items-start justify-between mb-4">
//               <div className="flex items-center space-x-3">
//                 {getPostTypeIcon(post.type)}
//                 <div>
//                   <span
//                     className={`px-2 py-1 rounded-full text-xs font-medium border ${getPostTypeColor(
//                       post.type
//                     )}`}
//                   >
//                     {post.type.replace("_", " ")}
//                   </span>
//                   {post.subject && (
//                     <p className="text-dark-400 text-sm mt-1">{post.subject}</p>
//                   )}
//                 </div>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <button
//                   onClick={() => setEditingPost(post)}
//                   className="text-dark-400 hover:text-white transition-colors"
//                   title="Edit"
//                 >
//                   <Edit className="w-4 h-4" />
//                 </button>
//                 <button
//                   onClick={() => handleDeletePost(post.id)}
//                   className="text-red-400 hover:text-red-300 transition-colors"
//                   title="Delete"
//                 >
//                   <Trash2 className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>

//             <p className="text-dark-300 text-sm mb-4 line-clamp-4">
//               {post.content}
//             </p>

//             {post.achievement && (
//               <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
//                 <p className="text-yellow-500 text-sm font-medium">
//                   Achievement: {post.achievement}
//                 </p>
//                 <p className="text-yellow-400 text-xs">
//                   +{post.points_earned} points
//                 </p>
//               </div>
//             )}

//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-4 text-sm text-dark-400">
//                 <span className="flex items-center space-x-1">
//                   <ThumbsUp className="w-4 h-4" />
//                   <span>{post.likes}</span>
//                 </span>
//                 <span className="flex items-center space-x-1">
//                   <MessageSquare className="w-4 h-4" />
//                   <span>{post.comments}</span>
//                 </span>
//                 {post.points_earned > 0 && (
//                   <span className="flex items-center space-x-1 text-yellow-500">
//                     <Star className="w-4 h-4" />
//                     <span>{post.points_earned}</span>
//                   </span>
//                 )}
//               </div>
//             </div>

//             <div className="mt-4 pt-4 border-t border-dark-700">
//               <div className="flex items-center justify-between text-sm text-dark-400">
//                 <span>By {post.users?.name || post.users?.email}</span>
//                 <span>{new Date(post.created_at).toLocaleDateString()}</span>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {filteredPosts.length === 0 && (
//         <div className="text-center py-12">
//           <MessageSquare className="w-16 h-16 text-dark-600 mx-auto mb-4" />
//           <h3 className="text-xl font-semibold text-white mb-2">
//             No posts found
//           </h3>
//           <p className="text-dark-400 mb-6">
//             {filterType === "all"
//               ? "Create your first post to get started!"
//               : `No ${filterType.replace("_", " ")} posts found.`}
//           </p>
//           <button
//             onClick={() => setShowCreateForm(true)}
//             className="btn-primary"
//           >
//             Create Post
//           </button>
//         </div>
//       )}

//       {/* Create/Edit Form Modal */}
//       {showCreateForm && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-dark-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-2xl font-bold text-white">
//                 {editingPost ? "Edit Post" : "Create New Post"}
//               </h2>
//               <button
//                 onClick={() => {
//                   setShowCreateForm(false);
//                   resetForm();
//                 }}
//                 className="text-dark-400 hover:text-white transition-colors"
//               >
//                 <X className="w-6 h-6" />
//               </button>
//             </div>

//             <form onSubmit={handleCreatePost} className="space-y-6">
//               {/* Content */}
//               <div>
//                 <label className="block text-white font-medium mb-2">
//                   Content
//                 </label>
//                 <textarea
//                   value={formData.content}
//                   onChange={(e) =>
//                     setFormData((prev) => ({
//                       ...prev,
//                       content: e.target.value,
//                     }))
//                   }
//                   className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 h-32 resize-none"
//                   placeholder="Write your post content..."
//                   required
//                 />
//               </div>

//               {/* Type */}
//               <div>
//                 <label className="block text-white font-medium mb-2">
//                   Post Type
//                 </label>
//                 <select
//                   value={formData.type}
//                   onChange={(e) =>
//                     setFormData((prev) => ({
//                       ...prev,
//                       type: e.target.value as FeedPost["type"],
//                     }))
//                   }
//                   className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
//                 >
//                   <option value="tip">Study Tip</option>
//                   <option value="achievement">Achievement</option>
//                   <option value="question">Question</option>
//                   <option value="milestone">Milestone</option>
//                   <option value="quiz_pack">Quiz Pack</option>
//                   <option value="lesson_pack">Lesson Pack</option>
//                 </select>
//               </div>

//               {/* Subject */}
//               <div>
//                 <label className="block text-white font-medium mb-2">
//                   Subject (Optional)
//                 </label>
//                 <select
//                   value={formData.subject}
//                   onChange={(e) =>
//                     setFormData((prev) => ({
//                       ...prev,
//                       subject: e.target.value,
//                     }))
//                   }
//                   className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
//                 >
//                   <option value="">Select a subject</option>
//                   {subjects.map((subject) => (
//                     <option key={subject.id} value={subject.name}>
//                       {subject.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Achievement (for achievement posts) */}
//               {formData.type === "achievement" && (
//                 <div>
//                   <label className="block text-white font-medium mb-2">
//                     Achievement Title
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.achievement}
//                     onChange={(e) =>
//                       setFormData((prev) => ({
//                         ...prev,
//                         achievement: e.target.value,
//                       }))
//                     }
//                     className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
//                     placeholder="Enter achievement title"
//                   />
//                 </div>
//               )}

//               {/* Points Earned */}
//               <div>
//                 <label className="block text-white font-medium mb-2">
//                   Points Earned
//                 </label>
//                 <input
//                   type="number"
//                   value={formData.points_earned}
//                   onChange={(e) =>
//                     setFormData((prev) => ({
//                       ...prev,
//                       points_earned: parseInt(e.target.value) || 0,
//                     }))
//                   }
//                   className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
//                   placeholder="0"
//                   min="0"
//                 />
//               </div>

//               {/* Media URL */}
//               <div>
//                 <label className="block text-white font-medium mb-2">
//                   Media URL (Optional)
//                 </label>
//                 <input
//                   type="url"
//                   value={formData.media_url}
//                   onChange={(e) =>
//                     setFormData((prev) => ({
//                       ...prev,
//                       media_url: e.target.value,
//                     }))
//                   }
//                   className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
//                   placeholder="https://example.com/image.jpg"
//                 />
//               </div>

//               {/* Submit Button */}
//               <div className="flex items-center justify-end space-x-4 pt-4">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowCreateForm(false);
//                     resetForm();
//                   }}
//                   className="px-6 py-3 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
//                 >
//                   {editingPost ? "Update Post" : "Create Post"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FeedPostManager;
