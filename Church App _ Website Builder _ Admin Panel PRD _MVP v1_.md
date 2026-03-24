# Church App & Website Builder — Admin Panel PRD (MVP v1)

### TL;DR

Most church platforms fail to provide a non-technical, all-in-one admin tool that centralizes and structures church content for seamless syndication. This PRD defines the MVP Admin Panel for a Church App & Website Builder, empowering everyday church admins to manage sermons, events, media, donations, live streams, and more—serving as the single content engine for a future cross-platform app and website.

---

## Goals

### Business Goals

* Convert high-traffic landing page visitors into active church users by launching a robust MVP within 60 days.

* Establish recurring SaaS revenue via a scalable, multi-tenant architecture.

* Position the platform as the leading church-specific builder—offering more value than generic tools by capturing the unique needs of churches.

* Achieve 100 church onboardings within the first 90 days post-launch.

* Keep churn rate under 5% monthly by delivering core value quickly.

### User Goals

* Church admins can fully manage sermons, events, donations, and content without developer or IT involvement.

* Church leadership gains real-time visibility into audience engagement, donation flows, and event analytics.

* Content created in admin only once, but instantly available on both the future app and website.

* Admin interface stays easy and unintimidating, supporting non-technical users with progressive guidance.

### Non-Goals

* The phase 2 end-user mobile app and public website (consumption layers) are out of scope for this MVP.

* No embedded code editor or advanced white-label reseller portal included.

* No internationalization or multi-currency support in MVP (multi-language flags only).

---

## User Stories

**Personas**

* **Church Admin (Primary User)**

* **Church Leadership/Pastor (Secondary User)**

* **Super Admin (Platform Operator)**

### Church Admin

* As a Church Admin, I want to upload sermon videos and notes, so that my congregation can access them on Sunday afternoon.

* As a Church Admin, I want to create and schedule upcoming events, so members always know what's happening.

* As a Church Admin, I want to set up a donation campaign and track giving, so I don’t need a separate tool for fundraising.

* As a Church Admin, I want to associate sermons and events with categories (e.g., Youth, Adult, Missions) so content is automatically organized.

* As a Church Admin, I want to reuse my uploaded images and documents, so I can quickly assemble new content.

### Church Leadership/Pastor

* As a Church Leader, I want to view dashboard analytics of sermon views and donations, so I can measure congregation engagement.

* As a Church Leader, I want to filter and review past events and campaigns, so I can plan outreach more effectively.

* As a Church Leader, I want to see which categories (e.g., Small Groups) have the most engagement, so I can focus on high-impact ministries.

* As a Church Leader, I want to receive notifications on key activities (like new donations or live stream activity), so I'm always in the loop.

### Super Admin (Platform Operator)

* As a Super Admin, I want to onboard a new church tenant, so I can grow the platform efficiently.

* As a Super Admin, I want to set and enforce plan limits per church (e.g., max sermons for free plan), so I can drive upgrades.

* As a Super Admin, I want to manage user permissions within each church, so I can help resolve admin issues quickly.

* As a Super Admin, I want basic oversight of uploaded content for compliance (e.g., DMCA checks), so platform risk is minimized.

* As a Super Admin, I want to track church-level analytics for business reporting.

---

## System Thinking: Admin as Content Engine

Every module is a structured content source exposing data via REST and GraphQL APIs, designed to render directly in both future mobile apps and websites.

### Module-to-Screen Mapping Table

### Content Relationship Highlights

* **Sermons:** Linked to categories, one or more media objects (audio/video), and an optional speaker.

* **Events:** Associated with categories, and can attach flyers/images from Media Library.

* **Donations:** May relate to ongoing campaigns or events (like a fundraising dinner).

* **Hymns:** Grouped by category (e.g., Christmas, Baptism), optionally with sheet music/media.

* **All media** is centrally managed and referenced by sermons, events, spiritual library, and more.

---

## Functional Requirements

### Dashboard (Priority: Highest)

* **Purpose:** Central activity view—analytics snapshot, recent content, upgrade prompts.

* **Content Fields:** Recent sermons/events, analytics (views, donations), plan status, quick links.

* **Workflows:** On login, overview of engagement, alerts (low storage/plan limits), drill down to modules.

* **Publishing:** N/A (reads from other modules).

* **Visibility Controls:** Dashboard tailored per role (admin, leader, super admin).

* **Dependencies:** Aggregated data from all content engines.

### Sermons (Priority: Highest)

* **Purpose:** Core module for sermon management.

* **Content Fields:** Title, date/time, speaker, description, media upload (audio/video), categories, featured image, tags, status (draft/published/scheduled), SEO meta.

* **Admin Workflow:** Add → fill fields → attach media → select categories → preview → save, publish, or schedule.

* **Publishing Logic:** Draft, published, scheduled; visibility (public/private).

* **Relationships:** Media Library, Categories, Speakers.

* **App Mapping:** Appears as sermons archive/detail.

* **Edge Cases:** Missing media, duplicate titles, scheduling conflicts.

### Events (Priority: High)

* **Purpose:** Manage all church events.

* **Content Fields:** Title, datetime, location, description, categories, flyer (media), RSVP toggle, status, SEO meta.

* **Workflow:** Add → fill details → attach flyer/media → select category → save/publish/schedule.

* **Publishing:** Draft, scheduled, published; visibility controls.

* **Relationships:** Media Library, Categories.

* **App Mapping:** Event list/calendar/detail.

### Categories (Priority: Core, Cross-cutting)

* **Purpose:** Structure content for easy discovery.

* **Fields:** Name, description, color/icon, visibility.

* **Workflow:** Create/edit/delete, assign to modules.

* **Publishing Logic:** Immediate effect (used for organizing).

* **Relationships:** Linked to sermons, events, hymns, media, spiritual library.

* **App Mapping:** Browsable/tag filter screens.

### Donations (Priority: High)

* **Purpose:** Accept/manage church giving.

* **Fields:** Campaign name, description, target amount (optional), status, linked event, start/end date, giving provider, featured image.

* **Workflow:** Create campaign → connect payment (Stripe/PayPal) → set visibility.

* **Publishing:** Draft/published/scheduled; live/dormant status.

* **Relationships:** Linked events/campaigns.

* **App Mapping:** Giving page, donation campaigns.

### Spiritual Library (Priority: Mid)

* **Purpose:** Host devotionals, articles, spiritual resources.

* **Fields:** Title, author, content, categories, publish date, status, media, SEO meta.

* **Workflow:** Add/edit, import text or upload PDF/media.

* **Publishing:** Draft/published/scheduled.

* **Relationships:** Categories, Media Library.

### Hymns/Lyrics (Priority: Mid)

* **Purpose:** Manage lyrics/sheet music for worship.

* **Fields:** Title, lyrics, categories, optional audio/sheet music, status.

* **Workflow:** Add → paste lyrics or upload files → categorize → publish.

* **Relationships:** Categories, media.

* **App Mapping:** Hymnal page, search.

### Radio (Priority: Low, Pro Plan)

* **Purpose:** 24/7 church audio via embed/stream.

* **Fields:** Stream URL, title, description, categories, featured cover, status.

* **Workflow:** Enter stream/metadata → activate/deactivate.

* **Publishing:** On/Off toggle.

* **App Mapping:** In-app radio player, web stream.

### Live Stream (Priority: High)

* **Purpose:** Stream scheduled or live events (Sundays, special occasions).

* **Fields:** Stream URL/embed, scheduled times, categories, thumbnail, linked event.

* **Workflow:** Create stream → enter embed URL/feed details → schedule or activate.

* **Publishing:** Scheduled/live/archive; visibility toggle.

* **Dependencies:** Integrates with YouTube Live, FB Live, Vimeo, etc.

### Media Library (Priority: Core)

* **Purpose:** Central file/media storage, reuse across modules.

* **Fields:** File type, title, description, tags, upload date, categories, status (active/archived), file reference.

* **Workflow:** Upload → tag/categorize → reuse in content → archive/delete.

* **Dependencies:** S3/CDN storage.

Global Admin Capabilities (Core)

* **Search & Filtering**: Universal content search, filter by type/status/date/category.

* **Content Scheduling**: Allow save as draft, schedule publish/unpublish across modules.

* **Media Handling**: Upload, preview, reuse, tag, archive, soft delete.

* **Multi-Language Readiness**: Flag fields for alternate language entries (core fields only).

* **SEO Metadata**: Fields for meta title, description for all public-facing content.

---

## User Experience

**Entry Point & First-Time User Experience**

* User receives invite/login—lands in setup wizard: church name, logo, timezone, primary color, connect giving provider.

* Step-by-step setup, with inline help (what is this? Why now?).

* Empty state guides prompt: “Let’s upload your first sermon!” or “Create your first event.”

* Onboarding completion displays a short animated preview of how content will appear in the app/website (mock or Figma frames).

**Core Experience**

* **Step 1:** Landing on dashboard: see high-level stats, quick links (“Add Sermon,” “View Media Library”), and plan status.

* **Step 2:** Creating content

  * Click “Create Sermon” or “Create Event”

  * Simple, distraction-free form—title, description, date/time, add categories.

  * Drag-and-drop/upload for media (video, audio, flyers, images).

  * Inline previews—see how sermon/event will look in app/website before publishing.

  * Autosave drafts.

  * Optional scheduling (pick future publish date/time).

  * Confirmation prompt before publishing live.

* **Step 3:** Managing media

  * Central Media Library; browse, bulk upload, tag, and reuse files in other modules.

  * Large tap targets for upload (mobile-responsive).

* **Step 4:** Donations

  * Enable giving with one-click integration (connect Stripe/PayPal).

  * Set up a campaign, see projected totals, easily link to events.

* **Step 5:** Live Stream

  * Add stream source/URL, preview video feed, schedule or activate.

* **Step 6:** Search, filter, bulk actions across modules.

* **Step 7:** Receive upgrade prompts when gated features are accessed beyond current plan.

**Advanced Features & Edge Cases**

* Bulk upload/assignment of media, mass duplicate/clone content for recurring events.

* Archive vs. true delete, with safeguards (confirmation modals, recovery window).

* Guided empty states for each module—no blank screens; always a next step suggested.

* Read-only mode when plan is expired or downgraded.

**UI/UX Highlights**

* Accessible color contrast by default, large legible text.

* 100% mobile responsive admin, supports tablets.

* Drag & drop, large tap targets for all uploads.

* Inline preview for every content type, “how this will look” Figma view.

* Confirmation for any destructive actions (delete/archive), autosave always on.

* Storage usage meter and plan status always visible.

* Minimal chrome—focus on content, not menus.

---

## Narrative

Pastor James, leading a busy congregation in Atlanta, finds himself overwhelmed every Sunday by the flood of WhatsApp messages—sermon recordings to send, event flyers to circulate, and last-minute donation links to track. Updating the website means calling a volunteer, uploading a YouTube link, hoping for the best, and never seeing if anyone actually tunes in. After hearing about a new Church App & Website Builder, he logs in for the first time, greeted by a warm setup wizard that collects only the basics: church name, logo, timezone, and his preferred blue as the church’s color.

He’s prompted to upload Sunday’s sermon right away, with an intuitive drag-and-drop tool—no forms, no confusion. Five minutes later, the sermon is linked to the right categories and saved. Scheduling next week’s event is just as easy, with an invite to upload the flyer directly from his phone. Activating the giving campaign connects instantly to Stripe, showing projected donations and providing a preview of the “Giving” page.

For the first time, Pastor James can see everything at a glance—the dashboard shows real engagement, upcoming events, and a gentle nudge to upgrade if he wants to go live with streaming. Within minutes, all his content is ready to power not just a website, but a modern mobile app. He didn’t write a line of code or ping his IT volunteer once. The congregation stays connected, and James can finally focus on ministry, not IT.

---

## Success Metrics

### User-Centric Metrics

* **Time-to-first-content-published:** < 10 minutes from signup

* **Admin task completion rate:** > 85% for key flows (setup, create sermon, event, donation)

* **Net Promoter Score:** NPS > 50 within 60 days of launch

### Business Metrics

* **Churches onboarded:** 100+ in first 90 days

* **Monthly recurring revenue:** Targets by pricing tier

* **Churn Rate:** < 5% churches unsubscribed monthly

### Technical Metrics

* **API response time:** p95 under 300ms

* **Uptime:** 99.9%

* **Media upload success rate:** > 99%

### Tracking Plan

* onboarding_completed

* sermon_published

* event_created

* donation_campaign_activated

* media_uploaded

* live_stream_started

* upgrade_prompt_shown

* upgrade_converted

---

## Technical Considerations

### Technical Needs

* **Multi-tenant architecture:** All records scoped per church_id; strict tenant isolation.

* **RESTful and GraphQL Content APIs:** For future Phase 2 app/website rendering; stable and versioned.

* **Role-based access:** Super Admin / Church Admin / Editor.

* **Comprehensive media handling:** S3-compatible blob storage with CDN, metadata for MIME/type/tags.

* **Scheduled job processing:** For draft-to-publish, maintenance, async content handling.

### Integration Points

* **Donations:** Stripe, PayPal, and roadmap for additional payment providers (via giving module).

* **Live streaming:** Accept embeddable URLs from YouTube Live, Facebook Live, Vimeo, etc.

* **Media delivery:** CDN-backed image/video serving, adaptive for mobile/web.

* **Authentication/Identity:** Email/password and social login, scoped to church.

### Data Storage & Privacy

* **Data storage:** Relational DB for structured content, separate blob storage for media.

* **PII Handling:** All donor and admin info follows GDPR/CCPA readiness + soft deletes on user removal.

* **Audit:** All destructive actions are logged, soft-delete with recovery window for admins.

### Scalability & Performance

* **User load:** Design baseline for 10,000+ churches, with on-demand scaling for spikes.

* **Media processing:** Async queues for transcode, thumbnail, virus scan.

### Potential Challenges

* **Non-technical users:** Risk of content loss/deletion—mitigate with confirmation, recovery, empty state education.

* **Payments:** PCI compliance for donation flows and legal for nonprofit giving.

* **Content misuse:** Hymns/radio—terms of service enforcement, establish rapid DMCA takedown workflows.

* **Security:** All stream URLs and donation forms must be protected from scraping/sharing.

---

## Monetization Hooks (Admin-Side)

* **Feature Gating by Plan:**

  * Free: Limited sermons/month, basic events, no live stream, no donation tools.

  * Growth: Unlimited sermons, events, giving/campaigns, larger storage.

  * Pro: Live stream, radio, advanced analytics, custom branding/colors, extra storage.

* **Upgrade Triggers:**

  * Contextual modal or sidebar prompt when user attempts to access a feature outside their current plan.

  * Dashboard shows current plan, usage, and storage meter.

  * Consider donation volume-based pricing for higher-volume churches.

---

## Risks & Gaps

* **Usability for non-technical admins:** Admin overwhelm on content models—mitigate with onboarding, empty state guides, step-by-step flows.

* **Content misuse:** Copyrighted media in hymns/radio; need for DMCA, reporting, proactive terms enforcement.

* **Payment/legal:** Local giving compliance, nonprofit rules, platform-level KYC for Stripe Connect, transparent donor receipts, and reporting.

* **International/multi-currency support:** Not included; all payments/localization out of MVP scope.

* **Scope creep:** Keep feature set tightly limited to MVP, no Phase 2 screens or user-facing website in this build.

---

## Milestones & Sequencing

### Project Estimate

* **Large:** 6–8 weeks for MVP v1 (from kickoff to first production-ready release).

### Team Size & Composition

* **Lean Startup Team:**

  * 1 Product Manager

  * 2 Backend Engineers

  * 1 Frontend Engineer

  * 1 Designer

  * (Total: 5 people max)

### Phases & Key Deliverables

**Phase 1: Foundation (Weeks 1-2)**

* Multi-tenant user/auth system (Backend)

* Church onboarding wizard (Design, FE, BE)

* Basic dashboard shell (Design, FE)

* Media Library module (All roles)

* **Dependencies:** Initial data model definition

**Phase 2: Core Content Modules (Weeks 3-4)**

* Sermons, Events, Categories, Spiritual Library, Hymns (Backend, FE, Design)

* Routing and search/filter logic (FE)

* Content relationship models

**Phase 3: Monetization & Streaming (Weeks 5-6)**

* Donations module (FE, BE, integrations)

* Live Stream & Radio modules (FE, BE)

* Feature gating & contextual upgrade prompts (FE)

* Stripe/PayPal payment setup (Integrations)

**Phase 4: Polish & API Readiness (Weeks 7-8)**

* SEO fields, scheduling controls (Design, FE)

* Global search/filter (FE)

* Content API endpoints for future Phase 2 (BE)

* Empty state guides, onboarding polish, QA, prep for launch

---