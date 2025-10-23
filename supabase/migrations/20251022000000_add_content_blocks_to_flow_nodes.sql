-- ======================================================
-- StudyPath App - Migration: Add Content Blocks Support
-- ======================================================
-- This migration adds flexible content blocks to flow_nodes,
-- enabling node-first, composable content creation

-- 1) Add content_blocks column to flow_nodes table
ALTER TABLE public.flow_nodes 
ADD COLUMN IF NOT EXISTS content_blocks JSONB DEFAULT '[]'::jsonb;

-- 2) Add index for content_blocks queries
CREATE INDEX IF NOT EXISTS idx_flow_nodes_content_blocks ON public.flow_nodes USING GIN (content_blocks);

-- 3) Add comment explaining the column
COMMENT ON COLUMN public.flow_nodes.content_blocks IS 
'Flexible content blocks array. Each block can be: text, note, mcq, poll, video, image, meme, or code. 
Structure: [{ id, type, order, data }]';

-- 4) Update existing nodes with empty content_blocks array (if needed)
UPDATE public.flow_nodes 
SET content_blocks = '[]'::jsonb 
WHERE content_blocks IS NULL;

-- 5) Helper function to validate content block structure
CREATE OR REPLACE FUNCTION public.validate_content_block(block JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if block has required fields
  IF NOT (block ? 'id' AND block ? 'type' AND block ? 'order' AND block ? 'data') THEN
    RETURN FALSE;
  END IF;
  
  -- Check if type is valid
  IF NOT (block->>'type' IN ('text', 'note', 'mcq', 'poll', 'video', 'image', 'meme', 'code')) THEN
    RETURN FALSE;
  END IF;
  
  -- Check if order is a number
  IF NOT jsonb_typeof(block->'order') = 'number' THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 6) Add constraint to validate content_blocks structure (optional - can be strict)
-- Uncomment if you want strict validation:
-- ALTER TABLE public.flow_nodes
-- ADD CONSTRAINT flow_nodes_content_blocks_valid CHECK (
--   content_blocks IS NULL OR 
--   jsonb_typeof(content_blocks) = 'array'
-- );

-- 7) Function to count content blocks by type
CREATE OR REPLACE FUNCTION public.count_content_blocks_by_type(
  node_id UUID,
  block_type TEXT
)
RETURNS INTEGER AS $$
DECLARE
  block_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO block_count
  FROM public.flow_nodes,
       jsonb_array_elements(content_blocks) AS block
  WHERE flow_nodes.id = node_id
    AND block->>'type' = block_type;
  
  RETURN COALESCE(block_count, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- 8) Function to get all MCQs from a flow's nodes
CREATE OR REPLACE FUNCTION public.get_flow_mcqs(flow_uuid UUID)
RETURNS TABLE (
  node_id UUID,
  node_title TEXT,
  mcq_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fn.id as node_id,
    fn.title as node_title,
    block->>'data' as mcq_data
  FROM public.flow_nodes fn,
       jsonb_array_elements(fn.content_blocks) AS block
  WHERE fn.flow_id = flow_uuid
    AND block->>'type' = 'mcq';
END;
$$ LANGUAGE plpgsql STABLE;

-- 9) Migration Notes
-- ======================================================
-- WHAT THIS ENABLES:
-- 1. Nodes can now contain multiple content types
-- 2. Admins can add content directly to nodes
-- 3. No need to pre-create MCQs or Quiz Packs
-- 4. Each node is a flexible container
-- 5. Content blocks can be reordered within a node
-- 
-- CONTENT BLOCK TYPES:
-- - text: Simple text content
-- - note: Highlighted notes (info/warning/success/error)
-- - mcq: Multiple choice questions (inline)
-- - poll: Yes/No or multiple option polls
-- - video: Video embeds (YouTube, Vimeo, etc.)
-- - image: Images with captions
-- - meme: Meme generator format
-- - code: Code snippets with syntax highlighting
--
-- BACKWARD COMPATIBILITY:
-- - Existing nodes keep their config field
-- - Quiz pack references still work
-- - No breaking changes to existing data
-- ======================================================

