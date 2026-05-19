<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  DataAnalysis,
  Download,
  Money,
  Refresh,
  Tickets,
  TrendCharts,
  Wallet,
} from "@element-plus/icons-vue";
import { getOrderList } from "@/api/orders";
import type { Order, OrderStatus } from "@/types/order";

type RevenueDay = {
  label: string;
  revenue: number;
  orders: number;
};

type ChannelItem = {
  name: string;
  value: number;
  color: string;
};

const loading = ref(false);
const orders = ref<Order[]>([]);
const range = ref("30");

const revenueStatuses: OrderStatus[] = ["paid", "shipped", "completed"];

const statusText: Record<OrderStatus, string> = {
  pending: "待支付",
  paid: "已支付",
  shipped: "配送中",
  completed: "已完成",
  cancelled: "已取消",
};

const statusTagType: Record<OrderStatus, "warning" | "primary" | "success" | "info" | "danger"> = {
  pending: "warning",
  paid: "primary",
  shipped: "success",
  completed: "success",
  cancelled: "info",
};

const channelItems: ChannelItem[] = [
  { name: "门店收银", value: 42, color: "#9a6a3a" },
  { name: "小程序", value: 31, color: "#4f7f72" },
  { name: "外卖平台", value: 18, color: "#c18653" },
  { name: "企业团购", value: 9, color: "#6f5b8f" },
];

const financeOrders = computed(() => {
  const days = Number(range.value);
  const startTime = Date.now() - days * 24 * 60 * 60 * 1000;

  return orders.value.filter((order) => {
    const time = new Date(order.createTime).getTime();
    if (Number.isNaN(time)) return true;
    return time >= startTime;
  });
});

const revenueOrders = computed(() => {
  return financeOrders.value.filter((order) => revenueStatuses.includes(order.status));
});

const cancelledOrders = computed(() => {
  return financeOrders.value.filter((order) => order.status === "cancelled");
});

const totalRevenue = computed(() => {
  return revenueOrders.value.reduce((total, order) => total + order.totalAmount, 0);
});

const estimatedCost = computed(() => Math.round(totalRevenue.value * 0.38));
const grossProfit = computed(() => totalRevenue.value - estimatedCost.value);

const averageOrderValue = computed(() => {
  if (revenueOrders.value.length === 0) return 0;
  return Math.round(totalRevenue.value / revenueOrders.value.length);
});

const refundAmount = computed(() => {
  return cancelledOrders.value.reduce((total, order) => total + order.totalAmount, 0);
});

const refundRate = computed(() => {
  if (financeOrders.value.length === 0) return 0;
  return Math.round((cancelledOrders.value.length / financeOrders.value.length) * 1000) / 10;
});

const revenueTrend = computed<RevenueDay[]>(() => {
  const days = Math.min(Number(range.value), 14);
  const now = new Date();
  const buckets = Array.from({ length: days }).map((_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (days - index - 1));
    const key = date.toISOString().slice(0, 10);

    return {
      key,
      label: `${date.getMonth() + 1}/${date.getDate()}`,
      revenue: 0,
      orders: 0,
    };
  });

  revenueOrders.value.forEach((order) => {
    const time = new Date(order.createTime);
    if (Number.isNaN(time.getTime())) return;

    const key = time.toISOString().slice(0, 10);
    const bucket = buckets.find((item) => item.key === key);
    if (!bucket) return;

    bucket.revenue += order.totalAmount;
    bucket.orders += 1;
  });

  return buckets.map(({ key, ...item }) => item);
});

const maxTrendRevenue = computed(() => {
  return Math.max(...revenueTrend.value.map((item) => item.revenue), 1);
});

const maxTrendOrders = computed(() => {
  return Math.max(...revenueTrend.value.map((item) => item.orders), 1);
});

const statusStats = computed(() => {
  const total = Math.max(financeOrders.value.length, 1);
  return (Object.keys(statusText) as OrderStatus[]).map((status) => {
    const count = financeOrders.value.filter((order) => order.status === status).length;
    return {
      status,
      label: statusText[status],
      count,
      percent: Math.round((count / total) * 100),
    };
  });
});

const recentOrders = computed(() => {
  return [...financeOrders.value].slice(0, 8);
});

const formatMoney = (value: number) => {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(value / 100);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("zh-CN").format(value);
};

const loadFinanceData = async () => {
  loading.value = true;
  try {
    const res = await getOrderList({
      page: 1,
      pageSize: 200,
      keyword: "",
      status: "",
    });
    orders.value = res.data.list;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadFinanceData();
});
</script>

<template>
  <div class="finance-page" v-loading="loading">
    <section class="finance-toolbar">
      <div>
        <p class="eyebrow">Finance Center</p>
        <h1>财务统计</h1>
        <p>汇总销售收入、退款风险、毛利估算和订单资金流向。</p>
      </div>

      <div class="toolbar-actions">
        <el-segmented
          v-model="range"
          :options="[
            { label: '近 7 天', value: '7' },
            { label: '近 30 天', value: '30' },
            { label: '近 60 天', value: '60' },
          ]"
        />
        <el-button :icon="Refresh" @click="loadFinanceData">刷新</el-button>
      </div>
    </section>

    <section class="finance-summary">
      <article class="summary-card is-primary">
        <div class="card-icon">
          <el-icon><Money /></el-icon>
        </div>
        <span>销售收入</span>
        <strong>{{ formatMoney(totalRevenue) }}</strong>
        <small>已支付 / 配送中 / 已完成订单</small>
      </article>

      <article class="summary-card">
        <div class="card-icon">
          <el-icon><Wallet /></el-icon>
        </div>
        <span>毛利估算</span>
        <strong>{{ formatMoney(grossProfit) }}</strong>
        <small>按 62% 毛利率估算</small>
      </article>

      <article class="summary-card">
        <div class="card-icon">
          <el-icon><Tickets /></el-icon>
        </div>
        <span>客单价</span>
        <strong>{{ formatMoney(averageOrderValue) }}</strong>
        <small>{{ formatNumber(revenueOrders.length) }} 笔有效订单</small>
      </article>

      <article class="summary-card">
        <div class="card-icon">
          <el-icon><DataAnalysis /></el-icon>
        </div>
        <span>退款风险</span>
        <strong>{{ refundRate }}%</strong>
        <small>取消金额 {{ formatMoney(refundAmount) }}</small>
      </article>
    </section>

    <section class="finance-grid">
      <el-card shadow="never" class="panel trend-panel">
        <template #header>
          <div class="panel-header">
            <div>
              <h2>收入趋势</h2>
              <span>最多展示最近 14 天资金表现</span>
            </div>
            <el-icon><TrendCharts /></el-icon>
          </div>
        </template>

        <div class="trend-chart">
          <div v-for="item in revenueTrend" :key="item.label" class="trend-item">
            <div class="bar-stage">
              <span
                class="revenue-bar"
                :style="{ height: `${Math.max((item.revenue / maxTrendRevenue) * 100, 4)}%` }"
              />
              <span
                class="order-line"
                :style="{ height: `${Math.max((item.orders / maxTrendOrders) * 100, 6)}%` }"
              />
            </div>
            <strong>{{ formatMoney(item.revenue) }}</strong>
            <span>{{ item.label }}</span>
          </div>
        </div>

        <div class="chart-legend">
          <span><i class="legend-dot revenue" />收入</span>
          <span><i class="legend-dot orders" />订单量</span>
        </div>
      </el-card>

      <el-card shadow="never" class="panel">
        <template #header>
          <div class="panel-header">
            <div>
              <h2>资金来源</h2>
              <span>按渠道估算占比</span>
            </div>
          </div>
        </template>

        <div class="channel-list">
          <div v-for="channel in channelItems" :key="channel.name" class="channel-item">
            <div class="channel-title">
              <span><i :style="{ background: channel.color }" />{{ channel.name }}</span>
              <strong>{{ channel.value }}%</strong>
            </div>
            <el-progress
              :percentage="channel.value"
              :color="channel.color"
              :stroke-width="10"
              :show-text="false"
            />
          </div>
        </div>
      </el-card>
    </section>

    <section class="finance-grid bottom">
      <el-card shadow="never" class="panel">
        <template #header>
          <div class="panel-header">
            <div>
              <h2>订单状态分布</h2>
              <span>辅助判断回款进度</span>
            </div>
          </div>
        </template>

        <div class="status-list">
          <div v-for="item in statusStats" :key="item.status" class="status-item">
            <div>
              <el-tag :type="statusTagType[item.status]" effect="plain">
                {{ item.label }}
              </el-tag>
              <strong>{{ item.count }} 单</strong>
            </div>
            <el-progress :percentage="item.percent" :stroke-width="9" />
          </div>
        </div>
      </el-card>

      <el-card shadow="never" class="panel recent-panel">
        <template #header>
          <div class="panel-header">
            <div>
              <h2>最近资金流水</h2>
              <span>展示最新订单金额和状态</span>
            </div>
            <el-button text :icon="Download">导出</el-button>
          </div>
        </template>

        <el-table :data="recentOrders" style="width: 100%">
          <el-table-column prop="order" label="订单号" min-width="150" />
          <el-table-column label="金额" width="130">
            <template #default="{ row }">
              <strong>{{ formatMoney(row.totalAmount) }}</strong>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="110">
            <template #default="{ row }">
              <el-tag :type="statusTagType[row.status as OrderStatus]" effect="light">
                {{ statusText[row.status as OrderStatus] }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" min-width="180" />
        </el-table>
      </el-card>
    </section>
  </div>
</template>

<style scoped>
.finance-page {
  min-height: calc(100vh - 100px);
  padding: 24px 24px 36px;
  color: #2a211b;
}

.finance-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 20px;
}

.eyebrow {
  margin: 0 0 6px;
  color: #8a5d35;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.finance-toolbar h1,
.panel-header h2 {
  margin: 0;
  color: #21160f;
}

.finance-toolbar h1 {
  font-size: 28px;
}

.finance-toolbar p,
.summary-card span,
.summary-card small,
.panel-header span,
.trend-item span,
.chart-legend {
  color: #75675d;
}

.finance-toolbar p {
  margin: 8px 0 0;
  font-size: 14px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.finance-summary,
.finance-grid {
  display: grid;
  gap: 18px;
}

.finance-summary {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 18px;
}

.summary-card,
.panel {
  border: 1px solid rgba(128, 88, 54, 0.12);
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(14px);
  box-shadow: 0 16px 38px rgba(88, 58, 35, 0.08);
}

.summary-card {
  display: grid;
  gap: 9px;
  min-height: 146px;
  padding: 20px;
  border-radius: 8px;
}

.summary-card.is-primary {
  color: #fff;
  border-color: transparent;
  background: linear-gradient(135deg, #6d4028 0%, #a76f3d 100%);
}

.summary-card.is-primary span,
.summary-card.is-primary small,
.summary-card.is-primary strong {
  color: #fff;
}

.card-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  color: #7a4b2f;
  background: rgba(137, 88, 49, 0.12);
  border-radius: 8px;
}

.is-primary .card-icon {
  color: #fff;
  background: rgba(255, 255, 255, 0.16);
}

.summary-card strong {
  color: #21160f;
  font-size: 27px;
  line-height: 1.1;
}

.finance-grid {
  grid-template-columns: minmax(0, 1.6fr) minmax(320px, 0.8fr);
  margin-bottom: 18px;
}

.finance-grid.bottom {
  grid-template-columns: minmax(320px, 0.8fr) minmax(0, 1.5fr);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.panel-header h2 {
  margin-bottom: 4px;
  font-size: 17px;
}

.trend-chart {
  display: grid;
  grid-template-columns: repeat(14, minmax(42px, 1fr));
  gap: 10px;
  min-height: 286px;
  align-items: end;
}

.trend-item {
  display: grid;
  gap: 7px;
  min-width: 0;
  justify-items: center;
}

.bar-stage {
  display: flex;
  align-items: end;
  justify-content: center;
  gap: 5px;
  width: 100%;
  height: 190px;
  padding: 10px 6px;
  border-radius: 8px;
  background: rgba(248, 244, 239, 0.88);
}

.revenue-bar,
.order-line {
  display: block;
  min-height: 6px;
  border-radius: 999px 999px 4px 4px;
}

.revenue-bar {
  width: 14px;
  background: linear-gradient(180deg, #c98d54, #76472b);
}

.order-line {
  width: 8px;
  background: #4f7f72;
}

.trend-item strong {
  color: #4b3425;
  font-size: 12px;
}

.trend-item span {
  font-size: 12px;
}

.chart-legend {
  display: flex;
  justify-content: flex-end;
  gap: 18px;
  margin-top: 14px;
  font-size: 13px;
}

.legend-dot,
.channel-title i {
  display: inline-block;
  width: 9px;
  height: 9px;
  margin-right: 6px;
  border-radius: 50%;
}

.legend-dot.revenue {
  background: #9a6a3a;
}

.legend-dot.orders {
  background: #4f7f72;
}

.channel-list,
.status-list {
  display: grid;
  gap: 16px;
}

.channel-item,
.status-item {
  display: grid;
  gap: 8px;
}

.channel-title,
.status-item > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.channel-title span {
  display: inline-flex;
  align-items: center;
}

.status-item strong {
  color: #3f2b20;
}

.recent-panel :deep(.el-table) {
  background: transparent;
}

@media (max-width: 1180px) {
  .finance-summary,
  .finance-grid,
  .finance-grid.bottom {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 780px) {
  .finance-page {
    padding: 16px;
  }

  .finance-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .toolbar-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .finance-summary,
  .finance-grid,
  .finance-grid.bottom {
    grid-template-columns: 1fr;
  }

  .trend-chart {
    overflow-x: auto;
    grid-template-columns: repeat(14, 58px);
  }
}
</style>
