import { supabase } from '../lib/supabase';

export class DatabaseService {
  // Database Introspection
  static async getDatabaseTables() {
    try {
      const { data, error } = await supabase.rpc("get_database_tables");
      if (error) {
        console.error("Error fetching database tables:", error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error("Error in getDatabaseTables:", error);
      return [];
    }
  }

  static async getDatabaseRelationships() {
    try {
      const { data, error } = await supabase.rpc("get_database_relationships");
      if (error) {
        console.error("Error fetching database relationships:", error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error("Error in getDatabaseRelationships:", error);
      return [];
    }
  }

  static async getDatabaseStats() {
    try {
      const { data, error } = await supabase.rpc("get_database_stats");
      if (error) {
        console.error("Error fetching database stats:", error);
        return {
          total_tables: 0,
          total_columns: 0,
          total_rows: 0,
          total_indexes: 0,
          total_constraints: 0,
          database_size: "0 MB",
          last_updated: new Date().toISOString(),
        };
      }
      return (
        data || {
          total_tables: 0,
          total_columns: 0,
          total_rows: 0,
          total_indexes: 0,
          total_constraints: 0,
          database_size: "0 MB",
          last_updated: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error("Error in getDatabaseStats:", error);
      return {
        total_tables: 0,
        total_columns: 0,
        total_rows: 0,
        total_indexes: 0,
        total_constraints: 0,
        database_size: "0 MB",
        last_updated: new Date().toISOString(),
      };
    }
  }

  // Statistics
  static async getStats() {
    const [
      subjectsCount,
      chaptersCount,
      lessonsCount,
      mcqsCount,
      feedPostsCount,
    ] = await Promise.all([
      supabase.from("subjects").select("*", { count: "exact", head: true }),
      supabase.from("chapters").select("*", { count: "exact", head: true }),
      supabase.from("lessons").select("*", { count: "exact", head: true }),
      supabase.from("mcqs").select("*", { count: "exact", head: true }),
      supabase.from("feed_posts").select("*", { count: "exact", head: true }),
    ]);

    return {
      subjects: subjectsCount.count || 0,
      chapters: chaptersCount.count || 0,
      lessons: lessonsCount.count || 0,
      mcqs: mcqsCount.count || 0,
      feedPosts: feedPostsCount.count || 0,
    };
  }
}
