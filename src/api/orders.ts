import request from "@/utils/request";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import * as supabaseOrders from "@/services/orderService";
import type { PageResult } from "@/types/product";
import type {
  OrderCreateDTO,
  OrderDetail,
  Order,
  OrderQuery,
  OrderStatus,
  OrderUpdateDTO,
} from "@/types/order";
import type { ApiResponse } from "@/types/api";

export function getOrderList(params: OrderQuery) {
  if (isSupabaseConfigured) {
    return supabaseOrders.getOrderList(params);
  }

  return request.get<any, ApiResponse<PageResult<Order>>>("/orders", {
    params,
  });
}

export const getOrderDetail = (id: number) => {
  if (isSupabaseConfigured) {
    return supabaseOrders.getOrderDetail(id);
  }

  return request.get<any, ApiResponse<OrderDetail>>(`/orders/${id}`);
};

export const createOrder = (payload: OrderCreateDTO) => {
  if (isSupabaseConfigured) {
    return supabaseOrders.createOrder(payload);
  }

  return request.post<any, ApiResponse<OrderDetail>>("/orders", payload);
};

export const updateOrder = (id: number, payload: OrderUpdateDTO) => {
  if (isSupabaseConfigured) {
    return supabaseOrders.updateOrder(id, payload);
  }

  return request.put<any, ApiResponse<OrderDetail>>(`/orders/${id}`, payload);
};

export const updateOrderStatus = (id: number, status: OrderStatus) => {
  if (isSupabaseConfigured) {
    return supabaseOrders.updateOrderStatus(id, status);
  }

  return request.post<any, ApiResponse<null>>(`/orders/${id}/status`, {
    status,
  });
};

export const subscribeToOrderChanges = (
  onChange: () => void,
  event: "*" | "INSERT" | "UPDATE" | "DELETE" = "*"
) => {
  if (isSupabaseConfigured && supabase) {
    const client = supabase;
    const channel = client
      .channel("admin-order-list")
      .on(
        "postgres_changes",
        { event, schema: "public", table: "orders" },
        () => onChange()
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }

  // Mock 模式下使用 BroadcastChannel
  if (typeof BroadcastChannel !== "undefined") {
    const channel = new BroadcastChannel("order-updates");
    const handleMessage = (ev: MessageEvent) => {
      if (ev.data && ev.data.type === "ORDER_UPDATED") {
        console.log("[API] 收到订单更新广播");
        onChange();
      }
    };
    channel.addEventListener("message", handleMessage);
    
    // 同时也监听 localStorage 变化（备用方案）
    const handleStorage = (ev: StorageEvent) => {
      if (ev.key === "coffeesys_orders") {
        console.log("[API] 检测到 localStorage 订单数据变化");
        onChange();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      channel.removeEventListener("message", handleMessage);
      window.removeEventListener("storage", handleStorage);
      channel.close();
    };
  }

  return () => {};
};
