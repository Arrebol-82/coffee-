export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "completed"
  | "cancelled";

export interface Order {
  id: number;
  order?: string;
  order_no?: string;
  customer: OrderCustomer;
  totalAmount: number;
  status: OrderStatus;
  createTime: string;
}

export interface OrderQuery {
  page: number;
  pageSize: number;
  status?: OrderStatus | "";
  keyword?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
}

export interface OrderCustomer {
  name: string;
  phone: string;
  address: string;
  remark?: string;
}

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  count: number;
}

export interface OrderCreateItem {
  productId: number;
  count: number;
}

export interface OrderCreateDTO {
  customer: OrderCustomer;
  items: OrderCreateItem[];
  status?: OrderStatus;
}

export type OrderUpdateDTO = OrderCreateDTO;

export interface OrderLog {
  id: number;
  action: string;
  operator: string;
  createTime: string;
}

export interface OrderDetail extends Order {
  items: OrderItem[];
  logs: OrderLog[];
}