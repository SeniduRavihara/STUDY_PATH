-- ======================================================
-- StudyPath App - Migration 002 (Subjects)
-- ======================================================

-- 1) Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT, -- Icon name or URL
    color TEXT DEFAULT '#3B82F6', -- Hex color for UI
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2) Enable Row-Level Security
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- 3) Policies
DROP POLICY IF EXISTS "Subjects are viewable by everyone" ON public.subjects;
DROP POLICY IF EXISTS "Subjects are manageable by creators" ON public.subjects;

-- Anyone can view subjects
CREATE POLICY "Subjects are viewable by everyone"
ON public.subjects
FOR SELECT
USING (true);

-- Only creators can manage their subjects
CREATE POLICY "Subjects are manageable by creators"
ON public.subjects
FOR ALL
USING (auth.uid() = created_by);

-- 4) Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subjects_created_by ON public.subjects(created_by);
CREATE INDEX IF NOT EXISTS idx_subjects_is_active ON public.subjects(is_active);
CREATE INDEX IF NOT EXISTS idx_subjects_sort_order ON public.subjects(sort_order);

-- 5) Update trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6) Update trigger for subjects
DROP TRIGGER IF EXISTS update_subjects_updated_at ON public.subjects;
CREATE TRIGGER update_subjects_updated_at
    BEFORE UPDATE ON public.subjects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
