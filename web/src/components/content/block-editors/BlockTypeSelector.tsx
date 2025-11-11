import React from "react";
import {
  Code,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  MessageSquare,
  Settings,
  Sparkles,
  Type,
  Video,
} from "lucide-react";
import type { ContentBlock } from "../ContentBlockEditor";

interface BlockTypeSelectorProps {
  onSelect: (type: ContentBlock["type"]) => void;
  onClose: () => void;
}

const BlockTypeSelector: React.FC<BlockTypeSelectorProps> = ({ onSelect, onClose }) => {
  const blockTypes = [
    { type: "text" as const, label: "Text", icon: Type, color: "bg-blue-500" },
    { type: "note" as const, label: "Note", icon: FileText, color: "bg-yellow-500" },
    { type: "mcq" as const, label: "MCQ", icon: HelpCircle, color: "bg-green-500" },
    { type: "mcq_pack" as const, label: "MCQ Pack", icon: Settings, color: "bg-purple-500" },
    { type: "poll" as const, label: "Poll", icon: MessageSquare, color: "bg-pink-500" },
    { type: "video" as const, label: "Video", icon: Video, color: "bg-red-500" },
    { type: "image" as const, label: "Image", icon: ImageIcon, color: "bg-indigo-500" },
    { type: "meme" as const, label: "Meme", icon: Sparkles, color: "bg-orange-500" },
    { type: "code" as const, label: "Code", icon: Code, color: "bg-gray-500" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-dark-800 rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Choose Block Type</h3>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {blockTypes.map((blockType) => {
            const Icon = blockType.icon;
            return (
              <button
                key={blockType.type}
                onClick={() => onSelect(blockType.type)}
                className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-dark-700 transition-colors group"
              >
                <div className={`${blockType.color} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs text-dark-300 group-hover:text-white text-center">
                  {blockType.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BlockTypeSelector;
