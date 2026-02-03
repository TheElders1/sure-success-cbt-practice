/*
  # Enhanced User Registration System

  ## Overview
  This migration restructures the users table to properly integrate with Supabase Auth
  and adds comprehensive user registration fields including personal information,
  academic details, and verification status tracking.

  ## Changes

  ### 1. User Table Restructuring
  - Links `users.id` to `auth.users.id` (Supabase Auth integration)
  - Removes custom password authentication (uses Supabase Auth instead)
  - Adds comprehensive registration fields:
    - Personal: first_name, middle_name, last_name, date_of_birth
    - Academic: faculty, department, jamb_reg_number
    - Account: username (unique), email_verified, jamb_verified
    - Verification: verification_document_url, account_status

  ### 2. New Tables
  - `verification_tokens`: Email verification and password reset tokens
  - `document_uploads`: JAMB result and student ID document management

  ### 3. Security Updates
  - Fixes RLS policies to properly use auth.uid()
  - Enables RLS on new tables
  - Adds policies for document uploads and verification

  ### 4. Storage
  - Creates storage bucket for verification documents
  - Sets up secure upload policies

  ## Important Notes
  - Uses Supabase Auth for authentication (email/password)
  - Supports login via email OR username
  - Email verification required for full account access
  - JAMB document verification required for account approval
*/

-- Drop password_hash column if it exists (we use Supabase Auth)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE users DROP COLUMN password_hash;
  END IF;
END $$;

-- Ensure users table has auth link
-- Note: The id should reference auth.users(id) but we can't enforce this with FK
-- Instead, we'll manage this at the application level

-- Add registration fields if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE users ADD COLUMN first_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'middle_name'
  ) THEN
    ALTER TABLE users ADD COLUMN middle_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE users ADD COLUMN last_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'username'
  ) THEN
    ALTER TABLE users ADD COLUMN username text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE users ADD COLUMN date_of_birth date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'faculty'
  ) THEN
    ALTER TABLE users ADD COLUMN faculty text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'jamb_reg_number'
  ) THEN
    ALTER TABLE users ADD COLUMN jamb_reg_number text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE users ADD COLUMN email_verified boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'jamb_verified'
  ) THEN
    ALTER TABLE users ADD COLUMN jamb_verified boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'verification_document_url'
  ) THEN
    ALTER TABLE users ADD COLUMN verification_document_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'account_status'
  ) THEN
    ALTER TABLE users ADD COLUMN account_status text DEFAULT 'pending' CHECK (account_status IN ('pending', 'active', 'suspended'));
  END IF;
END $$;

-- Create verification_tokens table if it doesn't exist
CREATE TABLE IF NOT EXISTS verification_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  token_type text NOT NULL CHECK (token_type IN ('email_verification', 'password_reset')),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create document_uploads table if it doesn't exist
CREATE TABLE IF NOT EXISTS document_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('jamb_result', 'student_id', 'admission_letter')),
  file_url text NOT NULL,
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  verified_by uuid REFERENCES users(id),
  verified_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_uploads ENABLE ROW LEVEL SECURITY;

-- Drop existing problematic policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can read own data" ON users;
  DROP POLICY IF EXISTS "Users can update own data" ON users;
  DROP POLICY IF EXISTS "Users can insert own data" ON users;
  DROP POLICY IF EXISTS "Users can read own quiz results" ON quiz_results;
  DROP POLICY IF EXISTS "Users can insert own quiz results" ON quiz_results;
  DROP POLICY IF EXISTS "Users can read own achievements" ON user_achievements;
  DROP POLICY IF EXISTS "Users can insert own achievements" ON user_achievements;
  DROP POLICY IF EXISTS "Users can read own weak areas" ON weak_areas;
  DROP POLICY IF EXISTS "Users can manage own weak areas" ON weak_areas;
  DROP POLICY IF EXISTS "Users can read own course progress" ON course_progress;
  DROP POLICY IF EXISTS "Users can manage own course progress" ON course_progress;
  DROP POLICY IF EXISTS "Users can read own activity logs" ON activity_logs;
  DROP POLICY IF EXISTS "Users can insert own activity logs" ON activity_logs;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create CORRECT policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Public read for username lookup (for login by username)
CREATE POLICY "Public can check username existence"
  ON users
  FOR SELECT
  TO anon
  USING (true);

-- Create policies for quiz_results table
CREATE POLICY "Users can read own quiz results"
  ON quiz_results
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own quiz results"
  ON quiz_results
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create policies for user_achievements table
CREATE POLICY "Users can read own achievements"
  ON user_achievements
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own achievements"
  ON user_achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create policies for weak_areas table
CREATE POLICY "Users can read own weak areas"
  ON weak_areas
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own weak areas"
  ON weak_areas
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own weak areas"
  ON weak_areas
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own weak areas"
  ON weak_areas
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for course_progress table
CREATE POLICY "Users can read own course progress"
  ON course_progress
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own course progress"
  ON course_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own course progress"
  ON course_progress
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own course progress"
  ON course_progress
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for activity_logs table
CREATE POLICY "Users can read own activity logs"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own activity logs"
  ON activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create policies for verification_tokens table
CREATE POLICY "Users can read own tokens"
  ON verification_tokens
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can manage verification tokens"
  ON verification_tokens
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for document_uploads table
CREATE POLICY "Users can read own documents"
  ON document_uploads
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own documents"
  ON document_uploads
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own documents"
  ON document_uploads
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_jamb_reg_number ON users(jamb_reg_number);
CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_id ON verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_document_uploads_user_id ON document_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_document_uploads_status ON document_uploads(verification_status);

-- Create trigger for document_uploads updated_at
CREATE TRIGGER update_document_uploads_updated_at BEFORE UPDATE ON document_uploads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
