# IdeaRadar — PRD

## Product Summary
**IdeaRadar** is a first-to-market AI-powered Micro-SaaS Idea Finder and Validator.
It's the "Bloomberg Terminal for startup ideas" — mining real pain points from 6 online sources, scoring them on market potential, and generating full business briefs + landing page copy on demand.

**URL**: https://radar-light-dark.preview.emergentagent.com  
**App Name**: IdeaRadar  
**Date Started**: 2026-02-19

---

## Problem Statement
Build a first-to-market AI-powered Micro-SaaS Idea Finder and Auto-Validator web app.
Mines Reddit, App Store reviews, Twitter complaints, Indie Hackers posts & job boards for real unsolved pain points, scores them by market size + competition gap + revenue potential, and generates a full validated business brief + landing page copy in one click.

## User Choices
- AI: OpenAI GPT-4o via emergentintegrations (EMERGENT_LLM_KEY)
- Monetization: First idea free (1 brief), then $40/mo Pro or $60/mo Business subscription
- Design: Dark premium + clean modern, with light/dark mode toggle
- Sources: All (Reddit, Twitter/X, App Store, LinkedIn, Product Hunt, Indie Hackers)

---

## Architecture

### Tech Stack
- **Backend**: FastAPI (Python) + MongoDB (Motor async driver)
- **Frontend**: React 19 + Tailwind CSS + Lucide React
- **AI**: emergentintegrations (LlmChat with OpenAI gpt-4o)
- **Auth**: JWT (PyJWT) + bcrypt password hashing
- **Fonts**: Plus Jakarta Sans (headings), Inter (body), JetBrains Mono (data)
- **Theming**: CSS variables with data-theme attribute, localStorage persistence

### Backend Routes (all prefixed /api)
- `POST /auth/register` — create account
- `POST /auth/login` — get JWT token
- `GET /auth/me` — current user
- `GET /ideas/feed` — filtered idea list (source, category, sort)
- `GET /ideas/trending` — top 6 trending
- `GET /ideas/user/saved` — user's saved ideas
- `GET /ideas/{id}` — single idea detail
- `POST /ideas/{id}/upvote` — upvote idea
- `POST /ideas/{id}/save` — toggle save
- `POST /ideas/{id}/brief` — AI business brief generation
- `POST /ideas/{id}/landing-copy` — AI landing page copy generation
- `POST /subscription/upgrade` — MOCKED upgrade (accepts tier: "pro" | "business")
- `GET /stats` — app statistics

### Database (MongoDB: idearadar_db)
- `users` — id, email, name, password_hash, is_premium, tier, free_briefs_used, saved_ideas[]
- `ideas` — 15 seeded pain points with full metadata (scores, source, tags, etc.)
- `user_ideas` — generated briefs and landing copies per user/idea pair

---

## Frontend Pages
- `/` — LandingPage (hero, live ticker, features, testimonials, CTA)
- `/auth` — AuthPage (login/register tabs)
- `/dashboard` — Dashboard (idea feed with source/category/sort filters)
- `/idea/:id` — IdeaDetail (full detail, 4 metrics rings, AI generation)
- `/saved` — SavedIdeas (user's bookmarked ideas)
- `/pricing` — Pricing (Free vs Pro vs Business tiers)

---

## Pricing Tiers
- **Free ($0/forever)**: Browse 15+ ideas, 1 AI brief, scores & metrics, filters
- **Pro ($40/month)**: Unlimited briefs, unlimited landing copy, priority updates, PDF export (soon)
- **Business ($60/month)**: Everything in Pro + early sources, Scan Any Topic (soon), team sharing (soon), API access (soon), priority support

---

## What's Been Implemented

### v1 — 2026-02-19 (MVP)
- [x] Full JWT authentication (register/login/me)
- [x] 15 seeded ideas across 6 sources and 10 categories
- [x] Idea feed with source filter, category filter, sort, and search
- [x] Animated SVG opportunity score rings (4-dimension scoring)
- [x] Idea detail page with competition analysis and pain quotes
- [x] AI business brief generation (GPT-4o via emergentintegrations)
- [x] AI landing page copy generation (GPT-4o)
- [x] Typewriter effect for generated content
- [x] Save/unsave ideas
- [x] Free tier enforcement (1 brief generation lifetime)
- [x] MOCKED subscription upgrade
- [x] Pricing page with Free/Pro comparison
- [x] Animated landing page with live idea ticker
- [x] Animated counter stats
- [x] Dark premium design (Bloomberg Terminal meets Linear/Vercel)
- [x] Responsive layout
- [x] Sonner toast notifications

### v2 — 2026-02-19 (Theme + Pricing)
- [x] Light/dark mode toggle (CSS variables, localStorage persistence)
- [x] Theme toggle on all pages (Landing, Auth, Dashboard, Detail, Saved, Pricing)
- [x] All hardcoded colors replaced with CSS variables for consistent theming
- [x] 3-tier pricing: Free ($0), Pro ($40/mo), Business ($60/mo)
- [x] Backend tier support (subscription/upgrade accepts tier parameter)
- [x] Light mode glass variant for consistent UI

---

## Test Results
- **v1 (2026-02-19)**: Backend 20/20, Frontend 95%
- **v2 (2026-02-19)**: Backend 23/23 (100%), Frontend 100%

---

## Prioritized Backlog

### P0 — Critical (Next Session)
- [ ] Real Stripe payment integration for $40/mo and $60/mo tiers
- [ ] Email verification on signup
- [ ] Password reset flow

### P1 — High Priority
- [ ] Live data scraping (Reddit API, Twitter API, App Store API)
- [ ] AI idea generation ("Generate New Ideas" premium feature)
- [ ] PDF export of business briefs
- [ ] Email delivery of generated briefs
- [ ] User dashboard with usage analytics

### P2 — Nice to Have
- [ ] "Scan Any Topic" feature (niche research)
- [ ] Idea commenting / community discussion
- [ ] Share idea page (public link)
- [ ] Google Auth integration
- [ ] Idea "watchlist" with email alerts
- [ ] CSV/Notion export
- [ ] Mobile app (React Native)

---

## Known Issues / Notes
- Subscription upgrade is MOCKED (no real payment). Stripe integration needed for production.
- free_briefs_used tracks both brief AND landing copy separately (each uses 1 free slot). Max 1 total per free user before paywall.
- JWT_SECRET should be a required env var in production (currently has fallback)
- AI generation takes 15-30 seconds (GPT-4o)
