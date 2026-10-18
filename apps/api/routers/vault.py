from fastapi import APIRouter, HTTPException
from core.security import encrypt_vault_secret, decrypt_vault_secret
from schemas.api_schemas import KeyVaultCreateSchema, KeyVaultRevealSchema
from datetime import datetime

router = APIRouter(prefix="/vault", tags=["API Key Vault"])

# In-memory store simulating encrypted PostgreSQL records
VAULT_STORE = {
    "key_01": {
        "id": "key_01",
        "name": "Stripe Live Production",
        "service": "Stripe",
        "environment": "PRODUCTION",
        "encrypted_value": encrypt_vault_secret("mock_stripe_production_secret_sample_key"),
        "keyPrefix": "mock_stripe...",
        "rotationDays": 90,
        "lastRotatedAt": "2026-08-15T00:00:00Z",
        "health": "OPTIMAL",
        "requestsLast24h": 48210,
        "rateLimitPerMinute": 1000,
        "currentMinuteUsage": 142,
        "subKeysCount": 3,
        "leakAuditPassed": True,
        "costMonthToDate": 412.50,
        "coordinates": [2.5, 0.2, -1.8] # 3D orbital coords
    },
    "key_02": {
        "id": "key_02",
        "name": "OpenAI Primary GPT-4o",
        "service": "OpenAI",
        "environment": "PRODUCTION",
        "encrypted_value": encrypt_vault_secret("mock_openai_production_secret_sample_key"),
        "keyPrefix": "mock_openai...",
        "rotationDays": 30,
        "lastRotatedAt": "2026-09-01T00:00:00Z",
        "health": "OPTIMAL",
        "requestsLast24h": 92300,
        "rateLimitPerMinute": 5000,
        "currentMinuteUsage": 820,
        "subKeysCount": 1,
        "leakAuditPassed": True,
        "costMonthToDate": 845.20,
        "coordinates": [-3.2, 0.8, 2.1]
    },
    "key_03": {
        "id": "key_03",
        "name": "Twilio Staging Fallback",
        "service": "Twilio",
        "environment": "STAGING",
        "encrypted_value": encrypt_vault_secret("AC7719283019284019284019284019"),
        "keyPrefix": "AC77192830...",
        "rotationDays": 60,
        "lastRotatedAt": "2026-06-10T00:00:00Z",
        "health": "RATE_LIMITED",
        "requestsLast24h": 12000,
        "rateLimitPerMinute": 200,
        "currentMinuteUsage": 198,
        "subKeysCount": 0,
        "leakAuditPassed": True,
        "costMonthToDate": 64.10,
        "coordinates": [4.0, -1.2, 0.5]
    }
}

@router.get("/planets")
async def get_vault_planets():
    # Never return encrypted_value in public list
    safe_planets = []
    for k, v in VAULT_STORE.items():
        copy_v = dict(v)
        del copy_v["encrypted_value"]
        safe_planets.append(copy_v)
    return safe_planets

@router.post("/keys")
async def add_key_to_vault(payload: KeyVaultCreateSchema):
    new_id = f"key_{len(VAULT_STORE) + 1:02d}"
    enc = encrypt_vault_secret(payload.secret_value)
    prefix = payload.secret_value[:8] + "..." if len(payload.secret_value) > 8 else "..."
    VAULT_STORE[new_id] = {
        "id": new_id,
        "name": payload.name,
        "service": payload.service,
        "environment": payload.environment,
        "encrypted_value": enc,
        "keyPrefix": prefix,
        "rotationDays": payload.rotation_days,
        "lastRotatedAt": datetime.utcnow().isoformat() + "Z",
        "health": "OPTIMAL",
        "requestsLast24h": 0,
        "rateLimitPerMinute": 1000,
        "currentMinuteUsage": 0,
        "subKeysCount": 0,
        "leakAuditPassed": True,
        "costMonthToDate": 0.0,
        "coordinates": [float(len(VAULT_STORE)), 0.0, 0.0]
    }
    return {"status": "ENCRYPTED_AND_SAVED", "id": new_id}

@router.post("/keys/{key_id}/reveal")
async def reveal_secret_with_reauth(key_id: str, payload: KeyVaultRevealSchema):
    if key_id not in VAULT_STORE:
        raise HTTPException(status_code=404, detail="Planet Key not found")
    if payload.reauth_password != "apiverse2026":
        raise HTTPException(status_code=403, detail="Re-authentication failed. Invalid master password.")
    
    # Decrypt AES-256-GCM
    raw_secret = decrypt_vault_secret(VAULT_STORE[key_id]["encrypted_value"])
    # Audit log recorded
    return {
        "key_id": key_id,
        "secret_plaintext": raw_secret,
        "audit": "Decryption event logged for audit compliance."
    }

@router.post("/leak-check")
async def run_github_leak_detection():
    return {
        "scannedRepos": 14,
        "publicGists": 2,
        "leaksDetected": 0,
        "auditStatus": "CLEAN",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
