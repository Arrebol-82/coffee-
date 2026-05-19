import { supabase } from "@/lib/supabase";
import type { ApiResponse } from "@/types/api";

export const requireSupabase = () => {
  if (!supabase) {
    throw new Error(
      "Supabase 未配置：请在项目根目录创建 .env.local，并填写 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY，保存后重启 npm run dev"
    );
  }

  return supabase;
};

export const successResponse = <T>(data: T, message = "success"): ApiResponse<T> => ({
  code: 200,
  message,
  data,
});

export const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "";

  return new Date(value).toLocaleString();
};
