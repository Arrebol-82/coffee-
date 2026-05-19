<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { getOrderDetail, updateOrderStatus } from "@/api/orders";
import { ORDER_STATUS_MAP } from "@/constants/order";
import { useAuthStore } from "@/stores/auth";
import type { OrderDetail, OrderStatus } from "@/types/order";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const order = ref<OrderDetail | null>(null);
const orderId = Number(route.params.id);

const nextAction = computed(() => {
  if (!order.value) return null;

  const map: Partial<
    Record<OrderStatus, { status: OrderStatus; label: string; type: string }>
  > = {
    pending: { status: "paid", label: "确认收款", type: "primary" },
    paid: { status: "shipped", label: "确认发货", type: "success" },
    shipped: { status: "completed", label: "确认完成", type: "warning" },
  };

  return map[order.value.status] ?? null;
});

const loadData = async () => {
  if (!orderId) return;
  loading.value = true;
  try {
    const res = await getOrderDetail(orderId);
    order.value = res.data;
  } finally {
    loading.value = false;
  }
};

const getStatusConfig = (status: OrderStatus) => {
  return ORDER_STATUS_MAP[status] || { type: "info", label: "未知状态" };
};

const handleStatusChange = async (newStatus: OrderStatus) => {
  if (!order.value) return;

  const confirmMap: Record<OrderStatus, string> = {
    pending: "确认将订单退回待付款状态？",
    paid: "确认用户已经完成付款吗？",
    shipped: "确认商品已经发货吗？",
    completed: "确认订单已经完成吗？",
    cancelled: "确认取消订单吗？此操作不可恢复。",
  };

  try {
    await ElMessageBox.confirm(confirmMap[newStatus], "状态确认", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: newStatus === "cancelled" ? "warning" : "info",
      customClass: "coffee-confirm-box",
      confirmButtonClass: "coffee-confirm-button",
      cancelButtonClass: "coffee-cancel-button",
    });

    await updateOrderStatus(order.value.id, newStatus);
    ElMessage.success("订单状态已更新");
    loadData();
  } catch (error) {
    if (error !== "cancel") console.error(error);
  }
};

onMounted(loadData);
</script>

<template>
  <div class="order-detail-page" v-loading="loading">
    <el-page-header @back="router.back()">
      <template #content>
        <span class="page-title">订单详情：{{ order?.order }}</span>
      </template>

      <template #extra>
        <div v-if="order" class="header-actions">
          <el-tag
            :type="getStatusConfig(order.status).type"
            size="large"
            effect="dark"
          >
            {{ getStatusConfig(order.status).label }}
          </el-tag>

          <el-button
            v-if="nextAction"
            :type="nextAction.type as any"
            plain
            @click="handleStatusChange(nextAction.status)"
          >
            {{ nextAction.label }}
          </el-button>
          <el-button
            v-if="!['completed', 'cancelled'].includes(order.status) && authStore.isAdmin"
            type="danger"
            @click="handleStatusChange('cancelled')"
          >
            取消订单
          </el-button>
        </div>
      </template>
    </el-page-header>

    <el-card v-if="order" shadow="never" class="detail-card">
      <template #header>
        <div class="section-title">基础信息</div>
      </template>

      <el-descriptions :column="3" border>
        <el-descriptions-item label="订单号">
          {{ order.order }}
        </el-descriptions-item>
        <el-descriptions-item label="订单金额">
          ¥{{ (order.totalAmount / 100).toFixed(2) }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ order.createTime }}
        </el-descriptions-item>
        <el-descriptions-item label="客户姓名">
          {{ order.customer.name }}
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">
          {{ order.customer.phone }}
        </el-descriptions-item>
        <el-descriptions-item label="收货地址">
          {{ order.customer.address }}
        </el-descriptions-item>
        <el-descriptions-item label="订单备注" :span="3">
          {{ order.customer.remark || "无" }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card v-if="order" shadow="never" class="detail-card">
      <template #header>
        <div class="section-title">商品明细</div>
      </template>

      <el-table :data="order.items" border>
        <el-table-column prop="name" label="商品名称" min-width="180" />
        <el-table-column label="单价" width="120">
          <template #default="{ row }">¥{{ (row.price / 100).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="count" label="数量" width="100" />
        <el-table-column label="小计" width="120">
          <template #default="{ row }">
            ¥{{ ((row.price * row.count) / 100).toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card v-if="order" shadow="never" class="detail-card">
      <template #header>
        <div class="section-title">操作日志</div>
      </template>

      <el-empty
        v-if="!order.logs.length"
        description="暂无操作记录"
        :image-size="70"
      />
      <el-timeline v-else>
        <el-timeline-item
          v-for="(log, index) in order.logs"
          :key="log.id"
          :timestamp="log.createTime"
          :type="index === order.logs.length - 1 ? 'primary' : ''"
          :hollow="index === order.logs.length - 1"
        >
          <h4>{{ log.action }}</h4>
          <p>操作人：{{ log.operator }}</p>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<style scoped>
.order-detail-page {
  min-height: 80vh;
  padding: 20px;
}

.page-title {
  color: #111827;
  font-weight: 700;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.detail-card {
  margin-top: 18px;
}

.section-title {
  color: #111827;
  font-weight: 700;
}

.el-timeline h4 {
  margin: 0 0 5px;
}

.el-timeline p {
  margin: 0;
  color: #909399;
  font-size: 13px;
}
</style>
