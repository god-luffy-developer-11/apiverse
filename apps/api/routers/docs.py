import httpx
from fastapi import APIRouter
from pydantic import BaseModel
from core.config import settings

router = APIRouter(prefix="/docs", tags=["Documentation Hub"])

class ExplainRequest(BaseModel):
    api: str
    endpoint: str
    description: str

DOCS_INDEX = [
    {
        "id": "doc_stripe_01",
        "api": "Stripe",
        "version": "2024-06-20",
        "method": "POST",
        "path": "/v1/payment_intents",
        "endpoint": "POST /v1/payment_intents",
        "summary": "Create a PaymentIntent object to initiate and track customer payment collection flow.",
        "parameters": [
            {"name": "amount", "type": "integer", "required": True, "desc": "Amount intended to be collected in smallest currency unit (e.g. 1000 for $10.00)."},
            {"name": "currency", "type": "string", "required": True, "desc": "Three-letter ISO currency code (e.g. 'usd', 'eur')."},
            {"name": "payment_method_types", "type": "array[string]", "required": False, "desc": "Payment methods to accept (e.g. ['card', 'link'])."}
        ],
        "defaultBody": "{\n  \"amount\": 2000,\n  \"currency\": \"usd\",\n  \"automatic_payment_methods\": { \"enabled\": true }\n}",
        "aiExplanation": "A PaymentIntent models the complete customer payment lifecycle. It handles complex asynchronous payment flows, automated 3D Secure regulatory authentication, retry logic, and webhook confirmation.",
        "changelog": [
            {"version": "2024-06-20", "note": "Added native support for Apple Pay One-Click tokens and instant merchant payouts."},
            {"version": "2023-10-16", "note": "Deprecated legacy `charges` endpoint in favor of unified PaymentIntents."}
        ]
    },
    {
        "id": "doc_openai_01",
        "api": "OpenAI",
        "version": "v1",
        "method": "POST",
        "path": "/v1/chat/completions",
        "endpoint": "POST /v1/chat/completions",
        "summary": "Creates a model response for the given conversation messages.",
        "parameters": [
            {"name": "model", "type": "string", "required": True, "desc": "ID of model (e.g. 'gpt-4o', 'gpt-4o-mini')."},
            {"name": "messages", "type": "array[object]", "required": True, "desc": "Array of message objects with 'role' ('system', 'user', 'assistant') and 'content'."},
            {"name": "temperature", "type": "float", "required": False, "desc": "Sampling temperature between 0 and 2. Lower is more deterministic."}
        ],
        "defaultBody": "{\n  \"model\": \"gpt-4o\",\n  \"messages\": [\n    {\"role\": \"system\", \"content\": \"You are a helpful assistant.\"},\n    {\"role\": \"user\", \"content\": \"Explain quantum computing in 1 sentence.\"}\n  ],\n  \"temperature\": 0.7\n}",
        "aiExplanation": "Generates streamable text and structured outputs. Supports function calling, JSON schema guarantees, vision inputs, and token-level log probabilities.",
        "changelog": [
            {"version": "v1.4", "note": "Strict structured outputs with 100% schema compliance guarantee enabled."},
            {"version": "v1.2", "note": "Added gpt-4o-mini high-throughput low-latency model."}
        ]
    },
    {
        "id": "doc_twilio_01",
        "api": "Twilio",
        "version": "2010-04-01",
        "method": "POST",
        "path": "/2010-04-01/Accounts/{AccountSid}/Messages.json",
        "endpoint": "POST /2010-04-01/Accounts/{Sid}/Messages.json",
        "summary": "Send a new outgoing SMS, MMS, or WhatsApp message to a phone number.",
        "parameters": [
            {"name": "To", "type": "string", "required": True, "desc": "Destination phone number in E.164 format (e.g. +14155552671)."},
            {"name": "From", "type": "string", "required": True, "desc": "Twilio phone number or alphanumeric Sender ID."},
            {"name": "Body", "type": "string", "required": True, "desc": "Text body of the message (up to 1600 characters)."}
        ],
        "defaultBody": "{\n  \"To\": \"+15551234567\",\n  \"From\": \"+15559876543\",\n  \"Body\": \"APIVerse verification code: 829104. Valid for 10 minutes.\"\n}",
        "aiExplanation": "Direct carrier gateway message router. Automatically handles GSM 03.38 character segmentation, carrier compliance filtering, and delivery status receipts.",
        "changelog": [
            {"version": "2024-03-01", "note": "Enforced A2P 10DLC campaign registration verification for US messaging."},
            {"version": "2023-08-15", "note": "Added interactive WhatsApp template messaging support."}
        ]
    }
]

@router.get("/")
async def list_docs():
    return DOCS_INDEX

@router.post("/explain")
async def explain_endpoint_with_ai(req: ExplainRequest):
    key = settings.GEMINI_API_KEY
    if key:
        prompt = f"""You are Ultron, the sharp developer AI of APIVerse.
Explain the technical architecture, security nuances, and best practices for this API endpoint:
API: {req.api}
Endpoint: {req.endpoint}
Description: {req.description}

Keep the explanation to 3 punchy, insightful developer bullet points."""
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key={key}"
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(url, json={"contents": [{"parts": [{"text": prompt}]}]})
                if res.status_code == 200:
                    cand = res.json().get("candidates", [])[0]
                    text = cand.get("content", {}).get("parts", [])[0].get("text", "")
                    return {"explanation": text}
        except Exception:
            pass

    return {
        "explanation": f"Ultron Architecture Summary for {req.endpoint}: Enforce idempotency keys on write operations, validate SSL/TLS certificate chains, and implement exponential backoff with jitter on 429/5xx status codes."
    }
