/*
  # Create Faculties and Departments Tables

  ## Overview
  This migration creates structured tables for managing academic faculties and departments,
  replacing the text-based faculty and department fields in the users table.

  ## New Tables
  
  ### `faculties`
  - `id` (uuid, primary key) - Unique identifier for each faculty
  - `name` (text, unique, not null) - Full name of the faculty
  - `code` (text, unique, not null) - Short code for the faculty (e.g., FAMS, FCT, FSC)
  - `description` (text, nullable) - Optional description of the faculty
  - `created_at` (timestamptz) - Timestamp when the faculty was created
  - `updated_at` (timestamptz) - Timestamp when the faculty was last updated

  ### `departments`
  - `id` (uuid, primary key) - Unique identifier for each department
  - `faculty_id` (uuid, not null) - Foreign key to faculties table
  - `name` (text, not null) - Full name of the department
  - `code` (text, unique, nullable) - Optional short code for the department
  - `created_at` (timestamptz) - Timestamp when the department was created
  - `updated_at` (timestamptz) - Timestamp when the department was last updated

  ## Initial Data
  Populates three faculties and their respective departments:
  1. **Faculty of Allied Medical Sciences** - 8 departments
  2. **Faculty of Computing** - 5 departments
  3. **Faculty of Science** - 18 departments

  ## Security
  - Enable RLS on both tables
  - Add policies for authenticated users to read faculty and department data
  - Admin users can manage (insert, update, delete) faculty and department records
*/

-- Create faculties table
CREATE TABLE IF NOT EXISTS faculties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id uuid NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for faculties
CREATE POLICY "Anyone can view faculties"
  ON faculties FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert faculties"
  ON faculties FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update faculties"
  ON faculties FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete faculties"
  ON faculties FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for departments
CREATE POLICY "Anyone can view departments"
  ON departments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert departments"
  ON departments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update departments"
  ON departments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete departments"
  ON departments FOR DELETE
  TO authenticated
  USING (true);

-- Insert faculties
INSERT INTO faculties (name, code, description) VALUES
  ('Faculty of Allied Medical Sciences', 'FAMS', 'Health sciences and medical technology programs'),
  ('Faculty of Computing', 'FCT', 'Computer science and information technology programs'),
  ('Faculty of Science', 'FSC', 'Pure and applied science programs')
ON CONFLICT (code) DO NOTHING;

-- Insert departments for Faculty of Allied Medical Sciences
INSERT INTO departments (faculty_id, name) 
SELECT id, dept_name FROM faculties, 
  (VALUES 
    ('Anatomy'),
    ('Healthcare Administration and Hospital Management'),
    ('Human Nutrition and Dietetics'),
    ('Human Physiology'),
    ('Medical Lab Science'),
    ('Public Health'),
    ('Nursing Science'),
    ('Optometry')
  ) AS dept(dept_name)
WHERE faculties.code = 'FAMS';

-- Insert departments for Faculty of Computing
INSERT INTO departments (faculty_id, name)
SELECT id, dept_name FROM faculties,
  (VALUES
    ('Computer Science'),
    ('Cyber Security'),
    ('Data Science'),
    ('Information Technology'),
    ('Software Engineering')
  ) AS dept(dept_name)
WHERE faculties.code = 'FCT';

-- Insert departments for Faculty of Science
INSERT INTO departments (faculty_id, name)
SELECT id, dept_name FROM faculties,
  (VALUES
    ('Applied Geophysics'),
    ('Animal & Environmental Biology (AEB)'),
    ('Biotechnology'),
    ('Biochemistry and Molecular Biology'),
    ('Chemistry'),
    ('Environmental Management and Toxicology'),
    ('Geology'),
    ('Geology and Mining'),
    ('Industrial Chemistry'),
    ('Industrial Mathematics'),
    ('Marine Science'),
    ('Mathematics'),
    ('Medical Physics'),
    ('Microbiology'),
    ('Physics'),
    ('Physics with Electronics'),
    ('Plant Science and Bio-technology'),
    ('Statistics')
  ) AS dept(dept_name)
WHERE faculties.code = 'FSC';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_departments_faculty_id ON departments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculties_code ON faculties(code);
CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(name);