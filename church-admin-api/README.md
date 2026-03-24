# Church Admin Panel — Backend API

Production-ready, multi-tenant NestJS backend for the Church App & Website Builder Admin Panel.

## Tech Stack

- **Runtime:** Node.js + NestJS (TypeScript)
- **Database:** PostgreSQL with TypeORM
- **Cache/Queues:** Redis + BullMQ
- **Auth:** JWT (access + refresh tokens), bcryptjs
- **Storage:** S3-compatible (configurable)
- **Docs:** Swagger/OpenAPI at `/api/docs`

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL, Redis, and S3 credentials

# 3. Build
npm run build

# 4. Run database migration
npm run migration:run

# 5. Seed default data (super admin, sample church, permissions)
npm run seed

# 6. Start development server
npm run start:dev
```

**Default login:** `admin@gracechurch.com` / `Admin@12345`
**API base:** `http://localhost:3000/api/v1`
**Swagger docs:** `http://localhost:3000/api/docs`

## Architecture

### Multi-Tenant Design
Every record is scoped by `church_id`. The `TenantMiddleware` extracts the church context from the JWT token and enforces strict isolation on all queries. Public endpoints are excluded from tenant enforcement.

### Modules (14 feature modules)

| Module | Route Prefix | Description |
|--------|-------------|-------------|
| Auth | `/api/v1/auth` | Login, register, JWT refresh, password management |
| Church | `/api/v1/churches` | Tenant management, onboarding, plan/usage |
| Users | `/api/v1/users` | Church user management, invitations |
| Sermons | `/api/v1/sermons` | Full CRUD + publish/schedule/archive/duplicate |
| Events | `/api/v1/events` | Church events with RSVP, location, virtual support |
| Categories | `/api/v1/categories` | Cross-cutting content categorization (hierarchical) |
| Donations | `/api/v1/donations` | Campaigns + transactions, Stripe/PayPal webhook-ready |
| Spiritual Library | `/api/v1/spiritual-library` | Devotionals, articles, PDFs |
| Hymns | `/api/v1/hymns` | Lyrics, sheet music, audio |
| Radio | `/api/v1/radio` | Stream management, activate/deactivate |
| Live Stream | `/api/v1/live-streams` | YouTube/FB/Vimeo embeds, go-live/end |
| Media | `/api/v1/media` | Central file storage, usage tracking |
| Dashboard | `/api/v1/dashboard` | Analytics, onboarding status, plan usage |
| Public | `/api/v1/public/:churchSlug` | Read-only content API (no auth) |

### Content State Machine
All content modules implement: `draft → published → archived` with optional `scheduled` state. Scheduled content auto-publishes via BullMQ cron job (every minute).

### Roles & Permissions
- **Super Admin** — Platform-level access, manages all churches
- **Church Admin** — Full control of their church's content
- **Editor** — Create/edit content, no delete/publish permissions

Enforced via `@Roles()` and `@RequirePermissions()` decorators with corresponding guards.

## API Response Format

All endpoints return a consistent structure:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

## Key Features

- **Soft Delete + Restore** on all content (no data loss)
- **Duplicate** any sermon, event, or content item
- **Bulk Actions** (publish, archive, delete multiple items)
- **Empty State Detection** (`is_empty` flags + `suggested_action` for onboarding UX)
- **Media Usage Tracking** (prevents deletion of in-use files)
- **Audit Logging** (all create/update/delete actions tracked)
- **Search + Filter + Pagination** on every list endpoint
- **Slug-based URLs** for SEO-ready public content
- **Webhook-ready** donation transaction recording

## Project Structure

```
src/
├── main.ts                          # Bootstrap + Swagger + CORS
├── app.module.ts                    # Root module (all imports + tenant middleware)
├── config/                          # Database, Redis, S3, App configs
├── common/
│   ├── decorators/                  # @CurrentUser, @CurrentChurch, @Roles, @RequirePermissions
│   ├── dto/                         # Pagination, API response DTOs
│   ├── entities/                    # BaseEntity, BaseContentEntity, AuditLog
│   ├── enums/                       # ContentStatus, UserRole, MediaType, etc.
│   ├── filters/                     # Global HTTP exception filter
│   ├── guards/                      # Roles, Permissions, Auth guards
│   ├── interceptors/                # Response wrapper, Audit trail
│   ├── middleware/                   # TenantMiddleware
│   ├── pipes/                       # Validation pipe
│   ├── services/                    # AuditLogger service
│   └── utils/                       # Slug generation
├── modules/
│   ├── auth/                        # JWT auth, strategies, guards
│   ├── church/                      # Tenant CRUD, onboarding, plans
│   ├── users/                       # Church user management
│   ├── sermons/                     # Sermon CRUD + state management
│   ├── events/                      # Event CRUD + RSVP
│   ├── categories/                  # Hierarchical categories
│   ├── donations/                   # Campaigns + transactions
│   ├── spiritual-library/           # Articles, devotionals
│   ├── hymns/                       # Lyrics + sheet music
│   ├── radio/                       # Stream management
│   ├── live-stream/                 # Live streaming
│   ├── media/                       # File upload + usage tracking
│   ├── dashboard/                   # Analytics aggregation
│   ├── public/                      # Read-only public API
│   └── permissions/                 # RBAC permission management
├── jobs/                            # BullMQ processors (scheduled publish, media cleanup)
└── database/
    ├── migrations/                  # Full PostgreSQL schema (21 tables)
    └── seeds/                       # Default data seeder
```

## Database Schema (21 tables)

`churches`, `users`, `refresh_tokens`, `permissions`, `categories`, `sermons`, `sermon_categories`, `events`, `event_categories`, `donation_campaigns`, `donation_transactions`, `spiritual_resources`, `spiritual_resource_categories`, `hymns`, `hymn_categories`, `radio_stations`, `live_streams`, `media`, `media_usages`, `audit_logs`, `user_profiles`

## npm Scripts

```bash
npm run start:dev      # Development with hot reload
npm run start:prod     # Production mode
npm run build          # Compile TypeScript
npm run migration:run  # Run database migrations
npm run seed           # Seed default data
```

## Environment Variables

See `.env.example` for the complete list. Key variables:

- `DATABASE_*` — PostgreSQL connection
- `REDIS_*` — Redis connection for BullMQ
- `JWT_SECRET` / `JWT_EXPIRATION` — Auth tokens
- `AWS_S3_*` — Media storage
- `STRIPE_*` / `PAYPAL_*` — Payment providers (stub-ready)
