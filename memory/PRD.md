# IdeaRadar — PRD

## Product Summary
**IdeaRadar** — first-to-market AI-powered Micro-SaaS Idea Finder and Validator.
"Bloomberg Terminal for startup ideas" — mines real pain points from 6+ sources, scores them, and generates full business briefs + landing page copy on demand.

**URL**: https://radar-light-dark.preview.emergentagent.com

---

## User Choices
- AI: OpenAI GPT-4o via emergentintegrations
- Monetization: Free + $40/mo Pro + $60/mo Business
- Design: Dark premium + clean modern, light/dark mode toggle

---

## Architecture
- **Backend**: FastAPI + MongoDB + emergentintegrations (AI + Stripe)
- **Frontend**: React 19 + Tailwind + Lucide React + Sonner
- **Auth**: JWT + bcrypt
- **Theming**: CSS variables, data-theme, localStorage

### API Routes (all /api prefixed)
Auth: register, login, me, forgot-password, reset-password
Ideas: feed, trending, saved, {id}, {id}/upvote, {id}/save, {id}/brief, {id}/landing-copy, {id}/export-pdf, scan-topic
Subscription: checkout, status/{session_id}, webhook/stripe
User: analytics
Stats: stats

### Database Collections
users, ideas, user_ideas, payment_transactions, password_resets

---

## Pricing
- **Free ($0)**: 15+ ideas, 1 AI brief, scores, filters
- **Pro ($40/mo)**: Unlimited briefs/copy, PDF export, priority updates
- **Business ($60/mo)**: + Scan Any Topic, early sources, team (soon), API (soon)

---

## Implemented

### v1 (MVP)
- JWT auth, 15 seeded ideas, feed with filters/sort/search
- 4-dimension opportunity score rings (SVG animated)
- AI business brief + landing copy generation (GPT-4o)
- Save/unsave, upvote, free tier enforcement
- Dark premium design, responsive, Sonner toasts

### v2 (Theme + Pricing)
- Light/dark mode toggle on all pages, localStorage persistence
- 3-tier pricing: Free ($0), Pro ($40/mo), Business ($60/mo)

### v3 (Stripe + Password Reset + Scan Topic)
- Real Stripe checkout ($40 Pro, $60 Business) with redirect + status polling
- Stripe webhook handler, payment_transactions tracking
- Password reset (forgot → 6-digit code → reset)
- "Scan Any Topic" AI research (premium, GPT-4o, adds 3 ideas to feed)

### v4 (PDF Export + Analytics)
- PDF export of business briefs (Pro+ only, branded with IdeaRadar header)
- User analytics dashboard (/analytics): 6 stat cards, tier badge, recent briefs
- Dashboard link in navbar user menu
- Export PDF button in IdeaDetail (shown for premium users with generated brief)

---

## Test Results
- v1: 20/20 backend, 95% frontend
- v2: 23/23 backend, 100% frontend
- v3: 18/18 backend, 100% frontend
- v4: 12/12 backend, 100% frontend

---

## Prioritized Backlog

### P1
- [ ] Live data scraping (Reddit/Twitter APIs)
- [ ] Email service (Resend/SendGrid) for password reset + brief delivery
- [ ] Real-time idea refresh / auto-discovery

### P2
- [ ] Idea commenting / community
- [ ] Share idea (public link)
- [ ] Google Auth
- [ ] CSV/Notion export
- [ ] Team sharing (Business tier)
- [ ] API access (Business tier)
- [ ] Email alerts for watchlisted ideas

---

## Notes
- Password reset code shown in UI (demo mode, no email service)
- Stripe uses test key
- AI generation takes 15-30 seconds
- Scan Topic adds ideas to shared feed
