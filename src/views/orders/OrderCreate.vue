<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete, Plus } from "@element-plus/icons-vue";
import { createOrder, getOrderDetail, updateOrder } from "@/api/orders";
import { getProductList } from "@/api/products";
import type { Product } from "@/types/product";
import type { OrderCreateDTO, OrderStatus } from "@/types/order";

interface DraftItem {
  productId?: number;
  count: number;
}

const router = useRouter();
const route = useRoute();

const loadingOrder = ref(false);
const loadingProducts = ref(false);
const submitting = ref(false);
const products = ref<Product[]>([]);
const status = ref<OrderStatus>("pending");
const items = ref<DraftItem[]>([{ count: 1 }]);
const originalItems = ref<DraftItem[]>([]);
const customer = ref({
  name: "",
  phone: "",
  address: "",
  remark: "",
});

const statusOptions: Array<{ label: string; value: OrderStatus }> = [
  { label: "待付款", value: "pending" },
  { label: "已付款", value: "paid" },
];

const orderId = computed(() => Number(route.params.id) || 0);
const isEdit = computed(() => route.name === "OrderEdit" && orderId.value > 0);
const pageTitle = computed(() => (isEdit.value ? "编辑订单" : "添加订单"));
const submitText = computed(() => (isEdit.value ? "保存订单" : "创建订单"));

const selectedProductIds = computed(() =>
  items.value
    .map((item) => item.productId)
    .filter((id): id is number => typeof id === "number")
);

const selectedItems = computed(() =>
  items.value
    .map((item) => {
      const product = products.value.find((product) => product.id === item.productId);
      if (!product) return null;

      return {
        product,
        count: item.count,
        subtotal: product.price * item.count,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
);

const totalAmount = computed(() =>
  selectedItems.value.reduce((total, item) => total + item.subtotal, 0)
);

const canSubmit = computed(
  () =>
    selectedItems.value.length > 0 &&
    items.value.every((item) => item.productId && item.count > 0) &&
    customer.value.name.trim() &&
    customer.value.phone.trim() &&
    customer.value.address.trim()
);

const formatMoney = (price: number) => `¥${(price / 100).toFixed(2)}`;

const getOriginalCount = (productId?: number) => {
  if (!isEdit.value || !productId) return 0;

  return originalItems.value
    .filter((item) => item.productId === productId)
    .reduce((total, item) => total + item.count, 0);
};

const getProductDisabled = (productId: number, currentItem: DraftItem) => {
  const product = products.value.find((product) => product.id === productId);
  return (
    (product?.stock ?? 0) + getOriginalCount(productId) === 0 ||
    (currentItem.productId !== productId && selectedProductIds.value.includes(productId))
  );
};

const getProductStock = (productId?: number) => {
  if (!productId) return 99;
  const stock = products.value.find((product) => product.id === productId)?.stock ?? 99;
  return stock + getOriginalCount(productId);
};

const loadProducts = async () => {
  loadingProducts.value = true;
  try {
    const res = await getProductList({
      page: 1,
      pageSize: 100,
    });
    products.value = res.data.list;
  } finally {
    loadingProducts.value = false;
  }
};

const loadOrder = async () => {
  if (!isEdit.value) return;

  loadingOrder.value = true;
  try {
    const res = await getOrderDetail(orderId.value);
    const detail = res.data;

    customer.value = {
      name: detail.customer.name,
      phone: detail.customer.phone,
      address: detail.customer.address,
      remark: detail.customer.remark ?? "",
    };
    status.value = detail.status;
    items.value = detail.items.map((item) => ({
      productId: item.id,
      count: item.count,
    }));
    originalItems.value = items.value.map((item) => ({ ...item }));
  } finally {
    loadingOrder.value = false;
  }
};

const addItem = () => {
  items.value.push({ count: 1 });
};

const removeItem = (index: number) => {
  if (items.value.length === 1) {
    items.value = [{ count: 1 }];
    return;
  }

  items.value.splice(index, 1);
};

const handleSubmit = async () => {
  if (!canSubmit.value) {
    ElMessage.warning("请先选择商品并填写数量");
    return;
  }

  const payload: OrderCreateDTO = {
    customer: {
      name: customer.value.name.trim(),
      phone: customer.value.phone.trim(),
      address: customer.value.address.trim(),
      remark: customer.value.remark.trim(),
    },
    status: status.value,
    items: items.value.map((item) => ({
      productId: item.productId!,
      count: item.count,
    })),
  };

  submitting.value = true;
  try {
    const res = isEdit.value
      ? await updateOrder(orderId.value, payload)
      : await createOrder(payload);

    ElMessage.success(isEdit.value ? "订单保存成功" : "订单创建成功");
    router.push(`/orders/${res.data.id}`);
  } finally {
    submitting.value = false;
  }
};

const handleCancel = async () => {
  if (selectedItems.value.length > 0) {
    try {
      await ElMessageBox.confirm("当前订单尚未提交，确认离开吗？", "离开确认", {
        confirmButtonText: "离开",
        cancelButtonText: "继续编辑",
        type: "warning",
      });
    } catch (error) {
      return;
    }
  }

  router.push("/orders");
};

onMounted(async () => {
  await loadProducts();
  await loadOrder();
});
</script>

<template>
  <div class="order-create-page" v-loading="loadingOrder">
    <el-page-header @back="handleCancel">
      <template #content>
        <span class="page-title">{{ pageTitle }}</span>
      </template>
    </el-page-header>

    <div class="content-grid">
      <section class="main-panel">
        <div class="panel-header">
          <h2>商品明细</h2>
          <el-button type="primary" :icon="Plus" @click="addItem">添加商品</el-button>
        </div>

        <div v-loading="loadingProducts" class="item-list">
          <div v-for="(item, index) in items" :key="index" class="item-row">
            <el-select
              v-model="item.productId"
              filterable
              placeholder="选择商品"
              class="product-select"
            >
              <el-option
                v-for="product in products"
                :key="product.id"
                :label="`${product.name} / ${formatMoney(product.price)} / 库存 ${product.stock}`"
                :value="product.id"
                :disabled="getProductDisabled(product.id, item)"
              />
            </el-select>

            <el-input-number
              v-model="item.count"
              :min="1"
              :max="getProductStock(item.productId)"
              controls-position="right"
              class="count-input"
            />

            <strong class="subtotal">
              {{
                item.productId
                  ? formatMoney(
                      (products.find((product) => product.id === item.productId)?.price ?? 0) *
                        item.count
                    )
                  : "¥0.00"
              }}
            </strong>

            <el-button
              circle
              type="danger"
              :icon="Delete"
              aria-label="删除商品"
              @click="removeItem(index)"
            />
          </div>
        </div>
      </section>

      <aside class="summary-panel">
        <h2>订单汇总</h2>

        <el-form label-position="top">
          <el-form-item label="客户姓名" required>
            <el-input v-model="customer.name" placeholder="请输入客户姓名" />
          </el-form-item>
          <el-form-item label="联系电话" required>
            <el-input v-model="customer.phone" placeholder="请输入联系电话" />
          </el-form-item>
          <el-form-item label="收货地址" required>
            <el-input v-model="customer.address" placeholder="门店自提或配送地址" />
          </el-form-item>
          <el-form-item label="订单备注">
            <el-input
              v-model="customer.remark"
              type="textarea"
              :rows="2"
              placeholder="口味偏好、配送备注等"
            />
          </el-form-item>
          <el-form-item label="初始状态">
            <el-select v-model="status" class="status-select">
              <el-option
                v-for="option in statusOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
        </el-form>

        <div class="summary-list">
          <div v-for="item in selectedItems" :key="item.product.id" class="summary-item">
            <span>{{ item.product.name }} x {{ item.count }}</span>
            <strong>{{ formatMoney(item.subtotal) }}</strong>
          </div>
          <el-empty
            v-if="selectedItems.length === 0"
            description="暂未选择商品"
            :image-size="72"
          />
        </div>

        <div class="total-line">
          <span>合计</span>
          <strong>{{ formatMoney(totalAmount) }}</strong>
        </div>

        <div class="actions">
          <el-button @click="handleCancel">取消</el-button>
          <el-button
            type="primary"
            :loading="submitting"
            :disabled="!canSubmit"
            @click="handleSubmit"
          >
            {{ submitText }}
          </el-button>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.order-create-page {
  padding: 20px;
}

.page-title {
  color: #111827;
  font-weight: 700;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 18px;
  margin-top: 18px;
}

.main-panel,
.summary-panel {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 18px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

h2 {
  margin: 0;
  color: #111827;
  font-size: 16px;
}

.item-list {
  display: grid;
  gap: 12px;
  min-height: 120px;
}

.item-row {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) 120px 110px 40px;
  gap: 10px;
  align-items: center;
}

.product-select,
.status-select {
  width: 100%;
}

.count-input {
  width: 120px;
}

.subtotal {
  color: #f56c6c;
  text-align: right;
}

.summary-panel {
  align-self: start;
}

.summary-list {
  display: grid;
  gap: 10px;
  min-height: 120px;
  margin-top: 10px;
}

.summary-item,
.total-line,
.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.summary-item span {
  color: #606266;
  font-size: 13px;
}

.summary-item strong {
  color: #111827;
  white-space: nowrap;
}

.total-line {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.total-line strong {
  color: #f56c6c;
  font-size: 22px;
}

.actions {
  margin-top: 18px;
  justify-content: flex-end;
}

@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .item-row {
    grid-template-columns: 1fr;
  }

  .count-input {
    width: 100%;
  }

  .subtotal {
    text-align: left;
  }
}
</style>
