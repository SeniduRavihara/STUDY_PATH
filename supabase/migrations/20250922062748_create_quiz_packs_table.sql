-- Create Quiz Packs table
CREATE TABLE IF NOT EXISTS quiz_packs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  mcq_count INTEGER DEFAULT 0,
  mcq_ids JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of MCQ IDs
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_packs_subject_id ON quiz_packs(subject_id);
CREATE INDEX IF NOT EXISTS idx_quiz_packs_topic_id ON quiz_packs(topic_id);
CREATE INDEX IF NOT EXISTS idx_quiz_packs_difficulty ON quiz_packs(difficulty);
CREATE INDEX IF NOT EXISTS idx_quiz_packs_created_by ON quiz_packs(created_by);
CREATE INDEX IF NOT EXISTS idx_quiz_packs_is_active ON quiz_packs(is_active);

-- Enable Row Level Security
ALTER TABLE quiz_packs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view active quiz packs" ON quiz_packs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create quiz packs" ON quiz_packs
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own quiz packs" ON quiz_packs
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own quiz packs" ON quiz_packs
  FOR DELETE USING (auth.uid() = created_by);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_quiz_packs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_quiz_packs_updated_at
  BEFORE UPDATE ON quiz_packs
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_packs_updated_at();
