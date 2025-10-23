import { useState } from "react";
import ContentBlockEditor, {
  type ContentBlock,
} from "../components/ContentBlockEditor";

export default function TestContentBlocks() {
  const [blocks, setBlocks] = useState<ContentBlock[]>([
    {
      id: "test-1",
      type: "text",
      order: 0,
      data: { content: "This is a test text block" },
    },
  ]);

  return (
    <div className="min-h-screen bg-dark-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-dark-900 rounded-2xl p-6">
          <h1 className="text-white text-2xl font-bold mb-4">
            Content Blocks Test
          </h1>
          <p className="text-dark-300 text-sm mb-6">
            Current blocks: {blocks.length}
          </p>

          <ContentBlockEditor
            blocks={blocks}
            onChange={(newBlocks) => {
              console.log("Blocks updated:", newBlocks);
              setBlocks(newBlocks);
            }}
          />

          <div className="mt-8 p-4 bg-dark-800 rounded">
            <h3 className="text-white font-medium mb-2">Debug Info:</h3>
            <pre className="text-dark-300 text-xs overflow-auto">
              {JSON.stringify(blocks, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
