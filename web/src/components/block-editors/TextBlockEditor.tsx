import React from "react";
import type { ContentBlock } from "../ContentBlockEditor";
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FORMAT_TEXT_COMMAND } from 'lexical';
import { Bold, Italic, Underline } from 'lucide-react';

interface TextBlockEditorProps {
  block: ContentBlock;
  onChange: (id: string, data: any) => void;
}

const theme = {
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
  },
};

function onError(error: Error) {
  console.error(error);
}

const Toolbar = () => {
  const [editor] = useLexicalComposerContext();

  const formatBold = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
  };

  const formatItalic = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
  };

  const formatUnderline = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
  };

  return (
    <div className="flex space-x-2 mb-2 border-b border-dark-600 pb-2">
      <button
        onClick={formatBold}
        className="p-1 rounded hover:bg-dark-700 text-white"
        title="Bold"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={formatItalic}
        className="p-1 rounded hover:bg-dark-700 text-white"
        title="Italic"
      >
        <Italic size={16} />
      </button>
      <button
        onClick={formatUnderline}
        className="p-1 rounded hover:bg-dark-700 text-white"
        title="Underline"
      >
        <Underline size={16} />
      </button>
    </div>
  );
};

const TextBlockEditor: React.FC<TextBlockEditorProps> = ({ block, onChange }) => {
  const initialConfig = {
    namespace: 'TextBlockEditor',
    theme,
    onError,
    editorState: block.data.content || undefined,
  };

  const handleChange = (editorState: any) => {
    onChange(block.id, { content: JSON.stringify(editorState) });
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <Toolbar />
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 min-h-[200px] outline-none"
            aria-placeholder="Enter text content..."
            placeholder={
              <div className="absolute top-2 left-3 text-gray-400 text-sm pointer-events-none">
                Enter text content...
              </div>
            }
          />
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <OnChangePlugin onChange={handleChange} />
    </LexicalComposer>
  );
};

export default TextBlockEditor;
