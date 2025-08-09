export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      application_logs: {
        Row: {
          ai_sentiment: Database["public"]["Enums"]["ai_sentiment"] | null;
          ai_topics: string[] | null;
          created_at: string | null;
          effectiveness_rating: number | null;
          id: string;
          learning_text: string | null;
          roadmap_step_id: string;
          situation_text: string | null;
          user_id: string;
        };
        Insert: {
          ai_sentiment?: Database["public"]["Enums"]["ai_sentiment"] | null;
          ai_topics?: string[] | null;
          created_at?: string | null;
          effectiveness_rating?: number | null;
          id?: string;
          learning_text?: string | null;
          roadmap_step_id: string;
          situation_text?: string | null;
          user_id: string;
        };
        Update: {
          ai_sentiment?: Database["public"]["Enums"]["ai_sentiment"] | null;
          ai_topics?: string[] | null;
          created_at?: string | null;
          effectiveness_rating?: number | null;
          id?: string;
          learning_text?: string | null;
          roadmap_step_id?: string;
          situation_text?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "application_logs_roadmap_step_id_fkey";
            columns: ["roadmap_step_id"];
            isOneToOne: false;
            referencedRelation: "roadmap_steps";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "application_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      content_blocks: {
        Row: {
          content: string;
          content_id: string;
          created_at: string;
          id: string;
          metadata: Json | null;
          published: boolean;
          updated_at: string;
        };
        Insert: {
          content: string;
          content_id: string;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          published?: boolean;
          updated_at?: string;
        };
        Update: {
          content?: string;
          content_id?: string;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          published?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      goal_examples: {
        Row: {
          goal: string;
          id: string;
          if_then_example: string | null;
          knowledge_content_id: string;
          spotting_mission_example: string | null;
        };
        Insert: {
          goal: string;
          id?: string;
          if_then_example?: string | null;
          knowledge_content_id: string;
          spotting_mission_example?: string | null;
        };
        Update: {
          goal?: string;
          id?: string;
          if_then_example?: string | null;
          knowledge_content_id?: string;
          spotting_mission_example?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "goal_examples_knowledge_content_id_fkey";
            columns: ["knowledge_content_id"];
            isOneToOne: false;
            referencedRelation: "knowledge_content";
            referencedColumns: ["id"];
          },
        ];
      };
      knowledge_content: {
        Row: {
          application: string | null;
          category: string | null;
          description: string | null;
          embedding: string | null;
          id: string;
          keywords: string[] | null;
          summary: string | null;
          title: string;
          type: Database["public"]["Enums"]["knowledge_content_type"];
        };
        Insert: {
          application?: string | null;
          category?: string | null;
          description?: string | null;
          embedding?: string | null;
          id?: string;
          keywords?: string[] | null;
          summary?: string | null;
          title: string;
          type: Database["public"]["Enums"]["knowledge_content_type"];
        };
        Update: {
          application?: string | null;
          category?: string | null;
          description?: string | null;
          embedding?: string | null;
          id?: string;
          keywords?: string[] | null;
          summary?: string | null;
          title?: string;
          type?: Database["public"]["Enums"]["knowledge_content_type"];
        };
        Relationships: [];
      };
      notification_logs: {
        Row: {
          body: string;
          created_at: string | null;
          delivered_at: string | null;
          delivery_status: string | null;
          error_message: string | null;
          id: string;
          notification_type: string;
          roadmap_step_id: string | null;
          scheduled_for: string | null;
          title: string;
          user_id: string | null;
        };
        Insert: {
          body: string;
          created_at?: string | null;
          delivered_at?: string | null;
          delivery_status?: string | null;
          error_message?: string | null;
          id?: string;
          notification_type?: string;
          roadmap_step_id?: string | null;
          scheduled_for?: string | null;
          title: string;
          user_id?: string | null;
        };
        Update: {
          body?: string;
          created_at?: string | null;
          delivered_at?: string | null;
          delivery_status?: string | null;
          error_message?: string | null;
          id?: string;
          notification_type?: string;
          roadmap_step_id?: string | null;
          scheduled_for?: string | null;
          title?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "notification_logs_roadmap_step_id_fkey";
            columns: ["roadmap_step_id"];
            isOneToOne: false;
            referencedRelation: "roadmap_steps";
            referencedColumns: ["id"];
          },
        ];
      };
      roadmap_steps: {
        Row: {
          completed_at: string | null;
          id: string;
          knowledge_content_id: string;
          order: number;
          plan_action: string | null;
          plan_created_at: string | null;
          plan_situation: string | null;
          plan_trigger: string | null;
          roadmap_id: string;
          status: Database["public"]["Enums"]["roadmap_step_status"] | null;
          updated_at: string | null;
        };
        Insert: {
          completed_at?: string | null;
          id?: string;
          knowledge_content_id: string;
          order: number;
          plan_action?: string | null;
          plan_created_at?: string | null;
          plan_situation?: string | null;
          plan_trigger?: string | null;
          roadmap_id: string;
          status?: Database["public"]["Enums"]["roadmap_step_status"] | null;
          updated_at?: string | null;
        };
        Update: {
          completed_at?: string | null;
          id?: string;
          knowledge_content_id?: string;
          order?: number;
          plan_action?: string | null;
          plan_created_at?: string | null;
          plan_situation?: string | null;
          plan_trigger?: string | null;
          roadmap_id?: string;
          status?: Database["public"]["Enums"]["roadmap_step_status"] | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "roadmap_steps_knowledge_content_id_fkey";
            columns: ["knowledge_content_id"];
            isOneToOne: false;
            referencedRelation: "knowledge_content";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "roadmap_steps_roadmap_id_fkey";
            columns: ["roadmap_id"];
            isOneToOne: false;
            referencedRelation: "roadmaps";
            referencedColumns: ["id"];
          },
        ];
      };
      roadmaps: {
        Row: {
          completed_at: string | null;
          created_at: string | null;
          goal_description: string | null;
          id: string;
          status: Database["public"]["Enums"]["roadmap_status"] | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string | null;
          goal_description?: string | null;
          id?: string;
          status?: Database["public"]["Enums"]["roadmap_status"] | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string | null;
          goal_description?: string | null;
          id?: string;
          status?: Database["public"]["Enums"]["roadmap_status"] | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "roadmaps_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_subscriptions: {
        Row: {
          created_at: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_current_period_end: string | null;
          subscription_status: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_current_period_end?: string | null;
          subscription_status?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_current_period_end?: string | null;
          subscription_status?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          created_at: string | null;
          email: string | null;
          free_roadmaps_used: boolean | null;
          id: string;
          reminder_enabled: boolean | null;
          reminder_last_sent: string | null;
          reminder_time: string | null;
          reminder_timezone: string | null;
          roadmap_count: number | null;
          testimonial_bonus_used: boolean | null;
          testimonial_state: Database["public"]["Enums"]["testimonial_state"] | null;
          testimonial_url: string | null;
        };
        Insert: {
          created_at?: string | null;
          email?: string | null;
          free_roadmaps_used?: boolean | null;
          id: string;
          reminder_enabled?: boolean | null;
          reminder_last_sent?: string | null;
          reminder_time?: string | null;
          reminder_timezone?: string | null;
          roadmap_count?: number | null;
          testimonial_bonus_used?: boolean | null;
          testimonial_state?: Database["public"]["Enums"]["testimonial_state"] | null;
          testimonial_url?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string | null;
          free_roadmaps_used?: boolean | null;
          id?: string;
          reminder_enabled?: boolean | null;
          reminder_last_sent?: string | null;
          reminder_time?: string | null;
          reminder_timezone?: string | null;
          roadmap_count?: number | null;
          testimonial_bonus_used?: boolean | null;
          testimonial_state?: Database["public"]["Enums"]["testimonial_state"] | null;
          testimonial_url?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown };
        Returns: unknown;
      };
      complete_step_and_unlock_next: {
        Args: { p_roadmap_id: string; p_step_id: string };
        Returns: Json;
      };
      create_roadmap_with_tracking: {
        Args: { p_goal_description: string; p_steps: Json; p_user_id: string };
        Returns: string;
      };
      halfvec_avg: {
        Args: { "": number[] };
        Returns: unknown;
      };
      halfvec_out: {
        Args: { "": unknown };
        Returns: unknown;
      };
      halfvec_send: {
        Args: { "": unknown };
        Returns: string;
      };
      halfvec_typmod_in: {
        Args: { "": unknown[] };
        Returns: number;
      };
      hnsw_bit_support: {
        Args: { "": unknown };
        Returns: unknown;
      };
      hnsw_halfvec_support: {
        Args: { "": unknown };
        Returns: unknown;
      };
      hnsw_sparsevec_support: {
        Args: { "": unknown };
        Returns: unknown;
      };
      hnswhandler: {
        Args: { "": unknown };
        Returns: unknown;
      };
      ivfflat_bit_support: {
        Args: { "": unknown };
        Returns: unknown;
      };
      ivfflat_halfvec_support: {
        Args: { "": unknown };
        Returns: unknown;
      };
      ivfflathandler: {
        Args: { "": unknown };
        Returns: unknown;
      };
      l2_norm: {
        Args: { "": unknown } | { "": unknown };
        Returns: number;
      };
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown };
        Returns: string;
      };
      match_knowledge_content: {
        Args: {
          match_count?: number;
          match_threshold?: number;
          query_embedding: string;
        };
        Returns: {
          id: string;
          title: string;
          category: string;
          type: Database["public"]["Enums"]["knowledge_content_type"];
          summary: string;
          similarity: number;
        }[];
      };
      sparsevec_out: {
        Args: { "": unknown };
        Returns: unknown;
      };
      sparsevec_send: {
        Args: { "": unknown };
        Returns: string;
      };
      sparsevec_typmod_in: {
        Args: { "": unknown[] };
        Returns: number;
      };
      sync_user_data: {
        Args: { p_user_id?: string };
        Returns: {
          user_id: string;
          roadmap_count: number;
          free_roadmaps_used: boolean;
          testimonial_bonus_used: boolean;
          has_testimonial: boolean;
        }[];
      };
      vector_avg: {
        Args: { "": number[] };
        Returns: string;
      };
      vector_dims: {
        Args: { "": string } | { "": unknown };
        Returns: number;
      };
      vector_norm: {
        Args: { "": string };
        Returns: number;
      };
      vector_out: {
        Args: { "": string };
        Returns: unknown;
      };
      vector_send: {
        Args: { "": string };
        Returns: string;
      };
      vector_typmod_in: {
        Args: { "": unknown[] };
        Returns: number;
      };
    };
    Enums: {
      ai_sentiment: "positive" | "negative" | "neutral";
      knowledge_content_type: "mental-model" | "cognitive-bias" | "fallacy";
      roadmap_status: "active" | "completed";
      roadmap_step_status: "locked" | "unlocked" | "completed";
      subscription_status: "free" | "premium";
      testimonial_state:
        | "not_asked"
        | "asked_first"
        | "dismissed_first"
        | "submitted"
        | "asked_second"
        | "dismissed_second";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      ai_sentiment: ["positive", "negative", "neutral"],
      knowledge_content_type: ["mental-model", "cognitive-bias", "fallacy"],
      roadmap_status: ["active", "completed"],
      roadmap_step_status: ["locked", "unlocked", "completed"],
      subscription_status: ["free", "premium"],
      testimonial_state: [
        "not_asked",
        "asked_first",
        "dismissed_first",
        "submitted",
        "asked_second",
        "dismissed_second",
      ],
    },
  },
} as const;
