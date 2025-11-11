import { supabase } from '../lib/supabase';

interface Lesson {
  id: string;
  chapter_id: string;
  title: string;
  content: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export class LessonService {
  static async getLessons(chapterId?: string) {
    let query = supabase
      .from("lessons")
      .select(
        `
        *,
        chapters (
          id,
          title,
          subjects (
            id,
            name,
            color
          )
        )
      `
      )
      .order("order_index", { ascending: true });

    if (chapterId) {
      query = query.eq("chapter_id", chapterId);
    }

    const { data, error } = await query;
    return { data, error };
  }

  static async createLesson(
    lesson: Omit<Lesson, "id" | "created_at" | "updated_at">
  ) {
    const { data, error } = await supabase
      .from("lessons")
      .insert(lesson)
      .select()
      .single();
    return { data, error };
  }

  static async updateLesson(id: string, updates: Partial<Lesson>) {
    const { data, error } = await supabase
      .from("lessons")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  }

  static async deleteLesson(id: string) {
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    return { error };
  }
}
