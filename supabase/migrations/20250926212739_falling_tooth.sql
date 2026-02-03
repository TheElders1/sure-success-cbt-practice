/*
  # CBT Practice Platform Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text, user's full name)
      - `email` (text, unique identifier)
      - `department` (text, user's department)
      - `join_date` (timestamp)
      - `last_visit` (timestamp)
      - `total_xp` (integer, experience points)
      - `level` (integer, user level)
      - `study_streak` (integer, consecutive study days)
      - `longest_streak` (integer, best streak record)
      - `last_study_date` (timestamp)
      - `total_quizzes_taken` (integer)
      - `perfect_scores` (integer)
      - `average_score` (numeric, percentage)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `quiz_results`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `course_code` (text, course identifier)
      - `segment_number` (integer, quiz segment)
      - `score` (integer, correct answers)
      - `total_questions` (integer, total questions)
      - `percentage` (numeric, score percentage)
      - `time_spent` (integer, seconds)
      - `marked_questions` (integer, flagged questions count)
      - `created_at` (timestamp)

    - `user_achievements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `achievement_id` (text, achievement identifier)
      - `unlocked_at` (timestamp)

    - `weak_areas`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `course_code` (text, course identifier)
      - `question_hash` (text, question identifier)
      - `question_text` (text, the question)
      - `correct_answer` (text, correct answer)
      - `wrong_count` (integer, times answered incorrectly)
      - `last_wrong` (timestamp, last incorrect attempt)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `course_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `course_code` (text, course identifier)
      - `segment_number` (integer, segment identifier)
      - `attempts` (integer, number of attempts)
      - `best_score` (numeric, best percentage)
      - `average_score` (numeric, average percentage)
      - `last_attempt` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `activity_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `action` (text, action type)
      - `page` (text, page visited)
      - `details` (jsonb, additional data)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add admin policies for management access

  3. Indexes
    - Performance indexes on frequently queried columns
    - Composite indexes for complex queries
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  department text,
  join_date timestamptz DEFAULT now(),
  last_visit timestamptz DEFAULT now(),
  total_xp integer DEFAULT 0,
  level integer DEFAULT 1,
  study_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_study_date timestamptz,
  total_quizzes_taken integer DEFAULT 0,
  perfect_scores integer DEFAULT 0,
  average_score numeric(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quiz_results table
CREATE TABLE IF NOT EXISTS quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  course_code text NOT NULL,
  segment_number integer NOT NULL,
  score integer NOT NULL,
  total_questions integer NOT NULL,
  percentage numeric(5,2) NOT NULL,
  time_spent integer NOT NULL,
  marked_questions integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  achievement_id text NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create weak_areas table
CREATE TABLE IF NOT EXISTS weak_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  course_code text NOT NULL,
  question_hash text NOT NULL,
  question_text text NOT NULL,
  correct_answer text NOT NULL,
  wrong_count integer DEFAULT 1,
  last_wrong timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, course_code, question_hash)
);

-- Create course_progress table
CREATE TABLE IF NOT EXISTS course_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  course_code text NOT NULL,
  segment_number integer NOT NULL,
  attempts integer DEFAULT 1,
  best_score numeric(5,2) NOT NULL,
  average_score numeric(5,2) NOT NULL,
  last_attempt timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, course_code, segment_number)
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  action text NOT NULL,
  page text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE weak_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = email);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = email);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = email);

-- Create policies for quiz_results table
CREATE POLICY "Users can read own quiz results"
  ON quiz_results
  FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE email = auth.uid()::text));

CREATE POLICY "Users can insert own quiz results"
  ON quiz_results
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE email = auth.uid()::text));

-- Create policies for user_achievements table
CREATE POLICY "Users can read own achievements"
  ON user_achievements
  FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE email = auth.uid()::text));

CREATE POLICY "Users can insert own achievements"
  ON user_achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE email = auth.uid()::text));

-- Create policies for weak_areas table
CREATE POLICY "Users can read own weak areas"
  ON weak_areas
  FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE email = auth.uid()::text));

CREATE POLICY "Users can manage own weak areas"
  ON weak_areas
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE email = auth.uid()::text));

-- Create policies for course_progress table
CREATE POLICY "Users can read own course progress"
  ON course_progress
  FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE email = auth.uid()::text));

CREATE POLICY "Users can manage own course progress"
  ON course_progress
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE email = auth.uid()::text));

-- Create policies for activity_logs table
CREATE POLICY "Users can read own activity logs"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE email = auth.uid()::text));

CREATE POLICY "Users can insert own activity logs"
  ON activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE email = auth.uid()::text));

-- Admin policies (for admin dashboard access)
CREATE POLICY "Admins can read all data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = 'admin@theelders.dev');

CREATE POLICY "Admins can read all quiz results"
  ON quiz_results
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = 'admin@theelders.dev');

CREATE POLICY "Admins can read all achievements"
  ON user_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = 'admin@theelders.dev');

CREATE POLICY "Admins can read all weak areas"
  ON weak_areas
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = 'admin@theelders.dev');

CREATE POLICY "Admins can read all course progress"
  ON course_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = 'admin@theelders.dev');

CREATE POLICY "Admins can read all activity logs"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = 'admin@theelders.dev');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_last_visit ON users(last_visit);

CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_course_code ON quiz_results(course_code);
CREATE INDEX IF NOT EXISTS idx_quiz_results_created_at ON quiz_results(created_at);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_course ON quiz_results(user_id, course_code);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);

CREATE INDEX IF NOT EXISTS idx_weak_areas_user_id ON weak_areas(user_id);
CREATE INDEX IF NOT EXISTS idx_weak_areas_course_code ON weak_areas(course_code);
CREATE INDEX IF NOT EXISTS idx_weak_areas_user_course ON weak_areas(user_id, course_code);

CREATE INDEX IF NOT EXISTS idx_course_progress_user_id ON course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_course_code ON course_progress(course_code);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weak_areas_updated_at BEFORE UPDATE ON weak_areas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_progress_updated_at BEFORE UPDATE ON course_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
