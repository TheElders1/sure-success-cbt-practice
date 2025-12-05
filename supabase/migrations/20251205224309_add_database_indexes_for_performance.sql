/*
  # Add Database Indexes for Performance Optimization

  ## Changes
  
  1. **Users Table Indexes**
    - Add index on `email` for faster login lookups
    - Add index on `username` for faster login lookups
    - Add index on `department` for filtering users by department
    - Add index on `total_xp` and `level` for leaderboard queries
    - Add index on `last_study_date` for streak calculations
  
  2. **Quiz Results Indexes**
    - Add index on `user_id` for fetching user's quiz history
    - Add index on `course_code` for course-specific analytics
    - Add composite index on `user_id, created_at` for timeline queries
    - Add composite index on `course_code, percentage` for top scores
  
  3. **User Achievements Indexes**
    - Add index on `user_id` for fetching user achievements
    - Add index on `achievement_id` for achievement statistics
  
  4. **Weak Areas Indexes**
    - Add index on `user_id` for fetching user's weak areas
    - Add composite index on `user_id, course_code` for course-specific weak areas
  
  5. **Announcements Indexes**
    - Add index on `priority` for filtering announcements
    - Add index on `created_at` for sorting recent announcements
  
  6. **Quiz Attempts Indexes**
    - Add index on `user_id` for fetching user's quiz attempts
    - Add index on `status` for filtering active quizzes
  
  7. **Quiz Questions Indexes**
    - Add index on `course_code` for fetching questions by course
    - Add index on `difficulty` for adaptive difficulty queries
  
  ## Performance Impact
  - Significantly improves query performance for user lookups
  - Faster leaderboard and analytics queries
  - Optimized quiz history and weak area retrieval
  - Better performance for announcement filtering
*/

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_total_xp ON users(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_users_level ON users(level DESC);
CREATE INDEX IF NOT EXISTS idx_users_last_study_date ON users(last_study_date);
CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status);
CREATE INDEX IF NOT EXISTS idx_users_faculty ON users(faculty);
CREATE INDEX IF NOT EXISTS idx_users_join_date ON users(join_date);

-- Quiz results indexes
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_course_code ON quiz_results(course_code);
CREATE INDEX IF NOT EXISTS idx_quiz_results_created_at ON quiz_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_course ON quiz_results(user_id, course_code);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_timeline ON quiz_results(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_course_scores ON quiz_results(course_code, percentage DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_attempt_id ON quiz_results(attempt_id);

-- User achievements indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked_at ON user_achievements(unlocked_at DESC);

-- Weak areas indexes
CREATE INDEX IF NOT EXISTS idx_weak_areas_user_id ON weak_areas(user_id);
CREATE INDEX IF NOT EXISTS idx_weak_areas_course_code ON weak_areas(course_code);
CREATE INDEX IF NOT EXISTS idx_weak_areas_user_course ON weak_areas(user_id, course_code);
CREATE INDEX IF NOT EXISTS idx_weak_areas_wrong_count ON weak_areas(wrong_count DESC);

-- Announcements indexes
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority);
CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON announcements(is_active);

-- Faculties and Departments indexes
CREATE INDEX IF NOT EXISTS idx_departments_faculty_id ON departments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculties_code ON faculties(code);

-- Quiz attempts indexes
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_status ON quiz_attempts(status);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_created_at ON quiz_attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_course ON quiz_attempts(user_id, course_code);

-- Quiz questions indexes
CREATE INDEX IF NOT EXISTS idx_quiz_questions_course_code ON quiz_questions(course_code);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_difficulty ON quiz_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_course_segment ON quiz_questions(course_code, segment_number);

-- Quiz answers indexes
CREATE INDEX IF NOT EXISTS idx_quiz_answers_attempt_id ON quiz_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_question_id ON quiz_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_is_marked ON quiz_answers(is_marked);

-- Course progress indexes
CREATE INDEX IF NOT EXISTS idx_course_progress_user_id ON course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_course_code ON course_progress(course_code);
CREATE INDEX IF NOT EXISTS idx_course_progress_user_course ON course_progress(user_id, course_code);

-- Document uploads indexes
CREATE INDEX IF NOT EXISTS idx_document_uploads_user_id ON document_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_document_uploads_status ON document_uploads(verification_status);

-- Activity logs indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Verification tokens indexes
CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_id ON verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires_at ON verification_tokens(expires_at);
