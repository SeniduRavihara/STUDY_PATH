import type { AuthError, Session, User } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: string | null;
  isAdmin: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Web Auth: Error getting session:", error);
        }

        // console.log(
        //   "Web Auth: Initial session restored:",
        //   session?.user?.email
        // );

        // if (session) {
        //   console.log("Web Auth: User session found - auto login successful!");
        //   console.log(
        //     "Web Auth: Session expires at:",
        //     new Date(session.expires_at! * 1000)
        //   );
        // } else {
        //   console.log("Web Auth: No session found - user needs to login");
        // }

        setSession(session);
        setUser(session?.user ?? null);

        // do not block the UI waiting for role fetch — fetch in background
        setLoading(false);

        (async () => {
          if (session?.user?.id) {
            try {
              const { data, error } = await supabase
                .from("users")
                .select("role")
                .eq("id", session.user.id)
                .single();
              if (!error && data) {
                setRole(data.role ?? null);
              } else {
                setRole(null);
              }
            } catch (err) {
              console.error("Web Auth: Failed to fetch user role:", err);
              setRole(null);
            }
          } else {
            setRole(null);
          }
        })();
      } catch (error) {
        console.error("Web Auth: Failed to initialize auth:", error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      // on auth change, don't block UI — set loading false immediately and fetch role in background
      setLoading(false);
      (async () => {
        if (session?.user?.id) {
          try {
            const { data, error } = await supabase
              .from("users")
              .select("role")
              .eq("id", session.user.id)
              .single();
            if (!error && data) setRole(data.role ?? null);
            else setRole(null);
          } catch (err) {
            console.error(
              "Web Auth: Failed to fetch role on auth change:",
              err
            );
            setRole(null);
          }
        } else {
          setRole(null);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    role,
    isAdmin: role === "admin",
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
