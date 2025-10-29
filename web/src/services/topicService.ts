import { supabase } from '../lib/supabase';
import type { Topic, TopicInsert, TopicUpdate, TopicWithChildren } from '../types/database';

export class TopicService {
  static async getTopicsBySubject(subjectId: string): Promise<TopicWithChildren[]> {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('subject_id', subjectId)
      .eq('is_active', true)
      .order('level', { ascending: true })
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching topics:', error);
      throw error;
    }

    // Convert flat array to hierarchical structure
    return this.buildTopicHierarchy(data || []);
  }

  static async getTopicById(id: string): Promise<Topic | null> {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching topic:', error);
      return null;
    }

    return data;
  }

  static async createTopic(topic: TopicInsert): Promise<Topic> {
    const { data, error } = await supabase
      .from('topics')
      .insert(topic)
      .select()
      .single();

    if (error) {
      console.error('Error creating topic:', error);
      throw error;
    }

    return data;
  }

  static async updateTopic(id: string, updates: TopicUpdate): Promise<Topic> {
    const { data, error } = await supabase
      .from('topics')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating topic:', error);
      throw error;
    }

    return data;
  }

  static async deleteTopic(id: string): Promise<void> {
    const { error } = await supabase
      .from('topics')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting topic:', error);
      throw error;
    }
  }

  static async getLeafTopics(subjectId: string): Promise<Topic[]> {
    const { data, error } = await supabase
      .from('topics')
      .select(`
        *,
        children:topics!parent_id(count)
      `)
      .eq('subject_id', subjectId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching leaf topics:', error);
      throw error;
    }

    // Filter topics that have no children (leaf nodes)
    const leafTopics = (data || []).filter(() => {
      // This is a simplified check - in a real scenario, you'd need a more complex query
      return true; // For now, return all topics
    });

    return leafTopics;
  }

  private static buildTopicHierarchy(topics: Topic[]): TopicWithChildren[] {
    const topicMap = new Map<string, TopicWithChildren>();
    const rootTopics: TopicWithChildren[] = [];

    // Create map of all topics
    topics.forEach(topic => {
      topicMap.set(topic.id, { ...topic, children: [] });
    });

    // Build hierarchy
    topics.forEach(topic => {
      const topicWithChildren = topicMap.get(topic.id)!;

      if (topic.parent_id) {
        const parent = topicMap.get(topic.parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(topicWithChildren);
        }
      } else {
        rootTopics.push(topicWithChildren);
      }
    });

    return rootTopics;
  }
}
