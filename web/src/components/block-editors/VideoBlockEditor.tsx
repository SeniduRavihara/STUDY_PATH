import React from "react";
import type { ContentBlock } from "../ContentBlockEditor";

interface VideoBlockEditorProps {
  block: ContentBlock;
  onChange: (id: string, data: any) => void;
}

const VideoBlockEditor: React.FC<VideoBlockEditorProps> = ({ block, onChange }) => (
  <div className="space-y-3">
    <input
      type="text"
      value={block.data.url || ""}
      onChange={(e) => onChange(block.id, { ...block.data, url: e.target.value })}
      placeholder="Video URL..."
      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
    />
    <input
      type="text"
      value={block.data.title || ""}
      onChange={(e) => onChange(block.id, { ...block.data, title: e.target.value })}
      placeholder="Video title..."
      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
    />
  </div>
);

export default VideoBlockEditor;
