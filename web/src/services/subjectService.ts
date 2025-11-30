import { supabase } from "../lib/supabase";
import type { Subject, SubjectInsert, SubjectUpdate } from "../types/database";

export class SubjectService {
  static async getSubjects(): Promise<Subject[]> {
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching subjects:", error);
      throw error;
    }

    return data || [];
  }

  static async getAllSubjects(): Promise<Subject[]> {
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching all subjects:", error);
      throw error;
    }

    return data || [];
  }

  static async getSubjectById(id: string): Promise<Subject | null> {
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching subject:", error);
      return null;
    }

    return data;
  }

  static async createSubject(subject: SubjectInsert): Promise<Subject> {
    const { data, error } = await supabase
      .from("subjects")
      .insert(subject)
      .select()
      .single();

    if (error) {
      console.error("Error creating subject:", error);
      throw error;
    }

    return data;
  }

  static async updateSubject(
    id: string,
    updates: SubjectUpdate
  ): Promise<Subject> {
    const { data, error } = await supabase
      .from("subjects")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating subject:", error);
      throw error;
    }

    return data;
  }

  static async deleteSubject(id: string): Promise<void> {
    console.log("Deleting subject:", id);

    const { error } = await supabase.from("subjects").delete().eq("id", id);

    if (error) {
      console.error("Error deleting subject:", error);
      throw error;
    }
  }

  static async getSubjectTopics(subjectId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("topics")
      .select("*")
      .eq("subject_id", subjectId)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching subject topics:", error);
      return [];
    }

    return data || [];
  }
}
