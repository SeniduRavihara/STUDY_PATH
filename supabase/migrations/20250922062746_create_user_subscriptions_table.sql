-- ======================================================
-- StudyPath App - Migration 006 (User Subscriptions Table)
-- ======================================================

-- 1) User Subscriptions Table (Many-to-Many relationship between users and subjects)
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    
    -- Subscription metadata
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    last_accessed_at TIMESTAMPTZ,
    total_time_spent INTEGER DEFAULT 0, -- in minutes
    completed_topics INTEGER DEFAULT 0,
    total_topics INTEGER DEFAULT 0,
    
    -- Constraints
    CONSTRAINT user_subscriptions_unique UNIQUE (user_id, subject_id),
    CONSTRAINT user_subscriptions_progress_valid CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    CONSTRAINT user_subscriptions_time_valid CHECK (total_time_spent >= 0),
    CONSTRAINT user_subscriptions_topics_valid CHECK (completed_topics >= 0 AND total_topics >= 0 AND completed_topics <= total_topics)
);

-- 2) Enable Row-Level Security
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- 3) RLS Policies
-- Users can view their own subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can manage their own subscriptions
CREATE POLICY "Users can manage their own subscriptions" ON public.user_subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- 4) Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_subject_id ON public.user_subscriptions(subject_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_active ON public.user_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_subject ON public.user_subscriptions(user_id, subject_id);

-- 5) Update trigger
CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 6) Function to update subscription progress when topics are completed
CREATE OR REPLACE FUNCTION public.update_subscription_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- This function will be called when user progress is updated
    -- For now, it's a placeholder for future progress tracking
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7) Function to get user's subscribed subjects with progress
CREATE OR REPLACE FUNCTION public.get_user_subscribed_subjects(user_uuid UUID)
RETURNS TABLE (
    subject_id UUID,
    subject_name TEXT,
    subject_description TEXT,
    subject_icon TEXT,
    subject_color TEXT[],
    subscribed_at TIMESTAMPTZ,
    progress_percentage INTEGER,
    last_accessed_at TIMESTAMPTZ,
    total_time_spent INTEGER,
    completed_topics INTEGER,
    total_topics INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id as subject_id,
        s.name as subject_name,
        s.description as subject_description,
        s.icon as subject_icon,
        s.color as subject_color,
        us.subscribed_at,
        us.progress_percentage,
        us.last_accessed_at,
        us.total_time_spent,
        us.completed_topics,
        us.total_topics
    FROM public.subjects s
    INNER JOIN public.user_subscriptions us ON s.id = us.subject_id
    WHERE us.user_id = user_uuid 
    AND us.is_active = true
    AND s.is_active = true
    ORDER BY us.subscribed_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 8) Function to get available subjects (not subscribed by user)
CREATE OR REPLACE FUNCTION public.get_available_subjects(user_uuid UUID)
RETURNS TABLE (
    subject_id UUID,
    subject_name TEXT,
    subject_description TEXT,
    subject_icon TEXT,
    subject_color TEXT[],
    created_at TIMESTAMPTZ,
    total_topics INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id as subject_id,
        s.name as subject_name,
        s.description as subject_description,
        s.icon as subject_icon,
        s.color as subject_color,
        s.created_at,
        (SELECT COUNT(*)::INTEGER FROM public.topics t WHERE t.subject_id = s.id AND t.is_active = true) as total_topics
    FROM public.subjects s
    WHERE s.is_active = true
    AND s.id NOT IN (
        SELECT us.subject_id 
        FROM public.user_subscriptions us 
        WHERE us.user_id = user_uuid 
        AND us.is_active = true
    )
    ORDER BY s.name;
END;
$$ LANGUAGE plpgsql;
