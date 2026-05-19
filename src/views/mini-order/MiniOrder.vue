<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { CreditCard, Money, Minus, Plus, ShoppingCart, Wallet } from '@element-plus/icons-vue';
import { getProductList } from '@/api/products';
import { createOrder, updateOrderStatus } from '@/api/orders';
import type { OrderCreateDTO, OrderDetail } from '@/types/order';
import type { Product, ProductCategory } from '@/types/product';

const router = useRouter();

const loading = ref(false);
const submitting = ref(false);
const products = ref<Product[]>([]);
const activeCategory = ref<ProductCategory | 'all'>('all');
const cartItems = ref<{ product: Product; count: number }[]>([]);
const showCart = ref(false);
const showPaymentDialog = ref(false);
const createdOrder = ref<OrderDetail | null>(null);
const selectedPayment = ref('wechat');
const paying = ref(false);

const paymentMethods = [
  { value: 'wechat', label: '微信支付', description: '使用微信扫码或零钱支付', icon: Wallet },
  { value: 'alipay', label: '支付宝', description: '使用支付宝扫码或余额支付', icon: CreditCard },
  { value: 'cash', label: '现金支付', description: '到店交由收银员确认', icon: Money },
  { value: 'card', label: '银行卡', description: '刷卡或使用银联支付', icon: CreditCard },
];

const categories: Array<{ value: ProductCategory | 'all'; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'espresso', label: '意式咖啡' },
  { value: 'drip_bag', label: '挂耳咖啡' },
  { value: 'instant', label: '即饮咖啡' },
  { value: 'beans', label: '咖啡豆' },
  { value: 'gear', label: '咖啡器具' },
];

const filteredProducts = computed(() => products.value.filter((product) => product.status === 'on_sale'));
const totalCount = computed(() => cartItems.value.reduce((sum, item) => sum + item.count, 0));
const totalAmount = computed(() =>
  cartItems.value.reduce((sum, item) => sum + (Number(item.product.price) || 0) * item.count, 0)
);

const formatMoney = (price: number) => `¥${((Number(price) || 0) / 100).toFixed(2)}`;

const loadProducts = async () => {
  loading.value = true;
  try {
    const res = await getProductList({
      page: 1,
      pageSize: 100,
      status: 'on_sale',
      category: activeCategory.value === 'all' ? '' : activeCategory.value,
    });
    products.value = res.data.list;
  } finally {
    loading.value = false;
  }
};

const getCartItemCount = (productId: number) => {
  return cartItems.value.find((item) => item.product.id === productId)?.count || 0;
};

const addToCart = (product: Product) => {
  const item = cartItems.value.find((cartItem) => cartItem.product.id === product.id);

  if (item) {
    if (item.count >= product.stock) {
      ElMessage.warning('库存不足');
      return;
    }
    item.count++;
    return;
  }

  if (product.stock <= 0) {
    ElMessage.warning('商品已售罄');
    return;
  }

  cartItems.value.push({ product, count: 1 });
};

const removeFromCart = (product: Product) => {
  const index = cartItems.value.findIndex((item) => item.product.id === product.id);
  const item = cartItems.value[index];
  if (!item) return;

  if (item.count > 1) {
    item.count--;
  } else {
    cartItems.value.splice(index, 1);
  }
};

const clearCart = async () => {
  if (cartItems.value.length === 0) return;

  try {
    await ElMessageBox.confirm('确定清空购物车吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    cartItems.value = [];
    showCart.value = false;
  } catch {
    // user cancelled
  }
};

const submitOrder = async () => {
  if (cartItems.value.length === 0) {
    ElMessage.warning("请先选择商品");
    return;
  }

  const payload: OrderCreateDTO = {
    customer: { name: "到店顾客", phone: "13800000000", address: "门店自提", remark: "" },
    status: "pending",
    items: cartItems.value.map((item) => ({ productId: item.product.id, count: item.count })),
  };

  console.log("[MiniOrder] 准备提交订单:", payload);

  submitting.value = true;
  try {
    const result = await createOrder(payload);
    console.log("[MiniOrder] 订单创建成功:", result);
    createdOrder.value = result.data;
    selectedPayment.value = "wechat";
    showPaymentDialog.value = true;
    ElMessage.success("下单成功，请选择支付方式");
    cartItems.value = [];
    showCart.value = false;
    await loadProducts();
  } catch (error) {
    console.error("[MiniOrder] 订单创建失败:", error);
  } finally {
    submitting.value = false;
  }
};

const confirmPayment = async () => {
  if (!createdOrder.value) return;

  const orderId = createdOrder.value.id;
  paying.value = true;
  try {
    await updateOrderStatus(orderId, "paid");
    ElMessage.success(`已选择${paymentMethods.find((method) => method.value === selectedPayment.value)?.label}`);
    showPaymentDialog.value = false;
    createdOrder.value = null;
    router.push(`/order/pickup/${orderId}`);
  } finally {
    paying.value = false;
  }
};

const goPickupPage = () => {
  if (!createdOrder.value) return;

  const orderId = createdOrder.value.id;
  showPaymentDialog.value = false;
  createdOrder.value = null;
  router.push(`/order/pickup/${orderId}`);
};

onMounted(loadProducts);

watch(activeCategory, () => {
  showCart.value = false;
  loadProducts();
});
</script>

<template>
  <div class="mini-order-page">
    <header class="page-header">
      <div class="header-content">
        <button class="back-btn" type="button" @click="router.push('/')">返回首页</button>
        <div>
          <p class="eyebrow">CoffeeSys</p>
          <h1>自助下单</h1>
        </div>
      </div>
    </header>

    <main class="page-content">
      <nav class="category-nav" aria-label="商品分类">
        <button
          v-for="category in categories"
          :key="category.value"
          class="category-item"
          :class="{ active: activeCategory === category.value }"
          type="button"
          @click="activeCategory = category.value"
        >
          {{ category.label }}
        </button>
      </nav>

      <el-empty v-if="!loading && filteredProducts.length === 0" description="暂无可下单商品" />

      <div v-loading="loading" class="product-grid">
        <article v-for="product in filteredProducts" :key="product.id" class="product-card">
          <div class="product-main">
            <div>
              <h2>{{ product.name }}</h2>
              <p>{{ product.description || product.origin || '门店精选商品' }}</p>
            </div>
            <strong>{{ formatMoney(product.price) }}</strong>
          </div>

          <div class="product-meta">
            <span>库存 {{ product.stock }}</span>
            <span v-if="product.recommended">推荐</span>
          </div>

          <div class="quantity-row">
            <el-button
              circle
              :icon="Minus"
              :disabled="getCartItemCount(product.id) === 0"
              @click="removeFromCart(product)"
            />
            <span>{{ getCartItemCount(product.id) }}</span>
            <el-button circle type="primary" :icon="Plus" @click="addToCart(product)" />
          </div>
        </article>
      </div>
    </main>

    <footer class="cart-bar">
      <button class="cart-toggle" type="button" @click="showCart = !showCart">
        <el-icon><ShoppingCart /></el-icon>
        <span>{{ totalCount }} 件</span>
      </button>
      <div class="cart-total">
        <span>合计</span>
        <strong>{{ formatMoney(totalAmount) }}</strong>
      </div>
      <el-button type="primary" size="large" :loading="submitting" @click="submitOrder">提交订单</el-button>
    </footer>

    <el-drawer v-model="showCart" title="购物车" direction="btt" size="55%">
      <div v-if="cartItems.length" class="cart-list">
        <div v-for="item in cartItems" :key="item.product.id" class="cart-item">
          <div>
            <strong>{{ item.product.name }}</strong>
            <span>{{ formatMoney(item.product.price) }} x {{ item.count }}</span>
          </div>
          <div class="quantity-row compact">
            <el-button circle :icon="Minus" @click="removeFromCart(item.product)" />
            <span>{{ item.count }}</span>
            <el-button circle type="primary" :icon="Plus" @click="addToCart(item.product)" />
          </div>
        </div>
        <el-button text type="danger" @click="clearCart">清空购物车</el-button>
      </div>
      <el-empty v-else description="购物车为空" />
    </el-drawer>

    <el-dialog v-model="showPaymentDialog" title="选择支付方式" width="420px" align-center>
      <div v-if="createdOrder" class="payment-panel">
        <div class="payment-summary">
          <span>订单号 {{ createdOrder.order_no || createdOrder.order }}</span>
          <strong>{{ formatMoney(createdOrder.totalAmount) }}</strong>
        </div>

        <el-radio-group v-model="selectedPayment" class="payment-methods">
          <label
            v-for="method in paymentMethods"
            :key="method.value"
            class="payment-method"
            :class="{ active: selectedPayment === method.value }"
          >
            <el-radio :value="method.value" size="large">
              <span class="method-content">
                <el-icon><component :is="method.icon" /></el-icon>
                <span>
                  <strong>{{ method.label }}</strong>
                  <small>{{ method.description }}</small>
                </span>
              </span>
            </el-radio>
          </label>
        </el-radio-group>
      </div>

      <template #footer>
        <el-button @click="goPickupPage">稍后支付</el-button>
        <el-button type="primary" :loading="paying" @click="confirmPayment">确认支付</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.mini-order-page {
  min-height: 100vh;
  padding-bottom: 92px;
  background: #f6f4ef;
  color: #241f1b;
}

.page-header {
  background: #2f241d;
  color: #fff;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 18px;
  max-width: 1120px;
  margin: 0 auto;
  padding: 22px 18px;
}

.back-btn {
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 999px;
  padding: 9px 14px;
  color: #fff;
  background: transparent;
  cursor: pointer;
}

.eyebrow {
  margin: 0 0 4px;
  color: #d9b98f;
  font-size: 13px;
}

h1,
h2,
p {
  margin: 0;
}

.page-content {
  max-width: 1120px;
  margin: 0 auto;
  padding: 20px 18px;
}

.category-nav {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 12px;
}

.category-item {
  flex: 0 0 auto;
  border: 1px solid #e3d9cd;
  border-radius: 999px;
  padding: 9px 14px;
  background: #fff;
  color: #5a4b3f;
  cursor: pointer;
}

.category-item.active {
  border-color: #7d4d2f;
  background: #7d4d2f;
  color: #fff;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
  min-height: 220px;
}

.product-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  border: 1px solid #e6ddd2;
  border-radius: 8px;
  padding: 16px;
  background: #fff;
}

.product-main {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.product-main h2 {
  font-size: 17px;
}

.product-main p,
.product-meta,
.cart-item span {
  color: #75685d;
  font-size: 13px;
}

.product-main strong,
.cart-total strong {
  color: #8a3f20;
}

.product-meta,
.quantity-row,
.cart-bar,
.cart-item {
  display: flex;
  align-items: center;
}

.product-meta,
.cart-item {
  justify-content: space-between;
}

.quantity-row {
  gap: 10px;
}

.quantity-row span {
  min-width: 24px;
  text-align: center;
  font-weight: 700;
}

.quantity-row.compact {
  flex: 0 0 auto;
}

.cart-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  gap: 14px;
  padding: 14px 18px;
  background: #fff;
  box-shadow: 0 -8px 24px rgba(54, 42, 33, 0.12);
}

.cart-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 999px;
  padding: 11px 15px;
  background: #2f241d;
  color: #fff;
  cursor: pointer;
}

.cart-total {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
}

.cart-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cart-item {
  border-bottom: 1px solid #eee6dc;
  padding-bottom: 12px;
}

.cart-item > div:first-child {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.payment-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.payment-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #eee6dc;
  border-radius: 8px;
  padding: 12px;
  background: #fbf8f3;
}

.payment-summary span {
  color: #75685d;
  font-size: 13px;
}

.payment-summary strong {
  color: #8a3f20;
  font-size: 20px;
}

.payment-methods {
  display: grid;
  gap: 10px;
  width: 100%;
}

.payment-method {
  display: block;
  border: 1px solid #e6ddd2;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.payment-method.active {
  border-color: #7d4d2f;
  background: #fff8f1;
}

.method-content {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.method-content .el-icon {
  color: #7d4d2f;
  font-size: 20px;
}

.method-content span {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.method-content strong {
  color: #241f1b;
  font-size: 15px;
}

.method-content small {
  color: #75685d;
  font-size: 12px;
}

@media (max-width: 640px) {
  .header-content {
    align-items: flex-start;
    flex-direction: column;
  }

  .product-grid {
    grid-template-columns: 1fr;
  }
}
</style>
