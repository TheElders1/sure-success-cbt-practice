/*
  # Create Analytics and User Experience Tables

  ## New Tables
  
  1. **user_onboarding_progress**
    - `user_id` (uuid, primary key) - User ID
    - `completed_steps` (jsonb) - Array of completed step IDs
    - `current_step` (text) - Current onboarding step
    - `is_completed` (boolean) - Onboarding completed status
    - `skipped` (boolean) - User skipped onboarding
    - `completed_at` (timestamptz) - When completed
    - `created_at` (timestamptz)
  
  2. **user_settings**
    - `user_id` (uuid, primary key) - User ID
    - `accessibility_mode` (boolean) - Enhanced accessibility
    - `font_size` (text) - Font size preference
    - `high_contrast` (boolean) - High contrast mode
    - `reduce_motion` (boolean) - Reduce animations
    - `keyboard_shortcuts_enabled` (boolean) - Enable shortcuts
    - `updated_at` (timestamptz)
  
  3. **quiz_session_analytics**
    - `id` (uuid, primary key)
    - `user_id` (uuid) - User ID
    - `quiz_id` (uuid) - Quiz/session ID
    - `course_code` (text) - Course code
    - `started_at` (timestamptz) - Session start time
    - `completed_at` (timestamptz) - Session end time
    - `total_questions` (integer) - Number of questions
    - `correct_answers` (integer) - Correct count
    - `score_percentage` (numeric) - Score percentage
    - `time_spent_seconds` (integer) - Total time spent
    - `question_timings` (jsonb) - Time per question
    - `answer_sequence` (jsonb) - Answer order and changes
    - `difficulty_breakdown` (jsonb) - Performance by difficulty
    - `device_type` (text) - Device used
  
  4. **subject_performance**
    - `id` (uuid, primary key)
    - `user_id` (uuid) - User ID
    - `subject_name` (text) - Subject/topic name
    - `course_code` (text) - Course code
    - `total_questions_attempted` (integer) - Questions attempted
    - `correct_answers` (integer) - Correct answers
    - `average_score` (numeric) - Average score
    - `time_spent_seconds` (integer) - Total time spent
    - `last_attempted_at` (timestamptz) - Last attempt
    - `strength_level` (text) - weak, average, strong, expert
    - `updated_at` (timestamptz)
  
  5. **daily_activity**
    - `id` (uuid, primary key)
    - `user_id` (uuid) - User ID
    - `activity_date` (date) - Activity date
    - `quizzes_taken` (integer) - Number of quizzes
    - `questions_answered` (integer) - Questions answered
    - `time_spent_minutes` (integer) - Time spent
    - `xp_earned` (integer) - XP earned that day
    - `created_at` (timestamptz)
    - UNIQUE(user_id, activity_date)
  
  6. **performance_snapshots**
    - `id` (uuid, primary key)
    - `user_id` (uuid) - User ID
    - `snapshot_date` (date) - Snapshot date
    - `total_quizzes` (integer) - Total quizzes taken
    - `average_score` (numeric) - Average score
    - `total_xp` (integer) - Total XP
    - `study_streak` (integer) - Current streak
    - `rank_position` (integer) - Overall rank
    - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Analytics data is private
*/

-- User onboarding progress table
CREATE TABLE IF NOT EXISTS user_onboarding_progress (
  user_id uuid PRIMARY KEY,
  completed_steps jsonb DEFAULT '[]',
  current_step text DEFAULT 'welcome',
  is_completed boolean DEFAULT false,
  skipped boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_onboarding_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own onboarding progress"
  ON user_onboarding_progress FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own onboarding progress"
  ON user_onboarding_progress FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id uuid PRIMARY KEY,
  accessibility_mode boolean DEFAULT false,
  font_size text DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large', 'extra-large')),
  high_contrast boolean DEFAULT false,
  reduce_motion boolean DEFAULT false,
  keyboard_shortcuts_enabled boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own settings"
  ON user_settings FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Quiz session analytics table
CREATE TABLE IF NOT EXISTS quiz_session_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  quiz_id uuid,
  course_code text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  total_questions integer DEFAULT 0,
  correct_answers integer DEFAULT 0,
  score_percentage numeric DEFAULT 0,
  time_spent_seconds integer DEFAULT 0,
  question_timings jsonb DEFAULT '[]',
  answer_sequence jsonb DEFAULT '[]',
  difficulty_breakdown jsonb DEFAULT '{}',
  device_type text DEFAULT 'desktop'
);

ALTER TABLE quiz_session_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics"
  ON quiz_session_analytics FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own analytics"
  ON quiz_session_analytics FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Subject performance table
CREATE TABLE IF NOT EXISTS subject_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subject_name text NOT NULL,
  course_code text NOT NULL,
  total_questions_attempted integer DEFAULT 0,
  correct_answers integer DEFAULT 0,
  average_score numeric DEFAULT 0,
  time_spent_seconds integer DEFAULT 0,
  last_attempted_at timestamptz DEFAULT now(),
  strength_level text DEFAULT 'average' CHECK (strength_level IN ('weak', 'average', 'strong', 'expert')),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, subject_name, course_code)
);

ALTER TABLE subject_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subject performance"
  ON subject_performance FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own subject performance"
  ON subject_performance FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Daily activity table
CREATE TABLE IF NOT EXISTS daily_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  activity_date date NOT NULL,
  quizzes_taken integer DEFAULT 0,
  questions_answered integer DEFAULT 0,
  time_spent_minutes integer DEFAULT 0,
  xp_earned integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, activity_date)
);

ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily activity"
  ON daily_activity FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own daily activity"
  ON daily_activity FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Performance snapshots table
CREATE TABLE IF NOT EXISTS performance_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  snapshot_date date NOT NULL,
  total_quizzes integer DEFAULT 0,
  average_score numeric DEFAULT 0,
  total_xp integer DEFAULT 0,
  study_streak integer DEFAULT 0,
  rank_position integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE performance_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own snapshots"
  ON performance_snapshots FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create snapshots"
  ON performance_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_session_analytics_user_id ON quiz_session_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_session_analytics_course ON quiz_session_analytics(course_code);
CREATE INDEX IF NOT EXISTS idx_quiz_session_analytics_started_at ON quiz_session_analytics(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_subject_performance_user_id ON subject_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_subject_performance_course ON subject_performance(course_code);
CREATE INDEX IF NOT EXISTS idx_daily_activity_user_date ON daily_activity(user_id, activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_performance_snapshots_user_date ON performance_snapshots(user_id, snapshot_date DESC);
