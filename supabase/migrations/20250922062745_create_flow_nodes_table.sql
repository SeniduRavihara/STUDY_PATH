-- ======================================================
-- StudyPath App - Migration 005 (Flow Nodes Table)
-- ======================================================

-- 1) Flow Nodes Table (Individual learning nodes)
CREATE TABLE IF NOT EXISTS public.flow_nodes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    flow_id UUID REFERENCES public.flows(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    
    -- KEY: sort_order determines position in flow
    sort_order INTEGER NOT NULL DEFAULT 0,
    
    -- Node configuration
    config JSONB DEFAULT '{}', -- Store node-specific settings
    status TEXT CHECK (status IN ('locked', 'available', 'completed', 'current')) DEFAULT 'available',
    
    -- Node rewards and difficulty
    xp_reward INTEGER DEFAULT 0,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
    estimated_time INTEGER DEFAULT 0, -- in minutes
    
    -- Node content
    content_blocks JSONB DEFAULT '[]', -- Array of content blocks for this node
    
    -- Node connections (which nodes this connects to)
    connections UUID[] DEFAULT '{}', -- Array of node IDs this node connects to
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT flow_nodes_title_not_empty CHECK (length(trim(title)) > 0),
    CONSTRAINT flow_nodes_xp_positive CHECK (xp_reward >= 0),
    CONSTRAINT flow_nodes_time_positive CHECK (estimated_time >= 0)
);

-- 2) Enable Row-Level Security
ALTER TABLE public.flow_nodes ENABLE ROW LEVEL SECURITY;

-- 3) RLS Policies
-- Anyone can view flow nodes
CREATE POLICY "Flow nodes are viewable by everyone" ON public.flow_nodes
    FOR SELECT USING (true);

-- Only flow creators can manage flow nodes
CREATE POLICY "Flow nodes are manageable by flow creators" ON public.flow_nodes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.flows 
            WHERE flows.id = flow_nodes.flow_id 
            AND flows.created_by = auth.uid()
        )
    );

-- 4) Indexes for performance
CREATE INDEX IF NOT EXISTS idx_flow_nodes_flow_id ON public.flow_nodes(flow_id);
CREATE INDEX IF NOT EXISTS idx_flow_nodes_status ON public.flow_nodes(status);
CREATE INDEX IF NOT EXISTS idx_flow_nodes_sort_order ON public.flow_nodes(flow_id, sort_order);

-- 5) Update trigger
CREATE TRIGGER update_flow_nodes_updated_at
    BEFORE UPDATE ON public.flow_nodes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 6) Function to update flow statistics when nodes are added/removed
CREATE OR REPLACE FUNCTION public.update_flow_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.flows 
        SET total_nodes = total_nodes + 1,
            total_xp = total_xp + COALESCE(NEW.xp_reward, 0),
            estimated_duration = estimated_duration + COALESCE(NEW.estimated_time, 0)
        WHERE id = NEW.flow_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.flows 
        SET total_nodes = total_nodes - 1,
            total_xp = total_xp - COALESCE(OLD.xp_reward, 0),
            estimated_duration = estimated_duration - COALESCE(OLD.estimated_time, 0)
        WHERE id = OLD.flow_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle XP and time changes
        IF OLD.xp_reward != NEW.xp_reward OR OLD.estimated_time != NEW.estimated_time THEN
            UPDATE public.flows 
            SET total_xp = total_xp - COALESCE(OLD.xp_reward, 0) + COALESCE(NEW.xp_reward, 0),
                estimated_duration = estimated_duration - COALESCE(OLD.estimated_time, 0) + COALESCE(NEW.estimated_time, 0)
            WHERE id = NEW.flow_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 7) Trigger for flow stats updates
CREATE TRIGGER trigger_update_flow_stats
    AFTER INSERT OR UPDATE OR DELETE ON public.flow_nodes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_flow_stats();
