import type { Database } from "../lib/supabase";

// Explicitly define and export all types
export type Subject = Database["public"]["Tables"]["subjects"]["Row"];
export type SubjectInsert = Database["public"]["Tables"]["subjects"]["Insert"];
export type SubjectUpdate = Database["public"]["Tables"]["subjects"]["Update"];

export type Topic = Database["public"]["Tables"]["topics"]["Row"];
export type TopicInsert = Database["public"]["Tables"]["topics"]["Insert"];
export type TopicUpdate = Database["public"]["Tables"]["topics"]["Update"];

export type Flow = Database["public"]["Tables"]["flows"]["Row"];
export type FlowInsert = Database["public"]["Tables"]["flows"]["Insert"];
export type FlowUpdate = Database["public"]["Tables"]["flows"]["Update"];

export type FlowNodeDb = Database["public"]["Tables"]["flow_nodes"]["Row"];
export type FlowNodeInsert =
  Database["public"]["Tables"]["flow_nodes"]["Insert"];
export type FlowNodeUpdate =
  Database["public"]["Tables"]["flow_nodes"]["Update"];

// Extended Topic interface for hierarchical display
export interface TopicWithChildren extends Topic {
  children?: TopicWithChildren[];
  isExpanded?: boolean; // UI-only property for expand/collapse state
}

// Flow/Node types
// export type FlowNodeDb = Database["public"]["Tables"]["flow_nodes"]["Row"];

export interface FlowNode extends Omit<FlowNodeDb, "content_blocks"> {
  content_blocks: ContentBlock[];
}

// Content Block types
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}
