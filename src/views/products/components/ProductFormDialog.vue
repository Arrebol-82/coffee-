<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";
import { createProduct, updateProduct } from "@/api/products";
import type { Product, ProductCreateDTO } from "@/types/product";

const props = defineProps<{
  modelValue: boolean;
  mode: "create" | "edit";
  currentId?: number;
  initialData?: Product;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const formRef = ref<FormInstance>();
const loading = ref(false);

const defaultForm = (): ProductCreateDTO => ({
  name: "",
  price: 2800,
  stock: 20,
  status: "on_sale",
  category: "beans",
  origin: "",
  roastLevel: "medium",
  description: "",
  recommended: false,
  lowStockThreshold: 12,
});

const form = reactive<ProductCreateDTO>(defaultForm());

const rules = reactive<FormRules<ProductCreateDTO>>({
  name: [{ required: true, message: "请输入商品名称", trigger: "blur" }],
  price: [{ required: true, message: "请输入价格", trigger: "blur" }],
  stock: [{ required: true, message: "请输入库存", trigger: "blur" }],
  category: [{ required: true, message: "请选择分类", trigger: "change" }],
  origin: [{ required: true, message: "请输入产地", trigger: "blur" }],
  roastLevel: [{ required: true, message: "请选择烘焙度", trigger: "change" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
});

const assignForm = (data: ProductCreateDTO) => {
  Object.assign(form, data);
};

const resetForm = () => {
  formRef.value?.clearValidate();
  assignForm(defaultForm());
};

watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal) return;

    if (props.mode === "edit" && props.initialData) {
      const { id, createTime, ...rest } = props.initialData;
      assignForm(rest);
    } else {
      resetForm();
    }
  }
);

const buildPayload = (): ProductCreateDTO => ({
  name: form.name,
  price: form.price,
  stock: form.stock,
  status: form.status,
  category: form.category,
  origin: form.origin,
  roastLevel: form.roastLevel,
  description: form.description,
  recommended: form.recommended,
  lowStockThreshold: form.lowStockThreshold,
});

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
  } catch {
    return;
  }

  loading.value = true;
  try {
    const payload = buildPayload();

    if (props.mode === "create") {
      await createProduct(payload);
      ElMessage.success("新增成功");
    } else if (props.currentId) {
      await updateProduct(props.currentId, payload);
      ElMessage.success("修改成功");
    }

    visible.value = false;
    emit("success");
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="mode === 'create' ? '新增商品' : '编辑商品'"
    width="680px"
    @closed="resetForm"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
      <el-form-item label="商品名称" prop="name">
        <el-input v-model="form.name" placeholder="例如 埃塞俄比亚耶加雪菲" />
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="分类" prop="category">
            <el-select v-model="form.category" style="width: 100%">
              <el-option label="手冲豆" value="beans" />
              <el-option label="意式豆" value="espresso" />
              <el-option label="挂耳咖啡" value="drip_bag" />
              <el-option label="即饮咖啡" value="instant" />
              <el-option label="咖啡器具" value="gear" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status" style="width: 100%">
              <el-option label="在售" value="on_sale" />
              <el-option label="售罄" value="sold_out" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="价格(分)" prop="price">
            <el-input-number
              v-model="form.price"
              :min="0"
              :step="100"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="库存" prop="stock">
            <el-input-number v-model="form.stock" :min="0" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="产地" prop="origin">
            <el-input v-model="form.origin" placeholder="例如 埃塞俄比亚" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="烘焙度" prop="roastLevel">
            <el-select v-model="form.roastLevel" style="width: 100%">
              <el-option label="浅烘" value="light" />
              <el-option label="中烘" value="medium" />
              <el-option label="深烘" value="dark" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="低库存阈值">
            <el-input-number
              v-model="form.lowStockThreshold"
              :min="1"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="推荐商品">
            <el-switch v-model="form.recommended" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="商品描述">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="记录风味、适用场景或门店备注"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        保存
      </el-button>
    </template>
  </el-dialog>
</template>
