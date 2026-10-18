from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/learning", tags=["Learning Hub"])

class SandboxVerifySchema(BaseModel):
    mission_id: str
    user_code: str

class QuizAnswerSchema(BaseModel):
    mission_id: str
    question_index: int
    selected_option: int

USER_PROGRESS = {
    "totalXp": 1450,
    "currentStreakDays": 7,
    "rank": "Senior Orbital Architect",
    "completedMissions": ["mission_01"],
    "certificateEarned": True
}

MISSIONS = [
    {
        "id": "mission_01",
        "title": "Constellation 1: The Foundations of REST & Idempotency",
        "planet": "Mercury Prime",
        "xp": 500,
        "status": "COMPLETED",
        "lessonsCount": 4,
        "description": "Master idempotent HTTP methods (GET, PUT, DELETE), safe retry headers, and UUID v4 collision avoidance.",
        "sandbox": {
            "prompt": "Implement an idempotency key header check for high-value financial transfers in Node/TypeScript.",
            "starterCode": "export function handlePayment(req: Request) {\n  const idempotencyKey = req.headers.get('Idempotency-Key');\n  // TODO: verify key exists and check Redis cache\n  if (!idempotencyKey) {\n    return new Response('Missing key', { status: 400 });\n  }\n  return new Response('Payment processed', { status: 200 });\n}",
            "expectedKeyword": "Idempotency-Key"
        },
        "quiz": {
            "question": "Which HTTP method MUST be idempotent according to RFC 9110?",
            "options": ["POST", "PUT", "PATCH (without precondition)", "CONNECT"],
            "correct": 1,
            "explanation": "PUT replaces the target resource entirely with the request payload, so making 10 identical PUT requests leaves the server in the exact same state as 1 request."
        }
    },
    {
        "id": "mission_02",
        "title": "Constellation 2: Mastering OAuth2, JWTs & Scopes",
        "planet": "Venus Cyber-Station",
        "xp": 750,
        "status": "IN_PROGRESS",
        "lessonsCount": 6,
        "description": "Understand asymmetric RSA/ECDSA signature verification, JWKS rotation, and short-lived token refresh patterns.",
        "sandbox": {
            "prompt": "Verify a JWT token signature using the asymmetric public key.",
            "starterCode": "import jwt from 'jsonwebtoken';\n\nexport function verifyAstronautToken(token: string, publicKey: string) {\n  return jwt.verify(token, publicKey, { algorithms: ['RS256'] });\n}",
            "expectedKeyword": "RS256"
        },
        "quiz": {
            "question": "Why should sensitive data like API keys never be stored in the payload of a standard JWT?",
            "options": [
                "JWTs can only hold strings under 100 characters",
                "JWT payloads are only Base64URL-encoded and readable by anyone who inspects the token",
                "JWTs do not support JSON formats",
                "It violates HTTP header case-sensitivity rules"
            ],
            "correct": 1,
            "explanation": "Standard JWTs are signed, not encrypted. Anyone who has the token can decode the Base64URL payload instantly."
        }
    },
    {
        "id": "mission_03",
        "title": "Constellation 3: Webhook Verification & Replay Protection",
        "planet": "Mars Outpost",
        "xp": 1000,
        "status": "IN_PROGRESS",
        "lessonsCount": 5,
        "description": "Implement HMAC-SHA256 signature verification, timing attack mitigation with constant-time equality, and timestamp tolerance.",
        "sandbox": {
            "prompt": "Write a constant-time HMAC comparison function to prevent timing attacks on webhook signatures.",
            "starterCode": "import crypto from 'crypto';\n\nexport function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {\n  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');\n  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));\n}",
            "expectedKeyword": "timingSafeEqual"
        },
        "quiz": {
            "question": "What is the primary vulnerability prevented by crypto.timingSafeEqual() in webhook validation?",
            "options": [
                "SQL Injection",
                "Timing Attack (measuring how many nanoseconds string comparison takes before failing)",
                "Cross-Site Scripting (XSS)",
                "Server-Side Request Forgery (SSRF)"
            ],
            "correct": 1,
            "explanation": "Standard string equality returns false on the first mismatched character. Attackers can measure response nanoseconds to guess signatures byte-by-byte."
        }
    }
]

@router.get("/missions")
async def get_learning_missions():
    return {
        "missions": MISSIONS,
        "totalXp": USER_PROGRESS["totalXp"],
        "currentStreakDays": USER_PROGRESS["currentStreakDays"],
        "rank": USER_PROGRESS["rank"],
        "certificateEarned": USER_PROGRESS["certificateEarned"]
    }

@router.post("/verify-sandbox")
async def verify_sandbox(data: SandboxVerifySchema):
    mission = next((m for m in MISSIONS if m["id"] == data.mission_id), None)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    keyword = mission["sandbox"]["expectedKeyword"]
    if keyword.lower() in data.user_code.lower():
        USER_PROGRESS["totalXp"] += 150
        return {
            "passed": True,
            "message": f"Astronaut Sandbox Verified! Synthesized code satisfies security constraints. +150 XP awarded!",
            "newXp": USER_PROGRESS["totalXp"]
        }
    else:
        return {
            "passed": False,
            "message": f"Verification failed. Your solution must utilize '{keyword}' for cryptographic security."
        }

@router.post("/submit-quiz")
async def submit_quiz(data: QuizAnswerSchema):
    mission = next((m for m in MISSIONS if m["id"] == data.mission_id), None)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    quiz = mission["quiz"]
    is_correct = (data.selected_option == quiz["correct"])
    if is_correct:
        USER_PROGRESS["totalXp"] += 100
        return {
            "correct": True,
            "explanation": quiz["explanation"],
            "xpEarned": 100,
            "totalXp": USER_PROGRESS["totalXp"]
        }
    else:
        return {
            "correct": False,
            "explanation": f"Incorrect. Correct answer was: '{quiz['options'][quiz['correct']]}'. Reason: {quiz['explanation']}"
        }
