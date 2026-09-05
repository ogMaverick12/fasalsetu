export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      diagnoses: {
        Row: {
          id: string;
          created_at: string;
          image_url: string | null;
          crop_type: string | null;
          diagnosis_text: string | null;
          state: string | null;
          language: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          image_url?: string | null;
          crop_type?: string | null;
          diagnosis_text?: string | null;
          state?: string | null;
          language?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          image_url?: string | null;
          crop_type?: string | null;
          diagnosis_text?: string | null;
          state?: string | null;
          language?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Diagnosis = Database['public']['Tables']['diagnoses']['Row'];
export type NewDiagnosis = Database['public']['Tables']['diagnoses']['Insert'];
