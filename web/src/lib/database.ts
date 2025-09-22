import { supabase } from './supabase';
import type { Database } from './supabase';

// Explicitly define and export all types
export type Subject = Database['public']['Tables']['subjects']['Row'];
export type SubjectInsert = Database['public']['Tables']['subjects']['Insert'];
export type SubjectUpdate = Database['public']['Tables']['subjects']['Update'];

export type Topic = Database['public']['Tables']['topics']['Row'];
export type TopicInsert = Database['public']['Tables']['topics']['Insert'];
export type TopicUpdate = Database['public']['Tables']['topics']['Update'];

// Extended Topic interface for hierarchical display
export interface TopicWithChildren extends Topic {
  children: TopicWithChildren[];
}

// Database service class
export class DatabaseService {
  // ===== SUBJECTS =====
  
  static async getSubjects(): Promise<Subject[]> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
    
    return data || [];
  }

  static async getSubjectById(id: string): Promise<Subject | null> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching subject:', error);
      return null;
    }
    
    return data;
  }

  static async createSubject(subject: SubjectInsert): Promise<Subject> {
    const { data, error } = await supabase
      .from('subjects')
      .insert(subject)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating subject:', error);
      throw error;
    }
    
    return data;
  }

  static async updateSubject(id: string, updates: SubjectUpdate): Promise<Subject> {
    const { data, error } = await supabase
      .from('subjects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating subject:', error);
      throw error;
    }
    
    return data;
  }

  static async deleteSubject(id: string): Promise<void> {
    const { error } = await supabase
      .from('subjects')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting subject:', error);
      throw error;
    }
  }

  // ===== TOPICS =====
  
  static async getTopicsBySubject(subjectId: string): Promise<TopicWithChildren[]> {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('subject_id', subjectId)
      .eq('is_active', true)
      .order('level', { ascending: true })
      .order('sort_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching topics:', error);
      throw error;
    }
    
    // Convert flat array to hierarchical structure
    return this.buildTopicHierarchy(data || []);
  }

  static async getTopicById(id: string): Promise<Topic | null> {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching topic:', error);
      return null;
    }
    
    return data;
  }

  static async createTopic(topic: TopicInsert): Promise<Topic> {
    const { data, error } = await supabase
      .from('topics')
      .insert(topic)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating topic:', error);
      throw error;
    }
    
    return data;
  }

  static async updateTopic(id: string, updates: TopicUpdate): Promise<Topic> {
    const { data, error } = await supabase
      .from('topics')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating topic:', error);
      throw error;
    }
    
    return data;
  }

  static async deleteTopic(id: string): Promise<void> {
    const { error } = await supabase
      .from('topics')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting topic:', error);
      throw error;
    }
  }

  static async getLeafTopics(subjectId: string): Promise<Topic[]> {
    const { data, error } = await supabase
      .from('topics')
      .select(`
        *,
        children:topics!parent_id(count)
      `)
      .eq('subject_id', subjectId)
      .eq('is_active', true);
    
    if (error) {
      console.error('Error fetching leaf topics:', error);
      throw error;
    }
    
    // Filter topics that have no children (leaf nodes)
    const leafTopics = (data || []).filter(() => {
      // This is a simplified check - in a real scenario, you'd need a more complex query
      return true; // For now, return all topics
    });
    
    return leafTopics;
  }

  // ===== HELPER METHODS =====
  
  private static buildTopicHierarchy(topics: Topic[]): TopicWithChildren[] {
    const topicMap = new Map<string, TopicWithChildren>();
    const rootTopics: TopicWithChildren[] = [];
    
    // Create map of all topics
    topics.forEach(topic => {
      topicMap.set(topic.id, { ...topic, children: [] });
    });
    
    // Build hierarchy
    topics.forEach(topic => {
      const topicWithChildren = topicMap.get(topic.id)!;
      
      if (topic.parent_id) {
        const parent = topicMap.get(topic.parent_id);
        if (parent) {
          parent.children.push(topicWithChildren);
        }
      } else {
        rootTopics.push(topicWithChildren);
      }
    });
    
    return rootTopics;
  }

  // ===== AUTH =====
  
  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }
}

