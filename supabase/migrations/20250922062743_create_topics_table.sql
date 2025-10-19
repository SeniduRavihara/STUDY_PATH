-- ======================================================
-- StudyPath App - Migration 003 (Topics)
-- ======================================================

-- 1) Topics Table (Hierarchical structure)
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    level INTEGER NOT NULL DEFAULT 0, -- 0 = top level, 1 = subtopic, 2 = sub-subtopic, etc.
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    has_flow BOOLEAN DEFAULT false, -- Indicates if this topic has an associated flow
    flow_id UUID, -- Will reference flows table when created
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT topics_level_check CHECK (level >= 0),
    CONSTRAINT topics_self_reference_check CHECK (id != parent_id)
);

-- 2) Enable Row-Level Security
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

-- 3) Policies
DROP POLICY IF EXISTS "Topics are viewable by everyone" ON public.topics;
DROP POLICY IF EXISTS "Topics are manageable by creators" ON public.topics;

-- Anyone can view topics
CREATE POLICY "Topics are viewable by everyone"
ON public.topics
FOR SELECT
USING (true);

-- Only creators can manage their topics
CREATE POLICY "Topics are manageable by creators"
ON public.topics
FOR ALL
USING (auth.uid() = created_by);

-- 4) Indexes for performance
CREATE INDEX IF NOT EXISTS idx_topics_subject_id ON public.topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_topics_parent_id ON public.topics(parent_id);
CREATE INDEX IF NOT EXISTS idx_topics_level ON public.topics(level);
CREATE INDEX IF NOT EXISTS idx_topics_is_active ON public.topics(is_active);
CREATE INDEX IF NOT EXISTS idx_topics_has_flow ON public.topics(has_flow);
CREATE INDEX IF NOT EXISTS idx_topics_created_by ON public.topics(created_by);
CREATE INDEX IF NOT EXISTS idx_topics_sort_order ON public.topics(sort_order);

-- 5) Composite index for hierarchical queries
CREATE INDEX IF NOT EXISTS idx_topics_subject_parent_level ON public.topics(subject_id, parent_id, level);

-- 6) Update trigger for topics
DROP TRIGGER IF EXISTS update_topics_updated_at ON public.topics;
CREATE TRIGGER update_topics_updated_at
    BEFORE UPDATE ON public.topics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 7) Function to calculate topic level based on parent hierarchy
CREATE OR REPLACE FUNCTION public.calculate_topic_level(topic_parent_id UUID)
RETURNS INTEGER AS $$
DECLARE
    parent_level INTEGER := 0;
BEGIN
    IF topic_parent_id IS NULL THEN
        RETURN 0; -- Top level topic
    END IF;
    
    -- Get parent's level and add 1
    SELECT COALESCE(level, 0) + 1 INTO parent_level
    FROM public.topics
    WHERE id = topic_parent_id;
    
    RETURN parent_level;
END;
$$ LANGUAGE plpgsql;

-- 8) Trigger to automatically set level when parent_id changes
CREATE OR REPLACE FUNCTION public.set_topic_level()
RETURNS TRIGGER AS $$
BEGIN
    NEW.level = public.calculate_topic_level(NEW.parent_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_topic_level_trigger ON public.topics;
CREATE TRIGGER set_topic_level_trigger
    BEFORE INSERT OR UPDATE ON public.topics
    FOR EACH ROW
    EXECUTE FUNCTION public.set_topic_level();
