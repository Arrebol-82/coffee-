# BrewMaster Admin

Vue 3 + TypeScript + Vite + Element Plus coffee shop admin system.

## Features

- Role-based login flow for Admin and Staff users
- Product CRUD and inventory alert views
- Order list, order detail, order creation, and live order management
- Finance dashboard
- MSW mock API for local development
- Optional Supabase-backed services when environment variables are configured

## Quick Start

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173/`.

## Mock Accounts

| Role | Username | Password |
| --- | --- | --- |
| Admin | `admin` | `123456` |
| Staff | `staff` | `123456` |

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Type-check and build production assets
npm run preview   # Preview production build
npm run clean     # Remove generated dist and dist-* folders
```

## Structure

The active application lives in `src/`. See `PROJECT_STRUCTURE.md` for the full structure and cleanup notes.
