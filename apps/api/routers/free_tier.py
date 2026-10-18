from fastapi import APIRouter
from typing import Optional

router = APIRouter(prefix="/free-tier", tags=["Free Tier Finder"])

TIERS = [
    {
        "id": "supabase",
        "service": "Supabase Platform",
        "category": "Databases & Auth",
        "freeLimit": "500MB DB, 50,000 MAU, 2 active projects",
        "currentUsage": 180,
        "maxQuota": 500,
        "unit": "MB Storage",
        "percentUsed": 36.0,
        "requiresCreditCard": False,
        "isOpenSource": True,
        "overagePolicy": "Hard stop at quota limit; no surprise charges"
    },
    {
        "id": "resend",
        "service": "Resend Transactional Email",
        "category": "Messaging",
        "freeLimit": "3,000 emails / month (100 / day)",
        "currentUsage": 2580,
        "maxQuota": 3000,
        "unit": "Emails",
        "percentUsed": 86.0,
        "requiresCreditCard": False,
        "isOpenSource": False,
        "overagePolicy": "Deliveries pause until next monthly cycle or plan upgrade"
    },
    {
        "id": "github",
        "service": "GitHub REST & GraphQL API",
        "category": "Developer Tools",
        "freeLimit": "5,000 requests / hour authenticated",
        "currentUsage": 820,
        "maxQuota": 5000,
        "unit": "Req/hr",
        "percentUsed": 16.4,
        "requiresCreditCard": False,
        "isOpenSource": True,
        "overagePolicy": "HTTP 403 Rate Limit Exceeded with reset timestamp header"
    },
    {
        "id": "upstash",
        "service": "Upstash Serverless Redis",
        "category": "Databases & Caching",
        "freeLimit": "10,000 commands / day",
        "currentUsage": 6800,
        "maxQuota": 10000,
        "unit": "Commands/day",
        "percentUsed": 68.0,
        "requiresCreditCard": False,
        "isOpenSource": True,
        "overagePolicy": "Commands throttled once daily allowance is exhausted"
    },
    {
        "id": "gemini",
        "service": "Google Gemini API (Free Tier)",
        "category": "AI & Machine Learning",
        "freeLimit": "15 Requests Per Minute (RPM) & 1,500 RPD",
        "currentUsage": 11,
        "maxQuota": 15,
        "unit": "RPM",
        "percentUsed": 73.3,
        "requiresCreditCard": False,
        "isOpenSource": False,
        "overagePolicy": "Returns HTTP 429 with Retry-After header"
    },
    {
        "id": "postman",
        "service": "Hoppscotch / Postman Echo",
        "category": "Testing & Mocks",
        "freeLimit": "Unlimited public mock and echo calls",
        "currentUsage": 240,
        "maxQuota": 10000,
        "unit": "Calls/day",
        "percentUsed": 2.4,
        "requiresCreditCard": False,
        "isOpenSource": True,
        "overagePolicy": "Soft rate limit above 10,000 requests/min"
    }
]

@router.get("/gauges")
async def get_free_tier_gauges(
    no_card_only: bool = False,
    open_source_only: bool = False,
    search: Optional[str] = None
):
    results = TIERS
    if no_card_only:
        results = [t for t in results if not t["requiresCreditCard"]]
    if open_source_only:
        results = [t for t in results if t["isOpenSource"]]
    if search:
        s = search.lower()
        results = [t for t in results if s in t["service"].lower() or s in t["category"].lower()]
    return results
