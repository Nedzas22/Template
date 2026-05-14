// Minimal Supabase types for the template.
// Regenerate from your own project with `supabase gen types typescript`.

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
      profiles: {
        Row: {
          user_id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
