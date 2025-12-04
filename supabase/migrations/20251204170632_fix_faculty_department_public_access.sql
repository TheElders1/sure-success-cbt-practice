/*
  # Fix Public Access to Faculties and Departments

  ## Changes
    - Drop existing SELECT policies for faculties and departments
    - Create new SELECT policies that allow both authenticated and anonymous users to view faculties and departments
    - This enables users on the registration page (who are not yet authenticated) to see faculty and department options

  ## Reasoning
    The registration form requires unauthenticated users to select their faculty and department before creating an account.
    The previous policies only allowed authenticated users to view these tables, causing the dropdowns to be empty.

  ## Security Notes
    - Faculties and departments are reference data that should be publicly readable
    - Write operations remain restricted to authenticated users only
*/

-- Drop existing restrictive SELECT policies
DROP POLICY IF EXISTS "Anyone can view faculties" ON faculties;
DROP POLICY IF EXISTS "Anyone can view departments" ON departments;

-- Create new policies that allow public read access
CREATE POLICY "Public can view faculties"
  ON faculties
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can view departments"
  ON departments
  FOR SELECT
  TO anon, authenticated
  USING (true);
