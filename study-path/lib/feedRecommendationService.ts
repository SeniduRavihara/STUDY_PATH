/**
 * Feed Recommendation Service
 *
 * Provides personalized feed post recommendations based on:
 * - User's active subjects and topics
 * - Current learning progress
 * - Upcoming nodes in their learning path
 * - Post engagement history
 */

import { supabase } from "../superbase/supabase";

export interface PostContext {
  target_subjects?: string[]; // UUID array
  target_topics?: string[]; // UUID array
  difficulty?: "easy" | "medium" | "hard" | null;
  learning_stage?: "beginner" | "intermediate" | "advanced" | null;
  node_types?: ("lesson" | "quiz" | "practice" | "project" | "milestone")[];
  show_to_all?: boolean;
}

export interface UserLearningContext {
  userId: string;
  activeSubjectIds: string[];
  activeTopicIds: string[];
  currentNodeTypes: string[];
  averageDifficulty: "easy" | "medium" | "hard";
  learningStage: "beginner" | "intermediate" | "advanced";
}

export interface PersonalizedPost {
  id: string;
  content: string;
  type: string;
  subject: string | null;
  achievement: string | null;
  points_earned: number | null;
  media_url: string | null;
  pack_data: any;
  user_id: string;
  likes: number;
  comments: number;
  created_at: string;
  updated_at: string;
  post_context: PostContext | null;
  priority: number;
  relevance_score: number;
}

export class FeedRecommendationService {
  /**
   * Get user's current learning context from their progress
   */
  static async getUserLearningContext(
    userId: string
  ): Promise<UserLearningContext> {
    try {
      // Get user's active subscriptions
      const { data: subscriptions, error: subError } = await supabase
        .from("user_subscriptions")
        .select("subject_id, subjects(id, name)")
        .eq("user_id", userId)
        .eq("is_active", true);

      if (subError) throw subError;

      const activeSubjectIds = subscriptions?.map((s) => s.subject_id) || [];

      // Get topics from active subjects
      const { data: topics, error: topicError } = await supabase
        .from("topics")
        .select("id, subject_id")
        .in("subject_id", activeSubjectIds);

      if (topicError) throw topicError;

      const activeTopicIds = topics?.map((t) => t.id) || [];

      // Get user's recent node progress to determine current node types
      const { data: recentProgress, error: progressError } = await supabase
        .from("user_node_progress")
        .select(
          `
          node_id,
          flow_nodes(config, difficulty)
        `
        )
        .eq("user_id", userId)
        .order("last_accessed_at", { ascending: false })
        .limit(5);

      if (progressError) throw progressError;

      // Extract node types and difficulty from recent progress
      const currentNodeTypes: string[] = [];
      const difficulties: string[] = [];

      recentProgress?.forEach((progress: any) => {
        if (progress.flow_nodes) {
          const config = progress.flow_nodes.config as any;
          if (config?.node_type) {
            currentNodeTypes.push(config.node_type);
          }
          if (progress.flow_nodes.difficulty) {
            difficulties.push(progress.flow_nodes.difficulty);
          }
        }
      });

      // Determine average difficulty
      const averageDifficulty =
        difficulties.length > 0
          ? difficulties.includes("hard")
            ? "hard"
            : difficulties.includes("medium")
            ? "medium"
            : "easy"
          : "medium";

      // Determine learning stage based on completion rate
      const { data: totalProgress } = await supabase
        .from("user_node_progress")
        .select("status", { count: "exact" })
        .eq("user_id", userId)
        .eq("status", "completed");

      const completedCount = totalProgress?.length || 0;
      const learningStage =
        completedCount > 50
          ? "advanced"
          : completedCount > 20
          ? "intermediate"
          : "beginner";

      return {
        userId,
        activeSubjectIds,
        activeTopicIds,
        currentNodeTypes,
        averageDifficulty,
        learningStage,
      };
    } catch (error) {
      console.error("Error getting user learning context:", error);
      // Return minimal context on error
      return {
        userId,
        activeSubjectIds: [],
        activeTopicIds: [],
        currentNodeTypes: [],
        averageDifficulty: "medium",
        learningStage: "beginner",
      };
    }
  }

  /**
   * Get personalized posts using database function
   */
  static async getPersonalizedPosts(
    userId: string,
    limit: number = 20
  ): Promise<PersonalizedPost[]> {
    try {
      // Get user's learning context
      const context = await this.getUserLearningContext(userId);

      // Call database function for personalized posts
      const { data, error } = await supabase.rpc("get_personalized_posts", {
        p_user_id: userId,
        p_subject_ids: context.activeSubjectIds,
        p_topic_ids: context.activeTopicIds,
        p_limit: limit,
      });

      if (error) {
        console.error("Error getting personalized posts:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getPersonalizedPosts:", error);
      return [];
    }
  }

  /**
   * Mark a post as viewed by the user
   */
  static async markPostViewed(
    userId: string,
    postId: string,
    engaged: boolean = false
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc("mark_post_viewed", {
        p_user_id: userId,
        p_post_id: postId,
        p_engaged: engaged,
      });

      if (error) {
        console.error("Error marking post as viewed:", error);
      }
    } catch (error) {
      console.error("Error in markPostViewed:", error);
    }
  }

  /**
   * Calculate local relevance score (client-side backup)
   */
  static calculateRelevanceScore(
    post: any,
    context: UserLearningContext
  ): number {
    let score = 0;

    // High priority posts always score high
    if (post.priority > 0) {
      return 100 + post.priority;
    }

    const postContext = post.post_context as PostContext;

    // Show to all posts get base score
    if (postContext?.show_to_all) {
      return 50;
    }

    // Subject match (40 points)
    if (
      postContext?.target_subjects &&
      postContext.target_subjects.length > 0
    ) {
      const hasSubjectMatch = postContext.target_subjects.some((subjectId) =>
        context.activeSubjectIds.includes(subjectId)
      );
      if (hasSubjectMatch) score += 40;
    }

    // Topic match (25 points)
    if (postContext?.target_topics && postContext.target_topics.length > 0) {
      const hasTopicMatch = postContext.target_topics.some((topicId) =>
        context.activeTopicIds.includes(topicId)
      );
      if (hasTopicMatch) score += 25;
    }

    // Difficulty match (10 points)
    if (
      postContext?.difficulty &&
      postContext.difficulty === context.averageDifficulty
    ) {
      score += 10;
    }

    // Learning stage match (10 points)
    if (
      postContext?.learning_stage &&
      postContext.learning_stage === context.learningStage
    ) {
      score += 10;
    }

    // Node type match (10 points)
    if (postContext?.node_types && postContext.node_types.length > 0) {
      const hasNodeTypeMatch = postContext.node_types.some((nodeType) =>
        context.currentNodeTypes.includes(nodeType)
      );
      if (hasNodeTypeMatch) score += 10;
    }

    // Recency bonus (5 points for posts within 7 days)
    const postAge =
      Date.now() - new Date(post.created_at || Date.now()).getTime();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (postAge < sevenDays) {
      score += 5;
    }

    return score;
  }

  /**
   * Get posts for a specific subject (useful for subject-specific feeds)
   */
  static async getPostsForSubject(
    subjectId: string,
    userId: string,
    limit: number = 10
  ): Promise<PersonalizedPost[]> {
    try {
      const { data, error } = await supabase.rpc("get_personalized_posts", {
        p_user_id: userId,
        p_subject_ids: [subjectId],
        p_topic_ids: null,
        p_limit: limit,
      });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error getting posts for subject:", error);
      return [];
    }
  }

  /**
   * Get posts for a specific topic
   */
  static async getPostsForTopic(
    topicId: string,
    userId: string,
    limit: number = 10
  ): Promise<PersonalizedPost[]> {
    try {
      const { data, error } = await supabase.rpc("get_personalized_posts", {
        p_user_id: userId,
        p_subject_ids: null,
        p_topic_ids: [topicId],
        p_limit: limit,
      });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error getting posts for topic:", error);
      return [];
    }
  }
}
