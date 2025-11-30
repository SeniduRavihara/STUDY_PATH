-- Migration: Add post targeting context and views tracking
-- Created: 2025-11-30
-- Description: Enables personalized feed recommendations based on user's learning journey

-- Add post_context column to feed_posts for targeting
ALTER TABLE feed_posts 
ADD COLUMN post_context JSONB DEFAULT '{
  "target_subjects": [],
  "target_topics": [],
  "difficulty": null,
  "learning_stage": null,
  "node_types": [],
  "show_to_all": true
}'::jsonb;

-- Add index for efficient post_context queries
CREATE INDEX idx_feed_posts_context ON feed_posts USING GIN (post_context);

-- Add priority field for admin to mark important posts
ALTER TABLE feed_posts 
ADD COLUMN priority INTEGER DEFAULT 0;

-- Create post_views table to track what users have seen
CREATE TABLE post_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  engaged BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, post_id)
);

-- Add indexes for post_views queries
CREATE INDEX idx_post_views_user ON post_views(user_id);
CREATE INDEX idx_post_views_post ON post_views(post_id);
CREATE INDEX idx_post_views_viewed_at ON post_views(viewed_at DESC);

-- Enable RLS on post_views
ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;

-- RLS policies for post_views
CREATE POLICY "Users can view their own post views"
  ON post_views FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own post views"
  ON post_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own post views"
  ON post_views FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to get personalized posts for a user
CREATE OR REPLACE FUNCTION get_personalized_posts(
  p_user_id UUID,
  p_subject_ids UUID[] DEFAULT NULL,
  p_topic_ids UUID[] DEFAULT NULL,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  type TEXT,
  subject TEXT,
  achievement TEXT,
  points_earned INTEGER,
  media_url TEXT,
  pack_data JSONB,
  user_id UUID,
  likes INTEGER,
  comments INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  post_context JSONB,
  priority INTEGER,
  relevance_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fp.id,
    fp.content,
    fp.type,
    fp.subject,
    fp.achievement,
    fp.points_earned,
    fp.media_url,
    fp.pack_data,
    fp.user_id,
    fp.likes,
    fp.comments,
    fp.created_at,
    fp.updated_at,
    fp.post_context,
    fp.priority,
    -- Calculate relevance score
    (
      CASE 
        -- High priority posts always score high
        WHEN fp.priority > 0 THEN 100 + fp.priority
        -- Show to all posts get base score
        WHEN (fp.post_context->>'show_to_all')::boolean = true THEN 50
        -- Calculate contextual relevance
        ELSE (
          -- Subject match (40 points)
          CASE 
            WHEN p_subject_ids IS NOT NULL AND 
                 EXISTS (
                   SELECT 1 FROM jsonb_array_elements_text(fp.post_context->'target_subjects') AS subj
                   WHERE subj::uuid = ANY(p_subject_ids)
                 ) THEN 40
            ELSE 0
          END +
          -- Topic match (25 points)
          CASE 
            WHEN p_topic_ids IS NOT NULL AND 
                 EXISTS (
                   SELECT 1 FROM jsonb_array_elements_text(fp.post_context->'target_topics') AS topic
                   WHERE topic::uuid = ANY(p_topic_ids)
                 ) THEN 25
            ELSE 0
          END +
          -- Recency bonus (10 points for posts within 7 days)
          CASE 
            WHEN fp.created_at > NOW() - INTERVAL '7 days' THEN 10
            ELSE 0
          END
        )
      END
    )::NUMERIC AS relevance_score
  FROM feed_posts fp
  WHERE 
    -- Exclude already viewed posts (unless high priority)
    (fp.priority > 0 OR NOT EXISTS (
      SELECT 1 FROM post_views pv 
      WHERE pv.post_id = fp.id AND pv.user_id = p_user_id
    ))
    AND
    -- Include if: show_to_all OR matches user context
    (
      (fp.post_context->>'show_to_all')::boolean = true
      OR fp.priority > 0
      OR (
        p_subject_ids IS NOT NULL AND 
        EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(fp.post_context->'target_subjects') AS subj
          WHERE subj::uuid = ANY(p_subject_ids)
        )
      )
      OR (
        p_topic_ids IS NOT NULL AND 
        EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(fp.post_context->'target_topics') AS topic
          WHERE topic::uuid = ANY(p_topic_ids)
        )
      )
    )
  ORDER BY relevance_score DESC, fp.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark post as viewed
CREATE OR REPLACE FUNCTION mark_post_viewed(
  p_user_id UUID,
  p_post_id UUID,
  p_engaged BOOLEAN DEFAULT FALSE
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO post_views (user_id, post_id, engaged, viewed_at)
  VALUES (p_user_id, p_post_id, p_engaged, NOW())
  ON CONFLICT (user_id, post_id) 
  DO UPDATE SET 
    viewed_at = NOW(),
    engaged = p_engaged OR post_views.engaged;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_personalized_posts TO authenticated;
GRANT EXECUTE ON FUNCTION mark_post_viewed TO authenticated;

-- Add interactive activity support
ALTER TABLE feed_posts 
ADD COLUMN activity_type TEXT DEFAULT 'post' CHECK (
  activity_type IN ('post', 'poll', 'quiz', 'video_quiz', 'flashcard', 
    'flashcard_deck', 'challenge', 'mcq_single', 'fill_blank', 'match_pairs')
);

ALTER TABLE feed_posts 
ADD COLUMN activity_data JSONB DEFAULT '{}'::jsonb;

-- Create index for activity queries
CREATE INDEX idx_feed_posts_activity_type ON feed_posts(activity_type);
CREATE INDEX idx_feed_posts_activity_data ON feed_posts USING GIN (activity_data);

-- Create table for activity responses (quizzes, challenges, etc.)
CREATE TABLE feed_activity_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  response_data JSONB NOT NULL,
  score INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_spent_seconds INTEGER,
  UNIQUE(user_id, post_id)
);

-- Indexes for activity responses
CREATE INDEX idx_activity_responses_user ON feed_activity_responses(user_id);
CREATE INDEX idx_activity_responses_post ON feed_activity_responses(post_id);
CREATE INDEX idx_activity_responses_type ON feed_activity_responses(activity_type);
CREATE INDEX idx_activity_responses_completed ON feed_activity_responses(completed_at DESC);

-- Enable RLS on activity responses
ALTER TABLE feed_activity_responses ENABLE ROW LEVEL SECURITY;

-- RLS policies for activity responses
CREATE POLICY "Users can view their own responses"
  ON feed_activity_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own responses"
  ON feed_activity_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own responses"
  ON feed_activity_responses FOR UPDATE
  USING (auth.uid() = user_id);

-- Create table for poll votes (separate for aggregation)
CREATE TABLE feed_poll_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  option_id TEXT NOT NULL,
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Indexes for poll votes
CREATE INDEX idx_poll_votes_user ON feed_poll_votes(user_id);
CREATE INDEX idx_poll_votes_post ON feed_poll_votes(post_id);
CREATE INDEX idx_poll_votes_option ON feed_poll_votes(post_id, option_id);

-- Enable RLS on poll votes
ALTER TABLE feed_poll_votes ENABLE ROW LEVEL SECURITY;

-- RLS policies for poll votes
CREATE POLICY "Users can view all poll votes"
  ON feed_poll_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own poll votes"
  ON feed_poll_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own poll votes"
  ON feed_poll_votes FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to get poll results
CREATE OR REPLACE FUNCTION get_poll_results(p_post_id UUID)
RETURNS TABLE (
  option_id TEXT,
  vote_count BIGINT,
  percentage NUMERIC
) AS $$
DECLARE
  total_votes BIGINT;
BEGIN
  -- Get total votes for this poll
  SELECT COUNT(*) INTO total_votes
  FROM feed_poll_votes
  WHERE post_id = p_post_id;
  
  -- Return aggregated results
  RETURN QUERY
  SELECT 
    fpv.option_id,
    COUNT(*)::BIGINT AS vote_count,
    CASE 
      WHEN total_votes > 0 THEN ROUND((COUNT(*)::NUMERIC / total_votes) * 100, 1)
      ELSE 0
    END AS percentage
  FROM feed_poll_votes fpv
  WHERE fpv.post_id = p_post_id
  GROUP BY fpv.option_id
  ORDER BY vote_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to submit quiz/activity response
CREATE OR REPLACE FUNCTION submit_activity_response(
  p_user_id UUID,
  p_post_id UUID,
  p_activity_type TEXT,
  p_response_data JSONB,
  p_score INTEGER DEFAULT NULL,
  p_time_spent INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  response_id UUID;
BEGIN
  INSERT INTO feed_activity_responses (
    user_id, 
    post_id, 
    activity_type, 
    response_data, 
    score, 
    time_spent_seconds
  )
  VALUES (
    p_user_id, 
    p_post_id, 
    p_activity_type, 
    p_response_data, 
    p_score, 
    p_time_spent
  )
  ON CONFLICT (user_id, post_id) 
  DO UPDATE SET 
    response_data = p_response_data,
    score = p_score,
    time_spent_seconds = p_time_spent,
    completed_at = NOW()
  RETURNING id INTO response_id;
  
  RETURN response_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to submit poll vote
CREATE OR REPLACE FUNCTION submit_poll_vote(
  p_user_id UUID,
  p_post_id UUID,
  p_option_id TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO feed_poll_votes (user_id, post_id, option_id)
  VALUES (p_user_id, p_post_id, p_option_id)
  ON CONFLICT (user_id, post_id) 
  DO UPDATE SET 
    option_id = p_option_id,
    voted_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on new functions
GRANT EXECUTE ON FUNCTION get_poll_results TO authenticated;
GRANT EXECUTE ON FUNCTION submit_activity_response TO authenticated;
GRANT EXECUTE ON FUNCTION submit_poll_vote TO authenticated;

-- Comment on new columns
COMMENT ON COLUMN feed_posts.post_context IS 'JSONB targeting context: target_subjects, target_topics, difficulty, learning_stage, node_types, show_to_all';
COMMENT ON COLUMN feed_posts.priority IS 'Priority level (0=normal, higher=more important). High priority posts always shown.';
COMMENT ON COLUMN feed_posts.activity_type IS 'Type of interactive activity: post, poll, quiz, video_quiz, flashcard, etc.';
COMMENT ON COLUMN feed_posts.activity_data IS 'JSONB data specific to activity type (poll options, quiz questions, flashcard content, etc.)';
COMMENT ON TABLE post_views IS 'Tracks which posts users have viewed to avoid repetition';
COMMENT ON TABLE feed_activity_responses IS 'Stores user responses to interactive activities (quizzes, challenges, etc.)';
COMMENT ON TABLE feed_poll_votes IS 'Stores poll votes with aggregation support';
