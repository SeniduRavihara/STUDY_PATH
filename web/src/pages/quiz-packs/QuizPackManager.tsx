// import {
//   BookOpen,
//   Edit,
//   HelpCircle,
//   Layers,
//   Plus,
//   Search,
//   Trash2,
//   X,
// } from "lucide-react";
// import React, { useEffect, useState } from "react";

// interface MCQ {
//   id: string;
//   question: string;
//   options: string[];
//   correct_answer: number;
//   explanation: string;
//   difficulty: "easy" | "medium" | "hard";
//   subject_id: string;
//   chapter_id: string;
//   chapters?: {
//     title: string;
//     subjects?: {
//       name: string;
//     };
//   };
// }

// interface Subject {
//   id: string;
//   name: string;
//   color: string;
// }

// interface Chapter {
//   id: string;
//   title: string;
//   subject_id: string;
//   subjects?: {
//     name: string;
//   };
// }

// interface QuizPack {
//   id: string;
//   title: string;
//   description: string;
//   subject: string;
//   difficulty: "easy" | "medium" | "hard";
//   mcq_count: number;
//   mcq_ids: string[];
//   created_at: string;
//   created_by: string;
// }

// const QuizPackManager: React.FC = () => {
//   const [mcqs, setMcqs] = useState<MCQ[]>([]);
//   const [subjects, setSubjects] = useState<Subject[]>([]);
//   const [chapters, setChapters] = useState<Chapter[]>([]);
//   const [quizPacks, setQuizPacks] = useState<QuizPack[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [editingPack, setEditingPack] = useState<QuizPack | null>(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedSubject, setSelectedSubject] = useState("");
//   const [selectedDifficulty, setSelectedDifficulty] = useState("");

//   // Form state
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     subject: "",
//     difficulty: "medium" as "easy" | "medium" | "hard",
//     selectedMcqs: [] as string[],
//   });

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       const [mcqsRes, subjectsRes, chaptersRes] = await Promise.all([
//         // TODO: Replace with new MCQService, SubjectService, ChapterService
//         // MCQService.getMCQs(),
//         // SubjectService.getSubjects(),
//         // ChapterService.getChapters(),
//       ]);

//       if (mcqsRes.data) setMcqs(mcqsRes.data);
//       if (subjectsRes.data) setSubjects(subjectsRes.data);
//       if (chaptersRes.data) setChapters(chaptersRes.data);

//       // Load existing quiz packs from feed posts
//       // TODO: Replace with new FeedPostService
//       // const feedPostsRes = await FeedPostService.getFeedPosts();
//       if (feedPostsRes.data) {
//         const quizPackPosts = feedPostsRes.data.filter(
//           (post) => post.type === "quiz_pack"
//         );
//         const packs: QuizPack[] = quizPackPosts.map((post) => ({
//           id: post.id,
//           title: post.content.split(":")[0] || "Quiz Pack",
//           description: post.content,
//           subject: post.subject || "General",
//           difficulty: post.pack_data?.difficulty || "medium",
//           mcq_count: post.pack_data?.question_count || 0,
//           mcq_ids: post.pack_data?.mcq_ids || [],
//           created_at: post.created_at,
//           created_by: post.users?.name || post.users?.email || "Unknown",
//         }));
//         setQuizPacks(packs);
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredMcqs = mcqs.filter((mcq) => {
//     const matchesSearch = mcq.question
//       .toLowerCase()
//       .includes(searchTerm.toLowerCase());
//     const matchesSubject =
//       !selectedSubject || mcq.chapters?.subjects?.name === selectedSubject;
//     const matchesDifficulty =
//       !selectedDifficulty || mcq.difficulty === selectedDifficulty;
//     return matchesSearch && matchesSubject && matchesDifficulty;
//   });

//   const handleCreatePack = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       // TODO: Replace with new AuthService
//       // const { user } = await AuthService.getCurrentUser();
//       if (!user) throw new Error("User not authenticated");

//       const selectedMcqData = mcqs.filter((mcq) =>
//         formData.selectedMcqs.includes(mcq.id)
//       );

//       const packData = {
//         title: formData.title,
//         description: formData.description,
//         subject: formData.subject,
//         difficulty: formData.difficulty,
//         mcq_count: selectedMcqData.length,
//         mcq_ids: formData.selectedMcqs,
//         mcqs: selectedMcqData,
//         created_at: new Date().toISOString(),
//       };

//       const postData = {
//         content: `${formData.title}: ${formData.description}`,
//         type: "quiz_pack" as const,
//         subject: formData.subject,
//         pack_data: packData,
//         user_id: user.id,
//         likes: 0,
//         comments: 0,
//       };

//       // TODO: Replace with new FeedPostService
//       // const { data, error } = await FeedPostService.createFeedPost(postData);
//       if (error) throw error;

//       // Add to local state
//       const newPack: QuizPack = {
//         id: data.id,
//         title: formData.title,
//         description: formData.description,
//         subject: formData.subject,
//         difficulty: formData.difficulty,
//         mcq_count: selectedMcqData.length,
//         mcq_ids: formData.selectedMcqs,
//         created_at: data.created_at,
//         created_by: user.email || "You",
//       };
//       setQuizPacks((prev) => [newPack, ...prev]);

//       setShowCreateForm(false);
//       resetForm();

//       alert("Quiz pack created successfully!");
//     } catch (error) {
//       console.error("Error creating quiz pack:", error);
//       alert("Error creating quiz pack. Please try again.");
//     }
//   };

//   const handleDeletePack = async (id: string) => {
//     if (!confirm("Are you sure you want to delete this quiz pack?")) return;

//     try {
//       // TODO: Replace with new FeedPostService
//       // const { error } = await FeedPostService.deleteFeedPost(id);
//       if (error) throw error;
//       setQuizPacks((prev) => prev.filter((pack) => pack.id !== id));

//       alert("Quiz pack deleted successfully!");
//     } catch (error) {
//       console.error("Error deleting quiz pack:", error);
//       alert("Error deleting quiz pack. Please try again.");
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       title: "",
//       description: "",
//       subject: "",
//       difficulty: "medium",
//       selectedMcqs: [],
//     });
//     setEditingPack(null);
//   };

//   const getDifficultyColor = (difficulty: string) => {
//     switch (difficulty) {
//       case "easy":
//         return "bg-green-500/10 text-green-500 border-green-500/20";
//       case "medium":
//         return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
//       case "hard":
//         return "bg-red-500/10 text-red-500 border-red-500/20";
//       default:
//         return "bg-gray-500/10 text-gray-500 border-gray-500/20";
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-white">Quiz Pack Manager</h1>
//           <p className="text-dark-400 mt-2">
//             Create and manage quiz packs by combining multiple MCQs
//           </p>
//         </div>
//         <button
//           onClick={() => setShowCreateForm(true)}
//           className="btn-primary flex items-center space-x-2"
//         >
//           <Plus className="w-5 h-5" />
//           <span>Create Quiz Pack</span>
//         </button>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <div className="card">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-dark-400 text-sm">Total Quiz Packs</p>
//               <p className="text-2xl font-bold text-white">
//                 {quizPacks.length}
//               </p>
//             </div>
//             <HelpCircle className="w-8 h-8 text-primary-500" />
//           </div>
//         </div>
//         <div className="card">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-dark-400 text-sm">Total MCQs</p>
//               <p className="text-2xl font-bold text-white">{mcqs.length}</p>
//             </div>
//             <BookOpen className="w-8 h-8 text-blue-500" />
//           </div>
//         </div>
//         <div className="card">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-dark-400 text-sm">Subjects</p>
//               <p className="text-2xl font-bold text-white">{subjects.length}</p>
//             </div>
//             <Layers className="w-8 h-8 text-green-500" />
//           </div>
//         </div>
//         <div className="card">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-dark-400 text-sm">Chapters</p>
//               <p className="text-2xl font-bold text-white">{chapters.length}</p>
//             </div>
//             <BookOpen className="w-8 h-8 text-purple-500" />
//           </div>
//         </div>
//       </div>

//       {/* Quiz Packs Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {quizPacks.map((pack) => (
//           <div
//             key={pack.id}
//             className="card group hover:scale-105 transition-transform duration-200"
//           >
//             <div className="flex items-start justify-between mb-4">
//               <div className="flex items-center space-x-3">
//                 <HelpCircle className="w-6 h-6 text-orange-500" />
//                 <div>
//                   <h3 className="text-white font-semibold text-lg">
//                     {pack.title}
//                   </h3>
//                   <p className="text-dark-400 text-sm">{pack.subject}</p>
//                 </div>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <button
//                   onClick={() => setEditingPack(pack)}
//                   className="text-dark-400 hover:text-white transition-colors"
//                   title="Edit"
//                 >
//                   <Edit className="w-4 h-4" />
//                 </button>
//                 <button
//                   onClick={() => handleDeletePack(pack.id)}
//                   className="text-red-400 hover:text-red-300 transition-colors"
//                   title="Delete"
//                 >
//                   <Trash2 className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>

//             <p className="text-dark-300 text-sm mb-4 line-clamp-3">
//               {pack.description}
//             </p>

//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-4 text-sm text-dark-400">
//                 <span className="flex items-center space-x-1">
//                   <HelpCircle className="w-4 h-4" />
//                   <span>{pack.mcq_count} MCQs</span>
//                 </span>
//                 <span
//                   className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(
//                     pack.difficulty
//                   )}`}
//                 >
//                   {pack.difficulty}
//                 </span>
//               </div>
//             </div>

//             <div className="mt-4 pt-4 border-t border-dark-700">
//               <div className="flex items-center justify-between text-sm text-dark-400">
//                 <span>By {pack.created_by}</span>
//                 <span>{new Date(pack.created_at).toLocaleDateString()}</span>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {quizPacks.length === 0 && (
//         <div className="text-center py-12">
//           <HelpCircle className="w-16 h-16 text-dark-600 mx-auto mb-4" />
//           <h3 className="text-xl font-semibold text-white mb-2">
//             No quiz packs found
//           </h3>
//           <p className="text-dark-400 mb-6">
//             Create your first quiz pack by combining MCQs from different
//             subjects.
//           </p>
//           <button
//             onClick={() => setShowCreateForm(true)}
//             className="btn-primary"
//           >
//             Create Quiz Pack
//           </button>
//         </div>
//       )}

//       {/* Create/Edit Form Modal */}
//       {showCreateForm && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-dark-900 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-2xl font-bold text-white">
//                 {editingPack ? "Edit Quiz Pack" : "Create Quiz Pack"}
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

//             <form onSubmit={handleCreatePack} className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Title */}
//                 <div>
//                   <label className="block text-white font-medium mb-2">
//                     Quiz Pack Title
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.title}
//                     onChange={(e) =>
//                       setFormData((prev) => ({
//                         ...prev,
//                         title: e.target.value,
//                       }))
//                     }
//                     className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
//                     placeholder="e.g., Advanced Calculus Quiz"
//                     required
//                   />
//                 </div>

//                 {/* Subject */}
//                 <div>
//                   <label className="block text-white font-medium mb-2">
//                     Subject
//                   </label>
//                   <select
//                     value={formData.subject}
//                     onChange={(e) =>
//                       setFormData((prev) => ({
//                         ...prev,
//                         subject: e.target.value,
//                       }))
//                     }
//                     className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
//                     required
//                   >
//                     <option value="">Select a subject</option>
//                     {subjects.map((subject) => (
//                       <option key={subject.id} value={subject.name}>
//                         {subject.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               {/* Description */}
//               <div>
//                 <label className="block text-white font-medium mb-2">
//                   Description
//                 </label>
//                 <textarea
//                   value={formData.description}
//                   onChange={(e) =>
//                     setFormData((prev) => ({
//                       ...prev,
//                       description: e.target.value,
//                     }))
//                   }
//                   className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 h-24 resize-none"
//                   placeholder="Describe what this quiz pack covers..."
//                   required
//                 />
//               </div>

//               {/* Difficulty */}
//               <div>
//                 <label className="block text-white font-medium mb-2">
//                   Difficulty Level
//                 </label>
//                 <select
//                   value={formData.difficulty}
//                   onChange={(e) =>
//                     setFormData((prev) => ({
//                       ...prev,
//                       difficulty: e.target.value as "easy" | "medium" | "hard",
//                     }))
//                   }
//                   className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
//                 >
//                   <option value="easy">Easy</option>
//                   <option value="medium">Medium</option>
//                   <option value="hard">Hard</option>
//                 </select>
//               </div>

//               {/* MCQ Selection */}
//               <div>
//                 <label className="block text-white font-medium mb-2">
//                   Select MCQs
//                 </label>

//                 {/* Filters */}
//                 <div className="mb-4 flex flex-wrap gap-4">
//                   <div className="flex-1 min-w-64">
//                     <div className="relative">
//                       <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-4 h-4" />
//                       <input
//                         type="text"
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
//                         placeholder="Search MCQs..."
//                       />
//                     </div>
//                   </div>
//                   <select
//                     value={selectedSubject}
//                     onChange={(e) => setSelectedSubject(e.target.value)}
//                     className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
//                   >
//                     <option value="">All Subjects</option>
//                     {subjects.map((subject) => (
//                       <option key={subject.id} value={subject.name}>
//                         {subject.name}
//                       </option>
//                     ))}
//                   </select>
//                   <select
//                     value={selectedDifficulty}
//                     onChange={(e) => setSelectedDifficulty(e.target.value)}
//                     className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
//                   >
//                     <option value="">All Difficulties</option>
//                     <option value="easy">Easy</option>
//                     <option value="medium">Medium</option>
//                     <option value="hard">Hard</option>
//                   </select>
//                 </div>

//                 <div className="max-h-64 overflow-y-auto bg-dark-800 border border-dark-700 rounded-lg p-4">
//                   {filteredMcqs.length === 0 ? (
//                     <p className="text-dark-400 text-center py-4">
//                       No MCQs found matching your criteria.
//                     </p>
//                   ) : (
//                     <div className="space-y-3">
//                       {filteredMcqs.map((mcq) => (
//                         <label
//                           key={mcq.id}
//                           className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg hover:bg-dark-700 transition-colors"
//                         >
//                           <input
//                             type="checkbox"
//                             checked={formData.selectedMcqs.includes(mcq.id)}
//                             onChange={(e) => {
//                               if (e.target.checked) {
//                                 setFormData((prev) => ({
//                                   ...prev,
//                                   selectedMcqs: [...prev.selectedMcqs, mcq.id],
//                                 }));
//                               } else {
//                                 setFormData((prev) => ({
//                                   ...prev,
//                                   selectedMcqs: prev.selectedMcqs.filter(
//                                     (id) => id !== mcq.id
//                                   ),
//                                 }));
//                               }
//                             }}
//                             className="mt-1 w-4 h-4 text-primary-500 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
//                           />
//                           <div className="flex-1">
//                             <p className="text-white text-sm font-medium">
//                               {mcq.question}
//                             </p>
//                             <div className="flex items-center space-x-4 mt-1 text-xs text-dark-400">
//                               <span>
//                                 {mcq.chapters?.subjects?.name ||
//                                   "Unknown Subject"}
//                               </span>
//                               <span>
//                                 {mcq.chapters?.title || "Unknown Chapter"}
//                               </span>
//                               <span
//                                 className={`px-2 py-1 rounded-full ${getDifficultyColor(
//                                   mcq.difficulty
//                                 )}`}
//                               >
//                                 {mcq.difficulty}
//                               </span>
//                             </div>
//                           </div>
//                         </label>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//                 <p className="text-dark-400 text-sm mt-2">
//                   Selected: {formData.selectedMcqs.length} MCQs
//                 </p>
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
//                   disabled={formData.selectedMcqs.length === 0}
//                   className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {editingPack ? "Update Quiz Pack" : "Create Quiz Pack"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default QuizPackManager;
