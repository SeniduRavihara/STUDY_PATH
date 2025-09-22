-- ======================================================
-- StudyPath App - Seed Data
-- ======================================================

-- 1) Insert Sample Subjects
INSERT INTO public.subjects (id, name, description, icon, color, sort_order) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Mathematics', 'Learn fundamental math concepts and problem-solving skills', 'calculator', '#3B82F6', 1),
    ('550e8400-e29b-41d4-a716-446655440002', 'Science', 'Explore physics, chemistry, biology, and earth sciences', 'flask', '#10B981', 2),
    ('550e8400-e29b-41d4-a716-446655440003', 'Programming', 'Master coding skills and software development', 'code', '#8B5CF6', 3),
    ('550e8400-e29b-41d4-a716-446655440004', 'History', 'Discover world history and historical events', 'book-open', '#F59E0B', 4),
    ('550e8400-e29b-41d4-a716-446655440005', 'Language Arts', 'Improve reading, writing, and communication skills', 'book', '#EF4444', 5);

-- 2) Insert Sample Topics for Mathematics
INSERT INTO public.topics (id, subject_id, parent_id, name, description, level, sort_order) VALUES
    -- Level 0: Main Topics
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', NULL, 'Algebra', 'Learn algebraic expressions, equations, and functions', 0, 1),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', NULL, 'Geometry', 'Study shapes, angles, and spatial relationships', 0, 2),
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', NULL, 'Calculus', 'Master derivatives, integrals, and limits', 0, 3),
    
    -- Level 1: Algebra Subtopics
    ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Linear Equations', 'Solve equations with one variable', 1, 1),
    ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Quadratic Equations', 'Work with second-degree equations', 1, 2),
    ('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Polynomials', 'Understand polynomial expressions and operations', 1, 3),
    
    -- Level 2: Linear Equations Sub-subtopics
    ('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440004', 'One-Step Equations', 'Basic equation solving with one operation', 2, 1),
    ('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440004', 'Two-Step Equations', 'Equations requiring two operations to solve', 2, 2),
    ('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440004', 'Multi-Step Equations', 'Complex equations with multiple operations', 2, 3),
    
    -- Level 1: Geometry Subtopics
    ('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'Triangles', 'Study triangle properties and theorems', 1, 1),
    ('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'Circles', 'Learn about circles, arcs, and angles', 1, 2),
    ('660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'Polygons', 'Explore various polygon shapes and properties', 1, 3);

-- 3) Insert Sample Topics for Programming
INSERT INTO public.topics (id, subject_id, parent_id, name, description, level, sort_order) VALUES
    -- Level 0: Main Topics
    ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', NULL, 'Web Development', 'Build websites and web applications', 0, 1),
    ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', NULL, 'Mobile Development', 'Create mobile apps for iOS and Android', 0, 2),
    ('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', NULL, 'Data Science', 'Analyze data and build machine learning models', 0, 3),
    
    -- Level 1: Web Development Subtopics
    ('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', 'Frontend Development', 'Build user interfaces with HTML, CSS, and JavaScript', 1, 1),
    ('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', 'Backend Development', 'Create server-side applications and APIs', 1, 2),
    ('770e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', 'Full-Stack Development', 'Combine frontend and backend development', 1, 3),
    
    -- Level 2: Frontend Development Sub-subtopics
    ('770e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440004', 'React', 'Build dynamic user interfaces with React', 2, 1),
    ('770e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440004', 'Vue.js', 'Create reactive web applications with Vue.js', 2, 2),
    ('770e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440004', 'Angular', 'Build enterprise-scale applications with Angular', 2, 3);

-- 4) Mark some topics as having flows (for demonstration)
UPDATE public.topics SET has_flow = true WHERE id IN (
    '660e8400-e29b-41d4-a716-446655440007', -- One-Step Equations
    '660e8400-e29b-41d4-a716-446655440008', -- Two-Step Equations
    '770e8400-e29b-41d4-a716-446655440007', -- React
    '770e8400-e29b-41d4-a716-446655440008'  -- Vue.js
);

-- 5) Note: Users will be created automatically when they sign up via auth
-- The trigger function handle_new_user() will create user records in public.users
-- when new users register through Supabase Auth
