import { supabase } from '../lib/supabase';

interface FeedPost {
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

  static async updateFeedPost(id: string, updates: any) {
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
