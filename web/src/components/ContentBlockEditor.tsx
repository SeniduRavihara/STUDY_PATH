import {
  Code,
  Edit,
  FileText,
  GripVertical,
  HelpCircle,
  Image as ImageIcon,
  MessageSquare,
  Plus,
  Sparkles,
  Trash2,
  Type,
  Video,
  X,
} from "lucide-react";
import React, { useState } from "react";
import MCQPackEditorModal from "./MCQPackEditorModal";

export interface ContentBlock {
  id: string;
  type:
    | "text"
    | "note"
    | "mcq"
    | "mcq_pack"
    | "poll"
    | "video"
    | "image"
    | "meme"
    | "code";
  order: number;
  data: any;
}

interface ContentBlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

const ContentBlockEditor: React.FC<ContentBlockEditorProps> = ({
  blocks,
  onChange,
}) => {
  const [showBlockSelector, setShowBlockSelector] = useState(false);
  const [editingMCQPack, setEditingMCQPack] = useState<{
    blockId: string;
    data: any;
  } | null>(null);

  // Add new block
  const addBlock = (type: ContentBlock["type"]) => {
    const newBlock: ContentBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      order: blocks.length,
      data: getDefaultDataForType(type),
    };
    console.log("🎯 Adding new block:", newBlock);
    console.log("📦 Current blocks:", blocks);
    console.log("📦 New blocks array:", [...blocks, newBlock]);
    onChange([...blocks, newBlock]);
    setShowBlockSelector(false);
  };

  // Get default data structure for each block type
  const getDefaultDataForType = (type: ContentBlock["type"]): any => {
    switch (type) {
      case "text":
        return { content: "" };
      case "note":
        return { title: "", content: "", style: "info" };
      case "mcq":
        return {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
          explanation: "",
        };
      case "mcq_pack":
        return {
          title: "MCQ Pack",
          description: "",
          mcqs: [
            {
              question: "",
              options: ["", "", "", ""],
              correctAnswer: 0,
              explanation: "",
            },
          ],
        };
      case "poll":
        return {
          question: "",
          options: ["Yes", "No"],
          allowMultiple: false,
        };
      case "video":
        return { url: "", title: "", description: "" };
      case "image":
        return { url: "", caption: "", alt: "" };
      case "meme":
        return { imageUrl: "", topText: "", bottomText: "" };
      case "code":
        return { code: "", language: "javascript", title: "" };
      default:
        return {};
    }
  };

  // Update block data
  const updateBlock = (id: string, data: any) => {
    onChange(
      blocks.map((block) =>
        block.id === id ? { ...block, data: { ...block.data, ...data } } : block
      )
    );
  };

  // Delete block
  const deleteBlock = (id: string) => {
    onChange(blocks.filter((block) => block.id !== id));
  };

  // Move block up/down
  const moveBlock = (index: number, direction: "up" | "down") => {
    console.log(`🔼🔽 Moving block ${index} ${direction}`);
    const newBlocks = [...blocks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= blocks.length) {
      console.log("Cannot move - out of bounds");
      return;
    }

    // Swap blocks
    [newBlocks[index], newBlocks[targetIndex]] = [
      newBlocks[targetIndex],
      newBlocks[index],
    ];

    // Update order numbers
    newBlocks.forEach((block, idx) => {
      block.order = idx;
    });

    console.log(
      "Blocks reordered:",
      newBlocks.map((b) => `${b.type}(${b.order})`).join(", ")
    );
    onChange(newBlocks);
  };

  // Block type configurations
  const blockTypes = [
    { type: "text" as const, icon: Type, label: "Text", color: "bg-blue-500" },
    {
      type: "note" as const,
      icon: FileText,
      label: "Note",
      color: "bg-yellow-500",
    },
    {
      type: "mcq" as const,
      icon: HelpCircle,
      label: "Single MCQ",
      color: "bg-purple-500",
    },
    {
      type: "mcq_pack" as const,
      icon: Sparkles,
      label: "MCQ Pack",
      color: "bg-indigo-500",
    },
    {
      type: "poll" as const,
      icon: MessageSquare,
      label: "Poll",
      color: "bg-green-500",
    },
    {
      type: "video" as const,
      icon: Video,
      label: "Video",
      color: "bg-red-500",
    },
    {
      type: "image" as const,
      icon: ImageIcon,
      label: "Image",
      color: "bg-pink-500",
    },
    {
      type: "meme" as const,
      icon: Sparkles,
      label: "Meme",
      color: "bg-orange-500",
    },
    { type: "code" as const, icon: Code, label: "Code", color: "bg-cyan-500" },
  ];

  return (
    <div className="space-y-4">
      {/* MCQ Pack Editor Modal */}
      {editingMCQPack && (
        <MCQPackEditorModal
          isOpen={true}
          onClose={() => setEditingMCQPack(null)}
          data={editingMCQPack.data}
          onSave={(updatedData) => {
            updateBlock(editingMCQPack.blockId, updatedData);
            setEditingMCQPack(null);
          }}
        />
      )}

      {/* Content Blocks List */}
      {blocks.length > 0 ? (
        <div className="space-y-3">
          {blocks.map((block, index) => (
            <div
              key={block.id}
              className="bg-dark-700 rounded-lg border border-dark-600 overflow-hidden"
            >
              {/* Block Header */}
              <div className="flex items-center justify-between px-4 py-2 bg-dark-800 border-b border-dark-600">
                <div className="flex items-center space-x-3">
                  <button
                    className="text-dark-400 hover:text-white cursor-move"
                    title="Drag to reorder"
                  >
                    <GripVertical className="w-4 h-4" />
                  </button>
                  {React.createElement(
                    blockTypes.find((t) => t.type === block.type)?.icon || Type,
                    { className: "w-4 h-4 text-primary-400" }
                  )}
                  <span className="text-sm font-medium text-white capitalize">
                    {block.type}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => moveBlock(index, "up")}
                    disabled={index === 0}
                    className="px-2 py-1 text-lg text-dark-400 hover:text-white hover:bg-dark-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveBlock(index, "down")}
                    disabled={index === blocks.length - 1}
                    className="px-2 py-1 text-lg text-dark-400 hover:text-white hover:bg-dark-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => deleteBlock(block.id)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors ml-1"
                    title="Delete block"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Block Content Editor */}
              <div className="p-4">
                {block.type === "text" && (
                  <TextBlockEditor block={block} onChange={updateBlock} />
                )}
                {block.type === "note" && (
                  <NoteBlockEditor block={block} onChange={updateBlock} />
                )}
                {block.type === "mcq" && (
                  <MCQBlockEditor block={block} onChange={updateBlock} />
                )}
                {block.type === "mcq_pack" && (
                  <MCQPackBlockPreview
                    block={block}
                    onEdit={() =>
                      setEditingMCQPack({ blockId: block.id, data: block.data })
                    }
                  />
                )}
                {block.type === "poll" && (
                  <PollBlockEditor block={block} onChange={updateBlock} />
                )}
                {block.type === "video" && (
                  <VideoBlockEditor block={block} onChange={updateBlock} />
                )}
                {block.type === "image" && (
                  <ImageBlockEditor block={block} onChange={updateBlock} />
                )}
                {block.type === "meme" && (
                  <MemeBlockEditor block={block} onChange={updateBlock} />
                )}
                {block.type === "code" && (
                  <CodeBlockEditor block={block} onChange={updateBlock} />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 px-4 bg-dark-800 rounded-lg border border-dark-600">
          <FileText className="w-12 h-12 text-dark-500 mx-auto mb-3" />
          <p className="text-dark-300 text-sm mb-2">No content blocks yet</p>
          <p className="text-dark-400 text-xs">
            Click "Add Content Block" below to get started!
          </p>
        </div>
      )}

      {/* Add Block Button */}
      <div className="relative">
        <button
          onClick={() => setShowBlockSelector(!showBlockSelector)}
          className="w-full py-3 border-2 border-dashed border-dark-600 rounded-lg text-dark-400 hover:text-primary-400 hover:border-primary-400 transition-all flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Content Block</span>
        </button>

        {/* Block Type Selector */}
        {showBlockSelector && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-dark-800 rounded-lg border border-dark-600 p-3 grid grid-cols-4 gap-2 z-10 shadow-xl">
            {blockTypes.map((blockType) => (
              <button
                key={blockType.type}
                onClick={() => addBlock(blockType.type)}
                className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-dark-700 transition-colors group"
              >
                <div
                  className={`${blockType.color} p-2 rounded-lg group-hover:scale-110 transition-transform`}
                >
                  <blockType.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-dark-300 group-hover:text-white">
                  {blockType.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Individual Block Editors
const TextBlockEditor: React.FC<{
  block: ContentBlock;
  onChange: (id: string, data: any) => void;
}> = ({ block, onChange }) => (
  <textarea
    value={block.data.content || ""}
    onChange={(e) => onChange(block.id, { content: e.target.value })}
    placeholder="Enter text content..."
    className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 min-h-[100px]"
  />
);

const NoteBlockEditor: React.FC<{
  block: ContentBlock;
  onChange: (id: string, data: any) => void;
}> = ({ block, onChange }) => (
  <div className="space-y-3">
    <input
      type="text"
      value={block.data.title || ""}
      onChange={(e) => onChange(block.id, { title: e.target.value })}
      placeholder="Note title..."
      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
    />
    <textarea
      value={block.data.content || ""}
      onChange={(e) => onChange(block.id, { content: e.target.value })}
      placeholder="Note content..."
      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 min-h-[80px]"
    />
    <select
      value={block.data.style || "info"}
      onChange={(e) => onChange(block.id, { style: e.target.value })}
      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
    >
      <option value="info">Info</option>
      <option value="warning">Warning</option>
      <option value="success">Success</option>
      <option value="error">Error</option>
    </select>
  </div>
);

const MCQBlockEditor: React.FC<{
  block: ContentBlock;
  onChange: (id: string, data: any) => void;
}> = ({ block, onChange }) => {
  const addOption = () => {
    if (block.data.options.length < 6) {
      onChange(block.id, {
        options: [...block.data.options, ""],
      });
    }
  };

  const removeOption = (index: number) => {
    if (block.data.options.length > 2) {
      const newOptions = block.data.options.filter(
        (_: any, i: number) => i !== index
      );
      onChange(block.id, {
        options: newOptions,
        correctAnswer:
          block.data.correctAnswer >= index
            ? Math.max(0, block.data.correctAnswer - 1)
            : block.data.correctAnswer,
      });
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...block.data.options];
    newOptions[index] = value;
    onChange(block.id, { options: newOptions });
  };

  return (
    <div className="space-y-3">
      <textarea
        value={block.data.question || ""}
        onChange={(e) => onChange(block.id, { question: e.target.value })}
        placeholder="Enter question..."
        className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 min-h-[60px]"
      />

      <div className="space-y-2">
        <label className="text-xs text-dark-400">
          Options (select correct answer)
        </label>
        {block.data.options.map((option: string, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="radio"
              checked={block.data.correctAnswer === index}
              onChange={() => onChange(block.id, { correctAnswer: index })}
              className="text-primary-500"
            />
            <input
              type="text"
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              className="flex-1 px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            {block.data.options.length > 2 && (
              <button
                onClick={() => removeOption(index)}
                className="text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        {block.data.options.length < 6 && (
          <button
            onClick={addOption}
            className="text-sm text-primary-400 hover:text-primary-300"
          >
            + Add Option
          </button>
        )}
      </div>

      <textarea
        value={block.data.explanation || ""}
        onChange={(e) => onChange(block.id, { explanation: e.target.value })}
        placeholder="Explanation (optional)..."
        className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 min-h-[60px]"
      />
    </div>
  );
};

const PollBlockEditor: React.FC<{
  block: ContentBlock;
  onChange: (id: string, data: any) => void;
}> = ({ block, onChange }) => {
  const addOption = () => {
    if (block.data.options.length < 6) {
      onChange(block.id, {
        options: [...block.data.options, ""],
      });
    }
  };

  const removeOption = (index: number) => {
    if (block.data.options.length > 2) {
      const newOptions = block.data.options.filter(
        (_: any, i: number) => i !== index
      );
      onChange(block.id, { options: newOptions });
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...block.data.options];
    newOptions[index] = value;
    onChange(block.id, { options: newOptions });
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={block.data.question || ""}
        onChange={(e) => onChange(block.id, { question: e.target.value })}
        placeholder="Poll question..."
        className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
      />

      <div className="space-y-2">
        {block.data.options.map((option: string, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="text"
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              className="flex-1 px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            {block.data.options.length > 2 && (
              <button
                onClick={() => removeOption(index)}
                className="text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        {block.data.options.length < 6 && (
          <button
            onClick={addOption}
            className="text-sm text-primary-400 hover:text-primary-300"
          >
            + Add Option
          </button>
        )}
      </div>

      <label className="flex items-center space-x-2 text-sm text-dark-300">
        <input
          type="checkbox"
          checked={block.data.allowMultiple || false}
          onChange={(e) =>
            onChange(block.id, { allowMultiple: e.target.checked })
          }
          className="text-primary-500"
        />
        <span>Allow multiple selections</span>
      </label>
    </div>
  );
};

const VideoBlockEditor: React.FC<{
  block: ContentBlock;
  onChange: (id: string, data: any) => void;
}> = ({ block, onChange }) => (
  <div className="space-y-3">
    <input
      type="text"
      value={block.data.title || ""}
      onChange={(e) => onChange(block.id, { title: e.target.value })}
      placeholder="Video title..."
      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
    />
    <input
      type="url"
      value={block.data.url || ""}
      onChange={(e) => onChange(block.id, { url: e.target.value })}
      placeholder="Video URL (YouTube, Vimeo, etc.)..."
      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
    />
    <textarea
      value={block.data.description || ""}
      onChange={(e) => onChange(block.id, { description: e.target.value })}
      placeholder="Description (optional)..."
      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 min-h-[60px]"
    />
  </div>
);

const ImageBlockEditor: React.FC<{
  block: ContentBlock;
  onChange: (id: string, data: any) => void;
}> = ({ block, onChange }) => (
  <div className="space-y-3">
    <input
      type="url"
      value={block.data.url || ""}
      onChange={(e) => onChange(block.id, { url: e.target.value })}
      placeholder="Image URL..."
      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
    />
    <input
      type="text"
      value={block.data.caption || ""}
      onChange={(e) => onChange(block.id, { caption: e.target.value })}
      placeholder="Caption..."
      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
    />
    <input
      type="text"
      value={block.data.alt || ""}
      onChange={(e) => onChange(block.id, { alt: e.target.value })}
      placeholder="Alt text (for accessibility)..."
      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
    />
  </div>
);

const MemeBlockEditor: React.FC<{
  block: ContentBlock;
  onChange: (id: string, data: any) => void;
}> = ({ block, onChange }) => (
  <div className="space-y-3">
    <input
      type="url"
      value={block.data.imageUrl || ""}
      onChange={(e) => onChange(block.id, { imageUrl: e.target.value })}
      placeholder="Meme image URL..."
      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
    />
    <input
      type="text"
      value={block.data.topText || ""}
      onChange={(e) => onChange(block.id, { topText: e.target.value })}
      placeholder="Top text..."
      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
    />
    <input
      type="text"
      value={block.data.bottomText || ""}
      onChange={(e) => onChange(block.id, { bottomText: e.target.value })}
      placeholder="Bottom text..."
      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
    />
  </div>
);

const CodeBlockEditor: React.FC<{
  block: ContentBlock;
  onChange: (id: string, data: any) => void;
}> = ({ block, onChange }) => (
  <div className="space-y-3">
    <input
      type="text"
      value={block.data.title || ""}
      onChange={(e) => onChange(block.id, { title: e.target.value })}
      placeholder="Code title..."
      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
    />
    <select
      value={block.data.language || "javascript"}
      onChange={(e) => onChange(block.id, { language: e.target.value })}
      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
    >
      <option value="javascript">JavaScript</option>
      <option value="typescript">TypeScript</option>
      <option value="python">Python</option>
      <option value="java">Java</option>
      <option value="cpp">C++</option>
      <option value="html">HTML</option>
      <option value="css">CSS</option>
      <option value="sql">SQL</option>
    </select>
    <textarea
      value={block.data.code || ""}
      onChange={(e) => onChange(block.id, { code: e.target.value })}
      placeholder="Enter code..."
      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 min-h-[150px] font-mono"
    />
  </div>
);

// MCQ Pack Block Preview - Shows summary and "Edit Pack" button
const MCQPackBlockPreview: React.FC<{
  block: ContentBlock;
  onEdit: () => void;
}> = ({ block, onEdit }) => {
  const mcqCount = block.data?.mcqs?.length || 0;
  const title = block.data?.title || "Untitled MCQ Pack";
  const description = block.data?.description || "";

  return (
    <div className="space-y-3">
      <div className="p-4 bg-dark-800 rounded-lg border border-dark-600">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="text-white font-medium mb-1">{title}</h4>
            {description && (
              <p className="text-sm text-dark-300">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-600">
          <div className="flex items-center space-x-4 text-sm text-dark-300">
            <span className="flex items-center">
              <HelpCircle className="w-4 h-4 mr-1" />
              {mcqCount} {mcqCount === 1 ? "Question" : "Questions"}
            </span>
          </div>

          <button
            onClick={onEdit}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Pack</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// MCQ Pack Block Editor - Collection of multiple MCQs (DEPRECATED - use modal instead)
// Commented out to avoid unused variable warnings - kept for reference
/*
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MCQPackBlockEditor: React.FC<{ block: ContentBlock; onChange: (id: string, data: any) => void }> = ({ block, onChange }) => {
  ...function implementation removed for brevity...
};
*/

export default ContentBlockEditor;
