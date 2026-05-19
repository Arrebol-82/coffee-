import type { OrderStatus } from "@/types/order";

interface StatusConfig {
  type: "success" | "info" | "warning" | "danger" | "primary" | "";
  label: string;
}

export const ORDER_STATUS_MAP: Record<OrderStatus, StatusConfig> = {
  pending: { type: "info", label: "待付款" },
  paid: { type: "primary", label: "已付款" },
  shipped: { type: "warning", label: "已发货" },
  completed: { type: "success", label: "已完成" },
  cancelled: { type: "danger", label: "已取消" },
};
