import React from "react";
import type { ContentBlock } from "../ContentBlockEditor";
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FORMAT_TEXT_COMMAND, $getSelection, $isRangeSelection } from 'lexical';
import { HeadingNode, QuoteNode, $createHeadingNode } from '@lexical/rich-text';
import { ListNode, ListItemNode, $insertList } from '@lexical/list';
import { $setBlocksType } from '@lexical/selection';
import { Bold, Italic, Underline, Heading1, Heading2, List, ListOrdered } from 'lucide-react';

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
  heading: {
    h1: 'text-2xl font-bold mb-2',
    h2: 'text-xl font-semibold mb-2',
  },
  list: {
    ul: 'list-disc list-inside',
    ol: 'list-decimal list-inside',
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

  const formatHeading1 = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode('h1'));
      }
    });
  };

  const formatHeading2 = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode('h2'));
      }
    });
  };

  const insertBulletList = () => {
    editor.update(() => {
      $insertList('bullet');
    });
  };

  const insertNumberedList = () => {
    editor.update(() => {
      $insertList('number');
    });
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
      <button
        onClick={formatHeading1}
        className="p-1 rounded hover:bg-dark-700 text-white"
        title="Heading 1"
      >
        <Heading1 size={16} />
      </button>
      <button
        onClick={formatHeading2}
        className="p-1 rounded hover:bg-dark-700 text-white"
        title="Heading 2"
      >
        <Heading2 size={16} />
      </button>
      <button
        onClick={insertBulletList}
        className="p-1 rounded hover:bg-dark-700 text-white"
        title="Bullet List"
      >
        <List size={16} />
      </button>
      <button
        onClick={insertNumberedList}
        className="p-1 rounded hover:bg-dark-700 text-white"
        title="Numbered List"
      >
        <ListOrdered size={16} />
      </button>
    </div>
  );
};

const TextBlockEditor: React.FC<TextBlockEditorProps> = ({ block, onChange }) => {
  const initialConfig = {
    namespace: 'TextBlockEditor',
    theme,
    onError,
    nodes: [HeadingNode, ListNode, ListItemNode, QuoteNode],
    editorState: block.data.content || undefined,
  };

  const handleChange = (editorState: any) => {
    onChange(block.id, { content: JSON.stringify(editorState) });
  };

  return (
    <div className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus-within:outline-none focus-within:ring-1 focus-within:ring-primary-500 min-h-[200px]">
      <LexicalComposer initialConfig={initialConfig}>
        <Toolbar />
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="w-full outline-none min-h-[180px] px-1 py-1"
              aria-placeholder="Enter text content..."
              placeholder={
                <div className="text-gray-400 text-sm pointer-events-none">
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
    </div>
  );
};

export default TextBlockEditor;
