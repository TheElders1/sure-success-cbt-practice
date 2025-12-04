import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          department: string;
          created_at: string;
          last_visit: string;
          total_xp: number;
          level: number;
          study_streak: number;
          longest_streak: number;
          last_study_date: string | null;
          total_quizzes: number;
          perfect_scores: number;
          average_score: number;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      quiz_results: {
        Row: {
          id: string;
          user_id: string;
          course_code: string;
          segment_number: number;
          score: number;
          total_questions: number;
          percentage: number;
          time_spent: number;
          marked_questions: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['quiz_results']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['quiz_results']['Insert']>;
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
        };
        Insert: Omit<Database['public']['Tables']['achievements']['Row'], 'id' | 'unlocked_at'>;
        Update: Partial<Database['public']['Tables']['achievements']['Insert']>;
      };
      weak_areas: {
        Row: {
          id: string;
          user_id: string;
          course_code: string;
          question_hash: string;
          question: string;
          correct_answer: string;
          wrong_count: number;
          last_wrong: string;
        };
        Insert: Omit<Database['public']['Tables']['weak_areas']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['weak_areas']['Insert']>;
      };
    };
  };
};
