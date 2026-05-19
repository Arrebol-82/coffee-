import request from "@/utils/request";
import { isSupabaseConfigured } from "@/lib/supabase";
import * as supabaseProducts from "@/services/productService";
import type {
  Product,
  InventoryLog,
  InventoryPurchaseDTO,
  ProductQuery,
  PageResult,
  ProductCreateDTO,
  ProductUpdateDTO,
} from "@/types/product";
import type { ApiResponse } from "@/types/api";

export function getProductList(params: ProductQuery) {
  if (isSupabaseConfigured) {
    return supabaseProducts.getProductList(params);
  }

  return request.get<any, ApiResponse<PageResult<Product>>>("/products", {
    params,
  });
}

export function getInventoryLogs() {
  if (isSupabaseConfigured) {
    return supabaseProducts.getInventoryLogs();
  }

  return request.get<any, ApiResponse<InventoryLog[]>>("/inventory/logs");
}

export function purchaseInventory(payload: InventoryPurchaseDTO) {
  if (isSupabaseConfigured) {
    return supabaseProducts.purchaseInventory(payload);
  }

  return request.post<any, ApiResponse<Product>>("/inventory/purchase", payload);
}

export function createProduct(payload: ProductCreateDTO) {
  if (isSupabaseConfigured) {
    return supabaseProducts.createProduct(payload);
  }

  return request.post<any, ApiResponse<null>>("/products", payload);
}

export function updateProduct(id: number, payload: ProductUpdateDTO) {
  if (isSupabaseConfigured) {
    return supabaseProducts.updateProduct(id, payload);
  }

  return request.put<any, ApiResponse<Product>>(`/products/${id}`, payload);
}

export function deleteProduct(id: number) {
  if (isSupabaseConfigured) {
    return supabaseProducts.deleteProduct(id);
  }

  return request.delete<any, ApiResponse<null>>(`/products/${id}`);
}
