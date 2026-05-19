<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { CoffeeCup, Lock, User } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const formRef = ref();

const form = reactive({
  username: "admin",
  password: "123",
});

const rules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
};

const handleLogin = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    loading.value = true;
    try {
      await authStore.login(form);
      ElMessage.success("登录成功，欢迎回来");
      router.push("/admin/dashboard");
    } finally {
      loading.value = false;
    }
  });
};
</script>

<template>
  <main class="login-container">
    <section class="login-shell">
      <div class="brand-panel">
        <div class="brand-mark">
          <el-icon><CoffeeCup /></el-icon>
        </div>
        <p class="eyebrow">CoffeeSys Admin</p>
        <h1 class="coffeesys-brand-text">CoffeeSys</h1>
        <p class="brand-copy">
          用一杯咖啡的时间，查看订单、库存、商品和财务表现。
        </p>

        <div class="brand-stats">
          <div>
            <strong>98%</strong>
            <span>库存预警覆盖</span>
          </div>
          <div>
            <strong>24h</strong>
            <span>订单持续跟踪</span>
          </div>
        </div>
      </div>

      <el-card class="login-card" shadow="never">
        <div class="form-heading">
          <span>欢迎回来</span>
          <h2>登录控制台</h2>
          <p>使用管理员或店员账号进入系统。</p>
        </div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="0"
          class="login-form"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="用户名：admin 或 staff"
              :prefix-icon="User"
              size="large"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="密码任意填写"
              :prefix-icon="Lock"
              size="large"
              show-password
            />
          </el-form-item>

          <div class="login-options">
            <el-checkbox>记住登录状态</el-checkbox>
            <span>演示环境</span>
          </div>

          <el-form-item>
            <el-button
              type="primary"
              :loading="loading"
              class="login-btn"
              size="large"
              @click="handleLogin"
            >
              立即登录
            </el-button>
          </el-form-item>
        </el-form>

        <div class="demo-tips">
          <span>默认账号</span>
          <strong>admin / 123</strong>
          <strong>staff / 123</strong>
        </div>
      </el-card>
    </section>
  </main>
</template>

<style scoped>
.login-container {
  display: grid;
  place-items: center;
  min-height: 100vh;
  padding: 32px;
  color: #241812;
}

.login-shell {
  display: grid;
  grid-template-columns: minmax(280px, 0.9fr) minmax(360px, 440px);
  width: min(980px, 100%);
  min-height: 560px;
  overflow: hidden;
  border: 1px solid rgba(125, 82, 48, 0.16);
  border-radius: 8px;
  background: rgba(255, 252, 247, 0.72);
  box-shadow: 0 24px 70px rgba(75, 46, 28, 0.16);
  backdrop-filter: blur(18px);
}

.brand-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 16px;
  min-height: 100%;
  padding: 42px;
  overflow: hidden;
  color: #fff;
  background:
    linear-gradient(145deg, rgba(62, 35, 22, 0.94), rgba(126, 79, 43, 0.82)),
    radial-gradient(circle at 24% 22%, rgba(255, 214, 154, 0.45), transparent 34%);
}

.brand-panel::before {
  position: absolute;
  top: 58px;
  right: 42px;
  width: 150px;
  height: 150px;
  content: "";
  border: 1px solid rgba(255, 236, 205, 0.36);
  border-radius: 50%;
}

.brand-panel::after {
  position: absolute;
  right: -70px;
  bottom: -70px;
  width: 230px;
  height: 230px;
  content: "";
  border-radius: 50%;
  background: rgba(255, 213, 156, 0.18);
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  color: #5b3522;
  background: #ffe3b8;
  border-radius: 8px;
  box-shadow: 0 18px 36px rgba(40, 21, 12, 0.24);
}

.brand-mark .el-icon {
  font-size: 30px;
}

.eyebrow {
  margin: 12px 0 0;
  color: rgba(255, 234, 206, 0.86);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.brand-panel h1 {
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: 38px;
  line-height: 1.12;
}

.brand-copy {
  position: relative;
  z-index: 1;
  max-width: 360px;
  margin: 0;
  color: rgba(255, 244, 229, 0.84);
  font-size: 15px;
  line-height: 1.8;
}

.brand-stats {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.brand-stats div {
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
}

.brand-stats strong,
.brand-stats span {
  display: block;
}

.brand-stats strong {
  margin-bottom: 4px;
  font-size: 22px;
}

.brand-stats span {
  color: rgba(255, 244, 229, 0.74);
  font-size: 12px;
}

.login-card {
  display: flex;
  align-items: center;
  border: none;
  border-radius: 0;
  background: rgba(255, 255, 255, 0.88);
}

.login-card :deep(.el-card__body) {
  width: 100%;
  padding: 46px;
}

.form-heading {
  margin-bottom: 28px;
}

.form-heading span {
  color: #9a6536;
  font-size: 13px;
  font-weight: 700;
}

.form-heading h2 {
  margin: 8px 0 8px;
  color: #21160f;
  font-size: 28px;
}

.form-heading p {
  margin: 0;
  color: #7a6b61;
  font-size: 14px;
}

.login-form {
  display: grid;
  gap: 4px;
}

.login-form :deep(.el-input__wrapper) {
  min-height: 46px;
  border-radius: 8px;
  box-shadow: 0 0 0 1px rgba(125, 82, 48, 0.15) inset;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow:
    0 0 0 1px #a66d3f inset,
    0 0 0 4px rgba(166, 109, 63, 0.12);
}

.login-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 2px 0 16px;
  color: #8a7b71;
  font-size: 13px;
}

.login-btn {
  width: 100%;
  min-height: 46px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #6f4128, #b1743d);
  box-shadow: 0 14px 28px rgba(133, 82, 42, 0.22);
  font-weight: 700;
}

.login-btn:hover,
.login-btn:focus {
  background: linear-gradient(135deg, #5e3522, #9f6334);
}

.demo-tips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  color: #806f64;
  font-size: 12px;
}

.demo-tips strong {
  padding: 5px 9px;
  color: #5b3522;
  border: 1px solid rgba(125, 82, 48, 0.18);
  border-radius: 999px;
  background: rgba(251, 241, 226, 0.9);
  font-weight: 600;
}

@media (max-width: 820px) {
  .login-container {
    padding: 18px;
  }

  .login-shell {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .brand-panel {
    min-height: 280px;
    padding: 30px;
  }

  .brand-panel h1 {
    font-size: 32px;
  }

  .login-card :deep(.el-card__body) {
    padding: 30px;
  }
}

@media (max-width: 520px) {
  .brand-stats {
    grid-template-columns: 1fr;
  }

  .login-options {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
