import { http, HttpResponse, delay } from "msw";
import { dbProducts, recordInventoryLog } from "./product";
import type { OrderCreateDTO, OrderDetail, OrderStatus } from "@/types/order";

// localStorage key
const ORDERS_STORAGE_KEY = "coffeesys_orders";
// BroadcastChannel 用于跨页面通信
const orderChannel = typeof BroadcastChannel !== "undefined"
  ? new BroadcastChannel("order-updates")
  : null;

// 从localStorage加载订单数据
const loadOrdersFromStorage = (): OrderDetail[] => {
  try {
    const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (saved) {
      console.log("[Mock API] 从localStorage加载订单数据");
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("[Mock API] 读取localStorage失败:", e);
  }

  // 如果没有保存的数据，生成初始数据
  console.log("[Mock API] 生成初始订单数据");
  return Array.from({ length: 55 }).map(
    (_, index): OrderDetail => {
      const statusList: OrderStatus[] = [
        "pending",
        "paid",
        "shipped",
        "completed",
        "cancelled",
      ];
      const createdAt = new Date(Date.now() - index * 86400000);

      return {
        id: index + 1,
        order: `ORDER${20260000 + index}`,
        customer: {
          name: `客户${index + 1}`,
          phone: `1380000${String(index + 1).padStart(4, "0")}`,
          address: "门店自提",
          remark: "",
        },
        totalAmount: Math.floor(Math.random() * 100000) + 3000,
        status: statusList[index % statusList.length]!,
        createTime: createdAt.toLocaleString(),
        items: [
          {
            id: index + 1,
            name: `埃塞俄比亚耶加雪菲 ${index + 1}`,
            price: 6800 + index * 100,
            count: 1,
          },
          {
            id: index + 100,
            name: `精品挂耳组合 ${index + 1}`,
            price: 3900,
            count: 2,
          },
        ],
        logs: [
          {
            id: index + 1,
            action: "创建订单",
            operator: "系统",
            createTime: createdAt.toLocaleString(),
          },
        ],
      };
    }
  );
};

// 保存订单到localStorage
const saveOrdersToStorage = (orders: OrderDetail[]) => {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    console.log("[Mock API] 订单数据已保存到localStorage");
    // 发送广播通知其他页面
    if (orderChannel) {
      orderChannel.postMessage({ type: "ORDER_UPDATED" });
      console.log("[Mock API] 已发送订单更新广播");
    }
  } catch (e) {
    console.error("[Mock API] 保存到localStorage失败:", e);
  }
};

// 初始化订单数据
export let allOrders: OrderDetail[] = loadOrdersFromStorage();
console.log("[Mock API] 初始化完成，当前订单数:", allOrders.length);

export const orderHandlers = [
  http.get("/api/orders", async ({ request }) => {
    console.log("[Mock API] 收到获取订单列表请求");
    await delay(500);

    // 每次查询都从 localStorage 重新加载最新数据
    const freshOrders = loadOrdersFromStorage();
    allOrders = freshOrders;

    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const pageSize = Number(url.searchParams.get("pageSize")) || 10;
    const keyword = url.searchParams.get("keyword") || "";
    const status = url.searchParams.get("status") || "";
    const date = url.searchParams.get("date") || "";
    const startDate = url.searchParams.get("startDate") || "";
    const endDate = url.searchParams.get("endDate") || "";

    console.log("[Mock API] 查询参数:", { page, pageSize, keyword, status });
    console.log("[Mock API] 当前订单总数:", allOrders.length);

    let resultList = allOrders;

    if (keyword) {
      resultList = resultList.filter((item) =>
        [item.order, item.customer.name, item.customer.phone].some((text) =>
          String(text || "").includes(keyword)
        )
      );
    }

    if (status) {
      resultList = resultList.filter((item) => item.status === status);
    }

    if (date === "today") {
      const today = new Date().toDateString();
      resultList = resultList.filter(
        (item) => new Date(item.createTime).toDateString() === today
      );
    }

    if (startDate) {
      const startTime = new Date(`${startDate} 00:00:00`).getTime();
      resultList = resultList.filter(
        (item) => new Date(item.createTime).getTime() >= startTime
      );
    }

    if (endDate) {
      const endTime = new Date(`${endDate} 23:59:59`).getTime();
      resultList = resultList.filter(
        (item) => new Date(item.createTime).getTime() <= endTime
      );
    }

    const start = (page - 1) * pageSize;
    const pageList = resultList.slice(start, start + pageSize);

    console.log("[Mock API] 返回订单数:", pageList.length);

    return HttpResponse.json({
      code: 200,
      message: "success",
      data: {
        list: pageList,
        total: resultList.length,
      },
    });
  }),

  http.get("/api/orders/:id", async ({ params }) => {
    await delay(200);
    const id = Number(params.id);
    const order = allOrders.find((item) => item.id === id);

    if (!order) {
      return HttpResponse.json({
        code: 404,
        message: "订单不存在",
        data: null,
      });
    }

    return HttpResponse.json({
      code: 200,
      message: "success",
      data: order,
    });
  }),

  http.post("/api/orders", async ({ request }) => {
    console.log("[Mock API] 收到创建订单请求");
    await delay(300);

    const body = (await request.json()) as OrderCreateDTO;
    console.log("[Mock API] 请求体:", body);

    const draftItems = body.items
      .map((item) => ({
        ...item,
        product: dbProducts.find((product) => product.id === item.productId),
      }))
      .filter((item) => item.product && item.count > 0);

    if (draftItems.length === 0) {
      return HttpResponse.json({
        code: 400,
        message: "请选择订单商品",
        data: null,
      });
    }

    const insufficientItem = draftItems.find(
      (item) => item.product!.stock < item.count
    );

    if (insufficientItem) {
      return HttpResponse.json({
        code: 400,
        message: `${insufficientItem.product!.name} 库存不足`,
        data: null,
      });
    }

    const items = draftItems.map((item) => {
      const product = item.product!;

      return {
        id: product.id,
        name: product.name,
        price: product.price,
        count: item.count,
      };
    });

    const nextId =
      allOrders.length > 0 ? Math.max(...allOrders.map((order) => order.id)) + 1 : 1;
    const createdAt = new Date().toLocaleString();
    const orderNo = `ORDER${Date.now()}`;
    const order: OrderDetail = {
      id: nextId,
      order: orderNo,
      customer: body.customer,
      totalAmount: items.reduce((total, item) => total + item.price * item.count, 0),
      status: body.status ?? "pending",
      createTime: createdAt,
      items,
      logs: [
        {
          id: Date.now(),
          action: "创建订单",
          operator: "Admin",
          createTime: createdAt,
        },
      ],
    };

    draftItems.forEach((item) => {
      const product = item.product!;
      const beforeStock = product.stock;
      product.stock -= item.count;
      recordInventoryLog({
        productId: product.id,
        productName: product.name,
        type: "out",
        change: -item.count,
        beforeStock,
        afterStock: product.stock,
        reason: `创建订单 ${orderNo}`,
      });
    });

    allOrders.unshift(order);
    saveOrdersToStorage(allOrders);
    console.log("[Mock API] 订单创建成功，当前订单数:", allOrders.length);
    console.log("[Mock API] 最新订单:", order);

    return HttpResponse.json({
      code: 200,
      message: "创建成功",
      data: order,
    });
  }),

  http.post("/api/orders/:id/status", async ({ params, request }) => {
    await delay(300);
    const id = Number(params.id);
    const body = (await request.json()) as { status: OrderStatus };
    const order = allOrders.find((item) => item.id === id);

    if (!order) {
      return HttpResponse.json({
        code: 404,
        message: "订单不存在",
        data: null,
      });
    }

    const oldStatus = order.status;
    order.status = body.status;

    if (
      body.status === "cancelled" &&
      !["cancelled", "completed"].includes(oldStatus)
    ) {
      order.items.forEach((item) => {
        const product = dbProducts.find((product) => product.id === item.id);
        if (!product) return;

        const beforeStock = product.stock;
        product.stock += item.count;
        recordInventoryLog({
          productId: product.id,
          productName: product.name,
          type: "restore",
          change: item.count,
          beforeStock,
          afterStock: product.stock,
          reason: `取消订单 ${order.order}`,
        });
      });
    }

    order.logs.push({
      id: Date.now(),
      action: `状态更新：${oldStatus} -> ${body.status}`,
      operator: "Admin",
      createTime: new Date().toLocaleString(),
    });

    saveOrdersToStorage(allOrders);

    return HttpResponse.json({
      code: 200,
      message: "状态更新成功",
      data: null,
    });
  }),
];
