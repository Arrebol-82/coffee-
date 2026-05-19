# API

The `api/` layer is the frontend-facing data facade. Views call these modules instead of reaching into services or mock data directly.

| File | Purpose |
| --- | --- |
| `dashboard.ts` | Dashboard summary API |
| `orders.ts` | Order list, detail, mutation, and realtime helpers |
| `products.ts` | Product, inventory, and purchase APIs |
