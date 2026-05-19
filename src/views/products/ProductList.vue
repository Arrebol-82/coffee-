<script lang="ts" setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { Delete, Edit, Plus, Refresh, Search } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { deleteProduct, getProductList } from "@/api/products";
import { useTable } from "@/composables/useTable";
import { useAuthStore } from "@/stores/auth";
import type { Product } from "@/types/product";
import {
  PRODUCT_CATEGORY_LABEL,
  ROAST_LEVEL_LABEL,
} from "@/types/product";
import ProductFormDialog from "./components/ProductFormDialog.vue";

const authStore = useAuthStore();
const route = useRoute();

const {
  loading,
  tableData,
  total,
  queryParams,
  loadData,
  handleSearch,
} = useTable<Product>(getProductList);

const dialogVisible = ref(false);
const dialogMode = ref<"create" | "edit">("create");
const currentRow = ref<Product | undefined>();

const formatMoney = (price: number) => `¥${(price / 100).toFixed(2)}`;

const categoryLabel = (row: Product) => PRODUCT_CATEGORY_LABEL[row.category];

const roastLabel = (row: Product) => ROAST_LEVEL_LABEL[row.roastLevel];

const handleCreate = () => {
  dialogMode.value = "create";
  currentRow.value = undefined;
  dialogVisible.value = true;
};

const handleEdit = (row: Product) => {
  dialogMode.value = "edit";
  currentRow.value = row;
  dialogVisible.value = true;
};

const handleFormSuccess = () => {
  if (dialogMode.value === "create") {
    queryParams.page = 1;
  }
  loadData();
};

const handleReset = () => {
  queryParams.keyword = "";
  queryParams.status = "";
  queryParams.category = "";
  handleSearch();
};

const handleDelete = async (row: Product) => {
  try {
    await ElMessageBox.confirm(`确定要删除商品「${row.name}」吗？`, "删除确认", {
      confirmButtonText: "删除",
      cancelButtonText: "取消",
      type: "warning",
    });

    await deleteProduct(row.id);
    ElMessage.success("删除成功");

    if (tableData.value.length === 1 && queryParams.page > 1) {
      queryParams.page--;
    }
    loadData();
  } catch (error) {
    if (error !== "cancel") console.error(error);
  }
};

watch(
  () => route.query,
  (query) => {
    queryParams.keyword = String(query.keyword || "");
    queryParams.status = String(query.status || "");
    queryParams.category = String(query.category || "");
    handleSearch();
  },
  { immediate: true }
);
</script>

<template>
  <div class="product-page">
    <el-card shadow="never">
      <div class="page-toolbar">
        <div class="filters">
          <el-input
            v-model="queryParams.keyword"
            placeholder="搜索商品、产地或描述"
            clearable
            class="filter-input"
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <el-select
            v-model="queryParams.status"
            placeholder="状态"
            clearable
            class="filter-select"
            @change="handleSearch"
          >
            <el-option label="在售" value="on_sale" />
            <el-option label="售罄" value="sold_out" />
          </el-select>

          <el-select
            v-model="queryParams.category"
            placeholder="分类"
            clearable
            class="filter-select"
            @change="handleSearch"
          >
            <el-option label="手冲豆" value="beans" />
            <el-option label="意式豆" value="espresso" />
            <el-option label="挂耳咖啡" value="drip_bag" />
            <el-option label="即饮咖啡" value="instant" />
            <el-option label="咖啡器具" value="gear" />
          </el-select>

          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </div>

        <el-button
          v-if="authStore.hasPerm('product:create')"
          type="primary"
          :icon="Plus"
          @click="handleCreate"
        >
          新增商品
        </el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        class="product-table"
        element-loading-text="正在加载商品..."
        style="width: 100%; margin-top: 18px"
      >
        <el-table-column label="商品" min-width="260">
          <template #default="{ row }">
            <div class="product-cell">
              <strong>{{ row.name }}</strong>
              <span>{{ row.origin }} · {{ roastLabel(row) }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="分类" width="110">
          <template #default="{ row }">
            {{ categoryLabel(row) }}
          </template>
        </el-table-column>

        <el-table-column label="价格" width="110">
          <template #default="{ row }">
            <strong class="price">{{ formatMoney(row.price) }}</strong>
          </template>
        </el-table-column>

        <el-table-column label="库存" width="120" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.stock <= row.lowStockThreshold ? 'danger' : 'success'"
              effect="plain"
            >
              {{ row.stock }} 件
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'on_sale' ? 'success' : 'info'">
              {{ row.status === "on_sale" ? "在售" : "售罄" }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="推荐" width="90" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.recommended" type="warning" effect="plain">
              推荐
            </el-tag>
            <span v-else class="muted">否</span>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" min-width="170" />

        <el-table-column label="操作" width="150" align="center">
          <template #default="{ row }">
            <div class="row-actions">
              <el-button
                v-if="authStore.hasPerm('product:edit')"
                size="small"
                type="primary"
                link
                :icon="Edit"
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                v-if="authStore.hasPerm('product:delete')"
                size="small"
                type="danger"
                link
                :icon="Delete"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 15, 20]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <ProductFormDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :current-id="currentRow?.id"
      :initial-data="currentRow"
      @success="handleFormSuccess"
    />
  </div>
</template>

<style scoped>
.product-page {
  padding: 20px;
}

.page-toolbar,
.filters {
  display: flex;
  align-items: center;
}

.page-toolbar {
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 16px;
}

.filters {
  flex-wrap: wrap;
  gap: 10px;
}

.filter-input {
  width: 240px;
}

.filter-select {
  width: 140px;
}

.product-cell {
  display: grid;
  gap: 4px;
  line-height: 1.45;
  min-width: 0;
}

.product-cell strong,
.product-cell span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-cell span,
.muted {
  color: #909399;
  font-size: 13px;
}

.price {
  color: #f56c6c;
}

.row-actions {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
}

.row-actions :deep(.el-button + .el-button) {
  margin-left: 0;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

@media (max-width: 760px) {
  .page-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .filter-input,
  .filter-select {
    width: 100%;
  }

  .pagination-container {
    justify-content: flex-start;
    overflow-x: auto;
  }
}
</style>
