# PainSignal — PRD

## Product Summary
**PainSignal** — first-to-market AI-powered Micro-SaaS Idea Finder and Validator.
Mines pain points from 6+ sources, scores them, generates business briefs + landing copy.

**URL**: https://radar-light-dark.preview.emergentagent.com

---

## Pricing
- **Free ($0)**: 15+ ideas, 1 AI brief, scores, filters
- **Pro ($40/mo)**: Unlimited briefs/copy, PDF/CSV export, Scan Topic, Live Discovery, Sharing
- **Business ($60/mo)**: + early sources, team (soon), API (soon)

---

## Implemented (v1-v6)

### v1 — MVP: JWT auth, 15 seeded ideas, feed w/ filters, AI brief + copy gen, dark premium design
### v2 — Theme: Light/dark mode toggle, 3-tier pricing ($0/$40/$60)
### v3 — Stripe: Real checkout, password reset, Scan Any Topic AI
### v4 — Export: PDF export of briefs, user analytics dashboard
### v5 — Rebrand + X Scraping: IdeaRadar→PainSignal, X/Twitter live scraping with AI fallback, LIVE badges
### v6 — Multi-source + Sharing:
- Multi-source AI discovery (Reddit, Product Hunt, App Store)
- CSV export of all ideas
- Public idea sharing with shareable links
- Shared idea page with opportunity metrics + CTA

---

## Test Results (cumulative: 97+ tests passing)
v1: 20/20 | v2: 23/23 | v3: 18/18 | v4: 12/12 | v5: 18/18 | v6: 18/18

## API Routes (/api)
Auth: register, login, me, forgot-password, reset-password
Ideas: feed, trending, saved, {id}, {id}/upvote, {id}/save, {id}/brief, {id}/landing-copy, {id}/export-pdf, export-csv, scan-topic, {id}/share
Scrape: x, discover, status
Shared: {share_id} (public)
Subscription: checkout, status/{session_id}, webhook/stripe
User: analytics | Stats: stats

## DB: users, ideas, user_ideas, payment_transactions, password_resets, shared_ideas

---

## Backlog

### P1
- [ ] Email service (Resend/SendGrid) for password reset + brief delivery
- [ ] Real X API (needs Basic plan $100/mo + API Key/Secret)
- [ ] Idea commenting / community upvoting

### P2
- [ ] Google Auth
- [ ] Notion export
- [ ] Team sharing + API access (Business tier)
- [ ] Email alerts for watchlisted ideas
- [ ] Mobile responsive polish
