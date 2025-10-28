-- ======================================================
-- StudyPath App - Migration 001 (Auth)
-- ======================================================

-- 1) Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "citext"; -- for case-insensitive text

-- 2) Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email CITEXT UNIQUE NOT NULL, -- case-insensitive email
    name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator', 'teacher')),
    
    -- Profile fields
    avatar_url TEXT,
    bio TEXT,
    
    -- Gamification
    level TEXT CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')) DEFAULT 'Beginner',
    total_xp INTEGER DEFAULT 0 CHECK (total_xp >= 0),
    hearts INTEGER DEFAULT 5 CHECK (hearts >= 0),
    coins INTEGER DEFAULT 200 CHECK (coins >= 0),
    streak INTEGER DEFAULT 0 CHECK (streak >= 0),
    rank TEXT DEFAULT 'Novice',
    
    -- User preferences (flexible JSONB for settings, notifications, etc.)
    preferences JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3) Enable Row-Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4) Policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
ON public.users
FOR SELECT
USING (auth.uid()::uuid = id);

-- Users can update their own profile (except role)
CREATE POLICY "Users can manage own profile"
ON public.users
FOR UPDATE
USING (auth.uid()::uuid = id)
WITH CHECK (
  auth.uid()::uuid = id 
  AND role = (SELECT role FROM public.users WHERE id = auth.uid()::uuid) -- prevent role self-elevation
);

-- Users can insert their own profile during signup
CREATE POLICY "Users can insert own profile"
ON public.users
FOR INSERT
WITH CHECK (auth.uid()::uuid = id);

-- Admins can manage all users
CREATE POLICY "Admins can manage all users"
ON public.users
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()::uuid
    AND u.role = 'admin'
  )
);

-- 5) Trigger function (SECURITY DEFINER + safe)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 6) Trigger to sync auth -> public.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7) Update trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8) Update trigger for users
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 9) Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_preferences ON public.users USING GIN (preferences); -- for JSONB queries

-- 10) Seed initial admin (optional - update email/id as needed)
-- To create your first admin, uncomment and update the values below:
-- INSERT INTO public.users (id, email, name, role)
-- VALUES ('YOUR_AUTH_USER_UUID'::uuid, 'admin@studypath.com', 'Admin User', 'admin')
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';