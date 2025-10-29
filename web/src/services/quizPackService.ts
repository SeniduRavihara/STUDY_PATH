import { supabase } from '../lib/supabase';

export class QuizPackService {
  static async getQuizPacksBySubject(subjectId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('quiz_packs')
      .select('*')
      .eq('subject_id', subjectId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quiz packs:', error);
      throw error;
    }

    return data || [];
  }

  static async getQuizPacksByTopic(topicId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('quiz_packs')
      .select('*')
      .eq('topic_id', topicId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quiz packs by topic:', error);
      throw error;
    }

    return data || [];
  }

  static async createQuizPack(packData: {
    title: string;
    description: string;
    topic_id: string;
    subject_id: string;
    difficulty: 'easy' | 'medium' | 'hard';
    mcq_ids: string[];
    created_by: string;
  }): Promise<any> {
    const { data, error } = await supabase
      .from('quiz_packs')
      .insert({
        title: packData.title,
        description: packData.description,
        topic_id: packData.topic_id,
        subject_id: packData.subject_id,
        difficulty: packData.difficulty,
        mcq_count: packData.mcq_ids.length,
        mcq_ids: packData.mcq_ids,
        created_by: packData.created_by,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating quiz pack:', error);
      throw error;
    }

    return data;
  }

  static async updateQuizPack(packId: string, updates: {
    title?: string;
    description?: string;
    topic_id?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    mcq_ids?: string[];
  }): Promise<any> {
    const updateData: any = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (updates.mcq_ids) {
      updateData.mcq_count = updates.mcq_ids.length;
    }

    const { data, error } = await supabase
      .from('quiz_packs')
      .update(updateData)
      .eq('id', packId)
      .select()
      .single();

    if (error) {
      console.error('Error updating quiz pack:', error);
      throw error;
    }

    return data;
  }

  static async deleteQuizPack(packId: string): Promise<void> {
    const { error } = await supabase
      .from('quiz_packs')
      .update({ is_active: false })
      .eq('id', packId);

    if (error) {
      console.error('Error deleting quiz pack:', error);
      throw error;
    }
  }
}
