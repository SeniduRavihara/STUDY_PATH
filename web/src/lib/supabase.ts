import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    storageKey: "studypath-admin-auth", // Custom storage key for web admin
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
});

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          level: "Beginner" | "Intermediate" | "Advanced";
          total_xp: number;
          hearts: number;
          coins: number;
          streak: number;
          rank: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          level?: "Beginner" | "Intermediate" | "Advanced";
          total_xp?: number;
          hearts?: number;
          coins?: number;
          streak?: number;
          rank?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          level?: "Beginner" | "Intermediate" | "Advanced";
          total_xp?: number;
          hearts?: number;
          coins?: number;
          streak?: number;
          rank?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      subjects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon: string | null;
          color: string;
          is_active: boolean;
          sort_order: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          color?: string;
          is_active?: boolean;
          sort_order?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          icon?: string | null;
          color?: string;
          is_active?: boolean;
          sort_order?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      topics: {
        Row: {
          id: string;
          subject_id: string;
          parent_id: string | null;
          name: string;
          description: string | null;
          level: number;
          sort_order: number;
          is_active: boolean;
          has_flow: boolean;
          flow_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          subject_id: string;
          parent_id?: string | null;
          name: string;
          description?: string | null;
          level?: number;
          sort_order?: number;
          is_active?: boolean;
          has_flow?: boolean;
          flow_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          subject_id?: string;
          parent_id?: string | null;
          name?: string;
          description?: string | null;
          level?: number;
          sort_order?: number;
          is_active?: boolean;
          has_flow?: boolean;
          flow_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
