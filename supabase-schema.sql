-- ============================================
-- SUPABASE SCHEMA FOR LEARNING APP (DUOLINGO-STYLE)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  streak_days INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- COURSES TABLE
-- ============================================
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  icon_url TEXT,
  color TEXT DEFAULT '#3B82F6',
  order_index INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT false,
  estimated_hours INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MODULES TABLE (sections within courses)
-- ============================================
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- LESSONS TABLE
-- ============================================
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  lesson_type TEXT CHECK (lesson_type IN ('theory', 'exercise', 'quiz', 'project')) NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  xp_reward INTEGER DEFAULT 10,
  order_index INTEGER NOT NULL,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- USER PROGRESS TABLE
-- ============================================
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  score INTEGER CHECK (score >= 0 AND score <= 100),
  attempts INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- ============================================
-- DAILY ACTIVITY TABLE (for streak tracking)
-- ============================================
CREATE TABLE daily_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  xp_earned INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, activity_date)
);

-- ============================================
-- ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  requirement_type TEXT CHECK (requirement_type IN ('streak', 'xp', 'lessons_completed', 'course_completed')) NOT NULL,
  requirement_value INTEGER NOT NULL,
  badge_color TEXT DEFAULT '#FFD700',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- USER ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_modules_course ON modules(course_id);
CREATE INDEX idx_lessons_module ON lessons(module_id);
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_lesson ON user_progress(lesson_id);
CREATE INDEX idx_daily_activity_user_date ON daily_activity(user_id, activity_date);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, update only their own
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Courses, Modules, Lessons: Read-only for users (only published)
CREATE POLICY "Published courses are viewable by everyone"
  ON courses FOR SELECT
  USING (is_published = true OR auth.role() = 'service_role');

CREATE POLICY "Modules are viewable by everyone"
  ON modules FOR SELECT
  USING (true);

CREATE POLICY "Lessons are viewable by everyone"
  ON lessons FOR SELECT
  USING (true);

-- User Progress: Users can only see and manage their own progress
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Daily Activity: Users can only see and manage their own activity
CREATE POLICY "Users can view own activity"
  ON daily_activity FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity"
  ON daily_activity FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activity"
  ON daily_activity FOR UPDATE
  USING (auth.uid() = user_id);

-- Achievements: Read-only for everyone
CREATE POLICY "Achievements are viewable by everyone"
  ON achievements FOR SELECT
  USING (true);

-- User Achievements: Users can only see their own achievements
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert a sample course (HTML & CSS Basics)
INSERT INTO courses (title, description, difficulty, color, order_index, is_published) VALUES
('HTML & CSS dla początkujących', 'Naucz się podstaw tworzenia stron internetowych od zera', 'beginner', '#E34F26', 1, true),
('Python - Pierwsze kroki', 'Wprowadzenie do programowania w Pythonie', 'beginner', '#3776AB', 2, true),
('JavaScript - Podstawy', 'Poznaj język, który ożywia strony internetowe', 'beginner', '#F7DF1E', 3, true);

-- Insert sample modules for HTML & CSS course
INSERT INTO modules (course_id, title, description, order_index)
SELECT id, 'Wprowadzenie do HTML', 'Poznaj podstawowe tagi i strukturę dokumentu', 1
FROM courses WHERE title = 'HTML & CSS dla początkujących';

INSERT INTO modules (course_id, title, description, order_index)
SELECT id, 'Stylowanie z CSS', 'Naucz się nadawać wygląd swoim stronom', 2
FROM courses WHERE title = 'HTML & CSS dla początkujących';

-- Insert sample lessons
INSERT INTO lessons (module_id, title, lesson_type, content, xp_reward, order_index)
SELECT id, 'Twój pierwszy tag HTML', 'theory',
'{
  "blocks": [
    {
      "type": "text",
      "content": "HTML to język znaczników, który definiuje strukturę strony internetowej. Każdy element na stronie to **tag**."
    },
    {
      "type": "code",
      "language": "html",
      "code": "<h1>Hello World!</h1>"
    },
    {
      "type": "tip",
      "content": "💡 Tag <h1> to nagłówek pierwszego poziomu - najważniejszy na stronie!"
    }
  ]
}'::jsonb, 10, 1
FROM modules WHERE title = 'Wprowadzenie do HTML';

INSERT INTO lessons (module_id, title, lesson_type, content, xp_reward, order_index)
SELECT id, 'Utwórz swój pierwszy nagłówek', 'exercise',
'{
  "type": "exercise",
  "instruction": "Utwórz nagłówek h1 z tekstem: Moja pierwsza strona",
  "starterCode": "<!-- Napisz swój kod tutaj -->\n",
  "solution": "<h1>Moja pierwsza strona</h1>",
  "hint": "Użyj tagu <h1> i zamknij go tagiem </h1>"
}'::jsonb, 15, 2
FROM modules WHERE title = 'Wprowadzenie do HTML';

-- Insert sample achievements
INSERT INTO achievements (title, description, requirement_type, requirement_value, badge_color) VALUES
('Pierwsza lekcja!', 'Ukończ swoją pierwszą lekcję', 'lessons_completed', 1, '#10B981'),
('Tydzień streak', 'Ucz się przez 7 dni z rzędu', 'streak', 7, '#F59E0B'),
('Centurion', 'Zdobądź 100 XP', 'xp', 100, '#3B82F6'),
('Mistrz HTML', 'Ukończ kurs HTML & CSS', 'course_completed', 1, '#E34F26');

-- ============================================
-- FUNCTIONS FOR STREAK CALCULATION
-- ============================================

CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
  yesterday DATE;
  had_activity_yesterday BOOLEAN;
BEGIN
  yesterday := CURRENT_DATE - INTERVAL '1 day';

  -- Check if user had activity yesterday
  SELECT EXISTS(
    SELECT 1 FROM daily_activity
    WHERE user_id = NEW.user_id
    AND activity_date = yesterday
  ) INTO had_activity_yesterday;

  -- Update profile
  UPDATE profiles
  SET
    last_activity_date = NEW.activity_date,
    streak_days = CASE
      WHEN last_activity_date = yesterday THEN streak_days + 1
      WHEN last_activity_date = CURRENT_DATE THEN streak_days
      ELSE 1
    END,
    total_xp = total_xp + NEW.xp_earned,
    updated_at = NOW()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_daily_activity_insert
  AFTER INSERT ON daily_activity
  FOR EACH ROW
  EXECUTE FUNCTION update_user_streak();

-- ============================================
-- DONE! Your database is ready 🎉
-- ============================================
