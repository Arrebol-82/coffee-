<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Check, Clock, House, Refresh } from "@element-plus/icons-vue";
import { getOrderDetail } from "@/api/orders";
import type { OrderDetail } from "@/types/order";

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const order = ref<OrderDetail | null>(null);

const orderId = computed(() => Number(route.params.id) || 0);
const orderNo = computed(() => order.value?.order_no || order.value?.order || "");
const pickupNumber = computed(() => {
  const source = orderNo.value || String(orderId.value);
  const digits = source.replace(/\D/g, "");
  const tail = (digits || String(orderId.value)).slice(-3).padStart(3, "0");
  return `A${tail}`;
});
const isPaid = computed(() => order.value?.status === "paid");
const totalCount = computed(() => order.value?.items.reduce((sum, item) => sum + item.count, 0) ?? 0);

const formatMoney = (price: number) => `¥${((Number(price) || 0) / 100).toFixed(2)}`;

const loadOrder = async () => {
  if (!orderId.value) {
    ElMessage.error("订单不存在");
    router.replace("/order");
    return;
  }

  loading.value = true;
  try {
    const res = await getOrderDetail(orderId.value);
    order.value = res.data;
  } catch (error) {
    console.error("[PickupNumber] 获取订单失败:", error);
    ElMessage.error("没有找到订单，请重新下单");
    router.replace("/order");
  } finally {
    loading.value = false;
  }
};

onMounted(loadOrder);
</script>

<template>
  <div class="pickup-page" v-loading="loading">
    <main v-if="order" class="pickup-shell">
      <section class="pickup-hero">
        <div class="status-pill" :class="{ paid: isPaid }">
          <el-icon><component :is="isPaid ? Check : Clock" /></el-icon>
          <span>{{ isPaid ? "已支付" : "待支付" }}</span>
        </div>

        <p class="eyebrow">请凭此号码取餐</p>
        <h1>{{ pickupNumber }}</h1>
        <p class="order-meta">订单号 {{ orderNo }}</p>
      </section>

      <section class="order-card">
        <div class="card-header">
          <div>
            <h2>订单明细</h2>
            <span>{{ totalCount }} 件商品</span>
          </div>
          <strong>{{ formatMoney(order.totalAmount) }}</strong>
        </div>

        <div class="item-list">
          <div v-for="item in order.items" :key="item.id" class="order-item">
            <div>
              <strong>{{ item.name }}</strong>
              <span>{{ formatMoney(item.price) }} x {{ item.count }}</span>
            </div>
            <b>{{ formatMoney(item.price * item.count) }}</b>
          </div>
        </div>
      </section>

      <section class="notice-band">
        <p>咖啡制作完成后，工作人员会按取单号叫号。</p>
      </section>

      <div class="actions">
        <el-button :icon="Refresh" @click="loadOrder">刷新状态</el-button>
        <el-button type="primary" :icon="House" @click="router.push('/order')">继续下单</el-button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.pickup-page {
  min-height: 100vh;
  padding: 28px 16px;
  background: #f6f4ef;
  color: #241f1b;
}

.pickup-shell {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: min(520px, 100%);
  margin: 0 auto;
}

.pickup-hero {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 10px;
  border-radius: 8px;
  padding: 32px 20px;
  background: #2f241d;
  color: #fff;
  text-align: center;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 999px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  color: #f3d4a8;
  font-size: 13px;
}

.status-pill.paid {
  color: #bdf0c4;
}

.eyebrow,
.order-meta,
.card-header span,
.order-item span,
.notice-band p {
  margin: 0;
  color: #75685d;
}

.pickup-hero .eyebrow,
.pickup-hero .order-meta {
  color: #d9b98f;
}

.pickup-hero h1 {
  margin: 0;
  color: #fff;
  font-size: 74px;
  line-height: 1;
  letter-spacing: 0;
}

.order-card,
.notice-band {
  border: 1px solid #e6ddd2;
  border-radius: 8px;
  background: #fff;
}

.order-card {
  padding: 16px;
}

.card-header,
.order-item,
.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.card-header {
  border-bottom: 1px solid #eee6dc;
  padding-bottom: 14px;
}

.card-header h2 {
  margin: 0 0 4px;
  font-size: 18px;
}

.card-header strong,
.order-item b {
  color: #8a3f20;
}

.item-list {
  display: flex;
  flex-direction: column;
}

.order-item {
  border-bottom: 1px solid #f0e8df;
  padding: 13px 0;
}

.order-item:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.order-item > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notice-band {
  padding: 14px 16px;
  background: #fff8f1;
}

.actions {
  justify-content: center;
}

@media (max-width: 480px) {
  .pickup-hero h1 {
    font-size: 58px;
  }

  .actions {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
