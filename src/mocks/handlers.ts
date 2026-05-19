import { authHandlers } from "./modules/auth";
import { productHandlers } from "./modules/product";
import { orderHandlers } from "./modules/order";
import { dashboardHandlers } from "./modules/dashboard";

export const handlers = [
  ...authHandlers,
  ...productHandlers,
  ...orderHandlers,
  ...dashboardHandlers,
];
