<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Refresh, View } from "@element-plus/icons-vue";
import { getOrderList, subscribeToOrderChanges } from "@/api/orders";
import { ORDER_STATUS_MAP } from "@/constants/order";
import type { Order, OrderStatus } from "@/types/order";

const router = useRouter();

const loading = ref(false);
const tableData = ref<Order[]>([]);
const total = ref(0);
const lastRefreshAt = ref("");

const queryParams = ref({
  page: 1,
  pageSize: 20,
  keyword: "",
  status: "" as OrderStatus | "",
});

let unsubscribeOrderChanges: (() => void) | undefined;

const pendingCount = computed(() => tableData.value.filter((order) => order.status === "pending").length);
const paidCount = computed(() => tableData.value.filter((order) => order.status === "paid").length);
const totalAmount = computed(() => tableData.value.reduce((sum, order) => sum + order.totalAmount, 0));

const formatMoney = (amount: number) => `¥${((Number(amount) || 0) / 100).toFixed(2)}`;
const getOrderNo = (order: Order) => order.order_no || order.order || `#${order.id}`;
const getStatus = (status: OrderStatus) => ORDER_STATUS_MAP[status] || { type: "info", label: "未知状态" };

const updateRefreshTime = () => {
  lastRefreshAt.value = new Date().toLocaleTimeString("zh-CN", { hour12: false });
};

const loadOrders = async () => {
  loading.value = true;
  try {
    const res = await getOrderList(queryParams.value);
    tableData.value = res.data.list;
    total.value = res.data.total;
    updateRefreshTime();
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  queryParams.value.page = 1;
  loadOrders();
};

const handleReset = () => {
  queryParams.value.keyword = "";
  queryParams.value.status = "";
  handleSearch();
};

const handlePageChange = () => {
  loadOrders();
};

const handleRealtimeChange = () => {
  handleSearch();
  ElMessage.success("收到下单页面的新订单，已同步到下单管理");
};

const goToDetail = (id: number) => {
  router.push(`/admin/orders/${id}`);
};

onMounted(() => {
  loadOrders();
  unsubscribeOrderChanges = subscribeToOrderChanges(handleRealtimeChange);
});

onBeforeUnmount(() => {
  unsubscribeOrderChanges?.();
});
</script>

<template>
  <div class="order-management-page">
    <section class="page-header">
      <div>
        <p>实时接收下单页面信息</p>
        <h1>下单管理</h1>
      </div>
      <el-button :icon="Refresh" :loading="loading" @click="loadOrders">刷新</el-button>
    </section>

    <section class="summary-grid">
      <div class="summary-item">
        <span>当前列表订单</span>
        <strong>{{ total }}</strong>
      </div>
      <div class="summary-item">
        <span>待处理</span>
        <strong>{{ pendingCount }}</strong>
      </div>
      <div class="summary-item">
        <span>已付款</span>
        <strong>{{ paidCount }}</strong>
      </div>
      <div class="summary-item">
        <span>当前页金额</span>
        <strong>{{ formatMoney(totalAmount) }}</strong>
      </div>
    </section>

    <section class="table-section">
      <div class="toolbar">
        <el-input
          v-model="queryParams.keyword"
          clearable
          placeholder="搜索订单号 / 顾客 / 电话"
          style="width: 240px"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-select
          v-model="queryParams.status"
          clearable
          placeholder="订单状态"
          style="width: 160px"
          @change="handleSearch"
        >
          <el-option label="待付款" value="pending" />
          <el-option label="已付款" value="paid" />
          <el-option label="已发货" value="shipped" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <span class="refresh-time">最近同步：{{ lastRefreshAt || "-" }}</span>
      </div>

      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column label="订单号" min-width="180">
          <template #default="{ row }">{{ getOrderNo(row) }}</template>
        </el-table-column>
        <el-table-column label="顾客" min-width="120">
          <template #default="{ row }">{{ row.customer.name }}</template>
        </el-table-column>
        <el-table-column label="电话" min-width="140">
          <template #default="{ row }">{{ row.customer.phone }}</template>
        </el-table-column>
        <el-table-column label="金额" width="120">
          <template #default="{ row }">
            <strong class="amount">{{ formatMoney(row.totalAmount) }}</strong>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatus(row.status).type" effect="plain">
              {{ getStatus(row.status).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" :icon="View" @click="goToDetail(row.id)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-row">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageChange"
          @current-change="handlePageChange"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.order-management-page {
  min-height: 100%;
  padding: 20px;
  background: transparent;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.page-header p {
  margin: 0 0 4px;
  color: #667085;
  font-size: 13px;
}

.page-header h1 {
  margin: 0;
  color: #1f2937;
  font-size: 24px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.summary-item,
.table-section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}

.summary-item {
  padding: 16px;
}

.summary-item span {
  display: block;
  margin-bottom: 8px;
  color: #667085;
  font-size: 13px;
}

.summary-item strong {
  color: #111827;
  font-size: 24px;
}

.table-section {
  padding: 16px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.refresh-time {
  margin-left: auto;
  color: #667085;
  font-size: 13px;
}

.amount {
  color: #f56c6c;
}

.pagination-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

@media (max-width: 900px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .refresh-time {
    width: 100%;
    margin-left: 0;
  }
}
</style>
