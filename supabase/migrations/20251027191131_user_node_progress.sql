-- ======================================================
-- StudyPath App - Migration 007 (User Node Progress Table)
-- ======================================================

-- 1) User Node Progress Table
CREATE TABLE IF NOT EXISTS public.user_node_progress (
	id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
	node_id UUID REFERENCES public.flow_nodes(id) ON DELETE CASCADE NOT NULL,
	status TEXT CHECK (status IN ('locked', 'available', 'completed', 'current')) DEFAULT 'locked',
	started_at TIMESTAMPTZ,
	completed_at TIMESTAMPTZ,
	last_accessed_at TIMESTAMPTZ,
	progress_data JSONB DEFAULT '{}', -- For quiz answers, scores, etc.
	CONSTRAINT user_node_progress_unique UNIQUE (user_id, node_id)
);

-- 2) Enable Row-Level Security
ALTER TABLE public.user_node_progress ENABLE ROW LEVEL SECURITY;

-- 3) RLS Policies
-- Users can view and manage their own node progress
CREATE POLICY "Users can view their own node progress" ON public.user_node_progress
	FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own node progress" ON public.user_node_progress
	FOR ALL USING (auth.uid() = user_id);

-- 4) Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_node_progress_user_id ON public.user_node_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_node_progress_node_id ON public.user_node_progress(node_id);
CREATE INDEX IF NOT EXISTS idx_user_node_progress_status ON public.user_node_progress(status);
