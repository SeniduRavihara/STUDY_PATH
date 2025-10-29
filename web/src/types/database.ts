import type { Database } from '../lib/supabase';

// Explicitly define and export all types
export type Subject = Database['public']['Tables']['subjects']['Row'];
export type SubjectInsert = Database['public']['Tables']['subjects']['Insert'];
export type SubjectUpdate = Database['public']['Tables']['subjects']['Update'];

export type Topic = Database['public']['Tables']['topics']['Row'];
export type TopicInsert = Database['public']['Tables']['topics']['Insert'];
export type TopicUpdate = Database['public']['Tables']['topics']['Update'];

// Extended Topic interface for hierarchical display
export interface TopicWithChildren extends Topic {
  children?: TopicWithChildren[];
  isExpanded?: boolean; // UI-only property for expand/collapse state
}

// Flow/Node types
export interface FlowNode {
  id: string;
  type: 'quiz' | 'study' | 'video' | 'assignment' | 'assessment' | 'start' | 'end';
  title: string;
  description: string;
  sort_order: number;
  config: any;
  connections: string[];
  status: 'locked' | 'available' | 'completed' | 'current';
  difficulty: 'easy' | 'medium' | 'hard';
  xp: number;
  icon: string;
  color: [string, string];
  estimatedTime?: string;
  position?: { x: number; y: number };
  content_blocks?: ContentBlock[];
}

// Content Block types
export interface ContentBlock {
  id: string;
  type: 'text' | 'note' | 'mcq' | 'mcq_pack' | 'poll' | 'video' | 'image' | 'meme' | 'code';
  order: number;
  data: any;
}
