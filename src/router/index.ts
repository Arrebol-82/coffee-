import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import { ElMessage } from "element-plus";
import { tokenStorage } from "@/utils/storage";
import { useAuthStore } from "@/stores/auth";
import { type Role } from "@/types/user";

const appTitle = "CoffeeSys";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/Home.vue"),
    meta: { title: appTitle },
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login.vue"),
    meta: { title: appTitle },
  },
  {
    path: "/order",
    name: "MiniOrder",
    component: () => import("@/views/mini-order/MiniOrder.vue"),
    meta: { title: appTitle, public: true },
  },
  {
    path: "/order/pickup/:id",
    name: "PickupNumber",
    component: () => import("@/views/mini-order/PickupNumber.vue"),
    meta: { title: appTitle, public: true },
  },
  {
    path: "/admin",
    redirect: "/admin/dashboard",
    component: () => import("@/layouts/AdminLayout.vue"),
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("@/views/Dashboard.vue"),
        meta: { title: appTitle },
      },
      {
        path: "products",
        name: "Products",
        component: () => import("@/views/products/ProductList.vue"),
        meta: { title: appTitle, roles: ["admin"] },
      },
      {
        path: "inventory",
        name: "Inventory",
        component: () => import("@/views/products/InventoryAlert.vue"),
        meta: { title: appTitle, roles: ["admin", "staff"] },
      },
      {
        path: "order-management",
        name: "OrderManagement",
        component: () => import("@/views/order-management/OrderManagement.vue"),
        meta: { title: appTitle, roles: ["admin", "staff"] },
      },
      {
        path: "orders",
        name: "Orders",
        component: () => import("@/views/orders/admin/OrderList.vue"),
        meta: { title: appTitle, roles: ["admin", "staff"] },
      },
      {
        path: "orders/create",
        name: "OrderCreate",
        component: () => import("@/views/orders/admin/OrderCreate.vue"),
        meta: { title: appTitle, roles: ["admin"] },
      },
      {
        path: "orders/:id/edit",
        name: "OrderEdit",
        component: () => import("@/views/orders/admin/OrderCreate.vue"),
        meta: { title: appTitle, roles: ["admin"] },
      },
      {
        path: "orders/:id",
        name: "OrderDetail",
        component: () => import("@/views/orders/admin/OrderDetail.vue"),
        meta: { title: appTitle, roles: ["admin", "staff"] },
      },
      {
        path: "finance",
        name: "Finance",
        component: () => import("@/views/finance/FinanceDashboard.vue"),
        meta: { title: appTitle, roles: ["admin"] },
      },
    ],
  },
  {
    path: "/403",
    name: "Forbidden",
    component: () => import("@/views/error/Forbidden.vue"),
    meta: { title: appTitle },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/error/NotFound.vue"),
    meta: { title: appTitle },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const whiteList = ["/", "/login", "/order", "/403"];

router.beforeEach(async (to, from, next) => {
  const token = tokenStorage.get();
  const authStore = useAuthStore();
  const isPublicRoute = whiteList.includes(to.path) || to.name === "NotFound" || to.meta.public;

  if (!token) {
    if (isPublicRoute) {
      next();
      return;
    }

    next("/login");
    return;
  }

  if (to.path === "/login") {
    next("/admin/dashboard");
    return;
  }

  if (!authStore.user) {
    try {
      await authStore.fetchUser();
    } catch (error) {
      console.error("用户信息获取失败:", error);
      ElMessage.error("身份已过期，请重新登录");
      authStore.logout();
      next("/");
      return;
    }
  }

  const requiredRoles = to.meta.roles as string[] | undefined;

  if (
    requiredRoles &&
    !requiredRoles.some((role) => authStore.roles.includes(role as Role))
  ) {
    next("/403");
    return;
  }

  next();
});

router.afterEach((to) => {
  document.title = (to.meta.title as string) || appTitle;
});

export default router;
