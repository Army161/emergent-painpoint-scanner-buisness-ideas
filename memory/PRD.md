# IdeaRadar — PRD

## Product Summary
**IdeaRadar** is a first-to-market AI-powered Micro-SaaS Idea Finder and Validator.
It's the "Bloomberg Terminal for startup ideas" — mining real pain points from 6 online sources, scoring them on market potential, and generating full business briefs + landing page copy on demand.

**URL**: https://prosperity-pulse.preview.emergentagent.com  
**App Name**: IdeaRadar  
**Date Started**: 2026-02-19

---

## Problem Statement
Build a first-to-market AI-powered Micro-SaaS Idea Finder and Auto-Validator web app.
Mines Reddit, App Store reviews, Twitter complaints, Indie Hackers posts & job boards for real unsolved pain points, scores them by market size + competition gap + revenue potential, and generates a full validated business brief + landing page copy in one click.

## User Choices
- AI: OpenAI GPT-4o via emergentintegrations (EMERGENT_LLM_KEY)
- Monetization: First idea free (1 brief), then $29/mo Pro subscription
- Design: Dark premium + clean modern, go all out, nothing generic
- Sources: All (Reddit, Twitter/X, App Store, LinkedIn, Product Hunt, Indie Hackers)

---

## Architecture

### Tech Stack
- **Backend**: FastAPI (Python) + MongoDB (Motor async driver)
- **Frontend**: React 19 + Tailwind CSS + Lucide React
- **AI**: emergentintegrations (LlmChat with OpenAI gpt-4o)
- **Auth**: JWT (PyJWT) + bcrypt password hashing
- **Fonts**: Plus Jakarta Sans (headings), Inter (body), JetBrains Mono (data)

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
- `POST /subscription/upgrade` — MOCKED upgrade to Pro
- `GET /stats` — app statistics

### Database (MongoDB: idearadar_db)
- `users` — id, email, name, password_hash, is_premium, free_briefs_used, saved_ideas[]
- `ideas` — 15 seeded pain points with full metadata (scores, source, tags, etc.)
- `user_ideas` — generated briefs and landing copies per user/idea pair

---

## Frontend Pages
- `/` — LandingPage (hero, live ticker, features, testimonials, CTA)
- `/auth` — AuthPage (login/register tabs)
- `/dashboard` — Dashboard (idea feed with source/category/sort filters)
- `/idea/:id` — IdeaDetail (full detail, 4 metrics rings, AI generation)
- `/saved` — SavedIdeas (user's bookmarked ideas)
- `/pricing` — Pricing (Free vs Pro, upgrade button)

---

## Seed Data
15 pre-validated pain points across:
- Finance (multi-currency invoicing, health insurance for self-employed)
- HR & Recruiting (AI video interview screener)
- Analytics (SaaS churn prediction, micro-SaaS portfolio analytics)
- Legal & Compliance (privacy policy auto-updater, contract red-flag detector)
- Operations (restaurant shift scheduling)
- Developer Tools (App Store review → roadmap, OSS license checker)
- Content Creation (podcast transcript converter, tweet A/B testing)
- Sales & CRM (LinkedIn follow-up automation, onboarding video personalization)
- Agency & Freelance (AI proposal generator)

---

## What's Been Implemented (v1 — 2026-02-19)
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
- [x] MOCKED subscription upgrade ($29/mo Pro)
- [x] Pricing page with Free/Pro comparison
- [x] Animated landing page with live idea ticker
- [x] Animated counter stats (14,892+ pain points, etc.)
- [x] Dark premium design (Bloomberg Terminal meets Linear/Vercel)
- [x] Responsive layout
- [x] Sonner toast notifications

---

## Test Results (2026-02-19)
- Backend: 20/20 tests passing
- Frontend: 95% flows working
- AI generation: Functional (GPT-4o)

---

## Prioritized Backlog

### P0 — Critical (Next Session)
- [ ] Real Stripe payment integration for $29/mo subscription
- [ ] Email verification on signup
- [ ] Password reset flow

### P1 — High Priority
- [ ] Live data scraping (Reddit API, Twitter API, App Store API)
- [ ] AI idea generation ("Generate New Ideas" premium feature)
- [ ] PDF export of business briefs
- [ ] Email delivery of generated briefs
- [ ] User dashboard with usage analytics

### P2 — Nice to Have
- [ ] Idea commenting / community discussion
- [ ] Share idea page (public link)
- [ ] Google Auth integration
- [ ] Idea "watchlist" with email alerts for new similar pain points
- [ ] CSV/Notion export
- [ ] Mobile app (React Native)

---

## Known Issues / Notes
- Subscription upgrade is MOCKED (no real payment). Stripe integration needed for production.
- free_briefs_used tracks both brief AND landing copy separately (each uses 1 free slot). Max 1 total per free user before paywall.
- JWT_SECRET should be a required env var in production (currently has fallback)
- AI generation takes 15-30 seconds (GPT-4o)
