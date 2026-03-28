# PainSignal — PRD

## Product Summary
**PainSignal** — first-to-market AI-powered Micro-SaaS Idea Finder and Validator.
"Bloomberg Terminal for startup ideas" — mines real pain points from social media, scores them, and generates full business briefs + landing page copy on demand.

**URL**: https://radar-light-dark.preview.emergentagent.com

---

## Pricing
- **Free ($0)**: 15+ ideas, 1 AI brief, scores, filters
- **Pro ($40/mo)**: Unlimited briefs/copy, PDF export, Scan Topic, Live X Scraping
- **Business ($60/mo)**: + early sources, team (soon), API (soon)

---

## Implemented

### v1 (MVP) — Auth, 15 seeded ideas, feed w/ filters, AI brief + copy gen, dark premium design
### v2 (Theme) — Light/dark mode toggle, 3-tier pricing ($0/$40/$60)
### v3 (Stripe) — Real Stripe checkout, password reset, Scan Any Topic AI
### v4 (Export) — PDF export of briefs, user analytics dashboard
### v5 (Rebrand + Live Scraping) — IdeaRadar → PainSignal rebrand, X/Twitter live scraping with AI fallback, LIVE badges, background hourly scrape, "Scrape X Now" button (Pro+)

---

## Test Results
- v1: 20/20 backend, 95% frontend
- v2: 23/23, 100%
- v3: 18/18, 100%
- v4: 12/12, 100%
- v5: 18/18, 100%

---

## API Routes (/api)
Auth: register, login, me, forgot-password, reset-password
Ideas: feed, trending, saved, {id}, {id}/upvote, {id}/save, {id}/brief, {id}/landing-copy, {id}/export-pdf, scan-topic
Subscription: checkout, status/{session_id}, webhook/stripe
Scrape: x (POST), status (GET)
User: analytics | Stats: stats

## DB Collections
users, ideas, user_ideas, payment_transactions, password_resets

---

## Backlog

### P1
- [ ] Email service (Resend/SendGrid) for password reset + brief delivery
- [ ] Real X API integration (needs Basic plan $100/mo, API Key + Secret)
- [ ] More scraping sources (Reddit, Product Hunt APIs)

### P2
- [ ] Idea commenting / community
- [ ] Share idea (public link)
- [ ] Google Auth
- [ ] CSV/Notion export
- [ ] Team sharing + API access (Business tier)
- [ ] Email alerts for watchlisted ideas

---

## Notes
- X/Twitter scraping uses AI-powered fallback (GPT-4o) when X API unavailable
- Password reset code shown in UI (demo mode)
- Stripe uses test key
- Background scrape runs hourly
