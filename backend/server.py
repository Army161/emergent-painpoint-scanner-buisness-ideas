from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import jwt
import bcrypt
import uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'idearadar-secret')
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Auth Utils ────────────────────────────────────────────────
def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()

def verify_password(p: str, h: str) -> bool:
    return bcrypt.checkpw(p.encode(), h.encode())

def create_token(user_id: str) -> str:
    return jwt.encode(
        {'user_id': user_id, 'exp': datetime.now(timezone.utc) + timedelta(days=7)},
        JWT_SECRET, algorithm='HS256'
    )

def verify_token(token: str):
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=['HS256']).get('user_id')
    except Exception:
        return None

async def get_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    if not credentials:
        return None
    user_id = verify_token(credentials.credentials)
    if not user_id:
        return None
    return await db.users.find_one({"id": user_id}, {"_id": 0})

async def require_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    user = await get_user(credentials)
    if not user:
        raise HTTPException(401, "Authentication required")
    return user

# ── Pydantic Models ───────────────────────────────────────────
class UserCreate(BaseModel):
    email: str
    name: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

# ── Seed Data ─────────────────────────────────────────────────
SEED_IDEAS = [
    {
        "id": "idea_001",
        "title": "AI Video Interview Pre-Screener for SMBs",
        "description": "Mid-market companies are spending 40+ hours/week manually reviewing recorded video interviews. Enterprise tools like HireVue cost $25K–$50K/year making them inaccessible for 100–500 person teams. A targeted AI screener that auto-summarizes recordings, scores candidates, and flags key moments at $299/mo would dominate this whitespace.",
        "source": "linkedin",
        "source_display": "LinkedIn",
        "source_badge_color": "#0A66C2",
        "source_url": "https://linkedin.com",
        "category": "HR & Recruiting",
        "pain_intensity": "severe",
        "pain_quote": "\"We spend 40% of our hiring time reviewing video recordings. HireVue wants $30K/yr for our 200-person team. We just need AI summaries and scoring. Why doesn't this exist at $300/mo?\" — HR Director, SaaS Company",
        "votes_on_source": 3201,
        "opportunity_score": 91,
        "market_score": 93,
        "competition_score": 82,
        "revenue_score": 94,
        "revenue_estimate": "$100K–$500K/mo",
        "market_size": "$4.3B TAM",
        "trending": True,
        "upvotes": 456,
        "tags": ["HR", "AI", "recruiting", "video", "SMB", "B2B SaaS"],
        "competition_analysis": "HireVue ($25K–$50K/yr, enterprise only), Spark Hire (scheduling, not AI). Zero affordable AI video screeners for the SMB market. Massive gap.",
        "created_at": "2025-02-03T10:00:00+00:00"
    },
    {
        "id": "idea_002",
        "title": "Automated Multi-Currency Invoice Reconciliation for Freelancers",
        "description": "Freelancers working across US, EU, and UK clients are losing 3–5% annually on manual FX tracking and failed tax reconciliation. Wave and FreshBooks handle single-currency. No tool does multi-currency invoicing + automatic tax compliance + FX reconciliation in one workflow for independent contractors.",
        "source": "reddit",
        "source_display": "Reddit",
        "source_badge_color": "#FF6314",
        "source_url": "https://reddit.com/r/freelance",
        "category": "Finance",
        "pain_intensity": "severe",
        "pain_quote": "\"I lost $2,400 last year from not tracking currency conversions properly. There is NOTHING that does this automatically for freelancers. I've tried every app.\" — u/freelancedev_uk (1,847 upvotes)",
        "votes_on_source": 1847,
        "opportunity_score": 87,
        "market_score": 85,
        "competition_score": 78,
        "revenue_score": 92,
        "revenue_estimate": "$50K–$200K/mo",
        "market_size": "$2.1B TAM",
        "trending": True,
        "upvotes": 312,
        "tags": ["freelance", "finance", "invoicing", "B2B SaaS", "FX"],
        "competition_analysis": "Wave (single currency), FreshBooks (limited FX), Xe.com (conversion only, no invoicing). No direct competitor owns multi-currency + tax + invoicing in one place.",
        "created_at": "2025-02-02T14:00:00+00:00"
    },
    {
        "id": "idea_003",
        "title": "Privacy Policy Auto-Updater with GDPR Compliance Monitoring",
        "description": "Solo founders and bootstrapped SaaS teams are one GDPR violation away from five-figure fines. Legal templates go stale within 6 months. No affordable tool monitors regulation changes and auto-updates your privacy policy, cookie consent, and DPA agreements. Current solutions cost $2K+/yr from legal firms.",
        "source": "indiehackers",
        "source_display": "Indie Hackers",
        "source_badge_color": "#0FAC81",
        "source_url": "https://indiehackers.com",
        "category": "Legal & Compliance",
        "pain_intensity": "severe",
        "pain_quote": "\"Got hit with a €15,000 GDPR fine because my privacy policy was outdated by 8 months. No one told me regulations changed. This shouldn't happen to bootstrappers.\" — IH member, 1.2K reactions",
        "votes_on_source": 2104,
        "opportunity_score": 83,
        "market_score": 80,
        "competition_score": 76,
        "revenue_score": 88,
        "revenue_estimate": "$30K–$150K/mo",
        "market_size": "$1.8B TAM",
        "trending": False,
        "upvotes": 198,
        "tags": ["legal", "GDPR", "compliance", "SaaS", "privacy"],
        "competition_analysis": "Termly ($99/yr, static), iubenda ($129/yr, no monitoring). No tool auto-monitors regulatory changes and pushes updates in real time.",
        "created_at": "2025-01-28T09:00:00+00:00"
    },
    {
        "id": "idea_004",
        "title": "SaaS Churn Prediction Engine for Non-Technical Founders",
        "description": "Sub-$1M ARR SaaS founders have no way to predict which users will churn in the next 30 days without a data team. Mixpanel and Amplitude require engineers to set up. A plug-and-play churn prediction tool that connects to Stripe + Intercom and gives a weekly 'at-risk users' report would be a $49/mo no-brainer.",
        "source": "reddit",
        "source_display": "Reddit",
        "source_badge_color": "#FF6314",
        "source_url": "https://reddit.com/r/SaaS",
        "category": "Analytics",
        "pain_intensity": "severe",
        "pain_quote": "\"I lost $8,400 MRR last quarter because I couldn't see who was about to cancel until it was too late. I can't afford a data scientist. I just need a dashboard.\" — u/bootstrappedfounder",
        "votes_on_source": 2891,
        "opportunity_score": 86,
        "market_score": 84,
        "competition_score": 79,
        "revenue_score": 89,
        "revenue_estimate": "$40K–$180K/mo",
        "market_size": "$3.2B TAM",
        "trending": True,
        "upvotes": 387,
        "tags": ["SaaS", "analytics", "churn", "no-code", "B2B"],
        "competition_analysis": "Mixpanel/Amplitude (requires engineers), ChurnZero (enterprise $20K+). Zero tools for the non-technical sub-$1M ARR founder segment.",
        "created_at": "2025-02-04T08:00:00+00:00"
    },
    {
        "id": "idea_005",
        "title": "Restaurant Staff Shift Scheduler for Teams Under 25",
        "description": "Independent restaurant owners with 5–25 staff are managing shifts in group chats and paper schedules. 7shifts and HotSchedules cost $70–$200/mo and are bloated for small teams. Owners need a $19/mo tool that handles shift swapping, availability collection, and WhatsApp/SMS notifications. Nothing exists at this price/simplicity combo.",
        "source": "reddit",
        "source_display": "Reddit",
        "source_badge_color": "#FF6314",
        "source_url": "https://reddit.com/r/restaurantowners",
        "category": "Operations",
        "pain_intensity": "moderate",
        "pain_quote": "\"I run a 12-person cafe. 7shifts wants $70/mo and it has 200 features I'll never use. I just need to post shifts and get confirmations via text.\" — u/cafeowner_Portland",
        "votes_on_source": 1103,
        "opportunity_score": 79,
        "market_score": 76,
        "competition_score": 72,
        "revenue_score": 82,
        "revenue_estimate": "$20K–$80K/mo",
        "market_size": "$890M TAM",
        "trending": False,
        "upvotes": 143,
        "tags": ["restaurant", "scheduling", "SMB", "hospitality", "B2B"],
        "competition_analysis": "7shifts ($70/mo, complex), HotSchedules (enterprise). No simple, affordable solution for sub-25 person restaurant teams.",
        "created_at": "2025-01-25T12:00:00+00:00"
    },
    {
        "id": "idea_006",
        "title": "App Store Review → Product Roadmap Insights AI",
        "description": "Product managers at B2C apps are manually reading thousands of App Store reviews to extract feature requests and bug patterns. There's no tool that automatically categorizes review sentiment, clusters feature requests, and maps them directly to a prioritized product roadmap. The 2-3 hours/week spent on this is universally hated.",
        "source": "appstore",
        "source_display": "App Store",
        "source_badge_color": "#0A84FF",
        "source_url": "https://apps.apple.com",
        "category": "Developer Tools",
        "pain_intensity": "moderate",
        "pain_quote": "\"I spend 3 hours every Monday reading App Store reviews and putting them in a spreadsheet. There HAS to be a better way.\" — App Store review on a competitor tool, 847 helpful votes",
        "votes_on_source": 847,
        "opportunity_score": 76,
        "market_score": 74,
        "competition_score": 68,
        "revenue_score": 80,
        "revenue_estimate": "$15K–$60K/mo",
        "market_size": "$720M TAM",
        "trending": False,
        "upvotes": 167,
        "tags": ["product", "AI", "app store", "analytics", "developer"],
        "competition_analysis": "AppFollow ($79/mo, basic), AppBot ($49/mo, no AI roadmap). No tool connects App Store reviews directly to an AI-generated product roadmap.",
        "created_at": "2025-01-20T11:00:00+00:00"
    },
    {
        "id": "idea_007",
        "title": "Tweet Format A/B Testing Automation for Creators",
        "description": "Twitter/X creators with 10K–500K followers are posting in the dark — no tool auto-tests whether their threads, single tweets, or quote tweets get more engagement for their specific audience. Manual A/B testing requires remembering to repost. An automation that tests 2–3 variants in the first 2 hours and promotes the winner would be transformative.",
        "source": "twitter",
        "source_display": "Twitter / X",
        "source_badge_color": "#1D9BF0",
        "source_url": "https://x.com",
        "category": "Content Creation",
        "pain_intensity": "moderate",
        "pain_quote": "\"Spent $2,000 on a Twitter course and the main advice was 'post more'. I need actual data on what format works for MY audience. No tool does this automatically.\" — @creator (2.3K likes)",
        "votes_on_source": 2300,
        "opportunity_score": 71,
        "market_score": 69,
        "competition_score": 65,
        "revenue_score": 75,
        "revenue_estimate": "$10K–$40K/mo",
        "market_size": "$420M TAM",
        "trending": False,
        "upvotes": 89,
        "tags": ["Twitter", "creator", "A/B testing", "content", "automation"],
        "competition_analysis": "Hypefury (scheduling, no A/B), Typefully (drafts). No tool does automated multi-variant tweet testing and winner promotion.",
        "created_at": "2025-01-18T15:00:00+00:00"
    },
    {
        "id": "idea_008",
        "title": "Health Insurance Navigator for Self-Employed Professionals",
        "description": "35M+ self-employed Americans spend 8–12 hours every year comparing health insurance plans across brokers, exchanges, and professional associations. The existing comparison tools (eHealth, Healthcare.gov) are built for employed individuals. A tool that accounts for irregular income, 1099 deductions, HSA optimization, and self-employed tax implications would serve a completely underserved segment.",
        "source": "twitter",
        "source_display": "Twitter / X",
        "source_badge_color": "#1D9BF0",
        "source_url": "https://x.com",
        "category": "Finance & Health",
        "pain_intensity": "severe",
        "pain_quote": "\"Self-employed for 3 years. Still have no idea if I'm on the right health plan. Every 'comparison tool' assumes I have a W-2. The self-employed market is completely ignored.\" — @selfemployedny (4.1K likes)",
        "votes_on_source": 4100,
        "opportunity_score": 89,
        "market_score": 92,
        "competition_score": 84,
        "revenue_score": 90,
        "revenue_estimate": "$60K–$250K/mo",
        "market_size": "$5.1B TAM",
        "trending": True,
        "upvotes": 521,
        "tags": ["health insurance", "self-employed", "finance", "B2C", "fintech"],
        "competition_analysis": "eHealth (W-2 focused), Healthcare.gov (no self-employed optimization), GuidelineHR (small biz). Nobody owns the 35M self-employed segment with proper tax-aware comparison.",
        "created_at": "2025-02-05T07:00:00+00:00"
    },
    {
        "id": "idea_009",
        "title": "AI Proposal Generator for Agency Owners",
        "description": "Digital agencies spend 3–6 hours crafting each client proposal, often losing 60% of them anyway. Agency-specific tools like Proposify exist but don't use AI to auto-generate tailored proposals from a brief. The dream is: paste a client brief → get a full, branded proposal with scope, timeline, pricing, and case studies in 10 minutes.",
        "source": "reddit",
        "source_display": "Reddit",
        "source_badge_color": "#FF6314",
        "source_url": "https://reddit.com/r/digital_marketing",
        "category": "Agency & Freelance",
        "pain_intensity": "moderate",
        "pain_quote": "\"I spend 4 hours on every proposal and win maybe 30% of them. The time cost is killing me. GPT helps but I still have to structure everything manually.\" — u/agencyfounder_NYC",
        "votes_on_source": 1456,
        "opportunity_score": 78,
        "market_score": 76,
        "competition_score": 70,
        "revenue_score": 84,
        "revenue_estimate": "$25K–$100K/mo",
        "market_size": "$1.2B TAM",
        "trending": False,
        "upvotes": 203,
        "tags": ["agency", "AI", "proposals", "freelance", "sales"],
        "competition_analysis": "Proposify ($49/mo, templates only), Better Proposals ($19/mo, manual). No tool auto-generates from a brief using AI with agency-specific context.",
        "created_at": "2025-01-22T13:00:00+00:00"
    },
    {
        "id": "idea_010",
        "title": "Micro-SaaS Portfolio Revenue Analytics Dashboard",
        "description": "Indie hackers running 2–10 small SaaS products have no centralized analytics across all their tools. They manually check Stripe dashboards for each product, copy-paste into spreadsheets, and have no unified MRR/churn/LTV view. A $29/mo aggregator that pulls from Stripe, Gumroad, Lemon Squeezy, and Paddle would be an instant sell.",
        "source": "indiehackers",
        "source_display": "Indie Hackers",
        "source_badge_color": "#0FAC81",
        "source_url": "https://indiehackers.com",
        "category": "Analytics",
        "pain_intensity": "moderate",
        "pain_quote": "\"I have 6 micro-SaaS products across 4 payment processors. My 'analytics' is a Google Sheet I update on Sundays. This is embarrassing. Someone build this already.\" — IH member, featured post",
        "votes_on_source": 1789,
        "opportunity_score": 82,
        "market_score": 79,
        "competition_score": 74,
        "revenue_score": 86,
        "revenue_estimate": "$20K–$80K/mo",
        "market_size": "$650M TAM",
        "trending": True,
        "upvotes": 267,
        "tags": ["indie hackers", "SaaS", "analytics", "portfolio", "Stripe"],
        "competition_analysis": "Baremetrics (Stripe only, $108/mo), ChartMogul ($100/mo). No tool aggregates across Stripe + Gumroad + Lemon Squeezy + Paddle at indie hacker price points.",
        "created_at": "2025-02-01T16:00:00+00:00"
    },
    {
        "id": "idea_011",
        "title": "Automated LinkedIn DM Follow-Up Sequence Builder",
        "description": "B2B sales reps sending LinkedIn connection requests have no native tool to set up automated, personalized follow-up sequences. Sales Navigator doesn't support messaging automation. The only tools that exist violate LinkedIn ToS. A native-feeling, compliant tool that sends 3–5 personalized follow-ups on a smart schedule would be worth $79/mo to any SDR.",
        "source": "linkedin",
        "source_display": "LinkedIn",
        "source_badge_color": "#0A66C2",
        "source_url": "https://linkedin.com",
        "category": "Sales & CRM",
        "pain_intensity": "moderate",
        "pain_quote": "\"LinkedIn is my #1 channel but I manually follow up with every connection. I need a compliant tool that does this automatically without getting my account flagged.\" — SDR Manager",
        "votes_on_source": 2134,
        "opportunity_score": 74,
        "market_score": 72,
        "competition_score": 65,
        "revenue_score": 80,
        "revenue_estimate": "$20K–$90K/mo",
        "market_size": "$1.4B TAM",
        "trending": False,
        "upvotes": 156,
        "tags": ["LinkedIn", "sales", "automation", "B2B", "CRM"],
        "competition_analysis": "Dux-Soup/Expandi (ToS violation risk), Lemlist (email-primary). No fully compliant LinkedIn-native sequence builder with smart scheduling.",
        "created_at": "2025-01-15T10:00:00+00:00"
    },
    {
        "id": "idea_012",
        "title": "Open Source License Compliance Checker for Early Startups",
        "description": "Early-stage startups building on OSS are sitting on legal time bombs. FOSSA and Black Duck cost $10K+/year — completely inaccessible for a 3-person startup. A $49/mo GitHub-integrated tool that scans your dependencies, flags GPL/AGPL conflicts, and generates your NOTICE file automatically would prevent costly legal issues that typically surface during Series A due diligence.",
        "source": "producthunt",
        "source_display": "Product Hunt",
        "source_badge_color": "#DA552F",
        "source_url": "https://producthunt.com",
        "category": "Developer Tools",
        "pain_intensity": "moderate",
        "pain_quote": "\"Found out during Series A DD that we had 3 GPL-licensed packages we were using incorrectly. Cost us 2 weeks and $15K in legal fees. FOSSA would've been $12K/yr. Insane.\" — Startup CTO",
        "votes_on_source": 987,
        "opportunity_score": 73,
        "market_score": 70,
        "competition_score": 67,
        "revenue_score": 78,
        "revenue_estimate": "$12K–$50K/mo",
        "market_size": "$580M TAM",
        "trending": False,
        "upvotes": 134,
        "tags": ["open source", "legal", "compliance", "developer", "GitHub"],
        "competition_analysis": "FOSSA ($10K+/yr), Black Duck (enterprise). No affordable, accessible OSS compliance tool targeting pre-Series A startups.",
        "created_at": "2025-01-12T11:00:00+00:00"
    },
    {
        "id": "idea_013",
        "title": "Podcast Episode Transcript → Multi-Platform Content Kit",
        "description": "Podcasters recording 1–4 episodes/week are leaving a content goldmine untouched. Their audio contains Twitter threads, LinkedIn posts, newsletter sections, and YouTube descriptions. No single tool takes a podcast transcript and outputs a full multi-platform content kit with proper formatting per platform. This is a weekly headache for every independent podcaster.",
        "source": "producthunt",
        "source_display": "Product Hunt",
        "source_badge_color": "#DA552F",
        "source_url": "https://producthunt.com",
        "category": "Content Creation",
        "pain_intensity": "moderate",
        "pain_quote": "\"I upload my podcast and then spend 3 hours reformatting it for 5 different platforms. I tried 4 tools. None of them output content that sounds like me.\" — Top Product Hunt comment, 312 upvotes",
        "votes_on_source": 1543,
        "opportunity_score": 75,
        "market_score": 73,
        "competition_score": 67,
        "revenue_score": 79,
        "revenue_estimate": "$15K–$60K/mo",
        "market_size": "$780M TAM",
        "trending": False,
        "upvotes": 178,
        "tags": ["podcast", "content", "AI", "repurposing", "creator"],
        "competition_analysis": "Castmagic ($39/mo, limited), Descript (editing-focused, expensive). No tool that outputs a complete multi-platform content kit from a single transcript.",
        "created_at": "2025-01-30T09:00:00+00:00"
    },
    {
        "id": "idea_014",
        "title": "AI Contract Red-Flag Detector for Non-Legal Founders",
        "description": "Founders signing vendor contracts, SaaS agreements, and NDAs are missing dangerous clauses — auto-renewal traps, unlimited liability, IP assignment overreach — that only a lawyer would catch. Legal review costs $300–$800 per contract. A $29/mo AI that reads any contract, highlights red flags in plain English, and suggests specific edits would save founders thousands annually.",
        "source": "indiehackers",
        "source_display": "Indie Hackers",
        "source_badge_color": "#0FAC81",
        "source_url": "https://indiehackers.com",
        "category": "Legal & Compliance",
        "pain_intensity": "severe",
        "pain_quote": "\"Got locked into a $24K/yr contract with a 12-month auto-renewal clause I missed. Lawyer would've caught it in 10 minutes. I just need something to read contracts for me.\" — IH founder",
        "votes_on_source": 3401,
        "opportunity_score": 88,
        "market_score": 87,
        "competition_score": 80,
        "revenue_score": 91,
        "revenue_estimate": "$40K–$160K/mo",
        "market_size": "$2.8B TAM",
        "trending": True,
        "upvotes": 398,
        "tags": ["legal", "AI", "contracts", "founders", "B2B SaaS"],
        "competition_analysis": "Ironclad (enterprise $50K+), LawGeex (legal teams). No consumer-grade AI contract reviewer at $29/mo for solo founders and small teams.",
        "created_at": "2025-02-04T13:00:00+00:00"
    },
    {
        "id": "idea_015",
        "title": "Customer Onboarding Video Personalizer at Scale",
        "description": "SaaS companies with 100–2,000 new signups/month send the same generic onboarding emails and videos to everyone. Personalized video tools like Loom require manual recording per customer — impossible at scale. A tool that auto-personalizes a template video by inserting the customer's name, company, and use case via AI-generated voiceover would dramatically improve activation rates.",
        "source": "producthunt",
        "source_display": "Product Hunt",
        "source_badge_color": "#DA552F",
        "source_url": "https://producthunt.com",
        "category": "Sales & CRM",
        "pain_intensity": "moderate",
        "pain_quote": "\"Our onboarding videos have a 23% watch rate. I KNOW personalization would double it. But recording a custom video for 300 people/month is impossible.\" — PM at SaaS startup",
        "votes_on_source": 1234,
        "opportunity_score": 77,
        "market_score": 75,
        "competition_score": 70,
        "revenue_score": 82,
        "revenue_estimate": "$20K–$90K/mo",
        "market_size": "$960M TAM",
        "trending": False,
        "upvotes": 189,
        "tags": ["SaaS", "video", "onboarding", "AI", "personalization"],
        "competition_analysis": "Vidyard (manual, expensive), Loom (manual recording). No tool auto-personalizes onboarding videos at scale with AI-generated voiceover.",
        "created_at": "2025-01-26T14:00:00+00:00"
    }
]

async def seed_database():
    count = await db.ideas.count_documents({})
    if count == 0:
        for idea in SEED_IDEAS:
            await db.ideas.insert_one({**idea})
        logger.info(f"Seeded {len(SEED_IDEAS)} ideas")

# ── Auth Routes ───────────────────────────────────────────────
@api_router.post("/auth/register")
async def register(data: UserCreate):
    existing = await db.users.find_one({"email": data.email.lower()})
    if existing:
        raise HTTPException(400, "Email already in use")
    user = {
        "id": str(uuid.uuid4()),
        "email": data.email.lower(),
        "name": data.name,
        "password_hash": hash_password(data.password),
        "is_premium": False,
        "free_briefs_used": 0,
        "saved_ideas": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user)
    token = create_token(user["id"])
    safe = {k: v for k, v in user.items() if k not in ["_id", "password_hash"]}
    return {"token": token, "user": safe}

@api_router.post("/auth/login")
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email.lower()})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(401, "Invalid email or password")
    token = create_token(user["id"])
    safe = {k: v for k, v in user.items() if k not in ["_id", "password_hash"]}
    return {"token": token, "user": safe}

@api_router.get("/auth/me")
async def me(user=Depends(require_user)):
    return {k: v for k, v in user.items() if k not in ["_id", "password_hash"]}

# ── Ideas Routes ──────────────────────────────────────────────
@api_router.get("/ideas/feed")
async def get_feed(source: str = "all", category: str = "all", sort: str = "trending", user=Depends(get_user)):
    query = {}
    if source != "all":
        query["source"] = source
    if category != "all":
        query["category"] = category
    sort_map = {
        "trending": [("upvotes", -1)],
        "newest": [("created_at", -1)],
        "score": [("opportunity_score", -1)]
    }
    ideas = await db.ideas.find(query, {"_id": 0}).sort(sort_map.get(sort, [("upvotes", -1)])).to_list(100)
    saved_ids = set(user.get("saved_ideas", [])) if user else set()
    for idea in ideas:
        idea["is_saved"] = idea["id"] in saved_ids
    return ideas

@api_router.get("/ideas/trending")
async def get_trending(user=Depends(get_user)):
    ideas = await db.ideas.find({"trending": True}, {"_id": 0}).sort([("opportunity_score", -1)]).limit(6).to_list(6)
    saved_ids = set(user.get("saved_ideas", [])) if user else set()
    for idea in ideas:
        idea["is_saved"] = idea["id"] in saved_ids
    return ideas

@api_router.get("/ideas/user/saved")
async def get_saved(user=Depends(require_user)):
    saved_ids = user.get("saved_ideas", [])
    if not saved_ids:
        return []
    ideas = await db.ideas.find({"id": {"$in": saved_ids}}, {"_id": 0}).to_list(100)
    for idea in ideas:
        idea["is_saved"] = True
    return ideas

@api_router.get("/ideas/{idea_id}")
async def get_idea(idea_id: str, user=Depends(get_user)):
    idea = await db.ideas.find_one({"id": idea_id}, {"_id": 0})
    if not idea:
        raise HTTPException(404, "Idea not found")
    saved_ids = set(user.get("saved_ideas", [])) if user else set()
    idea["is_saved"] = idea["id"] in saved_ids
    if user:
        user_idea = await db.user_ideas.find_one({"user_id": user["id"], "idea_id": idea_id}, {"_id": 0})
        if user_idea:
            idea["brief"] = user_idea.get("brief")
            idea["landing_copy"] = user_idea.get("landing_copy")
        else:
            idea["brief"] = None
            idea["landing_copy"] = None
    return idea

@api_router.post("/ideas/{idea_id}/upvote")
async def upvote(idea_id: str, user=Depends(require_user)):
    result = await db.ideas.update_one({"id": idea_id}, {"$inc": {"upvotes": 1}})
    if result.modified_count == 0:
        raise HTTPException(404, "Idea not found")
    return {"success": True}

@api_router.post("/ideas/{idea_id}/save")
async def toggle_save(idea_id: str, user=Depends(require_user)):
    idea = await db.ideas.find_one({"id": idea_id})
    if not idea:
        raise HTTPException(404, "Idea not found")
    if idea_id in user.get("saved_ideas", []):
        await db.users.update_one({"id": user["id"]}, {"$pull": {"saved_ideas": idea_id}})
        return {"saved": False}
    else:
        await db.users.update_one({"id": user["id"]}, {"$addToSet": {"saved_ideas": idea_id}})
        return {"saved": True}

@api_router.post("/ideas/{idea_id}/brief")
async def generate_brief(idea_id: str, user=Depends(require_user)):
    if not user["is_premium"] and user["free_briefs_used"] >= 1:
        raise HTTPException(402, "Free limit reached. Upgrade to Pro for unlimited briefs.")
    idea = await db.ideas.find_one({"id": idea_id}, {"_id": 0})
    if not idea:
        raise HTTPException(404, "Idea not found")
    user_idea = await db.user_ideas.find_one({"user_id": user["id"], "idea_id": idea_id})
    if user_idea and user_idea.get("brief"):
        return {"brief": user_idea["brief"]}
    brief = await _generate_brief(idea)
    await db.user_ideas.update_one(
        {"user_id": user["id"], "idea_id": idea_id},
        {"$set": {"brief": brief, "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    if not user["is_premium"]:
        await db.users.update_one({"id": user["id"]}, {"$inc": {"free_briefs_used": 1}})
    return {"brief": brief}

@api_router.post("/ideas/{idea_id}/landing-copy")
async def generate_landing_copy(idea_id: str, user=Depends(require_user)):
    if not user["is_premium"] and user["free_briefs_used"] >= 1:
        raise HTTPException(402, "Free limit reached. Upgrade to Pro for unlimited content.")
    idea = await db.ideas.find_one({"id": idea_id}, {"_id": 0})
    if not idea:
        raise HTTPException(404, "Idea not found")
    user_idea = await db.user_ideas.find_one({"user_id": user["id"], "idea_id": idea_id})
    if user_idea and user_idea.get("landing_copy"):
        return {"landing_copy": user_idea["landing_copy"]}
    copy = await _generate_landing_copy(idea)
    await db.user_ideas.update_one(
        {"user_id": user["id"], "idea_id": idea_id},
        {"$set": {"landing_copy": copy, "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    if not user["is_premium"]:
        await db.users.update_one({"id": user["id"]}, {"$inc": {"free_briefs_used": 1}})
    return {"landing_copy": copy}

@api_router.post("/subscription/upgrade")
async def upgrade(user=Depends(require_user)):
    await db.users.update_one({"id": user["id"]}, {"$set": {"is_premium": True}})
    return {"success": True, "message": "Welcome to IdeaRadar Pro!"}

@api_router.get("/stats")
async def get_stats():
    total = await db.ideas.count_documents({})
    users = await db.users.count_documents({})
    briefs = await db.user_ideas.count_documents({"brief": {"$exists": True, "$ne": None}})
    return {"ideas_discovered": total, "users": users, "briefs_generated": briefs}

# ── AI Generation ─────────────────────────────────────────────
async def _generate_brief(idea: dict) -> str:
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"brief-{uuid.uuid4()}",
        system_message="You are an expert startup strategist and business analyst specializing in Micro-SaaS opportunities. You create precise, actionable business briefs grounded in real market data."
    ).with_model("openai", "gpt-4o")

    prompt = f"""Generate a comprehensive business brief for this validated startup opportunity:

**Opportunity:** {idea['title']}
**Pain Point:** {idea['description']}
**Market Validation:** {idea.get('pain_quote', '')}
**Market Size:** {idea['market_size']} | **Revenue Target:** {idea['revenue_estimate']}
**Category:** {idea['category']} | **Competition Gap:** {idea.get('competition_analysis', '')}

Create a detailed business brief with these exact sections using markdown:

## Executive Summary
[2-3 compelling sentences positioning this as a clear market opportunity]

## The Validated Problem
[Specific pain, affected user segments, frequency of occurrence, quantified cost to users]

## Ideal Customer Profile
[Precise demographics, firmographics, job titles, company size, behaviors, willingness to pay]

## Solution Architecture
[Core 3 features, technical approach, key differentiators, MVP scope]

## Revenue Model
[3 pricing tiers with exact $ amounts, projected LTV, CAC estimate, payback period]

## Competitive Moat
[Why you win: what exists, why it fails this segment, your sustainable advantage]

## Go-To-Market: First 100 Customers
[Specific acquisition channels, outreach tactics, partnership opportunities, timeline]

## 90-Day Launch Plan
- **Week 1-2:** [Specific actions]
- **Week 3-4:** [Specific actions]
- **Month 2:** [Specific milestones]
- **Month 3:** [Revenue targets and growth actions]

Be specific with numbers. No vague advice. Write like an experienced founder who has launched 5 successful SaaS products."""

    return await chat.send_message(UserMessage(text=prompt))

async def _generate_landing_copy(idea: dict) -> str:
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"lp-{uuid.uuid4()}",
        system_message="You are a world-class conversion copywriter who has written landing pages generating $100M+ in SaaS revenue. Your copy is specific, emotionally resonant, and drives action."
    ).with_model("openai", "gpt-4o")

    prompt = f"""Write a complete, high-converting landing page for this product:

**Product:** {idea['title']}
**Target Customer Pain:** {idea['description']}
**Validated Quote:** {idea.get('pain_quote', '')}
**Category:** {idea['category']}

Write the copy in this exact format:

## Hero Headline
[Specific, pain-aware headline under 8 words. Not generic.]

## Sub-headline  
[One sentence that clarifies who this is for and what they get]

## Social Proof Bar
[3 specific numbers: "X companies use us" / "X hours saved per week" / "X% improvement"]

## Value Proposition 1
**[Short punchy header]**
[One specific sentence — what it does and why it matters]

## Value Proposition 2
**[Short punchy header]**
[One specific sentence]

## Value Proposition 3
**[Short punchy header]**
[One specific sentence]

## Feature: [Name]
[2-sentence description of how this feature eliminates a specific pain]

## Feature: [Name]
[2-sentence description]

## Feature: [Name]
[2-sentence description]

## Customer Testimonial
"[Specific, believable quote with measurable result]"
— [Name], [Title] at [Company Type]

## Pricing
**Starter — $[X]/month**
[3 bullet points of what's included]

**Pro — $[X]/month**
[3 bullet points, emphasize the upgrade trigger]

**Team — $[X]/month**
[3 bullet points for teams]

## Primary CTA
Button: [Action-oriented text]
Subtext: [Remove friction — e.g. "No credit card required. 5-minute setup."]

## Objection Handler
[One sentence that pre-empts the #1 reason someone wouldn't sign up]

Make every word earn its place. Specific beats generic. Always."""

    return await chat.send_message(UserMessage(text=prompt))

# ── App Setup ─────────────────────────────────────────────────
app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await seed_database()

@app.on_event("shutdown")
async def shutdown():
    client.close()
