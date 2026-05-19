<script setup lang="ts">
import { useRouter } from "vue-router";
import Sidebar from "@/components/Sidebar.vue";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const router = useRouter();

function backToOrder() {
  router.push("/order");
}

function logout() {
  authStore.logout();
  router.replace("/");
}
</script>

<template>
  <el-container class="admin-layout">
    <Sidebar />
    <el-container>
      <el-header class="admin-header">
        <div class="header-content">
          <span>当前身份：{{ authStore.userRole }}</span>
          <div class="header-actions">
            <el-button class="order-return-btn" size="small" @click="backToOrder">
              返回下单页面
            </el-button>
            <el-button type="danger" size="small" @click="logout">
              退出登录
            </el-button>
          </div>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.admin-layout {
  height: 100vh;
}

.admin-header {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-bottom: 1px solid #e6e8eb;
  color: #333;
  height: 60px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.order-return-btn {
  border: none;
  background: linear-gradient(135deg, #d4af37 0%, #ffd700 100%);
  color: #1a1a2e;
  font-weight: 800;
  box-shadow: 0 8px 22px rgba(212, 175, 55, 0.22);
}

.order-return-btn:hover,
.order-return-btn:focus {
  color: #1a1a2e;
  transform: translateY(-1px);
  box-shadow: 0 10px 28px rgba(212, 175, 55, 0.32);
}

.el-main {
  padding: 0;
  background: #f3f5f8;
  overflow-y: auto;
  height: calc(100vh - 60px);
}
</style>
