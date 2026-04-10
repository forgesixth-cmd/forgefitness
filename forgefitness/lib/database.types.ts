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
      apple_health_daily_metrics: {
        Row: {
          active_energy_burned_kcal: number | null;
          created_at: string;
          distance_km: number | null;
          entry_date: string;
          exercise_minutes: number | null;
          id: string;
          resting_energy_burned_kcal: number | null;
          sleep_hours: number | null;
          source_payload: Json | null;
          stand_hours: number | null;
          step_count: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          active_energy_burned_kcal?: number | null;
          created_at?: string;
          distance_km?: number | null;
          entry_date: string;
          exercise_minutes?: number | null;
          id?: string;
          resting_energy_burned_kcal?: number | null;
          sleep_hours?: number | null;
          source_payload?: Json | null;
          stand_hours?: number | null;
          step_count?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          active_energy_burned_kcal?: number | null;
          created_at?: string;
          distance_km?: number | null;
          entry_date?: string;
          exercise_minutes?: number | null;
          id?: string;
          resting_energy_burned_kcal?: number | null;
          sleep_hours?: number | null;
          source_payload?: Json | null;
          stand_hours?: number | null;
          step_count?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      apple_health_sleep_sessions: {
        Row: {
          created_at: string;
          duration_hours: number | null;
          ended_at: string;
          id: string;
          sleep_stage: string | null;
          source: string;
          source_payload: Json | null;
          started_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          duration_hours?: number | null;
          ended_at: string;
          id?: string;
          sleep_stage?: string | null;
          source?: string;
          source_payload?: Json | null;
          started_at: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          duration_hours?: number | null;
          ended_at?: string;
          id?: string;
          sleep_stage?: string | null;
          source?: string;
          source_payload?: Json | null;
          started_at?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      apple_health_syncs: {
        Row: {
          created_at: string;
          error_message: string | null;
          id: string;
          records_imported: number;
          source: string;
          status: string;
          sync_completed_at: string | null;
          sync_started_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          error_message?: string | null;
          id?: string;
          records_imported?: number;
          source?: string;
          status?: string;
          sync_completed_at?: string | null;
          sync_started_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          error_message?: string | null;
          id?: string;
          records_imported?: number;
          source?: string;
          status?: string;
          sync_completed_at?: string | null;
          sync_started_at?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      apple_health_workouts: {
        Row: {
          active_energy_burned_kcal: number | null;
          avg_heart_rate_bpm: number | null;
          created_at: string;
          distance_km: number | null;
          duration_minutes: number | null;
          ended_at: string | null;
          id: string;
          source: string;
          source_payload: Json | null;
          started_at: string;
          total_energy_burned_kcal: number | null;
          updated_at: string;
          user_id: string;
          workout_external_id: string | null;
          workout_type: string;
        };
        Insert: {
          active_energy_burned_kcal?: number | null;
          avg_heart_rate_bpm?: number | null;
          created_at?: string;
          distance_km?: number | null;
          duration_minutes?: number | null;
          ended_at?: string | null;
          id?: string;
          source?: string;
          source_payload?: Json | null;
          started_at: string;
          total_energy_burned_kcal?: number | null;
          updated_at?: string;
          user_id: string;
          workout_external_id?: string | null;
          workout_type: string;
        };
        Update: {
          active_energy_burned_kcal?: number | null;
          avg_heart_rate_bpm?: number | null;
          created_at?: string;
          distance_km?: number | null;
          duration_minutes?: number | null;
          ended_at?: string | null;
          id?: string;
          source?: string;
          source_payload?: Json | null;
          started_at?: string;
          total_energy_burned_kcal?: number | null;
          updated_at?: string;
          user_id?: string;
          workout_external_id?: string | null;
          workout_type?: string;
        };
        Relationships: [];
      };
      body_checkins: {
        Row: {
          avg_sleep_hours: number | null;
          body_fat_percentage: number | null;
          checkin_date: string;
          created_at: string;
          id: string;
          mood_score: number | null;
          notes: string | null;
          steps_average: number | null;
          updated_at: string;
          user_id: string;
          weight_kg: number | null;
        };
        Insert: {
          avg_sleep_hours?: number | null;
          body_fat_percentage?: number | null;
          checkin_date?: string;
          created_at?: string;
          id?: string;
          mood_score?: number | null;
          notes?: string | null;
          steps_average?: number | null;
          updated_at?: string;
          user_id: string;
          weight_kg?: number | null;
        };
        Update: {
          avg_sleep_hours?: number | null;
          body_fat_percentage?: number | null;
          checkin_date?: string;
          created_at?: string;
          id?: string;
          mood_score?: number | null;
          notes?: string | null;
          steps_average?: number | null;
          updated_at?: string;
          user_id?: string;
          weight_kg?: number | null;
        };
        Relationships: [];
      };
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
      habit_entries: {
        Row: {
          completed: boolean;
          created_at: string;
          entry_date: string;
          habit_key: string;
          id: string;
          label: string;
          notes: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed?: boolean;
          created_at?: string;
          entry_date?: string;
          habit_key: string;
          id?: string;
          label: string;
          notes?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed?: boolean;
          created_at?: string;
          entry_date?: string;
          habit_key?: string;
          id?: string;
          label?: string;
          notes?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      nutrition_meals: {
        Row: {
          ai_summary: string | null;
          analysis_json: Json | null;
          calories: number | null;
          carbs_grams: number | null;
          created_at: string;
          fats_grams: number | null;
          id: string;
          logged_at: string;
          meal_description: string;
          meal_type: string;
          protein_grams: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          ai_summary?: string | null;
          analysis_json?: Json | null;
          calories?: number | null;
          carbs_grams?: number | null;
          created_at?: string;
          fats_grams?: number | null;
          id?: string;
          logged_at?: string;
          meal_description: string;
          meal_type: string;
          protein_grams?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          ai_summary?: string | null;
          analysis_json?: Json | null;
          calories?: number | null;
          carbs_grams?: number | null;
          created_at?: string;
          fats_grams?: number | null;
          id?: string;
          logged_at?: string;
          meal_description?: string;
          meal_type?: string;
          protein_grams?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      nutrition_targets: {
        Row: {
          calories: number | null;
          carbs_grams: number | null;
          created_at: string;
          fats_grams: number | null;
          hydration_liters: number | null;
          protein_grams: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          calories?: number | null;
          carbs_grams?: number | null;
          created_at?: string;
          fats_grams?: number | null;
          hydration_liters?: number | null;
          protein_grams?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          calories?: number | null;
          carbs_grams?: number | null;
          created_at?: string;
          fats_grams?: number | null;
          hydration_liters?: number | null;
          protein_grams?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          current_weight_kg: number | null;
          daily_calorie_target: number | null;
          daily_calories_to_burn: number | null;
          daily_carbs_grams: number | null;
          daily_fats_grams: number | null;
          daily_protein_grams: number | null;
          display_name: string | null;
          estimated_body_fat_percentage: number | null;
          experience_level: string | null;
          height_cm: number | null;
          id: string;
          last_recommendation_at: string | null;
          primary_goal: string | null;
          target_days: number | null;
          target_strategy_summary: string | null;
          target_weight_kg: number | null;
          updated_at: string;
          weekly_availability: number | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          current_weight_kg?: number | null;
          daily_calorie_target?: number | null;
          daily_calories_to_burn?: number | null;
          daily_carbs_grams?: number | null;
          daily_fats_grams?: number | null;
          daily_protein_grams?: number | null;
          display_name?: string | null;
          estimated_body_fat_percentage?: number | null;
          experience_level?: string | null;
          height_cm?: number | null;
          id: string;
          last_recommendation_at?: string | null;
          primary_goal?: string | null;
          target_days?: number | null;
          target_strategy_summary?: string | null;
          target_weight_kg?: number | null;
          updated_at?: string;
          weekly_availability?: number | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          current_weight_kg?: number | null;
          daily_calorie_target?: number | null;
          daily_calories_to_burn?: number | null;
          daily_carbs_grams?: number | null;
          daily_fats_grams?: number | null;
          daily_protein_grams?: number | null;
          display_name?: string | null;
          estimated_body_fat_percentage?: number | null;
          experience_level?: string | null;
          height_cm?: number | null;
          id?: string;
          last_recommendation_at?: string | null;
          primary_goal?: string | null;
          target_days?: number | null;
          target_strategy_summary?: string | null;
          target_weight_kg?: number | null;
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
