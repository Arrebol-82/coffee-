<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { type Role } from "@/types/user";

interface MenuItem {
  title: string;
  path: string;
  roles?: string[];
}

const route = useRoute();
const authStore = useAuthStore();

const menuList: MenuItem[] = [
  { title: "仪表盘", path: "/admin/dashboard" },
  { title: "产品管理", path: "/admin/products", roles: ["admin"] },
  { title: "库存预警", path: "/admin/inventory", roles: ["admin", "staff"] },
  { title: "下单管理", path: "/admin/order-management", roles: ["admin", "staff"] },
  { title: "订单管理", path: "/admin/orders", roles: ["admin", "staff"] },
  { title: "财务统计", path: "/admin/finance", roles: ["admin"] },
];

const visibleMenus = computed(() => {
  return menuList.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    return item.roles.some((role) => authStore.roles.includes(role as Role));
  });
});

const activeMenu = computed(() => {
  if (route.path.startsWith("/admin/order-management")) return "/admin/order-management";
  if (route.path.startsWith("/admin/orders")) return "/admin/orders";
  return route.path;
});
</script>

<template>
  <el-aside width="230px" class="sidebar-container">
    <el-menu
      :default-active="activeMenu"
      router
      class="sidebar-menu"
      background-color="#2f3a4a"
      text-color="#e5e7eb"
      active-text-color="#ffd04b"
    >
      <div class="logo-area">
        <h3 class="coffeesys-brand-text">CoffeeSys</h3>
      </div>

      <el-menu-item
        v-for="item in visibleMenus"
        :key="item.path"
        :index="item.path"
      >
        <span>{{ item.title }}</span>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<style scoped>
.sidebar-container {
  height: 100vh;
  background-color: #2f3a4a;
  overflow-y: auto;
}

.sidebar-menu {
  border-right: none;
  height: 100%;
  overflow-y: auto;
}

.logo-area {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  flex-shrink: 0;
}

.logo-area h3 {
  margin: 0;
  font-size: 17px;
}
</style>
