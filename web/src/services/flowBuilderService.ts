import { supabase } from '../lib/supabase';

export class FlowBuilderService {
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

  // Optimized: Load only flow structure (no MCQs, no quiz packs)
  static async loadFlowStructure(flowId: string): Promise<any> {
    // Get flow first
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

    // Get flow nodes separately
    const { data: nodes, error: nodesError } = await supabase
      .from('flow_nodes')
      .select('*')
      .eq('flow_id', flowId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (nodesError) {
      console.error('Error fetching flow nodes:', nodesError);
      throw nodesError;
    }

    return {
      ...flow,
      flow_nodes: nodes || []
    };
  }

  // Load MCQs only when quiz node is clicked
  static async loadMCQsForQuizNode(quizPackId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('mcqs')
      .select('*')
      .eq('quiz_pack_id', quizPackId)
      .eq('is_active', true)
      .order('created_at');

    if (error) {
      console.error('Error fetching MCQs for quiz node:', error);
      throw error;
    }

    return data || [];
  }

  // Load quiz packs only when editing quiz node
  static async loadQuizPacksForTopic(topicId: string, subjectId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('quiz_packs')
      .select('*')
      .or(`topic_id.eq.${topicId},topic_id.is.null`)
      .eq('subject_id', subjectId)
      .eq('is_active', true)
      .order('created_at');

    if (error) {
      console.error('Error fetching quiz packs for topic:', error);
      throw error;
    }

    return data || [];
  }
}
