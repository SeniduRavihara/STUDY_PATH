-- Create MCQs table
CREATE TABLE IF NOT EXISTS mcqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of answer options
  correct_answer INTEGER NOT NULL, -- Index of correct answer (0-based)
  explanation TEXT,
  difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mcqs_subject_id ON mcqs(subject_id);
CREATE INDEX IF NOT EXISTS idx_mcqs_topic_id ON mcqs(topic_id);
CREATE INDEX IF NOT EXISTS idx_mcqs_difficulty ON mcqs(difficulty);
CREATE INDEX IF NOT EXISTS idx_mcqs_created_by ON mcqs(created_by);
CREATE INDEX IF NOT EXISTS idx_mcqs_is_active ON mcqs(is_active);

-- Enable Row Level Security
ALTER TABLE mcqs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view active MCQs" ON mcqs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create MCQs" ON mcqs
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own MCQs" ON mcqs
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own MCQs" ON mcqs
  FOR DELETE USING (auth.uid() = created_by);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_mcqs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_mcqs_updated_at
  BEFORE UPDATE ON mcqs
  FOR EACH ROW
  EXECUTE FUNCTION update_mcqs_updated_at();
