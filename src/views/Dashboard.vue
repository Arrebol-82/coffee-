<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  ArrowDown,
  ArrowUp,
  CoffeeCup,
  Goods,
  Money,
  Refresh,
  ShoppingCart,
  TrendCharts,
  Warning,
} from "@element-plus/icons-vue";
import { getDashboardSummary } from "@/api/dashboard";
import type { DashboardCard, DashboardSummary } from "@/types/dashboard";

const loading = ref(false);
const dashboardData = ref<DashboardSummary | null>(null);
const router = useRouter();

const cardIcons = [ShoppingCart, Warning, Money, TrendCharts];

const summaryCards = computed(() => {
  if (!dashboardData.value) return [];
  return Object.values(dashboardData.value.cards);
});

const maxRevenue = computed(() => {
  const trends = dashboardData.value?.trend7d ?? [];
  return Math.max(...trends.map((item) => item.revenue), 1);
});

const maxOrders = computed(() => {
  const trends = dashboardData.value?.trend7d ?? [];
  return Math.max(...trends.map((item) => item.orderCount), 1);
});

const totalChannelValue = computed(() => {
  return (dashboardData.value?.channels ?? []).reduce(
    (total, item) => total + item.value,
    0
  );
});

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("zh-CN").format(value);
};

const formatMoney = (value: number) => {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(value);
};

const cardValue = (card: DashboardCard) => {
  if (card.unit === "元") return formatMoney(card.value);
  if (card.unit === "%") return `${card.value}%`;
  return `${formatNumber(card.value)}${card.unit ?? ""}`;
};

const loadData = async () => {
  loading.value = true;
  try {
    const res = await getDashboardSummary();
    dashboardData.value = res.data;
  } finally {
    loading.value = false;
  }
};

const normalizeAdminPath = (path: string) => {
  if (path.startsWith("/admin") || path === "/order") return path;
  if (["/orders", "/products", "/inventory", "/finance"].includes(path)) {
    return `/admin${path}`;
  }
  return path;
};

const goTarget = (target?: { path?: string; query?: Record<string, string> }) => {
  if (!target?.path) return;
  router.push({ path: normalizeAdminPath(target.path), query: target.query });
};

const goProduct = (row: { name: string }) => {
  router.push({ path: "/admin/products", query: { keyword: row.name } });
};

const goFinance = () => {
  router.push("/admin/finance");
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="dashboard-page" v-loading="loading">
    <section class="dashboard-header">
      <div>
        <p class="eyebrow coffeesys-brand-text">CoffeeSys</p>
        <h1>运营仪表盘</h1>
        <p class="header-copy">查看今日订单、销售趋势、热卖商品和待办事项。</p>
      </div>
      <div class="header-actions">
        <el-button type="success" :icon="ShoppingCart" @click="router.push('/order')">
          快速下单
        </el-button>
        <el-button type="primary" :icon="Refresh" @click="loadData">
          刷新数据
        </el-button>
      </div>
    </section>

    <el-empty
      v-if="!loading && !dashboardData"
      description="暂无仪表盘数据"
      class="empty-state"
    />

    <template v-else-if="dashboardData">
      <section class="metric-grid">
        <article
          v-for="(card, index) in summaryCards"
          :key="card.label"
          class="metric-card"
          :class="{ clickable: card.path }"
          tabindex="0"
          role="button"
          @click="goTarget(card)"
              @keydown.enter="goTarget(card)"
              @keydown.space.prevent="goTarget(card)"
        >
          <div class="metric-icon">
            <el-icon><component :is="cardIcons[index]" /></el-icon>
          </div>
          <div class="metric-content">
            <span>{{ card.label }}</span>
            <strong>{{ cardValue(card) }}</strong>
            <small :class="card.trend">
              <el-icon>
                <ArrowUp v-if="card.trend === 'up'" />
                <ArrowDown v-else />
              </el-icon>
              {{ card.change }}% 较昨日
            </small>
          </div>
        </article>
      </section>

      <section class="main-grid">
        <el-card shadow="never" class="trend-panel">
          <template #header>
            <div class="panel-header">
              <div>
                <h2>近 7 日趋势</h2>
                <span>订单量与销售额走势</span>
              </div>
              <el-tag type="success" effect="plain">实时 mock</el-tag>
            </div>
          </template>

          <div class="trend-chart">
            <div
              v-for="item in dashboardData.trend7d"
              :key="item.date"
              class="trend-column"
            >
              <div class="bar-track">
                <span
                  class="revenue-bar"
                  :style="{ height: `${(item.revenue / maxRevenue) * 100}%` }"
                />
                <span
                  class="order-bar"
                  :style="{ height: `${(item.orderCount / maxOrders) * 100}%` }"
                />
              </div>
              <strong>{{ formatMoney(item.revenue) }}</strong>
              <span>{{ item.date }}</span>
            </div>
          </div>

          <div class="chart-legend">
            <span><i class="legend-dot revenue" />销售额</span>
            <span><i class="legend-dot orders" />订单数</span>
          </div>
        </el-card>

        <el-card shadow="never" class="task-panel">
          <template #header>
            <div class="panel-header">
              <div>
                <h2>待办提醒</h2>
                <span>需要优先处理的事项</span>
              </div>
            </div>
          </template>

          <div class="task-list">
            <div
              v-for="task in dashboardData.tasks"
              :key="task.id"
              class="task-item"
              tabindex="0"
              role="button"
              @click="goTarget(task)"
              @keydown.enter="goTarget(task)"
              @keydown.space.prevent="goTarget(task)"
            >
              <el-icon><Warning /></el-icon>
              <span>{{ task.title }}</span>
              <el-tag :type="task.type" round>{{ task.count }}</el-tag>
            </div>
          </div>
        </el-card>
      </section>

      <section class="bottom-grid">
        <el-card shadow="never">
          <template #header>
            <div class="panel-header">
              <div>
                <h2>热卖商品</h2>
                <span>按销量排序</span>
              </div>
              <el-icon><Goods /></el-icon>
            </div>
          </template>

          <el-table
            :data="dashboardData.topProducts"
            class="clickable-table"
            style="width: 100%"
            @row-click="goProduct"
          >
            <el-table-column label="商品" min-width="190">
              <template #default="{ row }">
                <div class="product-cell">
                  <el-icon><CoffeeCup /></el-icon>
                  <div>
                    <strong>{{ row.name }}</strong>
                    <span>{{ row.category }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="sold" label="销量" width="100" />
            <el-table-column label="销售额" width="130">
              <template #default="{ row }">
                {{ formatMoney(row.revenue) }}
              </template>
            </el-table-column>
            <el-table-column label="库存" width="120">
              <template #default="{ row }">
                <el-progress
                  :percentage="Math.min(row.stock, 100)"
                  :stroke-width="8"
                  :show-text="false"
                />
                <span class="stock-text">{{ row.stock }} 件</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <el-card shadow="never">
          <template #header>
            <div class="panel-header">
              <div>
                <h2>销售渠道</h2>
                <span>今日订单来源占比</span>
              </div>
            </div>
          </template>

          <div class="channel-list">
            <div
              v-for="channel in dashboardData.channels"
              :key="channel.name"
              class="channel-item"
              tabindex="0"
              role="button"
              @click="goFinance"
              @keydown.enter="goFinance"
              @keydown.space.prevent="goFinance"
            >
              <div class="channel-title">
                <span>
                  <i :style="{ background: channel.color }" />
                  {{ channel.name }}
                </span>
                <strong>{{ channel.value }}%</strong>
              </div>
              <el-progress
                :percentage="(channel.value / totalChannelValue) * 100"
                :color="channel.color"
                :stroke-width="10"
                :show-text="false"
              />
            </div>
          </div>
        </el-card>
      </section>
    </template>
  </div>
</template>

<style scoped>
.dashboard-page {
  min-height: calc(100vh - 100px);
  padding: 24px 24px 36px;
  color: #1f2937;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.eyebrow,
.header-copy,
.panel-header span,
.metric-content span,
.metric-content small,
.trend-column span,
.product-cell span,
.stock-text {
  color: #6b7280;
}

.eyebrow {
  margin: 0 0 6px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.dashboard-header h1,
.panel-header h2 {
  margin: 0;
  color: #111827;
}

.dashboard-header h1 {
  font-size: 28px;
}

.header-copy {
  margin: 8px 0 0;
  font-size: 14px;
}

.metric-grid,
.main-grid,
.bottom-grid {
  display: grid;
  gap: 18px;
}

.metric-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 18px;
}

.metric-card {
  display: flex;
  gap: 14px;
  min-height: 116px;
  padding: 20px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.metric-card.clickable {
  cursor: pointer;
}

.metric-card.clickable:hover,
.metric-card.clickable:focus-visible,
.task-item:hover,
.task-item:focus-visible,
.channel-item:hover,
.channel-item:focus-visible {
  border-color: #93c5fd;
  box-shadow: 0 10px 28px rgba(37, 99, 235, 0.1);
  outline: none;
}

.metric-card.clickable:hover,
.metric-card.clickable:focus-visible {
  transform: translateY(-2px);
}

.metric-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  color: #fff;
  background: #2563eb;
  border-radius: 8px;
}

.metric-content {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 8px;
}

.metric-content strong {
  font-size: 26px;
  line-height: 1;
  color: #111827;
}

.metric-content small {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

.metric-content small.up {
  color: #16a34a;
}

.metric-content small.down {
  color: #dc2626;
}

.main-grid {
  grid-template-columns: minmax(0, 2fr) minmax(280px, 0.9fr);
  margin-bottom: 18px;
}

.bottom-grid {
  grid-template-columns: minmax(0, 1.4fr) minmax(320px, 0.8fr);
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
  grid-template-columns: repeat(7, minmax(58px, 1fr));
  gap: 14px;
  min-height: 280px;
  align-items: end;
  padding-top: 12px;
}

.trend-column {
  display: grid;
  gap: 8px;
  justify-items: center;
  min-width: 0;
}

.bar-track {
  position: relative;
  display: flex;
  align-items: end;
  justify-content: center;
  gap: 5px;
  width: 100%;
  height: 190px;
  padding: 10px;
  background: #f8fafc;
  border-radius: 8px;
}

.revenue-bar,
.order-bar {
  display: block;
  width: 14px;
  min-height: 8px;
  border-radius: 999px 999px 4px 4px;
}

.revenue-bar {
  background: #2563eb;
}

.order-bar {
  background: #22c55e;
}

.trend-column strong {
  font-size: 12px;
  color: #374151;
}

.chart-legend {
  display: flex;
  justify-content: flex-end;
  gap: 18px;
  margin-top: 14px;
  color: #4b5563;
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
  background: #2563eb;
}

.legend-dot.orders {
  background: #22c55e;
}

.task-list,
.channel-list {
  display: grid;
  gap: 14px;
}

.task-item {
  display: grid;
  grid-template-columns: 28px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 13px 0;
  border-bottom: 1px solid #edf2f7;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, padding 0.2s ease;
}

.task-item:hover,
.task-item:focus-visible {
  padding-right: 10px;
  padding-left: 10px;
  border-radius: 8px;
}

.task-item:last-child {
  border-bottom: none;
}

.task-item .el-icon {
  color: #64748b;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-cell .el-icon {
  color: #7c3aed;
}

.product-cell div {
  display: grid;
  gap: 3px;
}

.stock-text {
  display: block;
  margin-top: 5px;
  font-size: 12px;
}

.channel-item {
  display: grid;
  gap: 8px;
  padding: 10px;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.channel-item:hover,
.channel-item:focus-visible {
  transform: translateY(-1px);
}

.channel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #374151;
}

.channel-title span {
  display: inline-flex;
  align-items: center;
}

.empty-state {
  min-height: 360px;
  background: #fff;
  border-radius: 8px;
}

.clickable-table :deep(.el-table__row) {
  cursor: pointer;
}

.clickable-table :deep(.el-table__row:hover > td.el-table__cell) {
  background: #f8fafc;
}

@media (max-width: 1180px) {
  .metric-grid,
  .main-grid,
  .bottom-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .dashboard-page {
    padding: 16px;
  }

  .dashboard-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .metric-grid,
  .main-grid,
  .bottom-grid {
    grid-template-columns: 1fr;
  }

  .trend-chart {
    overflow-x: auto;
    grid-template-columns: repeat(7, 72px);
  }
}
</style>
