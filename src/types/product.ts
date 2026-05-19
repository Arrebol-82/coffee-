export type ProductStatus = "on_sale" | "sold_out";

export type ProductCategory = "beans" | "espresso" | "drip_bag" | "instant" | "gear";

export type RoastLevel = "light" | "medium" | "dark";

export interface Product {
  id: number;
  name: string;
  price: number;
  status: ProductStatus;
  stock: number;
  category: ProductCategory;
  origin: string;
  roastLevel: RoastLevel;
  description: string;
  recommended: boolean;
  lowStockThreshold: number;
  createTime: string;
}

export type InventoryLogType = "in" | "out" | "adjust" | "restore";

export interface InventoryLog {
  id: number;
  productId: number;
  productName: string;
  type: InventoryLogType;
  change: number;
  beforeStock: number;
  afterStock: number;
  reason: string;
  operator: string;
  createTime: string;
}

export interface InventoryPurchaseDTO {
  productId: number;
  count: number;
  remark?: string;
}

export interface ProductQuery {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: ProductStatus | "";
  category?: ProductCategory | "";
}

export interface PageResult<T> {
  list: T[];
  total: number;
}

export type ProductCreateDTO = Omit<Product, "id" | "createTime">;

export type ProductUpdateDTO = Partial<ProductCreateDTO>;

export const PRODUCT_CATEGORY_LABEL: Record<ProductCategory, string> = {
  beans: "手冲豆",
  espresso: "意式豆",
  drip_bag: "挂耳咖啡",
  instant: "即饮咖啡",
  gear: "咖啡器具",
};

export const ROAST_LEVEL_LABEL: Record<RoastLevel, string> = {
  light: "浅烘",
  medium: "中烘",
  dark: "深烘",
};
