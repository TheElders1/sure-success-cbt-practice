/*
  # Complete Quiz System Database Schema

  ## Overview
  This migration creates the complete quiz system infrastructure including question storage,
  attempt tracking, and answer recording. It integrates with the existing quiz_results table.

  ## New Tables

  ### 1. `quiz_questions`
  Stores all quiz questions with their metadata and options.
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier for each question
  - `course_code` (text, not null) - Course identifier (e.g., CSC121, MTH121)
  - `segment_number` (integer, not null) - Quiz segment/section number
  - `question_text` (text, not null) - The actual question text
  - `question_type` (text, not null) - Type of question (multiple_choice, true_false, etc.)
  - `options` (jsonb, not null) - Answer options stored as JSON array
  - `correct_answer` (text, not null) - The correct answer
  - `explanation` (text, nullable) - Explanation for the correct answer
  - `difficulty` (text, nullable) - Question difficulty (easy, medium, hard)
  - `topic` (text, nullable) - Topic/subtopic within the course
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `quiz_attempts`
  Tracks individual quiz sessions/attempts by users.
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier for each attempt
  - `user_id` (uuid, not null) - Foreign key to users table
  - `course_code` (text, not null) - Course being attempted
  - `segment_number` (integer, not null) - Segment being attempted
  - `quiz_mode` (text, not null) - Mode (practice, exam, quick)
  - `start_time` (timestamptz, not null) - When the attempt started
  - `end_time` (timestamptz, nullable) - When the attempt ended (null if in progress)
  - `status` (text, not null) - Status (in_progress, completed, abandoned)
  - `time_spent` (integer, nullable) - Total time spent in seconds
  - `score` (integer, nullable) - Final score (null until completed)
  - `total_questions` (integer, not null) - Number of questions in this attempt
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. `quiz_answers`
  Stores individual answers for each question in an attempt.
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier for each answer
  - `attempt_id` (uuid, not null) - Foreign key to quiz_attempts
  - `question_id` (uuid, not null) - Foreign key to quiz_questions
  - `user_answer` (text, nullable) - User's selected answer
  - `is_correct` (boolean, nullable) - Whether the answer was correct
  - `is_marked` (boolean, default false) - Whether user marked for review
  - `time_spent` (integer, nullable) - Time spent on this question in seconds
  - `answer_order` (integer, not null) - Question order in the attempt
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. Enhancement to `quiz_results`
  Adds link to quiz_attempts table for better traceability.

  ## Security
  - Enable RLS on all new tables
  - Users can only access their own quiz attempts and answers
  - Questions are readable by all authenticated users
  - Proper foreign key constraints to ensure data integrity

  ## Indexes
  - Performance indexes on frequently queried columns
  - Composite indexes for common query patterns

  ## Important Notes
  - Question options are stored as JSON for flexibility
  - Quiz attempts track in-progress and completed sessions
  - Individual answers link to both attempts and questions
  - Time tracking at both attempt and question level
  - Support for marking questions for review
*/

-- Create quiz_questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code text NOT NULL,
  segment_number integer NOT NULL,
  question_text text NOT NULL,
  question_type text NOT NULL DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false')),
  options jsonb NOT NULL,
  correct_answer text NOT NULL,
  explanation text,
  difficulty text CHECK (difficulty IN ('easy', 'medium', 'hard')),
  topic text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_code text NOT NULL,
  segment_number integer NOT NULL,
  quiz_mode text NOT NULL DEFAULT 'practice' CHECK (quiz_mode IN ('practice', 'exam', 'quick')),
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  time_spent integer,
  score integer,
  total_questions integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create quiz_answers table
CREATE TABLE IF NOT EXISTS quiz_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  user_answer text,
  is_correct boolean,
  is_marked boolean DEFAULT false,
  time_spent integer,
  answer_order integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(attempt_id, question_id)
);

-- Add attempt_id to quiz_results if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quiz_results' AND column_name = 'attempt_id'
  ) THEN
    ALTER TABLE quiz_results ADD COLUMN attempt_id uuid REFERENCES quiz_attempts(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quiz_questions
-- All authenticated users can read questions
CREATE POLICY "Authenticated users can read questions"
  ON quiz_questions
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for quiz_attempts
CREATE POLICY "Users can read own attempts"
  ON quiz_attempts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own attempts"
  ON quiz_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own attempts"
  ON quiz_attempts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for quiz_answers
CREATE POLICY "Users can read own answers"
  ON quiz_answers
  FOR SELECT
  TO authenticated
  USING (attempt_id IN (SELECT id FROM quiz_attempts WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own answers"
  ON quiz_answers
  FOR INSERT
  TO authenticated
  WITH CHECK (attempt_id IN (SELECT id FROM quiz_attempts WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own answers"
  ON quiz_answers
  FOR UPDATE
  TO authenticated
  USING (attempt_id IN (SELECT id FROM quiz_attempts WHERE user_id = auth.uid()))
  WITH CHECK (attempt_id IN (SELECT id FROM quiz_attempts WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own answers"
  ON quiz_answers
  FOR DELETE
  TO authenticated
  USING (attempt_id IN (SELECT id FROM quiz_attempts WHERE user_id = auth.uid()));

-- Admin policies for quiz management
CREATE POLICY "Admins can manage questions"
  ON quiz_questions
  FOR ALL
  TO authenticated
  USING (auth.uid()::text IN (
    SELECT id::text FROM users WHERE email = 'admin@theelders.dev'
  ))
  WITH CHECK (auth.uid()::text IN (
    SELECT id::text FROM users WHERE email = 'admin@theelders.dev'
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_questions_course ON quiz_questions(course_code);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_segment ON quiz_questions(segment_number);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_course_segment ON quiz_questions(course_code, segment_number);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_difficulty ON quiz_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_topic ON quiz_questions(topic);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_course ON quiz_attempts(course_code);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_status ON quiz_attempts(status);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_course ON quiz_attempts(user_id, course_code);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_start_time ON quiz_attempts(start_time);

CREATE INDEX IF NOT EXISTS idx_quiz_answers_attempt_id ON quiz_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_question_id ON quiz_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_is_marked ON quiz_answers(is_marked);

CREATE INDEX IF NOT EXISTS idx_quiz_results_attempt_id ON quiz_results(attempt_id);

-- Create updated_at triggers
CREATE TRIGGER update_quiz_questions_updated_at BEFORE UPDATE ON quiz_questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_answers_updated_at BEFORE UPDATE ON quiz_answers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();