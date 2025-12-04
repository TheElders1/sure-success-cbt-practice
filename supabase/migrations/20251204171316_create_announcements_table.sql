/*
  # Create Announcements Table

  ## New Tables
    - `announcements`
      - `id` (uuid, primary key)
      - `title` (text, required) - Announcement title
      - `content` (text, required) - Announcement content/message
      - `created_by` (uuid, foreign key to users) - Admin who created the announcement
      - `priority` (text) - Priority level: 'low', 'medium', 'high', 'urgent'
      - `is_active` (boolean, default true) - Whether announcement is currently active
      - `created_at` (timestamptz) - When announcement was created
      - `updated_at` (timestamptz) - When announcement was last updated
      - `expires_at` (timestamptz, nullable) - Optional expiration date

  ## Security
    - Enable RLS on announcements table
    - Anyone (authenticated and anonymous) can view active announcements
    - Only authenticated users can create announcements
    - Only the creator can update/delete their announcements

  ## Notes
    This table allows admins to post announcements that all users can see.
    Announcements can have different priority levels and optional expiration dates.
*/

CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active announcements"
  ON announcements
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Authenticated users can create announcements"
  ON announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own announcements"
  ON announcements
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own announcements"
  ON announcements
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_expires ON announcements(expires_at);
