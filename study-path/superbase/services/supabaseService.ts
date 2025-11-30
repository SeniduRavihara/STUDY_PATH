import { supabase } from "../supabase";

export class SupabaseService {
  static async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return { user, error };
  }

  // User Profile
  static async createUserProfile(userId: string, profile: any) {
    const { data, error } = await supabase
      .from("users")
      .insert([{ id: userId, ...profile }])
      .select()
      .single();
    return { data, error };
  }

  static async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    return { data, error };
  }

  static async updateUserProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();
    return { data, error };
  }

  // Subjects
  static async getSubjects() {
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .order("name");
    return { data, error };
  }

  static async getSubjectById(id: string) {
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .eq("id", id)
      .single();
    return { data, error };
  }

  // Chapters
  static async getChaptersBySubject(subjectId: string) {
    const { data, error } = await supabase
      .from("chapters")
      .select("*")
      .eq("subject_id", subjectId)
      .order("created_at");
    return { data, error };
  }

  static async getChapterById(id: string) {
    const { data, error } = await supabase
      .from("chapters")
      .select("*")
      .eq("id", id)
      .single();
    return { data, error };
  }

  // User Progress
  static async getUserProgress(userId: string) {
    const { data, error } = await supabase
      .from("user_progress")
      .select(
        `
        *,
        chapters (
          *,
          subjects (*)
        )
      `
      )
      .eq("user_id", userId);
    return { data, error };
  }

  static async updateProgress(
    userId: string,
    chapterId: string,
    completed: boolean,
    points: number
  ) {
    const { data, error } = await supabase
      .from("user_progress")
      .upsert({
        user_id: userId,
        chapter_id: chapterId,
        completed,
        points_earned: points,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .select()
      .single();
    return { data, error };
  }

  // Feed Posts
  static async getFeedPosts() {
    const { data, error } = await supabase
      .from("feed_posts")
      .select(
        `
        *,
        users (
          name,
          level,
          points,
          streak,
          rank
        )
      `
      )
      .order("created_at", { ascending: false });
    return { data, error };
  }

  static async getFeedPostById(postId: string) {
    const { data, error } = await supabase
      .from("feed_posts")
      .select(
        `
        *,
        users (
          name,
          level,
          points,
          streak,
          rank
        )
      `
      )
      .eq("id", postId)
      .single();
    return { data, error };
  }

  static async createFeedPost(post: {
    user_id: string;
    content: string;
    type: "achievement" | "question" | "milestone" | "tip";
    subject: string;
    achievement: string;
    points_earned?: number;
    media_url?: string;
  }) {
    const { data, error } = await supabase
      .from("feed_posts")
      .insert([post])
      .select(
        `
        *,
        users (
          name,
          level,
          points,
          streak,
          rank
        )
      `
      )
      .single();
    return { data, error };
  }

  static async updateFeedPost(
    postId: string,
    updates: {
      content?: string;
      subject?: string;
      achievement?: string;
      media_url?: string;
    }
  ) {
    const { data, error } = await supabase
      .from("feed_posts")
      .update(updates)
      .eq("id", postId)
      .select(
        `
        *,
        users (
          name,
          level,
          points,
          streak,
          rank
        )
      `
      )
      .single();
    return { data, error };
  }

  static async deleteFeedPost(postId: string) {
    const { error } = await supabase
      .from("feed_posts")
      .delete()
      .eq("id", postId);
    return { error };
  }

  static async likePost(postId: string) {
    // First get current likes count
    const { data: currentPost } = await supabase
      .from("feed_posts")
      .select("likes")
      .eq("id", postId)
      .single();

    if (!currentPost) {
      return { data: null, error: { message: "Post not found" } };
    }

    const { data, error } = await supabase
      .from("feed_posts")
      .update({ likes: currentPost.likes + 1 })
      .eq("id", postId)
      .select()
      .single();
    return { data, error };
  }

  static async unlikePost(postId: string) {
    // First get current likes count
    const { data: currentPost } = await supabase
      .from("feed_posts")
      .select("likes")
      .eq("id", postId)
      .single();

    if (!currentPost) {
      return { data: null, error: { message: "Post not found" } };
    }

    const { data, error } = await supabase
      .from("feed_posts")
      .update({ likes: Math.max(currentPost.likes - 1, 0) })
      .eq("id", postId)
      .select()
      .single();
    return { data, error };
  }

  static async incrementComments(postId: string) {
    // First get current comments count
    const { data: currentPost } = await supabase
      .from("feed_posts")
      .select("comments")
      .eq("id", postId)
      .single();

    if (!currentPost) {
      return { data: null, error: { message: "Post not found" } };
    }

    const { data, error } = await supabase
      .from("feed_posts")
      .update({ comments: currentPost.comments + 1 })
      .eq("id", postId)
      .select()
      .single();
    return { data, error };
  }

  // Get comments for a post
  static async getComments(postId: string) {
    const { data, error } = await supabase
      .from("feed_comments")
      .select(
        `
        *,
        users (
          id,
          name,
          level,
          points,
          streak,
          rank
        )
      `
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    return { data, error };
  }

  // Create a new comment
  static async createComment(postId: string, content: string) {
    const { user } = await this.getCurrentUser();
    if (!user) {
      return { data: null, error: { message: "User not authenticated" } };
    }

    const { data, error } = await supabase
      .from("feed_comments")
      .insert({
        post_id: postId,
        user_id: user.id,
        content: content,
      })
      .select(
        `
        *,
        users (
          id,
          name,
          level,
          points,
          streak,
          rank
        )
      `
      )
      .single();

    if (!error && data) {
      // Increment comments count on the post
      await this.incrementComments(postId);
    }

    return { data, error };
  }

  // Real-time subscriptions
  static subscribeToFeedPosts(callback: (payload: any) => void) {
    return supabase
      .channel("feed_posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "feed_posts" },
        callback
      )
      .subscribe();
  }

  static subscribeToUserProgress(
    userId: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel("user_progress")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_progress",
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }

  // ===== FLOWS =====

  static async getFlowsByTopic(topicId: string) {
    const { data, error } = await supabase
      .from("flows")
      .select("*")
      .eq("topic_id", topicId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    return { data, error };
  }

  static async createFlow(flowData: {
    topicId: string;
    name: string;
    description?: string;
    createdBy: string;
  }) {
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

    return { data, error };
  }

  static async updateFlow(flowId: string, updates: any) {
    const { data, error } = await supabase
      .from("flows")
      .update(updates)
      .eq("id", flowId)
      .select()
      .single();

    return { data, error };
  }

  static async deleteFlow(flowId: string) {
    const { error } = await supabase.from("flows").delete().eq("id", flowId);

    return { error };
  }

  // ===== FLOW NODES =====

  static async getFlowNodes(flowId: string) {
    const { data, error } = await supabase
      .from("flow_nodes")
      .select("*")
      .eq("flow_id", flowId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    return { data, error };
  }

  static async saveFlowNodes(flowId: string, nodes: any[]) {
    // Delete existing nodes
    const { error: deleteError } = await supabase
      .from("flow_nodes")
      .delete()
      .eq("flow_id", flowId);

    if (deleteError) {
      return { error: deleteError };
    }

    // Insert new nodes
    const flowNodes = nodes.map((node) => ({
      flow_id: flowId,
      node_type: node.type,
      title: node.title,
      description: node.description,
      sort_order: node.sort_order || 1,
      config: node.config || {},
      status: node.status || "available",
      xp_reward: node.xp || 0,
      difficulty: node.difficulty || "medium",
      estimated_time: parseInt(node.estimatedTime?.replace(" min", "") || "5"),
      content_data: node.config || {},
      connections: node.connections || [],
    }));

    const { error: insertError } = await supabase
      .from("flow_nodes")
      .insert(flowNodes);

    return { error: insertError };
  }

  static async loadFlowWithNodes(flowId: string) {
    // Get flow
    const { data: flow, error: flowError } = await supabase
      .from("flows")
      .select("*")
      .eq("id", flowId)
      .single();

    if (flowError) {
      return { data: null, error: flowError };
    }

    if (!flow) {
      return { data: null, error: null };
    }

    // Get flow nodes
    const { data: nodes, error: nodesError } = await this.getFlowNodes(flowId);

    if (nodesError) {
      return { data: null, error: nodesError };
    }

    return {
      data: {
        ...flow,
        nodes: nodes || [],
      },
      error: null,
    };
  }

  static async getFlowNodeById(nodeId: string) {
    const { data, error } = await supabase
      .from("flow_nodes")
      .select("*")
      .eq("id", nodeId)
      .single();

    if (error) {
      console.error("Error fetching flow node:", error);
      return { data: null, error };
    }

    return { data, error: null };
  }

  // ===== TOPICS =====

  static async getTopicsBySubject(subjectId: string) {
    const { data, error } = await supabase
      .from("topics")
      .select("*")
      .eq("subject_id", subjectId)
      .eq("is_active", true)
      .order("level", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching topics:", error);
      return { data: null, error };
    }

    // Convert flat array to hierarchical structure (same as web app)
    const hierarchicalTopics = this.buildTopicHierarchy(data || []);

    return { data: hierarchicalTopics, error: null };
  }

  // Build hierarchical topic structure (same as web app)
  private static buildTopicHierarchy(topics: any[]): any[] {
    const topicMap = new Map<string, any>();
    const rootTopics: any[] = [];

    // Create map of all topics
    topics.forEach((topic) => {
      topicMap.set(topic.id, { ...topic, children: [] });
    });

    // Build hierarchy
    topics.forEach((topic) => {
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

  // ===== USER SUBSCRIPTIONS =====

  static async getUserSubscriptions(userId: string) {
    const { data, error } = await supabase.rpc("get_user_subscribed_subjects", {
      user_uuid: userId,
    });

    return { data, error };
  }

  static async getAvailableSubjects(userId: string) {
    const { data, error } = await supabase.rpc("get_available_subjects", {
      user_uuid: userId,
    });

    return { data, error };
  }

  static async subscribeToSubject(userId: string, subjectId: string) {
    const { data, error } = await supabase
      .from("user_subscriptions")
      .insert({
        user_id: userId,
        subject_id: subjectId,
        is_active: true,
      })
      .select()
      .single();

    return { data, error };
  }

  static async unsubscribeFromSubject(userId: string, subjectId: string) {
    const { error } = await supabase
      .from("user_subscriptions")
      .update({ is_active: false })
      .eq("user_id", userId)
      .eq("subject_id", subjectId);

    return { error };
  }

  static async updateSubscriptionProgress(
    userId: string,
    subjectId: string,
    updates: {
      progress_percentage?: number;
      last_accessed_at?: string;
      total_time_spent?: number;
      completed_topics?: number;
      total_topics?: number;
    }
  ) {
    const { data, error } = await supabase
      .from("user_subscriptions")
      .update(updates)
      .eq("user_id", userId)
      .eq("subject_id", subjectId)
      .select()
      .single();

    return { data, error };
  }

  static async getSubscriptionStatus(userId: string, subjectId: string) {
    const { data, error } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("subject_id", subjectId)
      .eq("is_active", true)
      .maybeSingle();

    return { data, error };
  }
}
