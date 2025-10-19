import { supabase } from "../supabase";

// Type definitions for better type safety
export interface User {
  id: string;
  email: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  points: number;
  streak: number;
  rank: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  email: string;
  name: string;
  level?: "Beginner" | "Intermediate" | "Advanced";
  points?: number;
  streak?: number;
  rank?: string;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  level?: "Beginner" | "Intermediate" | "Advanced";
  points?: number;
  streak?: number;
  rank?: string;
}

export class UserService {
  // Get a single user by ID
  static async getUser(userId: string): Promise<{ data: User | null; error: any }> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    // console.log("UserService: User:", data); // Debug log
    return { data, error };
  }

  // Get all users (for admin purposes)
  static async getAllUsers(): Promise<{ data: User[] | null; error: any }> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });
    return { data, error };
  }

  // Create a new user
  static async createUser(userId: string, userData: CreateUserData): Promise<{ data: User | null; error: any }> {
    const { data, error } = await supabase
      .from("users")
      .insert([{ id: userId, ...userData }])
      .select()
      .single();
    return { data, error };
  }

  // Update user data
  static async updateUser(userId: string, userData: UpdateUserData): Promise<{ data: User | null; error: any }> {
    const { data, error } = await supabase
      .from("users")
      .update(userData)
      .eq("id", userId)
      .select()
      .single();
    return { data, error };
  }

  // Get current authenticated user
  static async getCurrentUser(): Promise<{ data: User | null; error: any }> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: authError };
    }

    return this.getUser(user.id);
  }

  // Delete a user
  static async deleteUser(userId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);
    return { error };
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<{ data: User | null; error: any }> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();
    return { data, error };
  }

  // Update user points and rank
  static async updateUserPoints(userId: string, pointsToAdd: number): Promise<{ data: User | null; error: any }> {
    // First get current user data
    const { data: currentUser, error: fetchError } = await this.getUser(userId);
    if (fetchError || !currentUser) {
      return { data: null, error: fetchError };
    }

    const newPoints = currentUser.points + pointsToAdd;
    
    // Calculate new rank based on points
    let newRank = "Novice";
    if (newPoints >= 1000) newRank = "Master";
    else if (newPoints >= 500) newRank = "Expert";
    else if (newPoints >= 200) newRank = "Advanced";
    else if (newPoints >= 100) newRank = "Intermediate";
    else if (newPoints >= 50) newRank = "Apprentice";

    return this.updateUser(userId, {
      points: newPoints,
      rank: newRank
    });
  } 
}
