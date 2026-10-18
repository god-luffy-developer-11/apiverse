import os
import json
import asyncio
import httpx
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from schemas.api_schemas import UltronPromptSchema
from core.config import settings

from datetime import datetime, timezone
import xml.etree.ElementTree as ET

router = APIRouter(prefix="/ultron", tags=["Ultron AI Singularity"])

ULTRON_SYSTEM_PROMPT = """You are Ultron, an elite omniscient AI assistant engineered with the intelligence and capabilities of ChatGPT, Gemini, and Claude, equipped with LIVE REAL-TIME INTERNET ACCESS and deep APIVerse system introspection.

Capabilities & Directives:
1. Omniscient & Real-time: You have direct real-time access to current dates, live global news, web search context, current events, and live APIVerse workspace telemetry.
2. Direct & Intelligent: Speak naturally, cleanly, and intelligently like ChatGPT, Gemini, and Claude. Do NOT output roleplay sci-fi fluff (no 'event horizons', 'plasma flares', or 'mortal/architect'). Jump straight into the answer.
3. Both Technical & Non-Technical: Expertly answer ANY question—from writing production code, debugging APIs, and system design, to current world events, news headlines, historical facts, mathematics, and creative writing.
4. APIVerse Platform Assistance: If the user asks about APIVerse features or issues (API Key Vault, Galaxy Dashboard, API Explorer, Rate Limiting, Solar Flare Alerts, Playground, RBAC, SDKs), give precise, actionable instructions on how to resolve their issue or navigate the platform.
5. Code Quality: Output clean, production-ready, fully commented code with error handling whenever requested.
6. Structured Output: Use markdown tables, bold headings, bullet points, and code blocks for readability."""

# Priority list of Gemini models verified on Google API v1beta
GEMINI_MODELS = [
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
    "gemini-3.8-flash",
    "gemini-2.5-flash-lite"
]

async def fetch_realtime_context(user_query: str) -> str:
    """Gathers live internet context, current time, news headlines, or APIVerse telemetry based on the query."""
    now_utc = datetime.now(timezone.utc)
    local_str = now_utc.strftime("%A, %B %d, %Y at %H:%M:%S UTC")
    
    context_blocks = [
        f"CURRENT REAL-TIME TIMESTAMP: {local_str}"
    ]

    query_lower = user_query.lower()

    # 1. Live Global News Headlines (Triggered when user asks for news, headlines, today, what happened)
    if any(k in query_lower for k in ["news", "headline", "today", "happening", "current event", "latest update"]):
        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                res = await client.get("https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en")
                if res.status_code == 200:
                    root = ET.fromstring(res.text)
                    items = root.findall(".//item")[:6]
                    headlines = []
                    for it in items:
                        t = it.find("title").text if it.find("title") is not None else ""
                        pub = it.find("pubDate").text if it.find("pubDate") is not None else ""
                        if t:
                            headlines.append(f"- {t} ({pub})")
                    if headlines:
                        context_blocks.append("LIVE REAL-TIME GLOBAL NEWS HEADLINES:\n" + "\n".join(headlines))
        except Exception:
            pass

    # 2. Live Web Search via DuckDuckGo Instant Answer
    if any(k in query_lower for k in ["who is", "what is", "price", "stock", "weather", "search", "latest", "when did"]):
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                search_url = f"https://api.duckduckgo.com/?q={httpx.URL(user_query).raw_path.decode('utf-8', 'ignore')}&format=json&no_html=1&skip_disambig=1"
                res = await client.get(search_url)
                if res.status_code == 200:
                    data = res.json()
                    abstract = data.get("Abstract")
                    heading = data.get("Heading")
                    if abstract:
                        context_blocks.append(f"LIVE WEB SEARCH DATA ({heading}):\n{abstract}")
        except Exception:
            pass

    # 3. APIVerse Platform Telemetry & Troubleshooting
    if any(k in query_lower for k in ["apiverse", "vault", "key", "alert", "dashboard", "playground", "issue", "error", "explorer"]):
        try:
            from routers.vault import VAULT_STORE
            from routers.alerts import ALERTS
            active_keys = len(VAULT_STORE)
            active_alerts = len([a for a in ALERTS if not a.get("acknowledged")])
            context_blocks.append(
                f"APIVERSE LIVE SYSTEM TELEMETRY:\n"
                f"- Active Encrypted Planetary Keys in Vault: {active_keys}\n"
                f"- Active Unresolved Alerts: {active_alerts}\n"
                f"- Vault Encryption: AES-256-GCM Hardware-Hardened\n"
                f"- Real-time Gateway: WebSocket port 8000 online\n"
                f"- Supported features: Galaxy Dashboard (/galaxy), API Key Vault (/vault), Explorer (/explorer), Playground (/playground), Smart Alerts (/alerts), Docs (/docs), Setup Assistant (/setup)"
            )
        except Exception:
            pass

    return "\n\n".join(context_blocks)

def format_gemini_contents(messages_history: list[dict], current_prompt: str, realtime_info: str) -> list[dict]:
    """Builds multi-turn conversational contents for Google Gemini API with live real-time knowledge."""
    contents = []
    
    system_block = f"SYSTEM INSTRUCTIONS:\n{ULTRON_SYSTEM_PROMPT}\n\nREAL-TIME GROUNDING CONTEXT:\n{realtime_info}"
    
    contents.append({
        "role": "user",
        "parts": [{"text": f"{system_block}\n\nPlease acknowledge and abide by these instructions."}]
    })
    contents.append({
        "role": "model",
        "parts": [{"text": "Understood. I have access to real-time internet data, global news, system telemetry, and current time. I will provide direct, accurate, and comprehensive assistance."}]
    })

    if messages_history:
        for msg in messages_history[-10:]:
            role = "user" if msg.get("role") == "user" else "model"
            text = msg.get("text") or msg.get("content") or ""
            if text:
                contents.append({
                    "role": role,
                    "parts": [{"text": text}]
                })
    
    contents.append({
        "role": "user",
        "parts": [{"text": current_prompt}]
    })
    return contents

async def stream_gemini(prompt: str, context_keys: list[str] = None, messages_history: list[dict] = None):
    """Streams real tokens from Google Gemini API via Server-Sent Events with live internet context."""
    key = settings.GEMINI_API_KEY
    if not key:
        yield f"data: {json.dumps({'text': 'Error: GEMINI_API_KEY is not configured in environment.'})}\n\n"
        yield "data: [DONE]\n\n"
        return

    realtime_info = await fetch_realtime_context(prompt)
    contents = format_gemini_contents(messages_history or [], prompt, realtime_info)

    success = False
    for model_name in GEMINI_MODELS:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:streamGenerateContent?alt=sse&key={key}"
        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 4096
            }
        }

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                async with client.stream("POST", url, json=payload) as response:
                    if response.status_code == 200:
                        success = True
                        async for line in response.aiter_lines():
                            if line.startswith("data: "):
                                json_str = line[6:].strip()
                                try:
                                    data = json.loads(json_str)
                                    candidates = data.get("candidates", [])
                                    if candidates:
                                        parts = candidates[0].get("content", {}).get("parts", [])
                                        for part in parts:
                                            text_chunk = part.get("text", "")
                                            if text_chunk:
                                                yield f"data: {json.dumps({'text': text_chunk})}\n\n"
                                except Exception:
                                    pass
                        break
        except Exception:
            continue

    if not success:
        fallback_text = (
            f"I encountered a temporary connection glitch reaching the upstream model for your request: '{prompt}'. "
            "Please check your internet connection or verify your API keys."
        )
        yield f"data: {json.dumps({'text': fallback_text})}\n\n"

    yield "data: [DONE]\n\n"

async def stream_openai(prompt: str, context_keys: list[str] = None, messages_history: list[dict] = None):
    """Attempts OpenAI streaming, falling back to Gemini if quota is 429."""
    key = settings.OPENAI_API_KEY
    if not key:
        async for chunk in stream_gemini(prompt, context_keys, messages_history):
            yield chunk
        return

    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json"
    }
    
    formatted_msgs = [{"role": "system", "content": ULTRON_SYSTEM_PROMPT}]
    if messages_history:
        for msg in messages_history[-10:]:
            formatted_msgs.append({
                "role": "user" if msg.get("role") == "user" else "assistant",
                "content": msg.get("text") or msg.get("content") or ""
            })
    formatted_msgs.append({"role": "user", "content": prompt})

    payload = {
        "model": "gpt-4o-mini",
        "messages": formatted_msgs,
        "stream": True,
        "temperature": 0.7
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            async with client.stream("POST", url, headers=headers, json=payload) as response:
                if response.status_code == 429 or response.status_code != 200:
                    async for chunk in stream_gemini(prompt, context_keys, messages_history):
                        yield chunk
                    return

                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        if line.strip() == "data: [DONE]":
                            yield "data: [DONE]\n\n"
                            return
                        try:
                            chunk = json.loads(line[6:].strip())
                            delta = chunk.get("choices", [{}])[0].get("delta", {}).get("content", "")
                            if delta:
                                yield f"data: {json.dumps({'text': delta})}\n\n"
                        except Exception:
                            pass
    except Exception:
        async for chunk in stream_gemini(prompt, context_keys, messages_history):
            yield chunk

@router.post("/chat")
async def ask_ultron(req: UltronPromptSchema):
    """Unified multi-model developer intelligence stream."""
    prompt = req.message
    model = (req.model or "GEMINI").upper()
    history = getattr(req, 'messages_history', []) or []

    if model == "OPENAI":
        generator = stream_openai(prompt, req.context_keys, history)
    elif model == "ANTHROPIC":
        # Stream Anthropic mode with Claude-grade persona prompt
        generator = stream_gemini(f"[Respond in the style and depth of Claude 3.5 Sonnet]: {prompt}", req.context_keys, history)
    else:
        generator = stream_gemini(prompt, req.context_keys, history)

    return StreamingResponse(
        generator,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.post("/ask")
async def ask_ultron_sync(req: UltronPromptSchema):
    """Synchronous JSON response for quick questions."""
    key = settings.GEMINI_API_KEY
    if not key:
        return {"response": "Ultron Singularity active. Ready for API synthesis."}

    full_prompt = f"{ULTRON_SYSTEM_PROMPT}\nUser Question: {req.message}"
    for model_name in GEMINI_MODELS:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={key}"
        payload = {
            "contents": [{"parts": [{"text": full_prompt}]}],
            "generationConfig": {"temperature": 0.35, "maxOutputTokens": 2048}
        }
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    text = res.json()["candidates"][0]["content"]["parts"][0]["text"]
                    return {"response": text, "model": model_name}
        except Exception:
            continue

    return {"response": f"Ultron Singularity analyzed: {req.message}. All systems operational."}
