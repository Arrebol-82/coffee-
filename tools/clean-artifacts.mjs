import { rm, stat } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

const generatedDirs = [
  "dist",
  "dist-check",
  "dist-dashboard-click-check",
  "dist-empty-order-management-check",
  "dist-finance-check",
  "dist-inventory-check",
  "dist-login-check",
  "dist-no-refresh-check",
  "dist-order-bg-check",
  "dist-order-bg-same-check",
  "dist-order-check",
  "dist-order-edit-check",
  "dist-order-management-check",
  "dist-payment-check",
  "dist-pickup-check",
  "dist-product-check",
  "dist-purchase-check",
  "dist-refresh-check",
  "dist-release",
  "dist-rollback-check",
  "dist-supabase-check",
  "dist-supabase-final-check",
  "dist-supabase-migration-check",
  "dist-supabase-run-check",
];

for (const target of generatedDirs) {
  const fullPath = resolve(root, target);

  if (!fullPath.startsWith(root)) {
    throw new Error(`Refusing to remove path outside project: ${target}`);
  }

  try {
    const info = await stat(fullPath);
    if (!info.isDirectory()) continue;
    await rm(fullPath, { recursive: true, force: true });
    console.log(`removed ${target}`);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}
