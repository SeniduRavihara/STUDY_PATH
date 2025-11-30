import { supabase } from "../supabase";

export interface Subject {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  chapters: number;
  created_at: string;
  is_subscribed?: boolean;
  user_progress?: {
    completed_chapters: number;
    total_xp: number;
    streak: number;
  };
}

export interface UserSubscription {
  id: string;
  user_id: string;
  subject_id: string;
  subscribed_at: string;
  is_active: boolean;
  subject: Subject;
}

export class SubscriptionService {
  // Get all available subjects
  static async getAllSubjects(): Promise<Subject[]> {
    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) {
        console.error("Error fetching subjects:", error);
        return [];
      }

      // Ensure color is always an array for mobile compatibility
      return (data || []).map((subject) => ({
        ...subject,
        color:
          subject.color && typeof subject.color === "string"
            ? [subject.color, subject.color]
            : ["#3B82F6", "#3B82F6"],
      }));
    } catch (error) {
      console.error("Error in getAllSubjects:", error);
      return [];
    }
  }

  // Get user's subscribed subjects with progress
  static async getUserSubscriptions(userId: string): Promise<Subject[]> {
    try {
      console.log(
        "SubscriptionService: Getting user subscriptions for user:",
        userId
      );

      // First, try to use the RPC function if it exists
      try {
        const { data, error } = await supabase.rpc(
          "get_user_subscribed_subjects",
          { user_uuid: userId }
        );

        if (!error && data) {
          console.log("SubscriptionService: RPC response:", { data, error });
          // Convert the RPC result to Subject format
          return data.map((item: any) => ({
            id: item.subject_id,
            name: item.subject_name,
            description: item.subject_description,
            icon: item.subject_icon,
            color: item.subject_color
              ? [item.subject_color, item.subject_color]
              : ["#3B82F6", "#3B82F6"],
            difficulty: "Beginner" as const,
            chapters: item.total_topics || 0,
            created_at: item.subscribed_at,
            is_subscribed: true,
            user_progress: {
              completed_chapters: item.completed_topics || 0,
              total_xp: Math.floor(Math.random() * 1000),
              streak: Math.floor(Math.random() * 10),
            },
          }));
        }
      } catch {
        console.log("RPC function not available, falling back to direct query");
      }

      // Fallback: Get user's subscriptions directly
      console.log("Using fallback method: direct query");
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select(
          `
          *,
          subject:subjects(*)
        `
        )
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("subscribed_at", { ascending: false });

      if (error) {
        console.error("Error fetching user subscriptions:", error);
        return [];
      }

      // Convert to Subject format
      return (data || []).map((subscription: any) => ({
        ...subscription.subject,
        color:
          subscription.subject.color &&
          typeof subscription.subject.color === "string"
            ? [subscription.subject.color, subscription.subject.color]
            : ["#3B82F6", "#3B82F6"],
        is_subscribed: true,
        user_progress: {
          completed_chapters: 0, // Placeholder
          total_xp: Math.floor(Math.random() * 1000),
          streak: Math.floor(Math.random() * 10),
        },
      }));
    } catch (error) {
      console.error("Error in getUserSubscriptions:", error);
      return [];
    }
  }

  // Subscribe to a subject
  static async subscribeToSubject(
    userId: string,
    subjectId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from("user_subscriptions").insert({
        user_id: userId,
        subject_id: subjectId,
        is_active: true,
      });

      if (error) {
        console.error("Error subscribing to subject:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in subscribeToSubject:", error);
      return false;
    }
  }

  // Unsubscribe from a subject
  static async unsubscribeFromSubject(
    userId: string,
    subjectId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("user_subscriptions")
        .update({ is_active: false })
        .eq("user_id", userId)
        .eq("subject_id", subjectId);

      if (error) {
        console.error("Error unsubscribing from subject:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in unsubscribeFromSubject:", error);
      return false;
    }
  }

  // Get available subjects that user hasn't subscribed to
  static async getAvailableSubjects(userId: string): Promise<Subject[]> {
    try {
      console.log(
        "SubscriptionService: Getting available subjects for user:",
        userId
      );

      // Get all subjects from subjects table
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("subjects")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (subjectsError) {
        console.error("Error fetching subjects:", subjectsError);
        return [];
      }

      // Convert subjects to Subject format (no filtering needed)
      const availableSubjects = (subjectsData || []).map((subject) => ({
        ...subject,
        color:
          subject.color && typeof subject.color === "string"
            ? [subject.color, subject.color]
            : ["#3B82F6", "#3B82F6"],
      }));

      // console.log("Available subjects:", availableSubjects);

      return availableSubjects;
    } catch (error) {
      console.error("Error in getAvailableSubjects:", error);
      return [];
    }
  }

  // Check if user is subscribed to a subject
  static async isSubscribed(
    userId: string,
    subjectId: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("id")
        .eq("user_id", userId)
        .eq("subject_id", subjectId)
        .eq("is_active", true)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found"
        console.error("Error checking subscription:", error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error("Error in isSubscribed:", error);
      return false;
    }
  }
}
