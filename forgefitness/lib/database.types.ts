export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      exercise_logs: {
        Row: {
          created_at: string;
          exercise_name: string;
          id: string;
          notes: string | null;
          reps: number | null;
          session_id: string;
          set_number: number;
          updated_at: string;
          user_id: string;
          weight: number | null;
        };
        Insert: {
          created_at?: string;
          exercise_name: string;
          id?: string;
          notes?: string | null;
          reps?: number | null;
          session_id: string;
          set_number: number;
          updated_at?: string;
          user_id: string;
          weight?: number | null;
        };
        Update: {
          created_at?: string;
          exercise_name?: string;
          id?: string;
          notes?: string | null;
          reps?: number | null;
          session_id?: string;
          set_number?: number;
          updated_at?: string;
          user_id?: string;
          weight?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "exercise_logs_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "workout_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string | null;
          experience_level: string | null;
          id: string;
          primary_goal: string | null;
          updated_at: string;
          weekly_availability: number | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          experience_level?: string | null;
          id: string;
          primary_goal?: string | null;
          updated_at?: string;
          weekly_availability?: number | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          experience_level?: string | null;
          id?: string;
          primary_goal?: string | null;
          updated_at?: string;
          weekly_availability?: number | null;
        };
        Relationships: [];
      };
      workout_plans: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          level: string | null;
          name: string;
          schedule_days: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          level?: string | null;
          name: string;
          schedule_days?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          level?: string | null;
          name?: string;
          schedule_days?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      workout_sessions: {
        Row: {
          completed_at: string | null;
          created_at: string;
          duration_minutes: number | null;
          effort_score: number | null;
          focus_area: string | null;
          id: string;
          notes: string | null;
          plan_id: string | null;
          session_name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          duration_minutes?: number | null;
          effort_score?: number | null;
          focus_area?: string | null;
          id?: string;
          notes?: string | null;
          plan_id?: string | null;
          session_name: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          duration_minutes?: number | null;
          effort_score?: number | null;
          focus_area?: string | null;
          id?: string;
          notes?: string | null;
          plan_id?: string | null;
          session_name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workout_sessions_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "workout_plans";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
