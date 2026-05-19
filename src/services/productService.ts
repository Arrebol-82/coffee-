import { requireSupabase, successResponse, formatDateTime } from "./supabaseHelpers";
import type {
  InventoryLog,
  InventoryPurchaseDTO,
  PageResult,
  Product,
  ProductCreateDTO,
  ProductQuery,
  ProductUpdateDTO,
} from "@/types/product";

type ProductRow = {
  id: number;
  name: string;
  price: number;
  status: Product["status"];
  stock: number;
  category: Product["category"];
  origin: string;
  roast_level: Product["roastLevel"];
  description: string;
  recommended: boolean;
  low_stock_threshold: number;
  created_at: string;
};

type InventoryLogRow = {
  id: number;
  product_id: number | null;
  product_name: string;
  type: InventoryLog["type"];
  change: number;
  before_stock: number;
  after_stock: number;
  reason: string;
  operator: string;
  created_at: string;
};

const mapProduct = (row: ProductRow): Product => ({
  id: row.id,
  name: row.name,
  price: row.price,
  status: row.status,
  stock: row.stock,
  category: row.category,
  origin: row.origin,
  roastLevel: row.roast_level,
  description: row.description,
  recommended: row.recommended,
  lowStockThreshold: row.low_stock_threshold,
  createTime: formatDateTime(row.created_at),
});

const mapProductPayload = (payload: ProductCreateDTO | ProductUpdateDTO) => ({
  name: payload.name,
  price: payload.price,
  status: payload.status,
  stock: payload.stock,
  category: payload.category,
  origin: payload.origin,
  roast_level: payload.roastLevel,
  description: payload.description,
  recommended: payload.recommended,
  low_stock_threshold: payload.lowStockThreshold,
});

const cleanUndefined = <T extends Record<string, unknown>>(value: T) => {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined)
  ) as Partial<T>;
};

const mapInventoryLog = (row: InventoryLogRow): InventoryLog => ({
  id: row.id,
  productId: row.product_id ?? 0,
  productName: row.product_name,
  type: row.type,
  change: row.change,
  beforeStock: row.before_stock,
  afterStock: row.after_stock,
  reason: row.reason,
  operator: row.operator,
  createTime: formatDateTime(row.created_at),
});

export const getProductList = async (params: ProductQuery) => {
  const client = requireSupabase();
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = client
    .from("products")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (params.keyword) {
    const keyword = `%${params.keyword}%`;
    query = query.or(`name.ilike.${keyword},origin.ilike.${keyword},description.ilike.${keyword}`);
  }

  if (params.status) {
    query = query.eq("status", params.status);
  }

  if (params.category) {
    query = query.eq("category", params.category);
  }

  const { data, count, error } = await query.range(from, to);
  if (error) throw error;

  return successResponse<PageResult<Product>>({
    list: ((data ?? []) as ProductRow[]).map(mapProduct),
    total: count ?? 0,
  });
};

export const createProduct = async (payload: ProductCreateDTO) => {
  const client = requireSupabase();
  const insertPayload = {
    ...mapProductPayload(payload),
    is_active: true,
  };

  const { data, error } = await client
    .from("products")
    .insert(insertPayload)
    .select("*")
    .single();
  if (error) throw error;

  const product = mapProduct(data as ProductRow);
  await client.from("inventory_logs").insert({
    product_id: product.id,
    product_name: product.name,
    type: "in",
    change: product.stock,
    before_stock: 0,
    after_stock: product.stock,
    reason: "新增商品初始入库",
    operator: "Admin",
  });

  return successResponse<null>(null, "创建成功");
};

export const updateProduct = async (id: number, payload: ProductUpdateDTO) => {
  const client = requireSupabase();
  const { data: beforeData, error: beforeError } = await client
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();
  if (beforeError) throw beforeError;

  const beforeProduct = mapProduct(beforeData as ProductRow);
  const { data, error } = await client
    .from("products")
    .update(cleanUndefined(mapProductPayload(payload)))
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;

  const product = mapProduct(data as ProductRow);
  if (typeof payload.stock === "number" && payload.stock !== beforeProduct.stock) {
    await client.from("inventory_logs").insert({
      product_id: product.id,
      product_name: product.name,
      type: "adjust",
      change: payload.stock - beforeProduct.stock,
      before_stock: beforeProduct.stock,
      after_stock: payload.stock,
      reason: "商品管理手动调整库存",
      operator: "Admin",
    });
  }

  return successResponse<Product>(product, "更新成功");
};

export const deleteProduct = async (id: number) => {
  const client = requireSupabase();
  const { error } = await client
    .from("products")
    .update({ is_active: false })
    .eq("id", id);
  if (error) throw error;

  return successResponse<null>(null, "删除成功");
};

export const getInventoryLogs = async () => {
  const client = requireSupabase();
  const { data, error } = await client
    .from("inventory_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;

  return successResponse<InventoryLog[]>(((data ?? []) as InventoryLogRow[]).map(mapInventoryLog));
};

export const purchaseInventory = async (payload: InventoryPurchaseDTO) => {
  const client = requireSupabase();
  const { data, error } = await client
    .from("products")
    .select("*")
    .eq("id", payload.productId)
    .eq("is_active", true)
    .single();
  if (error) throw error;

  const product = mapProduct(data as ProductRow);
  const nextStock = product.stock + payload.count;

  const { data: updatedData, error: updateError } = await client
    .from("products")
    .update({ stock: nextStock })
    .eq("id", payload.productId)
    .select("*")
    .single();
  if (updateError) throw updateError;

  const updatedProduct = mapProduct(updatedData as ProductRow);
  await client.from("inventory_logs").insert({
    product_id: product.id,
    product_name: product.name,
    type: "in",
    change: payload.count,
    before_stock: product.stock,
    after_stock: nextStock,
    reason: payload.remark?.trim() || "购入商品入库",
    operator: "Admin",
  });

  return successResponse<Product>(updatedProduct, "入库成功");
};
