import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isPlaceholderValue = (value: string | undefined) => {
  return !value || value.startsWith("your_") || value.includes("你的");
};

export const isSupabaseConfigured =
  !isPlaceholderValue(supabaseUrl) && !isPlaceholderValue(supabaseAnonKey);

// Development mode uses the public anon/publishable key only.
// Do not put a service_role key or database password in frontend code.
// Before production, connect Supabase Auth and tighten RLS policies by role.
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
