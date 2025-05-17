import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";
// import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  console.log(supabaseUrl);
  throw new Error("Supabase 환경 변수가 설정되지 않았습니다.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
  },
});
