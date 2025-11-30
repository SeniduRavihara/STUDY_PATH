-- ======================================================
-- StudyPath App - Migration: Create Feed Posts Table
-- ======================================================

-- Create feed_posts table
CREATE TABLE IF NOT EXISTS public.feed_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

    -- Content
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('achievement', 'question', 'milestone', 'tip', 'quiz_pack', 'lesson_pack')),
    subject TEXT,
    achievement TEXT,
    points_earned INTEGER DEFAULT 0 CHECK (points_earned >= 0),

    -- Media
    media_url TEXT,

    -- Pack data for quiz_pack and lesson_pack types
    pack_data JSONB,

    -- Engagement metrics
    likes INTEGER DEFAULT 0 CHECK (likes >= 0),
    comments INTEGER DEFAULT 0 CHECK (comments >= 0),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row-Level Security
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow anyone to read feed posts
CREATE POLICY "Feed posts are viewable by everyone" ON public.feed_posts
    FOR SELECT USING (true);

-- Allow authenticated users to create feed posts
CREATE POLICY "Users can create their own feed posts" ON public.feed_posts
    FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

-- Allow users to update their own feed posts
CREATE POLICY "Users can update their own feed posts" ON public.feed_posts
    FOR UPDATE USING (auth.uid()::uuid = user_id);

-- Allow users to delete their own feed posts
CREATE POLICY "Users can delete their own feed posts" ON public.feed_posts
    FOR DELETE USING (auth.uid()::uuid = user_id);

-- Allow admins to manage all feed posts
CREATE POLICY "Admins can manage all feed posts" ON public.feed_posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()::uuid AND role = 'admin'
        )
    );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_feed_posts_user_id ON public.feed_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_type ON public.feed_posts(type);
CREATE INDEX IF NOT EXISTS idx_feed_posts_created_at ON public.feed_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_posts_subject ON public.feed_posts(subject);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_feed_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_feed_posts_updated_at
    BEFORE UPDATE ON public.feed_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_feed_posts_updated_at();