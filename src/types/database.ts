/* eslint-disable @typescript-eslint/no-explicit-any */
export type UserRole = 'participant' | 'admin';
export type MatchStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';
export type TournamentStage = 'group_stage' | 'round_of_32' | 'round_of_16' | 'quarter_final' | 'semi_final' | 'third_place' | 'final';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
          is_active: boolean;
          full_name: string | null;
          phone_number: string | null;
          college: string | null;
          district: string | null;
          mulearn_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: UserRole;
          is_active?: boolean;
          full_name?: string | null;
          phone_number?: string | null;
          college?: string | null;
          district?: string | null;
          mulearn_id?: string | null;
        };
        Update: {
          role?: UserRole;
          is_active?: boolean;
          full_name?: string | null;
          phone_number?: string | null;
          college?: string | null;
          district?: string | null;
          mulearn_id?: string | null;
        };
      };
      teams: {
        Row: {
          id: string;
          owner_id: string;
          team_name: string;
          submission_locked: boolean;
          github_link: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          team_name: string;
          submission_locked?: boolean;
          github_link?: string | null;
        };
        Update: {
          team_name?: string;
          submission_locked?: boolean;
          github_link?: string | null;
        };
      };
      matches: {
        Row: {
          id: string;
          match_code: string;
          stage: TournamentStage;
          home_team: string;
          away_team: string;
          kickoff_time: string;
          status: MatchStatus;
          multiplier: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          match_code: string;
          stage: TournamentStage;
          home_team: string;
          away_team: string;
          kickoff_time: string;
          status?: MatchStatus;
          multiplier: number;
        };
        Update: {
          match_code?: string;
          stage?: TournamentStage;
          home_team?: string;
          away_team?: string;
          kickoff_time?: string;
          status?: MatchStatus;
          multiplier?: number;
        };
      };
      submissions: {
        Row: {
          id: string;
          team_id: string;
          file_path: string;
          file_name: string;
          uploaded_at: string;
          is_valid: boolean;
          validation_errors: any | null;
          locked_at: string | null;
        };
        Insert: {
          team_id: string;
          file_path: string;
          file_name: string;
          is_valid: boolean;
          validation_errors?: any | null;
          locked_at?: string | null;
        };
        Update: {
          is_valid?: boolean;
          validation_errors?: any | null;
          locked_at?: string | null;
        };
      };
      predictions: {
        Row: {
          id: string;
          team_id: string;
          match_id: string;
          winner: string | null;
          home_score: number | null;
          away_score: number | null;
          extra_time_home: number | null;
          extra_time_away: number | null;
          penalty_home: number | null;
          penalty_away: number | null;
          goal_scorers: any | null;
          first_goal_scorer: string | null;
          possession_home: number | null;
          possession_away: number | null;
          shots_home: number | null;
          shots_away: number | null;
          xg_home: number | null;
          xg_away: number | null;
          yellow_home: number | null;
          yellow_away: number | null;
          red_home: number | null;
          red_away: number | null;
          confidence: number | null;
          created_at: string;
        };
        Insert: {
          team_id: string;
          match_id: string;
          winner?: string | null;
          home_score?: number | null;
          away_score?: number | null;
          extra_time_home?: number | null;
          extra_time_away?: number | null;
          penalty_home?: number | null;
          penalty_away?: number | null;
          goal_scorers?: any | null;
          first_goal_scorer?: string | null;
          possession_home?: number | null;
          possession_away?: number | null;
          shots_home?: number | null;
          shots_away?: number | null;
          xg_home?: number | null;
          xg_away?: number | null;
          yellow_home?: number | null;
          yellow_away?: number | null;
          red_home?: number | null;
          red_away?: number | null;
          confidence?: number | null;
        };
        Update: {
          winner?: string | null;
          home_score?: number | null;
          away_score?: number | null;
          extra_time_home?: number | null;
          extra_time_away?: number | null;
          penalty_home?: number | null;
          penalty_away?: number | null;
          goal_scorers?: any | null;
          first_goal_scorer?: string | null;
          possession_home?: number | null;
          possession_away?: number | null;
          shots_home?: number | null;
          shots_away?: number | null;
          xg_home?: number | null;
          xg_away?: number | null;
          yellow_home?: number | null;
          yellow_away?: number | null;
          red_home?: number | null;
          red_away?: number | null;
          confidence?: number | null;
        };
      };
      champion_predictions: {
        Row: {
          id: string;
          team_id: string;
          champion: string;
          created_at: string;
        };
        Insert: {
          team_id: string;
          champion: string;
        };
        Update: {
          champion?: string;
        };
      };
      actual_results: {
        Row: {
          id: string;
          match_id: string;
          winner: string | null;
          home_score: number | null;
          away_score: number | null;
          extra_time_home: number | null;
          extra_time_away: number | null;
          penalty_home: number | null;
          penalty_away: number | null;
          goal_scorers: any | null;
          first_goal_scorer: string | null;
          possession_home: number | null;
          possession_away: number | null;
          shots_home: number | null;
          shots_away: number | null;
          xg_home: number | null;
          xg_away: number | null;
          yellow_home: number | null;
          yellow_away: number | null;
          red_home: number | null;
          red_away: number | null;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          match_id: string;
          winner?: string | null;
          home_score?: number | null;
          away_score?: number | null;
          extra_time_home?: number | null;
          extra_time_away?: number | null;
          penalty_home?: number | null;
          penalty_away?: number | null;
          goal_scorers?: any | null;
          first_goal_scorer?: string | null;
          possession_home?: number | null;
          possession_away?: number | null;
          shots_home?: number | null;
          shots_away?: number | null;
          xg_home?: number | null;
          xg_away?: number | null;
          yellow_home?: number | null;
          yellow_away?: number | null;
          red_home?: number | null;
          red_away?: number | null;
          updated_by?: string | null;
        };
        Update: {
          match_id?: string;
          winner?: string | null;
          home_score?: number | null;
          away_score?: number | null;
          extra_time_home?: number | null;
          extra_time_away?: number | null;
          penalty_home?: number | null;
          penalty_away?: number | null;
          goal_scorers?: any | null;
          first_goal_scorer?: string | null;
          possession_home?: number | null;
          possession_away?: number | null;
          shots_home?: number | null;
          shots_away?: number | null;
          xg_home?: number | null;
          xg_away?: number | null;
          yellow_home?: number | null;
          yellow_away?: number | null;
          red_home?: number | null;
          red_away?: number | null;
          updated_by?: string | null;
          updated_at?: string;
        };
      };
      scoring_rules: {
        Row: {
          id: string;
          rule_key: string;
          rule_name: string;
          points: number;
          is_enabled: boolean;
          updated_at: string;
        };
        Insert: {
          rule_key: string;
          rule_name: string;
          points: number;
          is_enabled?: boolean;
        };
        Update: {
          rule_name?: string;
          points?: number;
          is_enabled?: boolean;
        };
      };
      leaderboard: {
        Row: {
          id: string;
          team_id: string;
          rank: number | null;
          total_score: number;
          accuracy_percentage: number;
          winner_score: number;
          scoreline_score: number;
          scorer_score: number;
          stats_score: number;
          champion_score: number;
          confidence_score: number;
          updated_at: string;
        };
        Insert: {
          team_id: string;
          rank?: number | null;
          total_score?: number;
          accuracy_percentage?: number;
          winner_score?: number;
          scoreline_score?: number;
          scorer_score?: number;
          stats_score?: number;
          champion_score?: number;
          confidence_score?: number;
        };
        Update: {
          rank?: number | null;
          total_score?: number;
          accuracy_percentage?: number;
          winner_score?: number;
          scoreline_score?: number;
          scorer_score?: number;
          stats_score?: number;
          champion_score?: number;
          confidence_score?: number;
        };
      };
      analytics_cache: {
        Row: {
          id: string;
          metric_key: string;
          metric_value: any;
          updated_at: string;
        };
        Insert: {
          metric_key: string;
          metric_value: any;
        };
        Update: {
          metric_value?: any;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          payload: any | null;
          created_at: string;
        };
        Insert: {
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          payload?: any | null;
        };
        Update: {
          actor_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          payload?: any | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      match_status: MatchStatus;
      tournament_stage: TournamentStage;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

