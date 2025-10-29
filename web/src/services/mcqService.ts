import { supabase } from '../lib/supabase';

export class MCQService {
  static async getMCQsBySubject(subjectId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('mcqs')
      .select('*')
      .eq('subject_id', subjectId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching MCQs:', error);
      throw error;
    }

    return data || [];
  }

  static async getMCQsByTopic(topicId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('mcqs')
      .select('*')
      .eq('topic_id', topicId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching MCQs by topic:', error);
      throw error;
    }

    return data || [];
  }

  static async createMCQ(mcqData: {
    question: string;
    options: string[];
    correct_answer: number;
    explanation?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    topic_id: string;
    subject_id: string;
    created_by: string;
  }): Promise<any> {
    const { data, error } = await supabase
      .from('mcqs')
      .insert({
        question: mcqData.question,
        options: mcqData.options,
        correct_answer: mcqData.correct_answer,
        explanation: mcqData.explanation,
        difficulty: mcqData.difficulty,
        topic_id: mcqData.topic_id,
        subject_id: mcqData.subject_id,
        created_by: mcqData.created_by,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating MCQ:', error);
      throw error;
    }

    return data;
  }
}
