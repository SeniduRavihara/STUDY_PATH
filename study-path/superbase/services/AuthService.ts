import { supabase } from "../supabase";

export class AuthService {
  static async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });
    return { data, error };
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  }

  static async signOut() {
    console.log("SupabaseService: Attempting to sign out..."); // Debug log
    const { error } = await supabase.auth.signOut();
    console.log("SupabaseService: Sign out result:", { error }); // Debug log
    return { error };
  }
}
