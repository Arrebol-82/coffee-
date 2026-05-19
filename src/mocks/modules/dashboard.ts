import { http, HttpResponse, delay } from "msw";
import type { DashboardSummary } from "@/types/dashboard";
import { allOrders } from "./order";
import { dbProducts } from "./product";
import { PRODUCT_CATEGORY_LABEL } from "@/types/product";

const oneDay = 86400000;

const buildDashboardSummary = (): DashboardSummary => {
  const today = new Date().toDateString();
  const todayOrders = allOrders.filter(
    (order) => new Date(order.createTime).toDateString() === today
  );
  const paidOrders = allOrders.filter((order) =>
    ["paid", "shipped", "completed"].includes(order.status)
  );
  const pendingOrders = allOrders.filter((order) => order.status === "pending");
  const lowStockProducts = dbProducts.filter(
    (product) => product.stock <= product.lowStockThreshold
  );

  const trend7d = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(Date.now() - (6 - index) * oneDay);
    const dateText = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;
    const orders = allOrders.filter(
      (order) => new Date(order.createTime).toDateString() === date.toDateString()
    );

    return {
      date: dateText,
      orderCount: orders.length,
      revenue: orders.reduce((total, order) => total + order.totalAmount, 0),
    };
  });

  return {
    cards: {
      todayOrders: {
        label: "今日订单",
        value: todayOrders.length,
        unit: "单",
        change: 12.8,
        trend: "up",
        path: "/orders",
        query: { date: "today" },
      },
      pendingOrders: {
        label: "待处理订单",
        value: pendingOrders.length,
        unit: "单",
        change: 6.4,
        trend: "down",
        path: "/orders",
        query: { status: "pending" },
      },
      todayRevenue: {
        label: "今日销售额",
        value: todayOrders.reduce((total, order) => total + order.totalAmount, 0) / 100,
        unit: "元",
        change: 18.2,
        trend: "up",
        path: "/finance",
      },
      conversionRate: {
        label: "付款转化率",
        value: Number(((paidOrders.length / allOrders.length) * 100).toFixed(1)),
        unit: "%",
        change: 3.1,
        trend: "up",
        path: "/orders",
        query: { status: "paid" },
      },
    },
    trend7d: trend7d.map((item) => ({
      ...item,
      revenue: Math.round(item.revenue / 100),
    })),
    topProducts: dbProducts.slice(0, 4).map((product, index) => ({
      id: product.id,
      name: product.name,
      category: PRODUCT_CATEGORY_LABEL[product.category],
      sold: 320 - index * 43,
      revenue: Math.round((product.price * (320 - index * 43)) / 100),
      stock: product.stock,
    })),
    channels: [
      { name: "小程序", value: 42, color: "#409eff" },
      { name: "门店扫码", value: 31, color: "#67c23a" },
      { name: "外卖平台", value: 19, color: "#e6a23c" },
      { name: "社群团购", value: 8, color: "#f56c6c" },
    ],
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
        count: 3,
        type: "info",
        path: "/orders",
        query: { status: "completed" },
      },
      {
        id: 4,
        title: "今日已完成发货",
        count: allOrders.filter((order) => order.status === "shipped").length,
        type: "success",
        path: "/orders",
        query: { status: "shipped", date: "today" },
      },
    ],
  };
};

export const dashboardHandlers = [
  http.get("/api/dashboard/summary", async () => {
    await delay(300);

    return HttpResponse.json({
      code: 200,
      message: "success",
      data: buildDashboardSummary(),
    });
  }),
];
