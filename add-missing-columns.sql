-- ============================================
-- MIGRATION: Add missing columns to courses and lessons tables
-- ============================================

-- Add 'language' column to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'python';

-- Add missing columns to lessons table
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'python',
ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER;

-- Add missing column to modules table
ALTER TABLE modules
ADD COLUMN IF NOT EXISTS icon_emoji TEXT;

-- Update the schema to reflect the changes
COMMENT ON COLUMN courses.language IS 'Programming language for this course (python, javascript, typescript, etc.)';
COMMENT ON COLUMN lessons.description IS 'Brief description of what the lesson covers';
COMMENT ON COLUMN lessons.language IS 'Programming language for this lesson';
COMMENT ON COLUMN lessons.estimated_minutes IS 'Estimated time to complete the lesson in minutes';
COMMENT ON COLUMN modules.icon_emoji IS 'Emoji icon for the module';

-- Verify the columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'courses' AND column_name = 'language';

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'lessons' AND column_name IN ('description', 'language', 'estimated_minutes');

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'modules' AND column_name = 'icon_emoji';
