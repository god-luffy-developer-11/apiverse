from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
from realtime.gateway import realtime_manager

router = APIRouter(prefix="/alerts", tags=["Smart Alerts & Solar Flares"])

class CreateRuleSchema(BaseModel):
    ruleName: str
    service: str
    planetId: str
    condition: str # "LATENCY_P95" | "ERROR_RATE" | "QUOTA_80" | "KEY_EXPIRY" | "KEY_LEAK"
    threshold: float
    channels: List[str] # ["in-app", "email", "slack", "discord", "webhook"]

class SnoozeSchema(BaseModel):
    hours: int = 1

ALERTS = [
    {
        "id": "alert_01",
        "ruleName": "Rate Limit Threshold Exceeded (99%)",
        "service": "Twilio",
        "severity": "CRITICAL",
        "message": "Twilio Staging fallback hit 198 req/min (capacity 200 req/min). Pulsing solar flare.",
        "planetId": "key_03",
        "triggeredAt": "2026-10-05T18:15:00Z",
        "acknowledged": False,
        "snoozedUntil": None,
        "dedupeCount": 14,
        "channels": ["in-app", "slack", "discord"],
        "aiIncidentSummary": "Surge detected in SMS verification retry attempts from staging load tests. Root cause: Carrier timeout triggered automated retry avalanche. Recommend applying exponential jitter."
    },
    {
        "id": "alert_02",
        "ruleName": "Monthly Budget 80% Consumed",
        "service": "OpenAI",
        "severity": "WARNING",
        "message": "OpenAI monthly spend reached $845.20 of $1,000 threshold.",
        "planetId": "key_02",
        "triggeredAt": "2026-10-04T18:40:00Z",
        "acknowledged": True,
        "snoozedUntil": None,
        "dedupeCount": 3,
        "channels": ["in-app", "email"],
        "aiIncidentSummary": "High volume of GPT-4o embeddings calls. Ultron Recommendation: Migrate embedding jobs to text-embedding-3-small to cut monthly burn rate by 62%."
    }
]

RULES = [
    {"id": "r1", "ruleName": "Production Latency p95 > 250ms", "service": "Stripe", "condition": "LATENCY_P95", "threshold": 250.0, "channels": ["in-app", "slack"]},
    {"id": "r2", "ruleName": "Error Rate > 1.0%", "service": "All Planets", "condition": "ERROR_RATE", "threshold": 1.0, "channels": ["in-app", "slack", "pagerduty"]},
    {"id": "r3", "ruleName": "Free Tier Fuel > 80%", "service": "Resend", "condition": "QUOTA_80", "threshold": 80.0, "channels": ["in-app", "email"]}
]

@router.get("/")
async def list_alerts():
    return ALERTS

@router.get("/rules")
async def list_alert_rules():
    return RULES

@router.post("/rules")
async def create_alert_rule(payload: CreateRuleSchema):
    new_r = {
        "id": f"r{len(RULES) + 1}",
        "ruleName": payload.ruleName,
        "service": payload.service,
        "condition": payload.condition,
        "threshold": payload.threshold,
        "channels": payload.channels
    }
    RULES.append(new_r)
    return new_r

@router.post("/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str):
    for a in ALERTS:
        if a["id"] == alert_id:
            a["acknowledged"] = True
            await realtime_manager.broadcast_workspace("ws_solar_alpha", {
                "type": "SOLAR_FLARE_ALERT",
                "workspaceId": "ws_solar_alpha",
                "timestamp": datetime.utcnow().isoformat(),
                "payload": {"action": "ACKNOWLEDGED", "alertId": alert_id}
            })
            return {"status": "ACKNOWLEDGED", "alert": a}
    raise HTTPException(status_code=404, detail="Alert not found")

@router.post("/{alert_id}/snooze")
async def snooze_alert(alert_id: str, data: SnoozeSchema):
    for a in ALERTS:
        if a["id"] == alert_id:
            snooze_until = (datetime.utcnow() + timedelta(hours=data.hours)).isoformat() + "Z"
            a["snoozedUntil"] = snooze_until
            a["acknowledged"] = True
            return {"status": "SNOOZED", "snoozedUntil": snooze_until}
    raise HTTPException(status_code=404, detail="Alert not found")

@router.post("/trigger-flare")
async def trigger_solar_flare_pulse(planet_id: str = "key_01", service: str = "Stripe"):
    """Triggers an instantaneous live supernova solar flare pulse in the 3D Galaxy."""
    flare_alert = {
        "id": f"alert_flare_{datetime.utcnow().strftime('%H%M%S')}",
        "ruleName": f"Live Solar Flare: Latency Spike on {service}",
        "service": service,
        "severity": "CRITICAL",
        "message": f"Supernova flare detected on {service} planet! Latency surged to 480ms.",
        "planetId": planet_id,
        "triggeredAt": datetime.utcnow().isoformat() + "Z",
        "acknowledged": False,
        "snoozedUntil": None,
        "dedupeCount": 1,
        "channels": ["in-app", "slack", "discord", "webhook"],
        "aiIncidentSummary": f"Ultron Singularity isolated an upstream gateway bottleneck on {service}. Auto-routing traffic through backup region."
    }
    ALERTS.insert(0, flare_alert)
    # Broadcast to all connected astronaut clients over WebSockets
    await realtime_manager.broadcast_workspace("ws_solar_alpha", {
        "type": "SOLAR_FLARE_ALERT",
        "workspaceId": "ws_solar_alpha",
        "timestamp": datetime.utcnow().isoformat(),
        "payload": {"action": "NEW_SOLAR_FLARE", "alert": flare_alert}
    })
    return {"status": "FLARE_PULSED", "alert": flare_alert}
