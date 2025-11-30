import { supabase } from "../lib/supabase";

export interface PostContext {
  target_subjects?: string[];
  target_topics?: string[];
  difficulty?: "easy" | "medium" | "hard" | null;
  learning_stage?: "beginner" | "intermediate" | "advanced" | null;
  node_types?: string[];
  show_to_all?: boolean;
}

export interface FeedPost {
  id: string;
  content: string;
  type: string;
  subject?: string | null;
  achievement?: string | null;
  points_earned?: number;
  media_url?: string | null;
  pack_data?: any;
  user_id: string;
  likes?: number;
  comments?: number;
  post_context?: PostContext | null;
  priority?: number;
  created_at: string;
  updated_at: string;
}

export class FeedService {
  static async getFeedPosts() {
    const { data, error } = await supabase
      .from("feed_posts")
      .select(
        `
        *,
        users (
          id,
          email,
          name
        )
      `
      )
      .order("created_at", { ascending: false });
    return { data, error };
  }

  static async createFeedPost(post: {
    content: string;
    type: string;
    subject?: string | null;
    achievement?: string | null;
    points_earned?: number;
    media_url?: string | null;
    pack_data?: any;
    user_id: string;
    likes?: number;
    comments?: number;
    post_context?: PostContext;
    priority?: number;
    activity_type?: string;
    activity_data?: any;
  }) {
    const { data, error } = await supabase
      .from("feed_posts")
      .insert(post)
      .select(
        `
        *,
        users (
          id,
          email,
          name
        )
      `
      )
      .single();
    return { data, error };
  }

  static async updateFeedPost(
    id: string,
    updates: {
      content?: string;
      type?: string;
      subject?: string | null;
      achievement?: string | null;
      points_earned?: number;
      media_url?: string | null;
      pack_data?: any;
      post_context?: PostContext;
      priority?: number;
      activity_type?: string;
      activity_data?: any;
    }
  ) {
    const { data, error } = await supabase
      .from("feed_posts")
      .update(updates)
      .eq("id", id)
      .select(
        `
        *,
        users (
          id,
          email,
          name
        )
      `
      )
      .single();
    return { data, error };
  }

  static async deleteFeedPost(id: string) {
    const { error } = await supabase.from("feed_posts").delete().eq("id", id);
    return { error };
  }
}
