# BrewMaster Admin Project Structure

This repository is a Vue 3 + TypeScript + Vite admin application for a coffee shop workflow.

## Active Project

Only the root-level application files are used by the current Vite config:

```text
.
|-- src/                  # Active application source
|-- public/               # Static assets served by Vite
|-- supabase/             # Database schema and seed SQL
|-- tools/                # Local maintenance scripts
|-- index.html            # Vite HTML entry
|-- vite.config.ts        # Vite config, @ -> src
|-- tsconfig*.json        # TypeScript configs
|-- package.json          # Scripts and dependencies
`-- README.md             # Project overview
```

## Source Layout

```text
src/
|-- api/                  # Frontend API facade
|-- assets/               # Static assets imported by source
|-- components/           # Shared Vue components
|-- composables/          # Reusable Composition API helpers
|-- constants/            # Shared constants and label maps
|-- layouts/              # Route layout components
|-- lib/                  # Third-party client setup, e.g. Supabase
|-- mocks/                # MSW mock handlers and mock data modules
|-- router/               # Vue Router routes and guards
|-- services/             # Supabase-backed business services
|-- stores/               # Pinia stores
|-- types/                # Shared TypeScript types
|-- utils/                # Small runtime utilities
|-- views/                # Route-level pages
|-- App.vue
|-- main.ts
`-- style.css
```

## Important Notes

- `src/` is the only source directory referenced by `vite.config.ts` and `tsconfig.app.json`.
- `dist/` and `dist-*` are generated build/check artifacts. They are ignored by Git and can be regenerated.

## Maintenance Commands

```bash
npm run dev       # Start development server
npm run build     # Type-check and build production assets
npm run preview   # Preview the production build
npm run clean     # Remove generated dist and dist-* folders
```
