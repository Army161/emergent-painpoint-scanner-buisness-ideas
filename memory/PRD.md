# IdeaRadar — PRD

## Product Summary
**IdeaRadar** is a first-to-market AI-powered Micro-SaaS Idea Finder and Validator.
The "Bloomberg Terminal for startup ideas" — mining real pain points from 6 online sources, scoring them on market potential, and generating full business briefs + landing page copy on demand.

**URL**: https://radar-light-dark.preview.emergentagent.com  
**App Name**: IdeaRadar  
**Date Started**: 2026-02-19

---

## Problem Statement
Build a first-to-market AI-powered Micro-SaaS Idea Finder and Auto-Validator web app.

## User Choices
- AI: OpenAI GPT-4o via emergentintegrations (EMERGENT_LLM_KEY)
- Monetization: Free tier + $40/mo Pro + $60/mo Business
- Design: Dark premium + clean modern, with light/dark mode toggle
- Sources: Reddit, Twitter/X, App Store, LinkedIn, Product Hunt, Indie Hackers + AI Scan

---

## Architecture

### Tech Stack
- **Backend**: FastAPI (Python) + MongoDB (Motor async driver)
- **Frontend**: React 19 + Tailwind CSS + Lucide React
- **AI**: emergentintegrations (LlmChat with OpenAI gpt-4o)
- **Payments**: Stripe via emergentintegrations (StripeCheckout)
- **Auth**: JWT (PyJWT) + bcrypt password hashing
- **Theming**: CSS variables with data-theme attribute, localStorage persistence

### Backend Routes (all prefixed /api)
- `POST /auth/register` — create account
- `POST /auth/login` — get JWT token
- `GET /auth/me` — current user
- `POST /auth/forgot-password` — send reset code
- `POST /auth/reset-password` — verify code + update password
- `GET /ideas/feed` — filtered idea list
- `GET /ideas/trending` — top 6 trending
- `GET /ideas/user/saved` — user's saved ideas
- `GET /ideas/{id}` — single idea detail
- `POST /ideas/{id}/upvote` — upvote idea
- `POST /ideas/{id}/save` — toggle save
- `POST /ideas/{id}/brief` — AI business brief generation
- `POST /ideas/{id}/landing-copy` — AI landing page copy generation
- `POST /ideas/scan-topic` — AI research any niche (premium only)
- `POST /subscription/checkout` — create Stripe checkout session
- `GET /subscription/status/{session_id}` — poll payment status
- `POST /webhook/stripe` — Stripe webhook handler
- `GET /stats` — app statistics

### Database (MongoDB: idearadar_db)
- `users` — id, email, name, password_hash, is_premium, tier, free_briefs_used, saved_ideas[]
- `ideas` — seeded + AI-scanned pain points with metadata
- `user_ideas` — generated briefs and landing copies
- `payment_transactions` — Stripe session tracking (session_id, user_id, tier, amount, payment_status)
- `password_resets` — reset codes with expiry

---

## Pricing Tiers
- **Free ($0/forever)**: Browse 15+ ideas, 1 AI brief, scores & metrics, filters
- **Pro ($40/month)**: Unlimited briefs, unlimited landing copy, priority updates, PDF export (soon)
- **Business ($60/month)**: Everything in Pro + early sources, Scan Any Topic, team sharing (soon), API access (soon), priority support

---

## What's Been Implemented

### v1 — 2026-02-19 (MVP)
- [x] Full JWT authentication (register/login/me)
- [x] 15 seeded ideas across 6 sources and 10 categories
- [x] Idea feed with source filter, category filter, sort, and search
- [x] Animated SVG opportunity score rings (4-dimension scoring)
- [x] Idea detail page with competition analysis and pain quotes
- [x] AI business brief generation (GPT-4o)
- [x] AI landing page copy generation (GPT-4o)
- [x] Typewriter effect for generated content
- [x] Save/unsave ideas
- [x] Free tier enforcement
- [x] Dark premium design
- [x] Sonner toast notifications

### v2 — 2026-02-19 (Theme + Pricing)
- [x] Light/dark mode toggle on all pages
- [x] 3-tier pricing: Free ($0), Pro ($40/mo), Business ($60/mo)

### v3 — 2026-02-19 (Stripe + Password Reset + Scan Topic)
- [x] Real Stripe payment integration ($40 Pro, $60 Business)
- [x] Stripe checkout sessions with redirect flow
- [x] Payment status polling on success page
- [x] Stripe webhook handler
- [x] payment_transactions collection for tracking
- [x] Password reset flow (forgot-password → code → reset)
- [x] "Scan Any Topic" AI research feature (premium only)
- [x] AI-scanned ideas added to feed with "AI Scan" source badge

---

## Test Results
- **v1**: Backend 20/20, Frontend 95%
- **v2**: Backend 23/23 (100%), Frontend 100%
- **v3**: Backend 18/18 (100%), Frontend 100%

---

## Prioritized Backlog

### P1 — High Priority
- [ ] Live data scraping (Reddit API, Twitter API for real-time data)
- [ ] PDF export of business briefs
- [ ] Email delivery (SendGrid/Resend for password reset + brief delivery)
- [ ] User dashboard with usage analytics

### P2 — Nice to Have
- [ ] Idea commenting / community discussion
- [ ] Share idea page (public link)
- [ ] Google Auth integration
- [ ] Idea "watchlist" with email alerts
- [ ] CSV/Notion export
- [ ] Team sharing & collaboration (Business tier)
- [ ] API access (Business tier)

---

## Known Issues / Notes
- Password reset code is returned in API response (demo mode). In production, would be sent via email.
- Stripe uses test key. Production needs real keys.
- AI generation takes 15-30 seconds (GPT-4o)
- Scan Topic generates 3 ideas per scan and adds them to the shared feed
