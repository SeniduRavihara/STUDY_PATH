-- ======================================================
-- StudyPath App - Migration 004 (Flows Table)
-- ======================================================

-- 1) Flows Table (Main flow container)
CREATE TABLE IF NOT EXISTS public.flows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flow metadata
    total_nodes INTEGER DEFAULT 0,
    estimated_duration INTEGER DEFAULT 0, -- in minutes
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
    total_xp INTEGER DEFAULT 0
);

-- 2) Enable Row-Level Security
ALTER TABLE public.flows ENABLE ROW LEVEL SECURITY;

-- 3) RLS Policies
-- Anyone can view flows
CREATE POLICY "Flows are viewable by everyone" ON public.flows
    FOR SELECT USING (true);

-- Only creators can manage their flows
CREATE POLICY "Flows are manageable by creators" ON public.flows
    FOR ALL USING (auth.uid() = created_by);

-- 4) Indexes for performance
CREATE INDEX IF NOT EXISTS idx_flows_topic_id ON public.flows(topic_id);
CREATE INDEX IF NOT EXISTS idx_flows_status ON public.flows(status);
CREATE INDEX IF NOT EXISTS idx_flows_created_by ON public.flows(created_by);
CREATE INDEX IF NOT EXISTS idx_flows_is_active ON public.flows(is_active);

-- 5) Update trigger
CREATE TRIGGER update_flows_updated_at
    BEFORE UPDATE ON public.flows
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 6) Update topics table to reference flows properly
-- Add foreign key constraint to topics.flow_id
ALTER TABLE public.topics 
ADD CONSTRAINT topics_flow_id_fkey 
FOREIGN KEY (flow_id) REFERENCES public.flows(id) ON DELETE SET NULL;
