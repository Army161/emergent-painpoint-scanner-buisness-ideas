# PainSignal — PRD

## Product Summary
**PainSignal** — first-to-market AI-powered Micro-SaaS Idea Finder and Validator.
Mines real pain points from X/Twitter via xAI Grok, scores them, generates business briefs + landing copy.

**URL**: https://radar-light-dark.preview.emergentagent.com

---

## Pricing
- **Free ($0)**: 15+ ideas, 1 AI brief, scores, filters
- **Pro ($40/mo)**: Unlimited briefs/copy, PDF/CSV export, Scan Topic, Live Discovery, Sharing
- **Business ($60/mo)**: + early sources, team (soon), API (soon)

---

## Implemented (v1-v7)

### v1 — MVP: JWT auth, 15 seeded ideas, feed w/ filters, AI brief + copy gen, dark premium design
### v2 — Theme: Light/dark mode toggle, 3-tier pricing ($0/$40/$60)
### v3 — Stripe: Real checkout, password reset, Scan Any Topic AI
### v4 — Export: PDF export of briefs, user analytics dashboard
### v5 — Rebrand: IdeaRadar→PainSignal, X/Twitter live scraping, LIVE badges
### v6 — Multi-source: AI discovery (Reddit/ProductHunt/AppStore), CSV export, public idea sharing
### v7 — Real X Integration:
- xAI Grok API with x_search tool for REAL tweet data
- Searches X/Twitter for actual complaints, frustrations, feature requests
- Extracts pain quotes from real tweets
- Auto-fallback to GPT-4o when xAI credits unavailable
- Refactored scraping engine with shared save_scraped_ideas function

---

## Test Results (cumulative: 115+ tests)
v1: 20/20 | v2: 23/23 | v3: 18/18 | v4: 12/12 | v5: 18/18 | v6: 18/18

## 3rd Party Integrations
- OpenAI GPT-4o (via emergentintegrations) — briefs, copy, topic scan, fallback discovery
- Stripe (via emergentintegrations) — $40/$60 subscription checkout
- xAI Grok (direct API) — real X/Twitter data via x_search tool

## API Routes (/api)
Auth: register, login, me, forgot-password, reset-password
Ideas: feed, trending, saved, export-csv, {id}, {id}/upvote, {id}/save, {id}/brief, {id}/landing-copy, {id}/export-pdf, scan-topic, {id}/share
Scrape: x (POST), discover (POST), status (GET)
Shared: {share_id} (public, no auth)
Subscription: checkout, status/{session_id}, webhook/stripe
User: analytics | Stats: stats

## DB: users, ideas, user_ideas, payment_transactions, password_resets, shared_ideas

---

## Backlog

### P1
- [ ] Add xAI credits for real X data (console.x.ai)
- [ ] Email service (Resend) for password reset + brief delivery
- [ ] Idea commenting / community upvoting

### P2
- [ ] Google Auth
- [ ] Notion export
- [ ] Team sharing + API access (Business tier)
- [ ] Email alerts for watchlisted ideas

---

## Notes
- xAI key configured but needs credits at console.x.ai — falls back to GPT-4o
- Password reset code shown in UI (demo, no email service)
- Stripe uses test key
- Background scrape runs hourly
