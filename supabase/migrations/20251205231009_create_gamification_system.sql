/*
  # Create Gamification System

  ## Overview
  Complete gamification system with achievements, badges, daily challenges,
  team competitions, and streak multipliers.

  ## New Tables
  
  1. **achievements**
    - `id` (uuid, primary key) - Achievement ID
    - `name` (text) - Achievement name
    - `description` (text) - Description
    - `icon` (text) - Icon identifier
    - `category` (text) - Category (streak, quiz_master, social, etc.)
    - `requirement_type` (text) - Type of requirement
    - `requirement_value` (integer) - Value to achieve
    - `xp_reward` (integer) - XP awarded
    - `badge_id` (uuid) - Associated badge
    - `rarity` (text) - common, rare, epic, legendary
    - `created_at` (timestamptz)

  2. **user_achievements**
    - `id` (uuid, primary key)
    - `user_id` (uuid) - User who earned it
    - `achievement_id` (uuid) - Achievement earned
    - `earned_at` (timestamptz) - When earned
    - `progress` (integer) - Progress towards achievement
    - UNIQUE(user_id, achievement_id)

  3. **badges**
    - `id` (uuid, primary key)
    - `name` (text) - Badge name
    - `description` (text) - Description
    - `icon` (text) - Icon/image identifier
    - `color` (text) - Badge color
    - `rarity` (text) - Rarity level
    - `created_at` (timestamptz)

  4. **user_badges**
    - `id` (uuid, primary key)
    - `user_id` (uuid) - User who owns badge
    - `badge_id` (uuid) - Badge owned
    - `earned_at` (timestamptz) - When earned
    - `is_displayed` (boolean) - Show on profile
    - UNIQUE(user_id, badge_id)

  5. **daily_challenges**
    - `id` (uuid, primary key)
    - `challenge_date` (date) - Date of challenge
    - `challenge_type` (text) - Type of challenge
    - `description` (text) - Challenge description
    - `requirement` (jsonb) - Challenge requirements
    - `xp_reward` (integer) - XP reward
    - `bonus_multiplier` (numeric) - Bonus multiplier
    - `created_at` (timestamptz)
    - UNIQUE(challenge_date)

  6. **user_daily_challenges**
    - `id` (uuid, primary key)
    - `user_id` (uuid) - User ID
    - `challenge_id` (uuid) - Challenge ID
    - `completed` (boolean) - Completion status
    - `progress` (integer) - Progress value
    - `completed_at` (timestamptz) - When completed
    - UNIQUE(user_id, challenge_id)

  7. **team_competitions**
    - `id` (uuid, primary key)
    - `name` (text) - Competition name
    - `description` (text) - Description
    - `start_date` (timestamptz) - Start time
    - `end_date` (timestamptz) - End time
    - `status` (text) - active, completed, upcoming
    - `competition_type` (text) - department, faculty, global
    - `created_at` (timestamptz)

  8. **team_competition_scores**
    - `id` (uuid, primary key)
    - `competition_id` (uuid) - Competition ID
    - `team_identifier` (text) - Department/team name
    - `total_score` (integer) - Total score
    - `participant_count` (integer) - Number of participants
    - `average_score` (numeric) - Average score
    - `updated_at` (timestamptz)
    - UNIQUE(competition_id, team_identifier)

  ## Security
  - RLS enabled on all tables
  - Users can view achievements and badges
  - Users can only modify their own progress
  - Challenges are read-only for users
  - Competition scores are read-only for users
*/

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  category text NOT NULL CHECK (category IN ('streak', 'quiz_master', 'social', 'learning', 'special')),
  requirement_type text NOT NULL,
  requirement_value integer NOT NULL DEFAULT 0,
  xp_reward integer NOT NULL DEFAULT 0,
  badge_id uuid,
  rarity text NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  achievement_id uuid NOT NULL REFERENCES achievements(id),
  earned_at timestamptz DEFAULT now(),
  progress integer DEFAULT 0,
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own achievement progress"
  ON user_achievements FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL DEFAULT '#3b82f6',
  rarity text NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges"
  ON badges FOR SELECT
  TO authenticated
  USING (true);

-- User badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_id uuid NOT NULL REFERENCES badges(id),
  earned_at timestamptz DEFAULT now(),
  is_displayed boolean DEFAULT false,
  UNIQUE(user_id, badge_id)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges"
  ON user_badges FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own badge display"
  ON user_badges FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert own badges"
  ON user_badges FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Daily challenges table
CREATE TABLE IF NOT EXISTS daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date date NOT NULL,
  challenge_type text NOT NULL,
  description text NOT NULL,
  requirement jsonb NOT NULL DEFAULT '{}',
  xp_reward integer NOT NULL DEFAULT 100,
  bonus_multiplier numeric DEFAULT 1.5,
  created_at timestamptz DEFAULT now(),
  UNIQUE(challenge_date)
);

ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view daily challenges"
  ON daily_challenges FOR SELECT
  TO authenticated
  USING (true);

-- User daily challenges table
CREATE TABLE IF NOT EXISTS user_daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_id uuid NOT NULL REFERENCES daily_challenges(id),
  completed boolean DEFAULT false,
  progress integer DEFAULT 0,
  completed_at timestamptz,
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE user_daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenge progress"
  ON user_daily_challenges FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own challenge progress"
  ON user_daily_challenges FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Team competitions table
CREATE TABLE IF NOT EXISTS team_competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('active', 'completed', 'upcoming')),
  competition_type text NOT NULL DEFAULT 'department' CHECK (competition_type IN ('department', 'faculty', 'global')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE team_competitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view competitions"
  ON team_competitions FOR SELECT
  TO authenticated
  USING (true);

-- Team competition scores table
CREATE TABLE IF NOT EXISTS team_competition_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES team_competitions(id),
  team_identifier text NOT NULL,
  total_score integer DEFAULT 0,
  participant_count integer DEFAULT 0,
  average_score numeric DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(competition_id, team_identifier)
);

ALTER TABLE team_competition_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view competition scores"
  ON team_competition_scores FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(challenge_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_daily_challenges_user_id ON user_daily_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_team_competitions_status ON team_competitions(status);
CREATE INDEX IF NOT EXISTS idx_team_competition_scores_competition ON team_competition_scores(competition_id);

-- Insert default achievements
INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, xp_reward, rarity) VALUES
  ('First Steps', 'Complete your first quiz', 'rocket', 'quiz_master', 'quizzes_completed', 1, 50, 'common'),
  ('Quiz Enthusiast', 'Complete 10 quizzes', 'star', 'quiz_master', 'quizzes_completed', 10, 100, 'common'),
  ('Quiz Master', 'Complete 50 quizzes', 'trophy', 'quiz_master', 'quizzes_completed', 50, 500, 'rare'),
  ('Perfect Week', 'Study for 7 consecutive days', 'calendar', 'streak', 'consecutive_days', 7, 200, 'rare'),
  ('Unstoppable', 'Maintain a 30-day study streak', 'flame', 'streak', 'consecutive_days', 30, 1000, 'epic'),
  ('Perfectionist', 'Score 100% on 5 quizzes', 'award', 'learning', 'perfect_scores', 5, 300, 'rare'),
  ('High Achiever', 'Achieve an average score above 90%', 'trending-up', 'learning', 'average_score', 90, 400, 'epic'),
  ('Consistent Learner', 'Study every day for a month', 'check-circle', 'streak', 'monthly_consistency', 30, 800, 'epic'),
  ('Speed Runner', 'Complete a quiz in under 5 minutes with 80%+', 'zap', 'special', 'speed_score', 1, 250, 'rare'),
  ('Team Player', 'Participate in a team competition', 'users', 'social', 'competitions_joined', 1, 150, 'common'),
  ('Legend', 'Complete 100 quizzes with 80%+ average', 'crown', 'quiz_master', 'legendary_achievement', 100, 2000, 'legendary')
ON CONFLICT DO NOTHING;

-- Insert default badges
INSERT INTO badges (name, description, icon, color, rarity) VALUES
  ('Beginner', 'Just getting started', 'seedling', '#10b981', 'common'),
  ('Dedicated Student', 'Shows consistent effort', 'book-open', '#3b82f6', 'common'),
  ('Top Performer', 'Excels in all areas', 'star', '#f59e0b', 'rare'),
  ('Streak Master', 'Never misses a day', 'flame', '#ef4444', 'rare'),
  ('Perfect Score', 'Achieved perfection', 'award', '#8b5cf6', 'epic'),
  ('Speed Demon', 'Fast and accurate', 'zap', '#ec4899', 'epic'),
  ('Hall of Fame', 'Elite performer', 'crown', '#fbbf24', 'legendary')
ON CONFLICT DO NOTHING;
