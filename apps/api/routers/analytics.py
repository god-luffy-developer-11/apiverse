import random
from fastapi import APIRouter
from datetime import datetime

router = APIRouter(prefix="/analytics", tags=["Dashboard & Galaxy Analytics"])

@router.get("/metrics")
async def get_galaxy_metrics(time_range: str = "24h"):
    multiplier = 1.0
    if time_range == "1h":
        multiplier = 0.04
    elif time_range == "7d":
        multiplier = 7.0
    elif time_range == "30d":
        multiplier = 30.0

    base_requests = 1542109
    return {
        "timeRange": time_range,
        "totalRequests24h": int(base_requests * multiplier),
        "avgLatencyMs": 78.4,
        "p50LatencyMs": 62.0,
        "p95LatencyMs": 142.1,
        "p99LatencyMs": 310.5,
        "errorRatePercent": 0.04,
        "monthCostUsd": 1321.80,
        "costBurnRateDailyUsd": 44.06,
        "activeComets": 24,
        "anomaliesDetected": 1,
        "anomalies": [
            {
                "service": "Twilio",
                "type": "RATE_LIMIT_CEILING",
                "severity": "CRITICAL",
                "description": "Staging key hit 99% of throughput capacity at 18:15 UTC."
            }
        ],
        "latencyTimeSeries": [
            {"time": "00:00", "p50": 58, "p95": 130, "p99": 280},
            {"time": "04:00", "p50": 61, "p95": 135, "p99": 295},
            {"time": "08:00", "p50": 74, "p95": 155, "p99": 340},
            {"time": "12:00", "p50": 82, "p95": 168, "p99": 375},
            {"time": "16:00", "p50": 79, "p95": 149, "p99": 320},
            {"time": "20:00", "p50": 63, "p95": 138, "p99": 290}
        ]
    }

@router.get("/comets")
async def get_live_comets():
    """Live light-beams and comets traversing the galaxy between API planets."""
    comets = []
    services = ["Stripe", "OpenAI", "Twilio", "Supabase", "GitHub", "Resend"]
    methods = ["GET", "POST", "PUT"]
    for i in range(12):
        s = random.choice(services)
        comets.append({
            "id": f"comet_{i}_{random.randint(100,999)}",
            "service": s,
            "method": random.choice(methods),
            "endpoint": f"/v1/{s.lower()}/process",
            "status": 200 if random.random() > 0.05 else 500,
            "latencyMs": round(random.uniform(25, 210), 1),
            "sourcePlanet": s,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        })
    return comets
