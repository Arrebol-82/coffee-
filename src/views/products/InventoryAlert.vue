<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";
import { Plus, Refresh, Warning } from "@element-plus/icons-vue";
import { getInventoryLogs, getProductList, purchaseInventory } from "@/api/products";
import { useTable } from "@/composables/useTable";
import type {
  InventoryLog,
  InventoryLogType,
  InventoryPurchaseDTO,
  Product,
} from "@/types/product";
import { PRODUCT_CATEGORY_LABEL } from "@/types/product";

const { loading, tableData, queryParams, loadData } =
  useTable<Product>(getProductList);

const logLoading = ref(false);
const inventoryLogs = ref<InventoryLog[]>([]);
const purchaseVisible = ref(false);
const purchaseLoading = ref(false);
const purchaseFormRef = ref<FormInstance>();
const purchaseForm = reactive<InventoryPurchaseDTO>({
  productId: undefined as unknown as number,
  count: 1,
  remark: "",
});

const purchaseRules = reactive<FormRules<InventoryPurchaseDTO>>({
  productId: [{ required: true, message: "请选择商品", trigger: "change" }],
  count: [{ required: true, message: "请输入购入数量", trigger: "blur" }],
});

const lowStockProducts = computed(() => {
  return tableData.value
    .filter((product) => product.stock <= product.lowStockThreshold)
    .sort((a, b) => a.stock - b.stock);
});

const normalProducts = computed(() => {
  return tableData.value.filter(
    (product) => product.stock > product.lowStockThreshold
  ).length;
});

const categoryLabel = (row: Product) => PRODUCT_CATEGORY_LABEL[row.category];

const logTypeMap: Record<
  InventoryLogType,
  { label: string; type: "success" | "warning" | "danger" | "info" }
> = {
  in: { label: "入库", type: "success" },
  out: { label: "出库", type: "danger" },
  adjust: { label: "调整", type: "warning" },
  restore: { label: "恢复", type: "info" },
};

const formatChange = (change: number) => {
  return change > 0 ? `+${change}` : `${change}`;
};

const loadInventoryLogs = async () => {
  logLoading.value = true;
  try {
    const res = await getInventoryLogs();
    inventoryLogs.value = res.data;
  } finally {
    logLoading.value = false;
  }
};

const refreshInventory = () => {
  loadData();
  loadInventoryLogs();
};

const openPurchaseDialog = () => {
  purchaseVisible.value = true;
};

const resetPurchaseForm = () => {
  purchaseForm.productId = undefined as unknown as number;
  purchaseForm.count = 1;
  purchaseForm.remark = "";
  purchaseFormRef.value?.clearValidate();
};

const handlePurchaseSubmit = async () => {
  if (!purchaseFormRef.value) return;

  try {
    await purchaseFormRef.value.validate();
  } catch {
    return;
  }

  purchaseLoading.value = true;
  try {
    await purchaseInventory({
      productId: purchaseForm.productId,
      count: purchaseForm.count,
      remark: purchaseForm.remark,
    });
    ElMessage.success("商品入库成功");
    purchaseVisible.value = false;
    refreshInventory();
  } finally {
    purchaseLoading.value = false;
  }
};

onMounted(() => {
  queryParams.page = 1;
  queryParams.pageSize = 100;
  refreshInventory();
});
</script>

<template>
  <div class="inventory-page">
    <section class="inventory-header">
      <div>
        <h1>库存预警</h1>
        <p>关注低于补货阈值的商品，优先处理会影响销售的库存。</p>
      </div>
      <div class="header-actions">
        <el-button type="success" :icon="Plus" @click="openPurchaseDialog">
          购入商品
        </el-button>
        <el-button type="primary" :icon="Refresh" @click="refreshInventory">
          刷新库存
        </el-button>
      </div>
    </section>

    <section class="summary-grid">
      <article class="summary-card danger">
        <el-icon><Warning /></el-icon>
        <div>
          <span>低库存商品</span>
          <strong>{{ lowStockProducts.length }}</strong>
        </div>
      </article>
      <article class="summary-card">
        <span>库存正常商品</span>
        <strong>{{ normalProducts }}</strong>
      </article>
    </section>

    <el-card shadow="never">
      <template #header>
        <div class="section-title">低库存预警</div>
      </template>

      <el-table
        v-loading="loading"
        :data="lowStockProducts"
        border
        element-loading-text="正在检查库存..."
      >
        <el-table-column label="商品" min-width="220">
          <template #default="{ row }">
            <div class="product-cell">
              <strong>{{ row.name }}</strong>
              <span>{{ categoryLabel(row) }} · {{ row.origin }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="当前库存" width="120">
          <template #default="{ row }">
            <el-tag type="danger">{{ row.stock }} 件</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lowStockThreshold" label="预警阈值" width="120" />
        <el-table-column label="建议" min-width="180">
          <template #default="{ row }">
            建议补货 {{ Math.max(row.lowStockThreshold * 2 - row.stock, 1) }} 件
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="never" class="log-card">
      <template #header>
        <div class="section-title">最近库存流水</div>
      </template>

      <el-table
        v-loading="logLoading"
        :data="inventoryLogs"
        border
        element-loading-text="正在加载库存流水..."
      >
        <el-table-column prop="productName" label="商品" min-width="220" />
        <el-table-column label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="logTypeMap[row.type as InventoryLogType].type" effect="plain">
              {{ logTypeMap[row.type as InventoryLogType].label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="变化" width="100" align="center">
          <template #default="{ row }">
            <strong :class="row.change > 0 ? 'positive' : 'negative'">
              {{ formatChange(row.change) }}
            </strong>
          </template>
        </el-table-column>
        <el-table-column label="库存" width="140" align="center">
          <template #default="{ row }">
            {{ row.beforeStock }} → {{ row.afterStock }}
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="原因" min-width="190" />
        <el-table-column prop="operator" label="操作人" width="110" />
        <el-table-column prop="createTime" label="时间" min-width="170" />
      </el-table>
    </el-card>

    <el-dialog
      v-model="purchaseVisible"
      title="购入商品"
      width="520px"
      @closed="resetPurchaseForm"
    >
      <el-form
        ref="purchaseFormRef"
        :model="purchaseForm"
        :rules="purchaseRules"
        label-width="92px"
      >
        <el-form-item label="商品" prop="productId">
          <el-select
            v-model="purchaseForm.productId"
            filterable
            placeholder="请选择要入库的商品"
            style="width: 100%"
          >
            <el-option
              v-for="product in tableData"
              :key="product.id"
              :label="`${product.name} / 当前库存 ${product.stock}`"
              :value="product.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="购入数量" prop="count">
          <el-input-number
            v-model="purchaseForm.count"
            :min="1"
            :max="9999"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="purchaseForm.remark"
            type="textarea"
            :rows="3"
            placeholder="例如 供应商到货、门店补货、盘点补录"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="purchaseVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="purchaseLoading"
          @click="handlePurchaseSubmit"
        >
          确认入库
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.inventory-page {
  padding: 20px;
}

.inventory-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.inventory-header h1 {
  margin: 0;
  color: #111827;
  font-size: 26px;
}

.inventory-header p {
  margin: 8px 0 0;
  color: #6b7280;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 220px));
  gap: 14px;
  margin-bottom: 18px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.summary-card span {
  display: block;
  margin-bottom: 6px;
  color: #6b7280;
}

.summary-card strong {
  color: #111827;
  font-size: 26px;
}

.summary-card.danger .el-icon {
  color: #f56c6c;
}

.section-title {
  color: #111827;
  font-weight: 700;
}

.log-card {
  margin-top: 18px;
}

.positive {
  color: #67c23a;
}

.negative {
  color: #f56c6c;
}

.product-cell {
  display: grid;
  gap: 4px;
}

.product-cell span {
  color: #909399;
  font-size: 13px;
}

@media (max-width: 760px) {
  .inventory-header {
    align-items: stretch;
    flex-direction: column;
  }

  .header-actions {
    flex-wrap: wrap;
  }
}
</style>
