/*
  # Create Content Management System Tables

  ## New Tables - Question organization and metadata
  
  Categories, tags, difficulty ratings, pools, multimedia support, and version control

  ## Security
  - RLS enabled
  - Authenticated users can view
  - Content creation open to authenticated users (admin checks in app layer)
*/

-- Question categories table
CREATE TABLE IF NOT EXISTS question_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  parent_id uuid REFERENCES question_categories(id) ON DELETE SET NULL,
  color text DEFAULT '#3B82F6',
  icon text DEFAULT 'folder',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE question_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view categories"
  ON question_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage categories"
  ON question_categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Question tags table
CREATE TABLE IF NOT EXISTS question_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  color text DEFAULT '#6B7280',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE question_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tags"
  ON question_tags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage tags"
  ON question_tags FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Question tag assignments table
CREATE TABLE IF NOT EXISTS question_tag_assignments (
  question_id uuid NOT NULL,
  tag_id uuid REFERENCES question_tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (question_id, tag_id)
);

ALTER TABLE question_tag_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tag assignments"
  ON question_tag_assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage tag assignments"
  ON question_tag_assignments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Question metadata table
CREATE TABLE IF NOT EXISTS question_metadata (
  question_id uuid PRIMARY KEY,
  category_id uuid REFERENCES question_categories(id) ON DELETE SET NULL,
  difficulty_level text DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard', 'expert')),
  estimated_time_seconds integer DEFAULT 60,
  success_rate numeric DEFAULT 0 CHECK (success_rate >= 0 AND success_rate <= 100),
  times_attempted integer DEFAULT 0,
  media_type text DEFAULT 'none' CHECK (media_type IN ('none', 'image', 'video', 'audio')),
  media_url text,
  media_caption text,
  version integer DEFAULT 1,
  is_active boolean DEFAULT true,
  created_by uuid,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE question_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active metadata"
  ON question_metadata FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage metadata"
  ON question_metadata FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Question pools table
CREATE TABLE IF NOT EXISTS question_pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  course_code text,
  randomize_order boolean DEFAULT true,
  questions_per_quiz integer DEFAULT 10,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE question_pools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view pools"
  ON question_pools FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage pools"
  ON question_pools FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Question pool items table
CREATE TABLE IF NOT EXISTS question_pool_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid REFERENCES question_pools(id) ON DELETE CASCADE NOT NULL,
  question_id uuid NOT NULL,
  weight numeric DEFAULT 1.0 CHECK (weight >= 0),
  added_at timestamptz DEFAULT now()
);

ALTER TABLE question_pool_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view pool items"
  ON question_pool_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage pool items"
  ON question_pool_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Question versions table
CREATE TABLE IF NOT EXISTS question_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL,
  version integer NOT NULL,
  question_text text NOT NULL,
  options jsonb NOT NULL,
  correct_answer text NOT NULL,
  explanation text,
  changed_by uuid,
  change_reason text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(question_id, version)
);

ALTER TABLE question_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view versions"
  ON question_versions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create versions"
  ON question_versions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_question_categories_parent_id ON question_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_question_metadata_category_id ON question_metadata(category_id);
CREATE INDEX IF NOT EXISTS idx_question_metadata_difficulty ON question_metadata(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_question_metadata_is_active ON question_metadata(is_active);
CREATE INDEX IF NOT EXISTS idx_question_pool_items_pool_id ON question_pool_items(pool_id);
CREATE INDEX IF NOT EXISTS idx_question_pool_items_question_id ON question_pool_items(question_id);
CREATE INDEX IF NOT EXISTS idx_question_versions_question_id ON question_versions(question_id);
CREATE INDEX IF NOT EXISTS idx_question_tag_assignments_tag_id ON question_tag_assignments(tag_id);
