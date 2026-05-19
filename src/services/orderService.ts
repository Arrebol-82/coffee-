import { requireSupabase, successResponse, formatDateTime } from "./supabaseHelpers";
import type { PageResult } from "@/types/product";
import type {
  Order,
  OrderCreateDTO,
  OrderDetail,
  OrderItem,
  OrderLog,
  OrderQuery,
  OrderStatus,
  OrderUpdateDTO,
} from "@/types/order";

type OrderRow = {
  id: number;
  order_no: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_remark: string | null;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
};

type OrderItemRow = {
  id: number;
  order_id: number;
  product_id: number | null;
  product_name: string;
  price: number;
  count: number;
};

type OrderLogRow = {
  id: number;
  action: string;
  operator: string;
  created_at: string;
};

type ProductStockRow = {
  id: number;
  name: string;
  price: number;
  stock: number;
};

const mapOrder = (row: OrderRow): Order => ({
  id: row.id,
  order_no: row.order_no,
  customer: {
    name: row.customer_name,
    phone: row.customer_phone,
    address: row.customer_address,
    remark: row.customer_remark ?? "",
  },
  totalAmount: row.total_amount,
  status: row.status,
  createTime: formatDateTime(row.created_at),
});

const mapOrderItem = (row: OrderItemRow): OrderItem => ({
  id: row.product_id ?? row.id,
  name: row.product_name,
  price: row.price,
  count: row.count,
});

const mapOrderLog = (row: OrderLogRow): OrderLog => ({
  id: row.id,
  action: row.action,
  operator: row.operator,
  createTime: formatDateTime(row.created_at),
});

const toOrderUpdatePayload = (payload: OrderCreateDTO | OrderUpdateDTO, totalAmount: number) => ({
  customer_name: payload.customer.name,
  customer_phone: payload.customer.phone,
  customer_address: payload.customer.address,
  customer_remark: payload.customer.remark ?? "",
  status: payload.status ?? "pending",
  total_amount: totalAmount,
});

const getProductsForItems = async (productIds: number[]) => {
  const client = requireSupabase();
  const { data, error } = await client
    .from("products")
    .select("id,name,price,stock")
    .eq("is_active", true)
    .in("id", productIds);
  if (error) throw error;

  return new Map((data ?? []).map((product) => [product.id, product as ProductStockRow]));
};

const buildOrderItems = (payload: OrderCreateDTO | OrderUpdateDTO, products: Map<number, ProductStockRow>) => {
  return payload.items
    .map((item) => {
      const product = products.get(item.productId);
      if (!product || item.count <= 0) return null;

      return {
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        count: item.count,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
};

const collectCounts = (items: Array<{ product_id: number | null; count: number }>) => {
  const map = new Map<number, number>();
  items.forEach((item) => {
    if (!item.product_id) return;
    map.set(item.product_id, (map.get(item.product_id) ?? 0) + item.count);
  });
  return map;
};

const applyStockDeltas = async (
  deltas: Map<number, number>,
  products: Map<number, ProductStockRow>,
  reason: string
) => {
  const client = requireSupabase();

  for (const [productId, delta] of deltas.entries()) {
    if (delta === 0) continue;

    const product = products.get(productId);
    if (!product) continue;

    const nextStock = product.stock - delta;
    if (nextStock < 0) {
      throw new Error(`${product.name} 库存不足`);
    }

    const { error } = await client
      .from("products")
      .update({ stock: nextStock })
      .eq("id", productId);
    if (error) throw error;

    await client.from("inventory_logs").insert({
      product_id: product.id,
      product_name: product.name,
      type: delta > 0 ? "out" : "restore",
      change: -delta,
      before_stock: product.stock,
      after_stock: nextStock,
      reason,
      operator: "Admin",
    });

    product.stock = nextStock;
  }
};

export const getOrderList = async (params: OrderQuery) => {
  const client = requireSupabase();
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = client
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (params.keyword) {
    const keyword = `%${params.keyword}%`;
    query = query.or(
      `order_no.ilike.${keyword},customer_name.ilike.${keyword},customer_phone.ilike.${keyword}`
    );
  }

  if (params.status) {
    query = query.eq("status", params.status);
  }

  if (params.date === "today") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    query = query.gte("created_at", start.toISOString()).lte("created_at", end.toISOString());
  }

  if (params.startDate) {
    query = query.gte("created_at", `${params.startDate}T00:00:00`);
  }

  if (params.endDate) {
    query = query.lte("created_at", `${params.endDate}T23:59:59`);
  }

  const { data, count, error } = await query.range(from, to);
  if (error) throw error;

  return successResponse<PageResult<Order>>({
    list: ((data ?? []) as OrderRow[]).map(mapOrder),
    total: count ?? 0,
  });
};

export const getOrderDetail = async (id: number) => {
  const client = requireSupabase();
  const { data: orderData, error } = await client
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;

  const { data: itemsData, error: itemsError } = await client
    .from("order_items")
    .select("*")
    .eq("order_id", id)
    .order("id", { ascending: true });
  if (itemsError) throw itemsError;

  const { data: logsData, error: logsError } = await client
    .from("order_logs")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: true });
  if (logsError) throw logsError;

  return successResponse<OrderDetail>({
    ...mapOrder(orderData as OrderRow),
    items: ((itemsData ?? []) as OrderItemRow[]).map(mapOrderItem),
    logs: ((logsData ?? []) as OrderLogRow[]).map(mapOrderLog),
  });
};

export const createOrder = async (payload: OrderCreateDTO) => {
  const client = requireSupabase();
  const productIds = payload.items.map((item) => item.productId);
  const products = await getProductsForItems(productIds);
  const items = buildOrderItems(payload, products);

  if (items.length === 0) {
    throw new Error("请选择订单商品");
  }

  const newCounts = collectCounts(items);
  for (const [productId, count] of newCounts.entries()) {
    const product = products.get(productId);
    if (!product || product.stock < count) {
      throw new Error(`${product?.name ?? "商品"} 库存不足`);
    }
  }

  const totalAmount = items.reduce((total, item) => total + item.price * item.count, 0);
  const orderNo = `ORDER${Date.now()}`;
  const { data: orderData, error } = await client
    .from("orders")
    .insert({
      order_no: orderNo,
      ...toOrderUpdatePayload(payload, totalAmount),
    })
    .select("*")
    .single();
  if (error) throw error;

  const order = mapOrder(orderData as OrderRow);
  const { error: itemError } = await client
    .from("order_items")
    .insert(items.map((item) => ({ ...item, order_id: order.id })));
  if (itemError) throw itemError;

  await applyStockDeltas(newCounts, products, `创建订单 ${orderNo}`);
  await client.from("order_logs").insert({
    order_id: order.id,
    action: "创建订单",
    operator: "Admin",
  });

  return getOrderDetail(order.id);
};

export const updateOrder = async (id: number, payload: OrderUpdateDTO) => {
  const client = requireSupabase();
  const current = (await getOrderDetail(id)).data;

  if (["completed", "cancelled"].includes(current.status)) {
    throw new Error("已完成或已取消的订单不可编辑");
  }

  const productIds = Array.from(
    new Set([
      ...payload.items.map((item) => item.productId),
      ...current.items.map((item) => item.id),
    ])
  );
  const products = await getProductsForItems(productIds);

  const items = buildOrderItems(payload, products);
  if (items.length === 0) {
    throw new Error("请选择订单商品");
  }

  const oldCounts = collectCounts(
    current.items.map((item) => ({ product_id: item.id, count: item.count }))
  );
  const newCounts = collectCounts(items);
  const deltas = new Map<number, number>();
  new Set([...oldCounts.keys(), ...newCounts.keys()]).forEach((productId) => {
    deltas.set(productId, (newCounts.get(productId) ?? 0) - (oldCounts.get(productId) ?? 0));
  });

  for (const [productId, newCount] of newCounts.entries()) {
    const product = products.get(productId);
    const oldCount = oldCounts.get(productId) ?? 0;
    if (!product || product.stock + oldCount < newCount) {
      throw new Error(`${product?.name ?? "商品"} 库存不足`);
    }
  }

  const totalAmount = items.reduce((total, item) => total + item.price * item.count, 0);
  const oldStatus = current.status;
  const { error: updateError } = await client
    .from("orders")
    .update(toOrderUpdatePayload(payload, totalAmount))
    .eq("id", id);
  if (updateError) throw updateError;

  const { error: deleteError } = await client.from("order_items").delete().eq("order_id", id);
  if (deleteError) throw deleteError;

  const { error: insertError } = await client
    .from("order_items")
    .insert(items.map((item) => ({ ...item, order_id: id })));
  if (insertError) throw insertError;

  await applyStockDeltas(deltas, products, `编辑订单 ${current.order_no}`);
  await client.from("order_logs").insert({
    order_id: id,
    action:
      oldStatus === (payload.status ?? oldStatus)
        ? "编辑订单信息"
        : `编辑订单信息，状态更新：${oldStatus} -> ${payload.status}`,
    operator: "Admin",
  });

  return getOrderDetail(id);
};

export const updateOrderStatus = async (id: number, status: OrderStatus) => {
  const client = requireSupabase();
  const current = (await getOrderDetail(id)).data;
  const oldStatus = current.status;

  if (status === "cancelled" && !["cancelled", "completed"].includes(oldStatus)) {
    const products = await getProductsForItems(current.items.map((item) => item.id));
    const restoreDeltas = new Map<number, number>();
    current.items.forEach((item) => restoreDeltas.set(item.id, -item.count));
    await applyStockDeltas(restoreDeltas, products, `取消订单 ${current.order_no}`);
  }

  const { error } = await client.from("orders").update({ status }).eq("id", id);
  if (error) throw error;

  await client.from("order_logs").insert({
    order_id: id,
    action: `状态更新：${oldStatus} -> ${status}`,
    operator: "Admin",
  });

  return successResponse<null>(null, "状态更新成功");
};
