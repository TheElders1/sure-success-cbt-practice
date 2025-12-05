/*
  # Create Social Features Tables

  ## New Tables
  
  1. **user_profiles**
    - Profile pictures, bio, location, social links
    - Privacy settings
  
  2. **friendships**
    - Friend requests and connections
    - Status tracking
  
  3. **study_groups**
    - Group management
    - Privacy controls
  
  4. **study_group_members**
    - Member management with roles
  
  5. **group_activities**
    - Activity feed for groups
  
  6. **shared_results**
    - Public sharing links for achievements

  ## Security
  - Enable RLS on all tables
  - Restrictive policies by default
*/

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  avatar_url text,
  bio text,
  location text,
  social_links jsonb DEFAULT '{}',
  privacy_settings jsonb DEFAULT '{"show_stats": true, "show_activity": true, "allow_friend_requests": true}',
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (is_public = true OR id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  friend_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  UNIQUE(user_id, friend_id)
);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their friendships"
  ON friendships FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR friend_id = auth.uid());

CREATE POLICY "Users can create friendship requests"
  ON friendships FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update friendship status"
  ON friendships FOR UPDATE
  TO authenticated
  USING (friend_id = auth.uid())
  WITH CHECK (friend_id = auth.uid());

CREATE POLICY "Users can delete their friendships"
  ON friendships FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR friend_id = auth.uid());

-- Study groups table
CREATE TABLE IF NOT EXISTS study_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  avatar_url text,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  is_private boolean DEFAULT false,
  max_members integer DEFAULT 50,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;

-- Study group members table
CREATE TABLE IF NOT EXISTS study_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;

-- Now add policies for study_groups that reference study_group_members
CREATE POLICY "Anyone can view public groups"
  ON study_groups FOR SELECT
  TO authenticated
  USING (
    is_private = false OR 
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM study_group_members
      WHERE group_id = study_groups.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create groups"
  ON study_groups FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Group admins can update groups"
  ON study_groups FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM study_group_members
      WHERE group_id = study_groups.id 
      AND user_id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM study_group_members
      WHERE group_id = study_groups.id 
      AND user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Policies for study_group_members
CREATE POLICY "Group members can view members"
  ON study_group_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM study_group_members sgm
      WHERE sgm.group_id = study_group_members.group_id 
      AND sgm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group admins can add members"
  ON study_group_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM study_groups
      WHERE id = group_id AND created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM study_group_members sgm
      WHERE sgm.group_id = study_group_members.group_id 
      AND sgm.user_id = auth.uid() 
      AND sgm.role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Members can leave groups"
  ON study_group_members FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Group activities table
CREATE TABLE IF NOT EXISTS group_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  activity_type text NOT NULL CHECK (activity_type IN ('quiz_completed', 'achievement_unlocked', 'streak_milestone', 'joined_group', 'level_up')),
  activity_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE group_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view activities"
  ON group_activities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM study_group_members
      WHERE group_id = group_activities.group_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can create activities"
  ON group_activities FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM study_group_members
      WHERE group_id = group_activities.group_id 
      AND user_id = auth.uid()
    )
  );

-- Shared results table
CREATE TABLE IF NOT EXISTS shared_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  result_type text NOT NULL CHECK (result_type IN ('quiz_score', 'streak', 'achievement', 'leaderboard_rank')),
  result_data jsonb NOT NULL,
  share_token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days')
);

ALTER TABLE shared_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shared results by token"
  ON shared_results FOR SELECT
  USING (expires_at > now());

CREATE POLICY "Users can create shared results"
  ON shared_results FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own shared results"
  ON shared_results FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_public ON user_profiles(is_public);
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);
CREATE INDEX IF NOT EXISTS idx_study_groups_created_by ON study_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_study_groups_is_private ON study_groups(is_private);
CREATE INDEX IF NOT EXISTS idx_study_group_members_group_id ON study_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_user_id ON study_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_activities_group_id ON group_activities(group_id);
CREATE INDEX IF NOT EXISTS idx_group_activities_created_at ON group_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shared_results_share_token ON shared_results(share_token);
CREATE INDEX IF NOT EXISTS idx_shared_results_user_id ON shared_results(user_id);
