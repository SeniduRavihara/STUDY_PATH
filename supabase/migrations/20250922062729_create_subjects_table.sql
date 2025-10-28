-- ======================================================
-- StudyPath App - Migration 002 (Subjects)
-- ======================================================

-- 1) Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Visual elements
    icon TEXT, -- Icon name or emoji
    color TEXT DEFAULT '#3B82F6', -- Hex color for UI
    cover_image_url TEXT, -- Banner/hero image
    
    -- Status and visibility
    status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    estimated_hours INTEGER DEFAULT 0 CHECK (estimated_hours >= 0),
    
    -- Counters (auto-updated via triggers)
    total_topics INTEGER DEFAULT 0 CHECK (total_topics >= 0),
    subscriber_count INTEGER DEFAULT 0 CHECK (subscriber_count >= 0),
    total_completions INTEGER DEFAULT 0 CHECK (total_completions >= 0),
    
    -- Organization
    sort_order INTEGER DEFAULT 0,
    
    -- Audit fields
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2) Enable Row-Level Security
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- 3) Policies
DROP POLICY IF EXISTS "Subjects are viewable by everyone" ON public.subjects;
DROP POLICY IF EXISTS "Subjects are manageable by creators" ON public.subjects;
DROP POLICY IF EXISTS "Admins can manage all subjects" ON public.subjects;

-- Anyone can view active/published subjects
CREATE POLICY "Subjects are viewable by everyone"
ON public.subjects
FOR SELECT
USING (true);

-- Creators can manage their own subjects
CREATE POLICY "Subjects are manageable by creators"
ON public.subjects
FOR ALL
USING (auth.uid()::uuid = created_by);

-- Admins can manage all subjects
CREATE POLICY "Admins can manage all subjects"
ON public.subjects
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()::uuid
    AND u.role = 'admin'
  )
);

-- 4) Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subjects_created_by ON public.subjects(created_by);
CREATE INDEX IF NOT EXISTS idx_subjects_is_active ON public.subjects(is_active);
CREATE INDEX IF NOT EXISTS idx_subjects_status ON public.subjects(status);
CREATE INDEX IF NOT EXISTS idx_subjects_difficulty ON public.subjects(difficulty);
CREATE INDEX IF NOT EXISTS idx_subjects_sort_order ON public.subjects(sort_order);

-- Composite index for common queries (active published subjects ordered)
CREATE INDEX IF NOT EXISTS idx_subjects_active_status_sort ON public.subjects(is_active, status, sort_order);

-- 5) Update trigger for subjects (reuses function from migration 001)
DROP TRIGGER IF EXISTS update_subjects_updated_at ON public.subjects;
CREATE TRIGGER update_subjects_updated_at
    BEFORE UPDATE ON public.subjects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
