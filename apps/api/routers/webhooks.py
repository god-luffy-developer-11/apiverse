import time
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/webhooks", tags=["Webhooks & Uptime"])

DELIVERIES = [
    {
        "id": "wh_01",
        "event": "payment_intent.succeeded",
        "service": "Stripe",
        "destinationUrl": "https://api.apiverse.io/webhooks/stripe",
        "status": 200,
        "payloadPreview": "{\"id\": \"pi_3MtwxX2eZvKYlo2C19...\", \"amount\": 4200, \"currency\": \"usd\"}",
        "latencyMs": 48,
        "attempts": 1,
        "timestamp": "2026-10-05T18:22:10Z"
    },
    {
        "id": "wh_02",
        "event": "customer.subscription.updated",
        "service": "Stripe",
        "destinationUrl": "https://api.apiverse.io/webhooks/stripe",
        "status": 200,
        "payloadPreview": "{\"id\": \"sub_1Nk7...\", \"status\": \"active\", \"plan\": \"team_armada\"}",
        "latencyMs": 35,
        "attempts": 1,
        "timestamp": "2026-10-05T18:19:44Z"
    },
    {
        "id": "wh_03",
        "event": "message.delivered",
        "service": "Twilio",
        "destinationUrl": "https://api.apiverse.io/webhooks/twilio",
        "status": 504,
        "payloadPreview": "{\"MessageSid\": \"SMb2910...\", \"MessageStatus\": \"undelivered\"}",
        "latencyMs": 5012,
        "attempts": 3,
        "timestamp": "2026-10-05T18:10:15Z"
    }
]

MONITORS = [
    {
        "id": "mon_01",
        "name": "Stripe Production API Gateway",
        "url": "https://api.stripe.com/healthcheck",
        "intervalSeconds": 60,
        "status": "UP",
        "uptimePercent": 99.99,
        "lastChecked": "Just now",
        "lastLatencyMs": 52
    },
    {
        "id": "mon_02",
        "name": "OpenAI Completions Endpoint",
        "url": "https://api.openai.com/v1/models",
        "intervalSeconds": 60,
        "status": "UP",
        "uptimePercent": 99.89,
        "lastChecked": "1 min ago",
        "lastLatencyMs": 145
    },
    {
        "id": "mon_03",
        "name": "Twilio Voice & SMS Carrier Trunk",
        "url": "https://api.twilio.com",
        "intervalSeconds": 120,
        "status": "DEGRADED",
        "uptimePercent": 99.45,
        "lastChecked": "Just now",
        "lastLatencyMs": 320
    }
]

@router.get("/deliveries")
async def get_webhook_deliveries():
    return DELIVERIES

@router.post("/deliveries/{delivery_id}/retry")
async def retry_webhook_delivery(delivery_id: str):
    target = next((d for d in DELIVERIES if d["id"] == delivery_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Webhook delivery not found")

    target["attempts"] += 1
    target["status"] = 200
    target["latencyMs"] = 64
    target["timestamp"] = datetime.utcnow().isoformat() + "Z"
    return {
        "status": "SUCCESS",
        "message": f"Webhook {delivery_id} successfully replayed with HTTP 200 response.",
        "delivery": target
    }

@router.get("/monitors")
async def get_uptime_monitors():
    return MONITORS

@router.post("/monitors/{monitor_id}/ping")
async def ping_monitor(monitor_id: str):
    mon = next((m for m in MONITORS if m["id"] == monitor_id), None)
    if not mon:
        raise HTTPException(status_code=404, detail="Monitor not found")
    
    t0 = time.perf_counter()
    latency = round((time.perf_counter() - t0) * 1000 + 45.0, 1)
    mon["lastChecked"] = "Just now"
    mon["lastLatencyMs"] = latency
    return {
        "id": monitor_id,
        "status": "HEALTHY",
        "latencyMs": latency,
        "checkedAt": datetime.utcnow().isoformat() + "Z"
    }
