import { supabase } from '../lib/supabase';

interface Chapter {
  id: string;
  subject_id: string;
  title: string;
  description: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export class ChapterService {
  static async getChapters(subjectId?: string) {
    let query = supabase
      .from("chapters")
      .select(
        `
        *,
        subjects (
          id,
          name,
          color
        )
      `
      )
      .order("order_index", { ascending: true });

    if (subjectId) {
      query = query.eq("subject_id", subjectId);
    }

    const { data, error } = await query;
    return { data, error };
  }

  static async createChapter(
    chapter: Omit<Chapter, "id" | "created_at" | "updated_at">
  ) {
    const { data, error } = await supabase
      .from("chapters")
      .insert(chapter)
      .select()
      .single();
    return { data, error };
  }

  static async updateChapter(id: string, updates: Partial<Chapter>) {
    const { data, error } = await supabase
      .from("chapters")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  }

  static async deleteChapter(id: string) {
    const { error } = await supabase.from("chapters").delete().eq("id", id);
    return { error };
  }
}
