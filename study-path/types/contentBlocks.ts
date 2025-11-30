// Content Block Types for Mobile App
// Matches the web implementation

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

// Specific data interfaces for each block type
export interface TextBlockData {
  content: string;
}

export interface NoteBlockData {
  title: string;
  content: string;
  style: "info" | "warning" | "success" | "error";
}

export interface MCQData {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface MCQBlockData extends MCQData {}

export interface MCQPackBlockData {
  title: string;
  description: string;
  mcqs: MCQData[];
}

export interface PollBlockData {
  question: string;
  options: string[];
  allowMultiple: boolean;
}

export interface VideoBlockData {
  url: string;
  title: string;
  description: string;
}

export interface ImageBlockData {
  url: string;
  caption: string;
  alt: string;
}

export interface MemeBlockData {
  imageUrl: string;
  topText: string;
  bottomText: string;
}

export interface CodeBlockData {
  code: string;
  language: string;
  title: string;
}

// Type guard functions
export function isTextBlock(
  block: ContentBlock
): block is ContentBlock & { data: TextBlockData } {
  return block.type === "text";
}

export function isNoteBlock(
  block: ContentBlock
): block is ContentBlock & { data: NoteBlockData } {
  return block.type === "note";
}

export function isMCQBlock(
  block: ContentBlock
): block is ContentBlock & { data: MCQBlockData } {
  return block.type === "mcq";
}

export function isMCQPackBlock(
  block: ContentBlock
): block is ContentBlock & { data: MCQPackBlockData } {
  return block.type === "mcq_pack";
}

export function isPollBlock(
  block: ContentBlock
): block is ContentBlock & { data: PollBlockData } {
  return block.type === "poll";
}

export function isVideoBlock(
  block: ContentBlock
): block is ContentBlock & { data: VideoBlockData } {
  return block.type === "video";
}

export function isImageBlock(
  block: ContentBlock
): block is ContentBlock & { data: ImageBlockData } {
  return block.type === "image";
}

export function isMemeBlock(
  block: ContentBlock
): block is ContentBlock & { data: MemeBlockData } {
  return block.type === "meme";
}

export function isCodeBlock(
  block: ContentBlock
): block is ContentBlock & { data: CodeBlockData } {
  return block.type === "code";
}
