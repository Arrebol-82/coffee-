import { requireSupabase, successResponse } from "./supabaseHelpers";

export interface SalesChannel {
  name: string;
  value: number;
  color: string;
}

export const getSalesChannels = async () => {
  const client = requireSupabase();
  const { data, error } = await client
    .from("sales_channels")
    .select("name,value,color")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;

  return successResponse<SalesChannel[]>((data ?? []) as SalesChannel[]);
};
