export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      assay_measurements: {
        Row: {
          assay_type: string | null
          compound_id: string
          created_at: string
          endpoint: string
          id: string
          measured_at: string | null
          project_id: string
          relation: string | null
          source_reference: string | null
          units: string | null
          user_id: string
          value: number
          value_kind: string
        }
        Insert: {
          assay_type?: string | null
          compound_id: string
          created_at?: string
          endpoint: string
          id?: string
          measured_at?: string | null
          project_id: string
          relation?: string | null
          source_reference?: string | null
          units?: string | null
          user_id?: string
          value: number
          value_kind?: string
        }
        Update: {
          assay_type?: string | null
          compound_id?: string
          created_at?: string
          endpoint?: string
          id?: string
          measured_at?: string | null
          project_id?: string
          relation?: string | null
          source_reference?: string | null
          units?: string | null
          user_id?: string
          value?: number
          value_kind?: string
        }
        Relationships: [
          {
            foreignKeyName: "assay_measurements_compound_id_fkey"
            columns: ["compound_id"]
            isOneToOne: false
            referencedRelation: "compounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assay_measurements_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          action: string
          created_at: string
          details: Json
          entity_id: string | null
          entity_type: string
          id: string
          project_id: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type: string
          id?: string
          project_id?: string | null
          user_id?: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string
          id?: string
          project_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      compound_relationships: {
        Row: {
          child_id: string
          created_at: string
          id: string
          parent_id: string
          project_id: string
          relationship_type: string
          user_id: string
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          parent_id: string
          project_id: string
          relationship_type: string
          user_id?: string
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          parent_id?: string
          project_id?: string
          relationship_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compound_relationships_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "compounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compound_relationships_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "compounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compound_relationships_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      compounds: {
        Row: {
          aromatic_ring_count: number | null
          calculated_at: string | null
          calculation_engine: string | null
          calculation_error: string | null
          calculation_status: string
          canonical_smiles: string | null
          clogp: number | null
          created_at: string
          dataset_id: string | null
          formula: string | null
          hba: number | null
          hbd: number | null
          heavy_atoms: number | null
          id: string
          inchikey: string | null
          input_format: string
          lipinski_violations: number | null
          mw: number | null
          name: string | null
          notes: string | null
          original_input: string
          project_id: string
          qed: number | null
          ring_count: number | null
          rotatable_bonds: number | null
          source: string
          structural_alerts: Json | null
          tags: string[]
          tpsa: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          aromatic_ring_count?: number | null
          calculated_at?: string | null
          calculation_engine?: string | null
          calculation_error?: string | null
          calculation_status?: string
          canonical_smiles?: string | null
          clogp?: number | null
          created_at?: string
          dataset_id?: string | null
          formula?: string | null
          hba?: number | null
          hbd?: number | null
          heavy_atoms?: number | null
          id?: string
          inchikey?: string | null
          input_format?: string
          lipinski_violations?: number | null
          mw?: number | null
          name?: string | null
          notes?: string | null
          original_input: string
          project_id: string
          qed?: number | null
          ring_count?: number | null
          rotatable_bonds?: number | null
          source: string
          structural_alerts?: Json | null
          tags?: string[]
          tpsa?: number | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          aromatic_ring_count?: number | null
          calculated_at?: string | null
          calculation_engine?: string | null
          calculation_error?: string | null
          calculation_status?: string
          canonical_smiles?: string | null
          clogp?: number | null
          created_at?: string
          dataset_id?: string | null
          formula?: string | null
          hba?: number | null
          hbd?: number | null
          heavy_atoms?: number | null
          id?: string
          inchikey?: string | null
          input_format?: string
          lipinski_violations?: number | null
          mw?: number | null
          name?: string | null
          notes?: string | null
          original_input?: string
          project_id?: string
          qed?: number | null
          ring_count?: number | null
          rotatable_bonds?: number | null
          source?: string
          structural_alerts?: Json | null
          tags?: string[]
          tpsa?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compounds_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compounds_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      datasets: {
        Row: {
          created_at: string
          id: string
          name: string
          project_id: string
          records_accepted: number
          records_duplicate: number
          records_invalid: number
          records_submitted: number
          source_type: string
          uploaded_file_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          project_id: string
          records_accepted?: number
          records_duplicate?: number
          records_invalid?: number
          records_submitted?: number
          source_type: string
          uploaded_file_id?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          project_id?: string
          records_accepted?: number
          records_duplicate?: number
          records_invalid?: number
          records_submitted?: number
          source_type?: string
          uploaded_file_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "datasets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "datasets_uploaded_file_id_fkey"
            columns: ["uploaded_file_id"]
            isOneToOne: false
            referencedRelation: "uploaded_files"
            referencedColumns: ["id"]
          },
        ]
      }
      docking_jobs: {
        Row: {
          created_at: string
          error: string | null
          id: string
          parameters: Json
          project_id: string
          provider: string | null
          status: string
          target_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          parameters?: Json
          project_id: string
          provider?: string | null
          status?: string
          target_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          parameters?: Json
          project_id?: string
          provider?: string | null
          status?: string
          target_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "docking_jobs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "docking_jobs_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "targets"
            referencedColumns: ["id"]
          },
        ]
      }
      generation_jobs: {
        Row: {
          created_at: string
          error: string | null
          id: string
          parameters: Json
          project_id: string
          provider: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          parameters?: Json
          project_id: string
          provider?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          parameters?: Json
          project_id?: string
          provider?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generation_jobs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      model_versions: {
        Row: {
          created_at: string
          id: string
          metrics: Json | null
          model_id: string
          training_dataset_id: string | null
          user_id: string
          version: string
        }
        Insert: {
          created_at?: string
          id?: string
          metrics?: Json | null
          model_id: string
          training_dataset_id?: string | null
          user_id?: string
          version: string
        }
        Update: {
          created_at?: string
          id?: string
          metrics?: Json | null
          model_id?: string
          training_dataset_id?: string | null
          user_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "model_versions_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_versions_training_dataset_id_fkey"
            columns: ["training_dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      models: {
        Row: {
          created_at: string
          endpoint: string | null
          id: string
          model_type: string
          name: string
          project_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          endpoint?: string | null
          id?: string
          model_type: string
          name: string
          project_id?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string
          endpoint?: string | null
          id?: string
          model_type?: string
          name?: string
          project_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "models_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      optimization_candidates: {
        Row: {
          compound_id: string | null
          created_at: string
          id: string
          rationale: string | null
          run_id: string
          score: number | null
          smiles: string
          user_id: string
        }
        Insert: {
          compound_id?: string | null
          created_at?: string
          id?: string
          rationale?: string | null
          run_id: string
          score?: number | null
          smiles: string
          user_id?: string
        }
        Update: {
          compound_id?: string | null
          created_at?: string
          id?: string
          rationale?: string | null
          run_id?: string
          score?: number | null
          smiles?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "optimization_candidates_compound_id_fkey"
            columns: ["compound_id"]
            isOneToOne: false
            referencedRelation: "compounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "optimization_candidates_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "optimization_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      optimization_runs: {
        Row: {
          created_at: string
          error: string | null
          id: string
          objectives: Json
          project_id: string
          seed_compound_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          objectives?: Json
          project_id: string
          seed_compound_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          objectives?: Json
          project_id?: string
          seed_compound_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "optimization_runs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "optimization_runs_seed_compound_id_fkey"
            columns: ["seed_compound_id"]
            isOneToOne: false
            referencedRelation: "compounds"
            referencedColumns: ["id"]
          },
        ]
      }
      prediction_jobs: {
        Row: {
          created_at: string
          error: string | null
          id: string
          model_version_id: string | null
          parameters: Json
          project_id: string
          provider: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          model_version_id?: string | null
          parameters?: Json
          project_id: string
          provider?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          model_version_id?: string | null
          parameters?: Json
          project_id?: string
          provider?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prediction_jobs_model_version_id_fkey"
            columns: ["model_version_id"]
            isOneToOne: false
            referencedRelation: "model_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prediction_jobs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      prediction_results: {
        Row: {
          compound_id: string
          created_at: string
          docking_job_id: string | null
          endpoint: string
          id: string
          prediction_job_id: string | null
          project_id: string
          uncertainty: number | null
          units: string | null
          user_id: string
          value: number | null
          value_kind: string
        }
        Insert: {
          compound_id: string
          created_at?: string
          docking_job_id?: string | null
          endpoint: string
          id?: string
          prediction_job_id?: string | null
          project_id: string
          uncertainty?: number | null
          units?: string | null
          user_id?: string
          value?: number | null
          value_kind?: string
        }
        Update: {
          compound_id?: string
          created_at?: string
          docking_job_id?: string | null
          endpoint?: string
          id?: string
          prediction_job_id?: string | null
          project_id?: string
          uncertainty?: number | null
          units?: string | null
          user_id?: string
          value?: number | null
          value_kind?: string
        }
        Relationships: [
          {
            foreignKeyName: "prediction_results_compound_id_fkey"
            columns: ["compound_id"]
            isOneToOne: false
            referencedRelation: "compounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prediction_results_docking_job_id_fkey"
            columns: ["docking_job_id"]
            isOneToOne: false
            referencedRelation: "docking_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prediction_results_prediction_job_id_fkey"
            columns: ["prediction_job_id"]
            isOneToOne: false
            referencedRelation: "prediction_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prediction_results_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          organization: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          organization?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          organization?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          assay_type: string | null
          created_at: string
          endpoint_name: string | null
          endpoint_units: string | null
          hard_constraints: Json
          id: string
          ligand_only: boolean
          name: string
          optimization_objectives: string[]
          organism: string | null
          pdb_id: string | null
          preferred_tools: string[]
          research_objective: string | null
          starting_compound_name: string | null
          starting_smiles: string | null
          status: string
          target_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assay_type?: string | null
          created_at?: string
          endpoint_name?: string | null
          endpoint_units?: string | null
          hard_constraints?: Json
          id?: string
          ligand_only?: boolean
          name: string
          optimization_objectives?: string[]
          organism?: string | null
          pdb_id?: string | null
          preferred_tools?: string[]
          research_objective?: string | null
          starting_compound_name?: string | null
          starting_smiles?: string | null
          status?: string
          target_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          assay_type?: string | null
          created_at?: string
          endpoint_name?: string | null
          endpoint_units?: string | null
          hard_constraints?: Json
          id?: string
          ligand_only?: boolean
          name?: string
          optimization_objectives?: string[]
          organism?: string | null
          pdb_id?: string | null
          preferred_tools?: string[]
          research_objective?: string | null
          starting_compound_name?: string | null
          starting_smiles?: string | null
          status?: string
          target_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          content: Json | null
          created_at: string
          id: string
          project_id: string
          title: string
          user_id: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          id?: string
          project_id: string
          title: string
          user_id?: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          id?: string
          project_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      targets: {
        Row: {
          created_at: string
          id: string
          name: string
          organism: string | null
          pdb_id: string | null
          project_id: string
          uniprot_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          organism?: string | null
          pdb_id?: string | null
          project_id: string
          uniprot_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organism?: string | null
          pdb_id?: string | null
          project_id?: string
          uniprot_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "targets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      uploaded_files: {
        Row: {
          created_at: string
          file_name: string
          file_type: string
          id: string
          project_id: string
          size_bytes: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_type: string
          id?: string
          project_id: string
          size_bytes?: number | null
          user_id?: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_type?: string
          id?: string
          project_id?: string
          size_bytes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "uploaded_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
