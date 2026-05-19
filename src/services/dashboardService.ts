import { requireSupabase, successResponse } from "./supabaseHelpers";
import { PRODUCT_CATEGORY_LABEL, type ProductCategory } from "@/types/product";
import type { DashboardSummary } from "@/types/dashboard";
import type { OrderStatus } from "@/types/order";

type OrderRow = {
  id: number;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
};

type ProductRow = {
  id: number;
  name: string;
  category: ProductCategory;
  stock: number;
  low_stock_threshold: number;
};

type OrderItemRow = {
  product_id: number | null;
  product_name: string;
  price: number;
  count: number;
};

type ChannelRow = {
  name: string;
  value: number;
  color: string;
};

const sameDay = (date: Date, target: Date) => date.toDateString() === target.toDateString();

export const getDashboardSummary = async () => {
  const client = requireSupabase();
  const [ordersRes, productsRes, orderItemsRes, channelsRes] = await Promise.all([
    client.from("orders").select("id,total_amount,status,created_at"),
    client
      .from("products")
      .select("id,name,category,stock,low_stock_threshold")
      .eq("is_active", true),
    client.from("order_items").select("product_id,product_name,price,count"),
    client
      .from("sales_channels")
      .select("name,value,color")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  if (ordersRes.error) throw ordersRes.error;
  if (productsRes.error) throw productsRes.error;
  if (orderItemsRes.error) throw orderItemsRes.error;
  if (channelsRes.error) throw channelsRes.error;

  const orders = (ordersRes.data ?? []) as OrderRow[];
  const products = (productsRes.data ?? []) as ProductRow[];
  const orderItems = (orderItemsRes.data ?? []) as OrderItemRow[];
  const channels = (channelsRes.data ?? []) as ChannelRow[];
  const today = new Date();
  const todayOrders = orders.filter((order) => sameDay(new Date(order.created_at), today));
  const paidOrders = orders.filter((order) =>
    ["paid", "shipped", "completed"].includes(order.status)
  );
  const pendingOrders = orders.filter((order) => order.status === "pending");
  const lowStockProducts = products.filter(
    (product) => product.stock <= product.low_stock_threshold
  );

  const trend7d = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date();
    date.setDate(today.getDate() - (6 - index));
    const dateOrders = orders.filter((order) => sameDay(new Date(order.created_at), date));

    return {
      date: `${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate()
      ).padStart(2, "0")}`,
      orderCount: dateOrders.length,
      revenue: Math.round(
        dateOrders.reduce((total, order) => total + order.total_amount, 0) / 100
      ),
    };
  });

  const salesMap = new Map<
    number,
    { id: number; name: string; sold: number; revenue: number }
  >();
  orderItems.forEach((item) => {
    if (!item.product_id) return;
    const current = salesMap.get(item.product_id) ?? {
      id: item.product_id,
      name: item.product_name,
      sold: 0,
      revenue: 0,
    };
    current.sold += item.count;
    current.revenue += item.price * item.count;
    salesMap.set(item.product_id, current);
  });

  const topProducts = Array.from(salesMap.values())
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 4)
    .map((item) => {
      const product = products.find((entry) => entry.id === item.id);

      return {
        id: item.id,
        name: item.name,
        category: product ? PRODUCT_CATEGORY_LABEL[product.category] : "未分类",
        sold: item.sold,
        revenue: Math.round(item.revenue / 100),
        stock: product?.stock ?? 0,
      };
    });

  const summary: DashboardSummary = {
    cards: {
      todayOrders: {
        label: "今日订单",
        value: todayOrders.length,
        unit: "单",
        change: 0,
        trend: "up",
        path: "/orders",
        query: { date: "today" },
      },
      pendingOrders: {
        label: "待处理订单",
        value: pendingOrders.length,
        unit: "单",
        change: 0,
        trend: "down",
        path: "/orders",
        query: { status: "pending" },
      },
      todayRevenue: {
        label: "今日销售额",
        value: Math.round(
          todayOrders.reduce((total, order) => total + order.total_amount, 0) / 100
        ),
        unit: "元",
        change: 0,
        trend: "up",
        path: "/finance",
      },
      conversionRate: {
        label: "付款转化率",
        value:
          orders.length === 0
            ? 0
            : Number(((paidOrders.length / orders.length) * 100).toFixed(1)),
        unit: "%",
        change: 0,
        trend: "up",
        path: "/orders",
        query: { status: "paid" },
      },
    },
    trend7d,
    topProducts,
    channels,
    tasks: [
      {
        id: 1,
        title: "待付款订单需要跟进",
        count: pendingOrders.length,
        type: "warning",
        path: "/orders",
        query: { status: "pending" },
      },
      {
        id: 2,
        title: "低库存商品需要补货",
        count: lowStockProducts.length,
        type: "danger",
        path: "/inventory",
      },
      {
        id: 3,
        title: "售后申请等待处理",
        count: orders.filter((order) => order.status === "completed").length,
        type: "info",
        path: "/orders",
        query: { status: "completed" },
      },
      {
        id: 4,
        title: "今日已完成发货",
        count: orders.filter(
          (order) => order.status === "shipped" && sameDay(new Date(order.created_at), today)
        ).length,
        type: "success",
        path: "/orders",
        query: { status: "shipped", date: "today" },
      },
    ],
  };

  return successResponse<DashboardSummary>(summary);
};
