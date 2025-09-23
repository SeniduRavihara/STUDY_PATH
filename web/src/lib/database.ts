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
  isExpanded?: boolean; // UI-only property for expand/collapse state
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

  static async getAllSubjects(): Promise<Subject[]> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching all subjects:', error);
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

  // ===== FLOWS =====
  
  static async getFlowsByTopic(topicId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('flows')
      .select('*')
      .eq('topic_id', topicId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching flows by topic:', error);
      throw error;
    }
    
    return data || [];
  }

  static async createFlow(flowData: {
    topicId: string;
    name: string;
    description?: string;
    createdBy: string;
  }): Promise<any> {
    const { data, error } = await supabase
      .from('flows')
      .insert({
        topic_id: flowData.topicId,
        name: flowData.name,
        description: flowData.description,
        created_by: flowData.createdBy
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating flow:', error);
      throw error;
    }
    
    return data;
  }

  static async updateFlow(flowId: string, updates: any): Promise<any> {
    const { data, error } = await supabase
      .from('flows')
      .update(updates)
      .eq('id', flowId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating flow:', error);
      throw error;
    }
    
    return data;
  }

  static async deleteFlow(flowId: string): Promise<void> {
    const { error } = await supabase
      .from('flows')
      .delete()
      .eq('id', flowId);
    
    if (error) {
      console.error('Error deleting flow:', error);
      throw error;
    }
  }

  // ===== FLOW NODES =====
  
  static async getFlowNodes(flowId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('flow_nodes')
      .select('*')
      .eq('flow_id', flowId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching flow nodes:', error);
      throw error;
    }
    
    return data || [];
  }

  static async saveFlowNodes(flowId: string, nodes: any[]): Promise<void> {
    // Delete existing nodes
    const { error: deleteError } = await supabase
      .from('flow_nodes')
      .delete()
      .eq('flow_id', flowId);
    
    if (deleteError) {
      console.error('Error deleting existing flow nodes:', deleteError);
      throw deleteError;
    }

    // Insert new nodes
    const flowNodes = nodes.map(node => ({
      flow_id: flowId,
      node_type: node.type,
      title: node.title,
      description: node.description,
      sort_order: node.sort_order,
      config: node.config || {},
      status: node.status || 'available',
      xp_reward: node.xp || 0,
      difficulty: node.difficulty || 'medium',
      estimated_time: parseInt(node.estimatedTime?.replace(' min', '') || '5'),
      content_data: node.config || {},
      connections: node.connections || []
    }));

    const { error: insertError } = await supabase
      .from('flow_nodes')
      .insert(flowNodes);
    
    if (insertError) {
      console.error('Error inserting flow nodes:', insertError);
      throw insertError;
    }
  }

  static async loadFlowWithNodes(flowId: string): Promise<any> {
    // Get flow
    const { data: flow, error: flowError } = await supabase
      .from('flows')
      .select('*')
      .eq('id', flowId)
      .single();
    
    if (flowError) {
      console.error('Error fetching flow:', flowError);
      throw flowError;
    }
    
    if (!flow) return null;
    
    // Get flow nodes
    const nodes = await this.getFlowNodes(flowId);
    
    return {
      ...flow,
      nodes
    };
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

