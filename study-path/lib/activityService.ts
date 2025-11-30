import { supabase } from "../superbase/supabase";

export interface PollResults {
  option_id: string;
  vote_count: number;
  percentage: number;
}

export interface QuizAnswer {
  question_id: string;
  selected_option: string;
}

export interface ActivityResponse {
  id: string;
  user_id: string;
  post_id: string;
  activity_type: string;
  response_data: any;
  score: number | null;
  completed_at: string;
  time_spent_seconds: number | null;
}

export class ActivityService {
  /**
   * Submit a poll vote
   */
  static async submitPollVote(postId: string, optionId: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase.rpc("submit_poll_vote", {
      p_user_id: user.id,
      p_post_id: postId,
      p_option_id: optionId,
    });

    if (error) throw error;
  }

  /**
   * Get poll results
   */
  static async getPollResults(postId: string): Promise<PollResults[]> {
    const { data, error } = await supabase.rpc("get_poll_results", {
      p_post_id: postId,
    });

    if (error) throw error;
    return data || [];
  }

  /**
   * Check if user has voted in a poll
   */
  static async hasUserVoted(
    postId: string
  ): Promise<{ voted: boolean; option_id?: string }> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { voted: false };

    const { data, error } = await supabase
      .from("feed_poll_votes")
      .select("option_id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    return {
      voted: !!data,
      option_id: data?.option_id,
    };
  }

  /**
   * Submit quiz/activity response
   */
  static async submitActivityResponse(
    postId: string,
    activityType: string,
    responseData: any,
    score?: number,
    timeSpent?: number
  ): Promise<string> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase.rpc("submit_activity_response", {
      p_user_id: user.id,
      p_post_id: postId,
      p_activity_type: activityType,
      p_response_data: responseData,
      p_score: score || null,
      p_time_spent: timeSpent || null,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Get user's response to an activity
   */
  static async getUserActivityResponse(
    postId: string
  ): Promise<ActivityResponse | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("feed_activity_responses")
      .select("*")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  /**
   * Check if user has completed an activity
   */
  static async hasUserCompleted(postId: string): Promise<boolean> {
    const response = await this.getUserActivityResponse(postId);
    return !!response;
  }

  /**
   * Get user's activity statistics
   */
  static async getUserActivityStats() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("feed_activity_responses")
      .select("activity_type, score, completed_at")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false });

    if (error) throw error;

    // Calculate statistics
    const totalCompleted = data?.length || 0;
    const averageScore =
      data && data.length > 0
        ? data.reduce((sum, r) => sum + (r.score || 0), 0) / data.length
        : 0;

    const byType =
      data?.reduce((acc, r) => {
        acc[r.activity_type] = (acc[r.activity_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

    return {
      totalCompleted,
      averageScore,
      byType,
      recentActivities: data?.slice(0, 10) || [],
    };
  }
}
