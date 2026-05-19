import { http, HttpResponse, delay } from "msw";
import type {
  InventoryLog,
  InventoryLogType,
  InventoryPurchaseDTO,
  Product,
  ProductCategory,
  ProductCreateDTO,
} from "@/types/product";

const categoryList: ProductCategory[] = [
  "beans",
  "espresso",
  "drip_bag",
  "instant",
  "gear",
];

const names = [
  "埃塞俄比亚耶加雪菲",
  "哥伦比亚花月夜",
  "危地马拉安提瓜",
  "巴拿马瑰夏",
  "巴西皇后庄园",
  "云南普洱日晒",
  "冷萃咖啡液礼盒",
  "精品挂耳组合",
  "意式拼配黑巧",
  "手冲滤杯套装",
];

export let dbProducts: Product[] = Array.from({ length: 28 }).map((_, index) => {
  const category = categoryList[index % categoryList.length]!;
  const stock = index % 7 === 0 ? 5 + index : 18 + index;

  return {
    id: index + 1,
    name: `${names[index % names.length]} ${index + 1}`,
    price: 2800 + index * 180,
    status: index % 5 === 0 ? "sold_out" : "on_sale",
    stock,
    category,
    origin: ["埃塞俄比亚", "哥伦比亚", "危地马拉", "中国云南", "巴西"][
      index % 5
    ]!,
    roastLevel: index % 3 === 0 ? "light" : index % 3 === 1 ? "medium" : "dark",
    description: "风味干净，适合日常出杯和门店陈列。",
    recommended: index % 4 === 0,
    lowStockThreshold: 12,
    createTime: new Date(Date.now() - index * 86400000).toLocaleString(),
  };
});

export let inventoryLogs: InventoryLog[] = [];

export const recordInventoryLog = (params: {
  productId: number;
  productName: string;
  type: InventoryLogType;
  change: number;
  beforeStock: number;
  afterStock: number;
  reason: string;
  operator?: string;
}) => {
  inventoryLogs.unshift({
    id: Date.now() + Math.floor(Math.random() * 1000),
    operator: "Admin",
    createTime: new Date().toLocaleString(),
    ...params,
  });
};

export const productHandlers = [
  http.get("/api/products", async ({ request }) => {
    await delay(500);

    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const pageSize = Number(url.searchParams.get("pageSize")) || 10;
    const keyword = url.searchParams.get("keyword") || "";
    const status = url.searchParams.get("status") || "";
    const category = url.searchParams.get("category") || "";

    let filteredList = dbProducts;

    if (keyword) {
      filteredList = filteredList.filter((item) =>
        [item.name, item.origin, item.description].some((text) =>
          text.includes(keyword)
        )
      );
    }

    if (status) {
      filteredList = filteredList.filter((item) => item.status === status);
    }

    if (category) {
      filteredList = filteredList.filter((item) => item.category === category);
    }

    const start = (page - 1) * pageSize;
    const pageList = filteredList.slice(start, start + pageSize);

    return HttpResponse.json({
      code: 200,
      message: "success",
      data: {
        list: pageList,
        total: filteredList.length,
      },
    });
  }),

  http.post("/api/products", async ({ request }) => {
    await delay(300);
    const newProduct = (await request.json()) as ProductCreateDTO;
    const nextId =
      dbProducts.length > 0
        ? Math.max(...dbProducts.map((product) => product.id)) + 1
        : 1;

    const productObj: Product = {
      id: nextId,
      createTime: new Date().toLocaleString(),
      ...newProduct,
    };

    dbProducts.unshift(productObj);
    recordInventoryLog({
      productId: productObj.id,
      productName: productObj.name,
      type: "in",
      change: productObj.stock,
      beforeStock: 0,
      afterStock: productObj.stock,
      reason: "新增商品初始入库",
    });

    return HttpResponse.json({
      code: 200,
      message: "创建成功",
      data: null,
    });
  }),

  http.put("/api/products/:id", async ({ params, request }) => {
    await delay(300);
    const id = Number(params.id);
    const updateData = (await request.json()) as Partial<ProductCreateDTO>;
    const index = dbProducts.findIndex((product) => product.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { code: 404, message: "商品不存在", data: null },
        { status: 404 }
      );
    }

    const beforeProduct = dbProducts[index]!;
    dbProducts[index] = { ...beforeProduct, ...updateData };

    if (
      typeof updateData.stock === "number" &&
      updateData.stock !== beforeProduct.stock
    ) {
      recordInventoryLog({
        productId: dbProducts[index]!.id,
        productName: dbProducts[index]!.name,
        type: "adjust",
        change: updateData.stock - beforeProduct.stock,
        beforeStock: beforeProduct.stock,
        afterStock: updateData.stock,
        reason: "商品管理手动调整库存",
      });
    }

    return HttpResponse.json({
      code: 200,
      message: "更新成功",
      data: dbProducts[index],
    });
  }),

  http.delete("/api/products/:id", async ({ params }) => {
    await delay(300);
    const id = Number(params.id);
    dbProducts = dbProducts.filter((product) => product.id !== id);

    return HttpResponse.json({
      code: 200,
      message: "删除成功",
      data: null,
    });
  }),

  http.get("/api/inventory/logs", async () => {
    await delay(200);

    return HttpResponse.json({
      code: 200,
      message: "success",
      data: inventoryLogs.slice(0, 50),
    });
  }),

  http.post("/api/inventory/purchase", async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as InventoryPurchaseDTO;
    const product = dbProducts.find((product) => product.id === body.productId);

    if (!product) {
      return HttpResponse.json(
        { code: 404, message: "商品不存在", data: null },
        { status: 404 }
      );
    }

    if (!Number.isFinite(body.count) || body.count <= 0) {
      return HttpResponse.json({
        code: 400,
        message: "购入数量必须大于 0",
        data: null,
      });
    }

    const beforeStock = product.stock;
    product.stock += body.count;
    recordInventoryLog({
      productId: product.id,
      productName: product.name,
      type: "in",
      change: body.count,
      beforeStock,
      afterStock: product.stock,
      reason: body.remark?.trim() || "购入商品入库",
    });

    return HttpResponse.json({
      code: 200,
      message: "入库成功",
      data: product,
    });
  }),
];
