export interface TrendPoint {
  date: string;
  orderCount: number;
  revenue: number;
}

export interface DashboardCard {
  label: string;
  value: number;
  unit?: string;
  change: number;
  trend: "up" | "down";
  path?: string;
  query?: Record<string, string>;
}

export interface TopProduct {
  id: number;
  name: string;
  category: string;
  sold: number;
  revenue: number;
  stock: number;
}

export interface ChannelMetric {
  name: string;
  value: number;
  color: string;
}

export interface DashboardTask {
  id: number;
  title: string;
  count: number;
  type: "warning" | "danger" | "info" | "success";
  path: string;
  query?: Record<string, string>;
}

export interface DashboardSummary {
  cards: {
    todayOrders: DashboardCard;
    pendingOrders: DashboardCard;
    todayRevenue: DashboardCard;
    conversionRate: DashboardCard;
  };
  trend7d: TrendPoint[];
  topProducts: TopProduct[];
  channels: ChannelMetric[];
  tasks: DashboardTask[];
}
