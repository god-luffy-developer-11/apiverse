import os
import json
from typing import Optional, List
from fastapi import APIRouter, Query

router = APIRouter(prefix="/explorer", tags=["API Explorer"])

# Flagship curated APIs
FLAGSHIP_CATALOG = [
    {
        "id": "stripe",
        "name": "Stripe Payments",
        "category": "Fintech & Billing",
        "constellation": "Cygnus",
        "description": "Financial infrastructure for the internet. Payments, billing, subscriptions, invoicing and identity verification.",
        "authType": "API_KEY",
        "pricing": "FREEMIUM",
        "latencyMs": 85,
        "uptime99": 99.99,
        "freeTierLimit": "Sandbox unlimited, 2.9% + $0.30 per live charge",
        "icon": "💳",
        "endpointsCount": 182,
        "popularityRank": 98,
        "apiKeyUrl": "https://dashboard.stripe.com/apikeys",
        "docsUrl": "https://stripe.com/docs/api",
        "portalUrl": "https://dashboard.stripe.com",
        "https": True,
        "cors": "Yes",
        "quickSetupSnippet": "curl https://api.stripe.com/v1/charges -u sk_test_...:"
    },
    {
        "id": "openai",
        "name": "OpenAI Platform",
        "category": "AI & Machine Learning",
        "constellation": "Orion",
        "description": "State-of-the-art LLMs (GPT-4o, GPT-4o-mini, text embeddings, DALL-E, Whisper speech-to-text).",
        "authType": "BEARER",
        "pricing": "PAID",
        "latencyMs": 240,
        "uptime99": 99.85,
        "freeTierLimit": "$5 initial grant for new verified accounts",
        "icon": "🧠",
        "endpointsCount": 45,
        "popularityRank": 99,
        "apiKeyUrl": "https://platform.openai.com/api-keys",
        "docsUrl": "https://platform.openai.com/docs",
        "portalUrl": "https://platform.openai.com",
        "https": True,
        "cors": "Yes",
        "quickSetupSnippet": "curl https://api.openai.com/v1/chat/completions -H 'Authorization: Bearer sk-...' -d '{\"model\":\"gpt-4o-mini\",\"messages\":[{\"role\":\"user\",\"content\":\"Hello\"}]}'"
    },
    {
        "id": "gemini",
        "name": "Google Gemini (AI Studio)",
        "category": "AI & Machine Learning",
        "constellation": "Centaurus",
        "description": "Google's multimodal flagship AI models (Gemini 2.5/3.8 Flash, Pro, Vision, Audio, Computer Use) with generous free tier.",
        "authType": "API_KEY",
        "pricing": "FREEMIUM",
        "latencyMs": 140,
        "uptime99": 99.94,
        "freeTierLimit": "15 RPM / 1,500 RPD free with no credit card required",
        "icon": "✨",
        "endpointsCount": 38,
        "popularityRank": 99,
        "apiKeyUrl": "https://aistudio.google.com/app/apikey",
        "docsUrl": "https://ai.google.dev/gemini-api/docs",
        "portalUrl": "https://aistudio.google.com",
        "https": True,
        "cors": "Yes",
        "quickSetupSnippet": "curl 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=YOUR_KEY' -H 'Content-Type: application/json' -d '{\"contents\":[{\"parts\":[{\"text\":\"Hello\"}]}]}'"
    },
    {
        "id": "anthropic",
        "name": "Anthropic Claude",
        "category": "AI & Machine Learning",
        "constellation": "Andromeda",
        "description": "Next-generation intelligence with Claude 3.5 Sonnet & Haiku. Premier reasoning, coding, and large context windows.",
        "authType": "API_KEY",
        "pricing": "PAID",
        "latencyMs": 210,
        "uptime99": 99.88,
        "freeTierLimit": "$5 initial credit on organization activation",
        "icon": "🎭",
        "endpointsCount": 26,
        "popularityRank": 97,
        "apiKeyUrl": "https://console.anthropic.com/settings/keys",
        "docsUrl": "https://docs.anthropic.com",
        "portalUrl": "https://console.anthropic.com",
        "https": True,
        "cors": "Yes",
        "quickSetupSnippet": "curl https://api.anthropic.com/v1/messages -H 'x-api-key: sk-ant-...' -H 'anthropic-version: 2023-06-01' -d '{\"model\":\"claude-3-5-sonnet-20241022\",\"max_tokens\":1024,\"messages\":[{\"role\":\"user\",\"content\":\"Hi\"}]}'"
    },
    {
        "id": "twilio",
        "name": "Twilio Communications",
        "category": "Messaging & Voice",
        "constellation": "Pegasus",
        "description": "Global communications cloud: programmable SMS, voice, WhatsApp, Two-Factor Verify, and SIP trunking.",
        "authType": "BASIC",
        "pricing": "FREEMIUM",
        "latencyMs": 110,
        "uptime99": 99.95,
        "freeTierLimit": "$15 free sandbox trial balance",
        "icon": "📱",
        "endpointsCount": 94,
        "popularityRank": 92,
        "apiKeyUrl": "https://console.twilio.com/",
        "docsUrl": "https://www.twilio.com/docs",
        "portalUrl": "https://console.twilio.com",
        "https": True,
        "cors": "Yes",
        "quickSetupSnippet": "curl -X POST https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Messages.json -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN"
    },
    {
        "id": "supabase",
        "name": "Supabase PostgreSQL",
        "category": "Databases & Storage",
        "constellation": "Lyra",
        "description": "Open source Firebase alternative: instant Postgres database, Auth, Realtime edge subscriptions, Storage, and Vector.",
        "authType": "API_KEY",
        "pricing": "FREEMIUM",
        "latencyMs": 42,
        "uptime99": 99.97,
        "freeTierLimit": "2 free projects, 500MB DB, 50,000 MAU, 1GB storage",
        "icon": "⚡",
        "endpointsCount": 58,
        "popularityRank": 96,
        "apiKeyUrl": "https://app.supabase.com/project/_/settings/api",
        "docsUrl": "https://supabase.com/docs",
        "portalUrl": "https://supabase.com",
        "https": True,
        "cors": "Yes",
        "quickSetupSnippet": "curl 'https://<project-ref>.supabase.co/rest/v1/todos' -H 'apikey: <anon-key>' -H 'Authorization: Bearer <anon-key>'"
    },
    {
        "id": "resend",
        "name": "Resend Modern Email",
        "category": "Messaging & Voice",
        "constellation": "Cassiopeia",
        "description": "Developer-first email delivery platform built on React Email, exceptional deliverability, and real-time open webhooks.",
        "authType": "API_KEY",
        "pricing": "FREEMIUM",
        "latencyMs": 95,
        "uptime99": 99.99,
        "freeTierLimit": "3,000 emails/month free, 100 emails/day",
        "icon": "📧",
        "endpointsCount": 14,
        "popularityRank": 94,
        "apiKeyUrl": "https://resend.com/api-keys",
        "docsUrl": "https://resend.com/docs/api-reference",
        "portalUrl": "https://resend.com",
        "https": True,
        "cors": "Yes",
        "quickSetupSnippet": "curl -X POST 'https://api.resend.com/emails' -H 'Authorization: Bearer re_...' -H 'Content-Type: application/json' -d '{\"from\":\"onboarding@resend.dev\",\"to\":\"delivered@resend.dev\",\"subject\":\"Hello\",\"html\":\"<p>Hi</p>\"}'"
    },
    {
        "id": "github-api",
        "name": "GitHub REST & GraphQL",
        "category": "Developer Tools",
        "constellation": "Phoenix",
        "description": "Programmatic interface to code repositories, pull requests, actions workflows, GitHub issues, and developer graphs.",
        "authType": "BEARER",
        "pricing": "FREE",
        "latencyMs": 75,
        "uptime99": 99.96,
        "freeTierLimit": "5,000 requests/hour authenticated, 60/hr unauth",
        "icon": "🐙",
        "endpointsCount": 340,
        "popularityRank": 99,
        "apiKeyUrl": "https://github.com/settings/tokens",
        "docsUrl": "https://docs.github.com/en/rest",
        "portalUrl": "https://github.com",
        "https": True,
        "cors": "Yes",
        "quickSetupSnippet": "curl -H 'Accept: application/vnd.github+json' -H 'Authorization: Bearer ghp_...' https://api.github.com/user"
    },
    {
        "id": "clerk",
        "name": "Clerk Auth & User Management",
        "category": "Security & Identity",
        "constellation": "Andromeda",
        "description": "Complete user authentication, session security, multi-factor auth, passkeys, and organization tenant management.",
        "authType": "BEARER",
        "pricing": "FREEMIUM",
        "latencyMs": 52,
        "uptime99": 99.99,
        "freeTierLimit": "10,000 monthly active users (MAU) completely free",
        "icon": "🛡️",
        "endpointsCount": 62,
        "popularityRank": 95,
        "apiKeyUrl": "https://dashboard.clerk.com",
        "docsUrl": "https://clerk.com/docs",
        "portalUrl": "https://dashboard.clerk.com",
        "https": True,
        "cors": "Yes",
        "quickSetupSnippet": "curl https://api.clerk.com/v1/users -H 'Authorization: Bearer sk_test_...'"
    },
    {
        "id": "algolia",
        "name": "Algolia Search & Discovery",
        "category": "Developer Tools",
        "constellation": "Ursa Major",
        "description": "Sub-millisecond typo-tolerant search, facet filtering, neural re-ranking, and recommendation APIs.",
        "authType": "API_KEY",
        "pricing": "FREEMIUM",
        "latencyMs": 18,
        "uptime99": 99.99,
        "freeTierLimit": "10,000 search requests / month free forever",
        "icon": "🔍",
        "endpointsCount": 54,
        "popularityRank": 92,
        "apiKeyUrl": "https://dashboard.algolia.com/account/api-keys",
        "docsUrl": "https://www.algolia.com/doc/",
        "portalUrl": "https://dashboard.algolia.com",
        "https": True,
        "cors": "Yes",
        "quickSetupSnippet": "curl -X POST https://<APP_ID>.algolia.net/1/indexes/<INDEX>/query -H 'X-Algolia-API-Key: ...' -H 'X-Algolia-Application-Id: ...'"
    },
    {
        "id": "mapbox",
        "name": "Mapbox Navigation & Maps",
        "category": "Geocoding",
        "constellation": "Crux",
        "description": "High-performance vector tiles, global forward/reverse geocoding, turn-by-turn routing, and 3D terrain rendering.",
        "authType": "API_KEY",
        "pricing": "FREEMIUM",
        "latencyMs": 45,
        "uptime99": 99.93,
        "freeTierLimit": "50,000 map loads & 100,000 geocoding requests / month free",
        "icon": "🗺️",
        "endpointsCount": 42,
        "popularityRank": 90,
        "apiKeyUrl": "https://account.mapbox.com/access-tokens/",
        "docsUrl": "https://docs.mapbox.com/api/",
        "portalUrl": "https://account.mapbox.com",
        "https": True,
        "cors": "Yes",
        "quickSetupSnippet": "curl 'https://api.mapbox.com/geocoding/v5/mapbox.places/Los%20Angeles.json?access_token=pk....'"
    },
    {
        "id": "deepgram",
        "name": "Deepgram Speech AI",
        "category": "Machine Learning",
        "constellation": "Vela",
        "description": "Real-time speech-to-text, audio intelligence, diarization, and human-like text-to-speech with sub-300ms latency.",
        "authType": "API_KEY",
        "pricing": "FREEMIUM",
        "latencyMs": 68,
        "uptime99": 99.94,
        "freeTierLimit": "$200 free credit on signup (over 12,000 minutes)",
        "icon": "🎙️",
        "endpointsCount": 28,
        "popularityRank": 91,
        "apiKeyUrl": "https://console.deepgram.com/",
        "docsUrl": "https://developers.deepgram.com/",
        "portalUrl": "https://console.deepgram.com",
        "https": True,
        "cors": "Yes",
        "quickSetupSnippet": "curl -X POST 'https://api.deepgram.com/v1/listen' -H 'Authorization: Token ...' -H 'Content-Type: audio/wav' --data-binary @audio.wav"
    },
    {
        "id": "huggingface",
        "name": "Hugging Face Inference",
        "category": "Machine Learning",
        "constellation": "Centaurus",
        "description": "Serverless inference for 100,000+ open-source AI models across computer vision, NLP, text generation, and audio.",
        "authType": "BEARER",
        "pricing": "FREEMIUM",
        "latencyMs": 190,
        "uptime99": 99.82,
        "freeTierLimit": "Free community rate-limited inference API",
        "icon": "🤗",
        "endpointsCount": 110,
        "popularityRank": 94,
        "apiKeyUrl": "https://huggingface.co/settings/tokens",
        "docsUrl": "https://huggingface.co/docs/api-inference",
        "portalUrl": "https://huggingface.co",
        "https": True,
        "cors": "Yes",
        "quickSetupSnippet": "curl https://api-inference.huggingface.co/models/bert-base-uncased -H 'Authorization: Bearer hf_...' -d '{\"inputs\":\"Today is a [MASK] day.\"}'"
    }
]

# Load full public_apis.json database
DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "public_apis.json")
CATEGORIES_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "categories.json")

def load_catalog() -> List[dict]:
    catalog = list(FLAGSHIP_CATALOG)
    seen_names = set(a["name"].lower() for a in catalog)
    if os.path.exists(DATA_PATH):
        try:
            with open(DATA_PATH, "r", encoding="utf-8") as f:
                apis = json.load(f)
                for api in apis:
                    if api["name"].lower() not in seen_names:
                        catalog.append(api)
                        seen_names.add(api["name"].lower())
        except Exception as e:
            print(f"Warning: Failed to load public_apis.json: {e}")
    return catalog

CATALOG = load_catalog()

@router.get("/apis")
async def list_apis(
    category: Optional[str] = None,
    pricing: Optional[str] = None,
    search: Optional[str] = None,
    auth_type: Optional[str] = None,
    limit: Optional[int] = None,
    offset: int = 0
):
    results = CATALOG
    if category and category != "ALL":
        results = [a for a in results if a.get("category", "").lower() == category.lower()]
    if pricing and pricing != "ALL":
        results = [a for a in results if a.get("pricing", "").lower() == pricing.lower()]
    if auth_type and auth_type != "ALL":
        results = [a for a in results if a.get("authType", "").lower() == auth_type.lower()]
    if search:
        s = search.lower()
        results = [
            a for a in results
            if s in a.get("name", "").lower()
            or s in a.get("description", "").lower()
            or s in a.get("category", "").lower()
            or s in a.get("constellation", "").lower()
        ]
    
    if limit is not None and limit > 0:
        return results[offset : offset + limit]
    return results

@router.get("/categories")
async def list_categories():
    if os.path.exists(CATEGORIES_PATH):
        try:
            with open(CATEGORIES_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    
    # Fallback compute dynamically
    cats = sorted(list(set(a.get("category", "General") for a in CATALOG)))
    return {
        "total_apis": len(CATALOG),
        "total_categories": len(cats),
        "categories": [{"name": c, "icon": "✨", "count": sum(1 for a in CATALOG if a.get("category") == c)} for c in cats]
    }

@router.get("/stats")
async def get_stats():
    total = len(CATALOG)
    free_count = sum(1 for a in CATALOG if a.get("pricing") == "FREE" or a.get("authType") == "NONE")
    https_count = sum(1 for a in CATALOG if a.get("https") is True)
    categories = sorted(list(set(a.get("category", "General") for a in CATALOG)))
    return {
        "totalApis": total,
        "totalCategories": len(categories),
        "totalFree": free_count,
        "totalHttps": https_count,
        "status": "LIVE",
        "source": "public-apis/public-apis database injected"
    }

@router.get("/compare")
async def compare_apis(api_ids: str):
    ids = [i.strip() for i in api_ids.split(",")]
    matched = [a for a in CATALOG if a["id"] in ids]
    return {
        "compared": matched,
        "recommendation": "Supabase + Resend + Gemini provides the most powerful modern stack with $0 upfront cost."
    }
