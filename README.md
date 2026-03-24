# Church App & Website Builder — Admin Panel

A production-ready, multi-tenant Church administration platform with a NestJS backend API and React admin dashboard.

## Architecture

```
church-admin-api/   — NestJS REST API (TypeORM, JWT Auth, RBAC)
admin-ui/           — React + Vite admin dashboard (TypeScript)
```

## Features

- **Multi-Tenant** — Every record scoped by `church_id` via JWT middleware
- **Role-Based Access Control** — Super Admin, Church Admin, Editor roles
- **14+ Modules** — Sermons, Events, Donations, Hymns, Radio, Live Stream, Spiritual Library, Media, Categories, Permissions, Dashboard, Public API
- **Content Workflow** — Draft → Published → Scheduled → Archived
- **Soft Delete & Restore** on all entities
- **Rate Limiting** via NestJS Throttler
- **Swagger API Docs** at `/api/docs`

## Quick Start

### Backend API

```bash
cd church-admin-api
cp .env.example .env
npm install
npm run start:dev
# API runs on http://localhost:3000
# Swagger docs at http://localhost:3000/api/docs
```

### Admin Dashboard

```bash
cd admin-ui
npm install
npm run dev
# Dashboard runs on http://localhost:5173
```

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | NestJS, TypeORM, SQLite/PostgreSQL  |
| Frontend  | React 19, Vite, TypeScript          |
| Auth      | JWT (access + refresh tokens)       |
| Styling   | Custom CSS (Appy Pie design system) |

## Database

- **Local dev**: SQLite (zero config, `better-sqlite3`)
- **Production**: PostgreSQL (set `DB_TYPE=postgres` in `.env`)

## API Endpoints

All endpoints prefixed with `/api/v1/`:

| Module            | Endpoint                    |
|-------------------|-----------------------------|
| Auth              | `/api/v1/auth/*`            |
| Church            | `/api/v1/churches/*`        |
| Users             | `/api/v1/users/*`           |
| Sermons           | `/api/v1/sermons/*`         |
| Events            | `/api/v1/events/*`          |
| Donations         | `/api/v1/donations/*`       |
| Hymns             | `/api/v1/hymns/*`           |
| Radio             | `/api/v1/radio/*`           |
| Live Stream       | `/api/v1/live-streams/*`    |
| Spiritual Library | `/api/v1/spiritual-library/*`|
| Media             | `/api/v1/media/*`           |
| Categories        | `/api/v1/categories/*`      |
| Dashboard         | `/api/v1/dashboard/*`       |
| Public            | `/api/v1/public/*`          |

## License

Proprietary — Appy Pie LLP
