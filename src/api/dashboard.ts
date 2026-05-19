import request from "@/utils/request";
import type { ApiResponse } from "@/types/api";
import type { DashboardSummary } from "@/types/dashboard";

export const getDashboardSummary = () => {
  return request.get<any, ApiResponse<DashboardSummary>>("/dashboard/summary");
};
