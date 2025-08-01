export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)";
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
      roadmap_steps: {
        Row: {
          id: string;
          knowledge_content_id: string;
          order: number;
          plan_action: string | null;
          plan_created_at: string | null;
          plan_situation: string | null;
          plan_trigger: string | null;
          roadmap_id: string;
          status: Database["public"]["Enums"]["roadmap_step_status"] | null;
        };
        Insert: {
          id?: string;
          knowledge_content_id: string;
          order: number;
          plan_action?: string | null;
          plan_created_at?: string | null;
          plan_situation?: string | null;
          plan_trigger?: string | null;
          roadmap_id: string;
          status?: Database["public"]["Enums"]["roadmap_step_status"] | null;
        };
        Update: {
          id?: string;
          knowledge_content_id?: string;
          order?: number;
          plan_action?: string | null;
          plan_created_at?: string | null;
          plan_situation?: string | null;
          plan_trigger?: string | null;
          roadmap_id?: string;
          status?: Database["public"]["Enums"]["roadmap_step_status"] | null;
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
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string | null;
          goal_description?: string | null;
          id?: string;
          status?: Database["public"]["Enums"]["roadmap_status"] | null;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string | null;
          goal_description?: string | null;
          id?: string;
          status?: Database["public"]["Enums"]["roadmap_status"] | null;
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
      users: {
        Row: {
          created_at: string | null;
          email: string | null;
          id: string;
          notification_prefs: Json | null;
          stripe_customer_id: string | null;
          subscription_status: Database["public"]["Enums"]["subscription_status"] | null;
          testimonial_state: Database["public"]["Enums"]["testimonial_state"] | null;
        };
        Insert: {
          created_at?: string | null;
          email?: string | null;
          id: string;
          notification_prefs?: Json | null;
          stripe_customer_id?: string | null;
          subscription_status?: Database["public"]["Enums"]["subscription_status"] | null;
          testimonial_state?: Database["public"]["Enums"]["testimonial_state"] | null;
        };
        Update: {
          created_at?: string | null;
          email?: string | null;
          id?: string;
          notification_prefs?: Json | null;
          stripe_customer_id?: string | null;
          subscription_status?: Database["public"]["Enums"]["subscription_status"] | null;
          testimonial_state?: Database["public"]["Enums"]["testimonial_state"] | null;
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
          query_embedding: string;
          match_threshold?: number;
          match_count?: number;
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
