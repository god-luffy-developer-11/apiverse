from fastapi import APIRouter, Header, HTTPException

router = APIRouter(prefix="/auth", tags=["Auth & RBAC"])

@router.get("/me")
async def get_current_astronaut(authorization: str = Header(None)):
    return {
        "id": "astro_01",
        "name": "Commander Shepard",
        "email": "shepard@apiverse.dev",
        "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        "role": "OWNER",
        "workspaceId": "ws_solar_alpha",
        "organizationId": "org_andromeda",
        "color": "#06b6d4",
        "lastActive": "Just now"
    }

@router.get("/team")
async def get_team_astronauts():
    return [
        {
            "id": "astro_01",
            "name": "Commander Shepard",
            "email": "shepard@apiverse.dev",
            "role": "OWNER",
            "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
            "status": "In Galaxy Dashboard"
        },
        {
            "id": "astro_02",
            "name": "Dr. Liara T'Soni",
            "email": "liara@apiverse.dev",
            "role": "ADMIN",
            "avatarUrl": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
            "status": "Debugging in Ultron Singularity"
        },
        {
            "id": "astro_03",
            "name": "Garrus Vakarian",
            "email": "garrus@apiverse.dev",
            "role": "DEVELOPER",
            "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
            "status": "Testing Stripe webhooks in Playground"
        }
    ]
