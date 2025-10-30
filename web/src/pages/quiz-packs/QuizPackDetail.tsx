// import type { DragEndEvent } from "@dnd-kit/core";
// import {
//   closestCenter,
//   DndContext,
//   KeyboardSensor,
//   PointerSensor,
//   useSensor,
//   useSensors,
// } from "@dnd-kit/core";
// import {
//   arrayMove,
//   SortableContext,
//   sortableKeyboardCoordinates,
//   useSortable,
//   verticalListSortingStrategy,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import {
//   ArrowLeft,
//   Edit,
//   GripVertical,
//   Plus,
//   Save,
//   Target,
//   Trash2,
//   Upload,
//   X,
// } from "lucide-react";
// import React, { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { useAuth } from "../../contexts/AuthContext";
// import { supabase } from "../../lib/supabase";
// import { MCQService } from "../../services/mcqService";
// import { QuizPackService } from "../../services/quizPackService";
// import { SubjectService } from "../../services/subjectService";
// import { TopicService } from "../../services/topicService";

// interface MCQ {
//   id: string;
//   question: string;
//   options: string[];
//   correct_answer: number;
//   explanation: string;
//   difficulty: "easy" | "medium" | "hard";
//   topic_id?: string;
//   subject_id: string;
//   created_at: string;
//   updated_at: string;
// }

// interface QuizPack {
//   id: string;
//   title: string;
//   description: string;
//   topic_id: string;
//   subject_id: string;
//   difficulty: "easy" | "medium" | "hard";
//   mcq_count: number;
//   mcq_ids: string[];
//   created_by: string;
//   created_at: string;
//   updated_at: string;
// }

// interface Topic {
//   id: string;
//   name: string;
//   description: string;
//   level: number;
//   parent_id?: string;
// }

// interface Subject {
//   id: string;
//   name: string;
//   description: string;
//   icon: string;
//   color: [string, string];
// }

// // Sortable MCQ Item Component
// interface SortableMCQItemProps {
//   mcq: MCQ;
//   index: number;
//   onEdit: (mcq: MCQ) => void;
//   onDelete: (mcqId: string) => void;
//   getDifficultyColor: (difficulty: string) => string;
// }

// const SortableMCQItem: React.FC<SortableMCQItemProps> = ({
//   mcq,
//   index,
//   onEdit,
//   onDelete,
//   getDifficultyColor,
// }) => {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({ id: mcq.id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     opacity: isDragging ? 0.5 : 1,
//   };

//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       className={`bg-dark-800 rounded-xl p-6 hover:bg-dark-700 transition-colors ${
//         isDragging ? "shadow-2xl" : ""
//       }`}
//     >
//       <div className="flex items-start justify-between">
//         <div className="flex items-start space-x-3 flex-1">
//           {/* Drag Handle */}
//           <div
//             {...attributes}
//             {...listeners}
//             className="cursor-grab active:cursor-grabbing p-1 hover:bg-dark-600 rounded transition-colors"
//             title="Drag to reorder"
//           >
//             <GripVertical className="w-5 h-5 text-dark-400 hover:text-white" />
//           </div>

//           <div className="flex-1">
//             <div className="flex items-center space-x-3 mb-3">
//               <span className="text-primary-500 font-medium">#{index + 1}</span>
//               <span
//                 className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(
//                   mcq.difficulty
//                 )}`}
//               >
//                 {mcq.difficulty}
//               </span>
//             </div>
//             <h4 className="text-white font-medium mb-3">{mcq.question}</h4>
//             <div className="space-y-2 mb-4">
//               {mcq.options.map((option, optionIndex) => (
//                 <div key={optionIndex} className="flex items-center space-x-3">
//                   <div
//                     className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
//                       optionIndex === mcq.correct_answer
//                         ? "bg-green-500 text-white"
//                         : "bg-dark-600 text-dark-400"
//                     }`}
//                   >
//                     {String.fromCharCode(65 + optionIndex)}
//                   </div>
//                   <span
//                     className={`text-sm ${
//                       optionIndex === mcq.correct_answer
//                         ? "text-green-400"
//                         : "text-dark-300"
//                     }`}
//                   >
//                     {option}
//                   </span>
//                 </div>
//               ))}
//             </div>
//             {mcq.explanation && (
//               <div className="bg-dark-700 rounded-lg p-3">
//                 <p className="text-dark-300 text-sm">
//                   <span className="font-medium text-white">Explanation:</span>{" "}
//                   {mcq.explanation}
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="flex items-center space-x-2 ml-4">
//           <button
//             onClick={() => onEdit(mcq)}
//             className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors"
//             title="Edit MCQ"
//           >
//             <Edit className="w-4 h-4" />
//           </button>
//           <button
//             onClick={() => onDelete(mcq.id)}
//             className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
//             title="Delete MCQ"
//           >
//             <Trash2 className="w-4 h-4" />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const QuizPackDetail: React.FC = () => {
//   const navigate = useNavigate();
//   const { quizPackId } = useParams();
//   const { user } = useAuth();

//   console.log("QuizPackDetail loaded with quizPackId:", quizPackId);

//   const [quizPack, setQuizPack] = useState<QuizPack | null>(null);
//   const [mcqs, setMcqs] = useState<MCQ[]>([]);
//   const [topic, setTopic] = useState<Topic | null>(null);
//   const [subject, setSubject] = useState<Subject | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [showMCQForm, setShowMCQForm] = useState(false);
//   const [editingMCQ, setEditingMCQ] = useState<MCQ | null>(null);
//   const [showImportModal, setShowImportModal] = useState(false);

//   // Drag and drop sensors
//   const sensors = useSensors(
//     useSensor(PointerSensor),
//     useSensor(KeyboardSensor, {
//       coordinateGetter: sortableKeyboardCoordinates,
//     })
//   );

//   // MCQ form state
//   const [mcqFormData, setMcqFormData] = useState({
//     question: "",
//     options: ["", "", "", ""],
//     correct_answer: 0,
//     explanation: "",
//     difficulty: "medium" as "easy" | "medium" | "hard",
//   });

//   useEffect(() => {
//     if (quizPackId) {
//       loadQuizPackData();
//     }
//   }, [quizPackId]);

//   const loadQuizPackData = async () => {
//     try {
//       setLoading(true);

//       // Load quiz pack
//       const { data: packData, error: packError } =
//         await supabase
//           .from("quiz_packs")
//           .select("*")
//           .eq("id", quizPackId)
//           .single();

//       if (packError) throw packError;
//       setQuizPack(packData);

//       // Load MCQs for this quiz pack
//       if (packData.mcq_ids && packData.mcq_ids.length > 0) {
//         const { data: mcqsData, error: mcqsError } =
//           await supabase
//             .from("mcqs")
//             .select("*")
//             .in("id", packData.mcq_ids)
//             .order("created_at", { ascending: true });

//         if (mcqsError) throw mcqsError;
//         setMcqs(mcqsData || []);
//       }

//       // Load topic
//       const { data: topicData, error: topicError } =
//         await supabase
//           .from("topics")
//           .select("*")
//           .eq("id", packData.topic_id)
//           .single();

//       if (topicError) throw topicError;
//       setTopic(topicData);

//       // Load subject
//       const { data: subjectData, error: subjectError } =
//         await supabase
//           .from("subjects")
//           .select("*")
//           .eq("id", packData.subject_id)
//           .single();

//       if (subjectError) throw subjectError;
//       setSubject(subjectData);
//     } catch (error) {
//       console.error("Error loading quiz pack data:", error);
//       alert("Error loading quiz pack. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetMCQForm = () => {
//     setMcqFormData({
//       question: "",
//       options: ["", "", "", ""],
//       correct_answer: 0,
//       explanation: "",
//       difficulty: "medium",
//     });
//     setEditingMCQ(null);
//   };

//   const startEditingMCQ = (mcq: MCQ) => {
//     setEditingMCQ(mcq);
//     setMcqFormData({
//       question: mcq.question,
//       options: mcq.options,
//       correct_answer: mcq.correct_answer,
//       explanation: mcq.explanation,
//       difficulty: mcq.difficulty,
//     });
//     setShowMCQForm(true);
//   };

//   const handleCreateMCQ = async () => {
//     if (!quizPack || !user?.id) return;

//     try {
//       const newMCQ = await MCQService.createMCQ({
//         question: mcqFormData.question,
//         options: mcqFormData.options,
//         correct_answer: mcqFormData.correct_answer,
//         explanation: mcqFormData.explanation,
//         difficulty: mcqFormData.difficulty,
//         topic_id: quizPack.topic_id,
//         subject_id: quizPack.subject_id,
//         created_by: user.id,
//       });

//       // Add MCQ to the quiz pack
//       const updatedPack = await QuizPackService.updateQuizPack(quizPack.id, {
//         mcq_ids: [...quizPack.mcq_ids, newMCQ.id],
//       });

//       setQuizPack(updatedPack);
//       setMcqs([...mcqs, newMCQ]);
//       setShowMCQForm(false);
//       resetMCQForm();
//     } catch (error) {
//       console.error("Error creating MCQ:", error);
//       alert("Error creating MCQ. Please try again.");
//     }
//   };

//   const handleUpdateMCQ = async () => {
//     if (!editingMCQ || !user?.id) return;

//     try {
//       const { data, error } = await supabase
//         .from("mcqs")
//         .update({
//           question: mcqFormData.question,
//           options: mcqFormData.options,
//           correct_answer: mcqFormData.correct_answer,
//           explanation: mcqFormData.explanation,
//           difficulty: mcqFormData.difficulty,
//           updated_at: new Date().toISOString(),
//         })
//         .eq("id", editingMCQ.id)
//         .select()
//         .single();

//       if (error) throw error;

//       setMcqs(mcqs.map((mcq) => (mcq.id === editingMCQ.id ? data : mcq)));
//       setShowMCQForm(false);
//       resetMCQForm();
//     } catch (error) {
//       console.error("Error updating MCQ:", error);
//       alert("Error updating MCQ. Please try again.");
//     }
//   };

//   const handleDeleteMCQ = async (mcqId: string) => {
//     if (confirm("Are you sure you want to delete this MCQ?")) {
//       try {
//         // Remove MCQ from quiz pack
//         const updatedMcqIds = quizPack!.mcq_ids.filter((id) => id !== mcqId);
//         await QuizPackService.updateQuizPack(quizPack!.id, {
//           mcq_ids: updatedMcqIds,
//         });

//         // Delete MCQ from database
//         await supabase
//           .from("mcqs")
//           .update({ is_active: false })
//           .eq("id", mcqId);

//         setMcqs(mcqs.filter((mcq) => mcq.id !== mcqId));
//         setQuizPack({
//           ...quizPack!,
//           mcq_ids: updatedMcqIds,
//           mcq_count: updatedMcqIds.length,
//         });
//       } catch (error) {
//         console.error("Error deleting MCQ:", error);
//         alert("Error deleting MCQ. Please try again.");
//       }
//     }
//   };

//   const getDifficultyColor = (difficulty: string) => {
//     switch (difficulty) {
//       case "easy":
//         return "text-green-400 bg-green-500/20";
//       case "medium":
//         return "text-yellow-400 bg-yellow-500/20";
//       case "hard":
//         return "text-red-400 bg-red-500/20";
//       default:
//         return "text-gray-400 bg-gray-500/20";
//     }
//   };

//   // Handle drag end event
//   const handleDragEnd = async (event: DragEndEvent) => {
//     const { active, over } = event;

//     if (!over || active.id === over.id || !quizPack) {
//       return;
//     }

//     const oldIndex = mcqs.findIndex((mcq) => mcq.id === active.id);
//     const newIndex = mcqs.findIndex((mcq) => mcq.id === over.id);

//     if (oldIndex === -1 || newIndex === -1) {
//       return;
//     }

//     // Reorder MCQs in local state
//     const reorderedMcqs = arrayMove(mcqs, oldIndex, newIndex);
//     setMcqs(reorderedMcqs);

//     // Update the mcq_ids array in the quiz pack
//     const newMcqIds = reorderedMcqs.map((mcq) => mcq.id);

//     try {
//     // Update the quiz pack with new order
//     const updatedPack = await QuizPackService.updateQuizPack(quizPack.id, {
//         mcq_ids: newMcqIds,
//       });

//       setQuizPack(updatedPack);
//       console.log("MCQ order updated successfully");
//     } catch (error) {
//       console.error("Error updating MCQ order:", error);
//       // Revert the local state if database update fails
//       setMcqs(mcqs);
//       alert("Error updating MCQ order. Please try again.");
//     }
//   };

//   // Get MCQs in the correct order based on mcq_ids array
//   const getOrderedMcqs = () => {
//     if (!quizPack || !mcqs.length) return [];

//     return quizPack.mcq_ids
//       .map((id) => mcqs.find((mcq) => mcq.id === id))
//       .filter(Boolean) as MCQ[];
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-dark-950 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-white text-lg">Loading Quiz Pack...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!quizPack) {
//     return (
//       <div className="min-h-screen bg-dark-950 flex items-center justify-center">
//         <div className="text-center">
//           <h1 className="text-2xl font-bold text-white mb-4">
//             Quiz Pack Not Found
//           </h1>
//           <button onClick={() => navigate(-1)} className="btn-primary">
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-dark-950">
//       {/* Header */}
//       <div className="bg-dark-900 border-b border-dark-800">
//         <div className="px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <button
//                 onClick={() => navigate(-1)}
//                 className="text-dark-400 hover:text-white transition-colors"
//               >
//                 <ArrowLeft className="w-6 h-6" />
//               </button>
//               <div>
//                 <h1 className="text-2xl font-bold text-white">
//                   {quizPack.title}
//                 </h1>
//                 <p className="text-dark-400">
//                   {subject?.name} • {topic?.name} • {mcqs.length} MCQs
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-3">
//               <button
//                 onClick={() => setShowImportModal(true)}
//                 className="px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors flex items-center space-x-2"
//               >
//                 <Upload className="w-4 h-4" />
//                 <span>Import</span>
//               </button>
//               <button
//                 onClick={() => {
//                   setShowMCQForm(true);
//                   resetMCQForm();
//                 }}
//                 className="btn-primary flex items-center space-x-2"
//               >
//                 <Plus className="w-4 h-4" />
//                 <span>Add MCQ</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="p-6">
//         <div className="max-w-6xl mx-auto">
//           {/* Quiz Pack Info */}
//           <div className="bg-dark-800 rounded-xl p-6 mb-6">
//             <div className="flex items-center justify-between mb-4">
//               <div>
//                 <h2 className="text-xl font-semibold text-white mb-2">
//                   {quizPack.title}
//                 </h2>
//                 <p className="text-dark-400">{quizPack.description}</p>
//               </div>
//               <div className="flex items-center space-x-4">
//                 <span
//                   className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
//                     quizPack.difficulty
//                   )}`}
//                 >
//                   {quizPack.difficulty}
//                 </span>
//                 <div className="text-right">
//                   <p className="text-white font-medium">
//                     {mcqs.length} Questions
//                   </p>
//                   <p className="text-dark-400 text-sm">
//                     Updated {new Date(quizPack.updated_at).toLocaleDateString()}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* MCQs List with Drag and Drop */}
//           <div className="space-y-4">
//             {mcqs.length === 0 ? (
//               <div className="text-center py-12">
//                 <Target className="w-16 h-16 text-dark-600 mx-auto mb-4" />
//                 <h3 className="text-xl font-semibold text-white mb-2">
//                   No MCQs Yet
//                 </h3>
//                 <p className="text-dark-400 mb-4">
//                   Start building your quiz pack by adding MCQs
//                 </p>
//                 <button
//                   onClick={() => {
//                     setShowMCQForm(true);
//                     resetMCQForm();
//                   }}
//                   className="btn-primary flex items-center space-x-2 mx-auto"
//                 >
//                   <Plus className="w-4 h-4" />
//                   <span>Add First MCQ</span>
//                 </button>
//               </div>
//             ) : (
//               <DndContext
//                 sensors={sensors}
//                 collisionDetection={closestCenter}
//                 onDragEnd={handleDragEnd}
//               >
//                 <SortableContext
//                   items={getOrderedMcqs().map((mcq) => mcq.id)}
//                   strategy={verticalListSortingStrategy}
//                 >
//                   {getOrderedMcqs().map((mcq, index) => (
//                     <SortableMCQItem
//                       key={mcq.id}
//                       mcq={mcq}
//                       index={index}
//                       onEdit={startEditingMCQ}
//                       onDelete={handleDeleteMCQ}
//                       getDifficultyColor={getDifficultyColor}
//                     />
//                   ))}
//                 </SortableContext>
//               </DndContext>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* MCQ Form Modal */}
//       {showMCQForm && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-dark-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between mb-6">
//               <h3 className="text-xl font-semibold text-white">
//                 {editingMCQ ? "Edit MCQ" : "Add New MCQ"}
//               </h3>
//               <button
//                 onClick={() => {
//                   setShowMCQForm(false);
//                   resetMCQForm();
//                 }}
//                 className="text-dark-400 hover:text-white transition-colors"
//               >
//                 <X className="w-6 h-6" />
//               </button>
//             </div>

//             <div className="space-y-4">
//               <div>
//                 <label className="block text-white font-medium mb-2">
//                   Question *
//                 </label>
//                 <textarea
//                   value={mcqFormData.question}
//                   onChange={(e) =>
//                     setMcqFormData({ ...mcqFormData, question: e.target.value })
//                   }
//                   className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 h-24 resize-none"
//                   placeholder="Enter the question"
//                 />
//               </div>

//               <div>
//                 <label className="block text-white font-medium mb-2">
//                   Answer Options *
//                 </label>
//                 <div className="space-y-2">
//                   {mcqFormData.options.map((option, index) => (
//                     <div key={index} className="flex items-center space-x-3">
//                       <input
//                         type="radio"
//                         name="correct_answer"
//                         checked={mcqFormData.correct_answer === index}
//                         onChange={() =>
//                           setMcqFormData({
//                             ...mcqFormData,
//                             correct_answer: index,
//                           })
//                         }
//                         className="w-4 h-4 text-primary-500 bg-dark-700 border-dark-600 focus:ring-primary-500"
//                       />
//                       <input
//                         type="text"
//                         value={option}
//                         onChange={(e) => {
//                           const newOptions = [...mcqFormData.options];
//                           newOptions[index] = e.target.value;
//                           setMcqFormData({
//                             ...mcqFormData,
//                             options: newOptions,
//                           });
//                         }}
//                         className="flex-1 px-3 py-2 bg-dark-700 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
//                         placeholder={`Option ${index + 1}`}
//                       />
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-white font-medium mb-2">
//                   Explanation
//                 </label>
//                 <textarea
//                   value={mcqFormData.explanation}
//                   onChange={(e) =>
//                     setMcqFormData({
//                       ...mcqFormData,
//                       explanation: e.target.value,
//                     })
//                   }
//                   className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 h-20 resize-none"
//                   placeholder="Explain why this is the correct answer"
//                 />
//               </div>

//               <div>
//                 <label className="block text-white font-medium mb-2">
//                   Difficulty *
//                 </label>
//                 <select
//                   value={mcqFormData.difficulty}
//                   onChange={(e) =>
//                     setMcqFormData({
//                       ...mcqFormData,
//                       difficulty: e.target.value as "easy" | "medium" | "hard",
//                     })
//                   }
//                   className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
//                 >
//                   <option value="easy">Easy</option>
//                   <option value="medium">Medium</option>
//                   <option value="hard">Hard</option>
//                 </select>
//               </div>

//               <div className="flex items-center justify-end space-x-3 pt-4">
//                 <button
//                   onClick={() => {
//                     setShowMCQForm(false);
//                     resetMCQForm();
//                   }}
//                   className="px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={editingMCQ ? handleUpdateMCQ : handleCreateMCQ}
//                   disabled={
//                     !mcqFormData.question ||
//                     mcqFormData.options.some((opt) => !opt.trim())
//                   }
//                   className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
//                 >
//                   <Save className="w-4 h-4" />
//                   <span>{editingMCQ ? "Update MCQ" : "Add MCQ"}</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Import Modal */}
//       {showImportModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-dark-800 rounded-2xl p-6 w-full max-w-md">
//             <div className="flex items-center justify-between mb-6">
//               <h3 className="text-xl font-semibold text-white">Import MCQs</h3>
//               <button
//                 onClick={() => setShowImportModal(false)}
//                 className="text-dark-400 hover:text-white transition-colors"
//               >
//                 <X className="w-6 h-6" />
//               </button>
//             </div>

//             <div className="text-center py-8">
//               <Upload className="w-16 h-16 text-dark-600 mx-auto mb-4" />
//               <h4 className="text-lg font-semibold text-white mb-2">
//                 Import Feature Coming Soon
//               </h4>
//               <p className="text-dark-400 mb-6">
//                 You'll be able to import MCQs from CSV, JSON, or other quiz
//                 formats.
//               </p>
//               <button
//                 onClick={() => setShowImportModal(false)}
//                 className="btn-primary"
//               >
//                 Got it
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default QuizPackDetail;
