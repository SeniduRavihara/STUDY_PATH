import { supabase } from "../lib/supabase";
import type { Flow, FlowNode, FlowUpdate } from "../types/database";

export class FlowBuilderService {
  static async getFlowByTopic(topicId: string): Promise<Flow | null> {
    const { data, error } = await supabase
      .from("flows")
      .select("*")
      .eq("topic_id", topicId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching flows by topic:", error);
      throw error;
    }

    return data[0] || null;
  }

  static async createFlow(flowData: {
    topicId: string;
    name: string;
    description?: string;
    createdBy: string;
  }): Promise<Flow> {
    const { data, error } = await supabase
      .from("flows")
      .insert({
        topic_id: flowData.topicId,
        name: flowData.name,
        description: flowData.description,
        created_by: flowData.createdBy,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating flow:", error);
      throw error;
    }

    return data;
  }

  static async updateFlow(flowId: string, updates: FlowUpdate): Promise<Flow> {
    const { data, error } = await supabase
      .from("flows")
      .update(updates)
      .eq("id", flowId)
      .select()
      .single();

    if (error) {
      console.error("Error updating flow:", error);
      throw error;
    }

    return data;
  }

  static async deleteFlow(flowId: string): Promise<void> {
    const { error } = await supabase.from("flows").delete().eq("id", flowId);

    if (error) {
      console.error("Error deleting flow:", error);
      throw error;
    }
  }

  static async getFlowNodes(flowId: string): Promise<FlowNode[]> {
    const { data, error } = await supabase
      .from("flow_nodes")
      .select("*")
      .eq("flow_id", flowId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching flow nodes:", error);
      throw error;
    }

    return data || [];
  }

  static async saveFlowNodes(flowId: string, nodes: FlowNode[]): Promise<void> {
    // Delete existing nodes
    const { error: deleteError } = await supabase
      .from("flow_nodes")
      .delete()
      .eq("flow_id", flowId);

    if (deleteError) {
      console.error("Error deleting existing flow nodes:", deleteError);
      throw deleteError;
    }

    // Insert new nodes
    const flowNodes = nodes.map((node) => ({
      flow_id: flowId,
      title: node.title,
      description: node.description,
      sort_order: node.sort_order,
      config: node.config || {},
      status: node.status || "available",
      xp_reward: node.xp_reward || 0,
      difficulty: node.difficulty || "medium",
      estimated_time: node.estimated_time || 10,
      content_blocks: node.content_blocks || [],
      connections: node.connections || [],
      is_practice_node: node.is_practice_node || false,
      optional_position: node.optional_position || null,
    }));

    const { error: insertError } = await supabase
      .from("flow_nodes")
      .insert(flowNodes);

    if (insertError) {
      console.error("Error inserting flow nodes:", insertError);
      throw insertError;
    }
  }

  static async loadFlowWithNodes(
    flowId: string
  ): Promise<{ flow: Flow; nodes: FlowNode[] } | null> {
    // Get flow
    const { data: flow, error: flowError } = await supabase
      .from("flows")
      .select("*")
      .eq("id", flowId)
      .single();

    if (flowError) {
      console.error("Error fetching flow:", flowError);
      throw flowError;
    }

    if (!flow) return null;

    // Get flow nodes
    const nodes = await this.getFlowNodes(flowId);

    // console.log("Loaded flow with nodes:", { flow, nodes });

    return {
      flow,
      nodes,
    };
  }
}
