from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from realtime.gateway import realtime_manager

router = APIRouter(prefix="/community", tags=["Community Hub"])

class NewPostSchema(BaseModel):
    title: str
    content: str
    tags: List[str]
    author: Optional[str] = "Astronaut Engineer"

class NewCommentSchema(BaseModel):
    content: str
    author: Optional[str] = "Astronaut Engineer"

POSTS = [
    {
        "id": "post_01",
        "author": "Sarah Connor",
        "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        "title": "Production Checklist for Zero-Downtime Stripe Webhook Handlers",
        "content": "Make sure your webhook handlers verify cryptographic signatures with 5-minute tolerance windows, return HTTP 200 before queuing background processing jobs, and store idempotent event IDs in Redis or Postgres.",
        "upvotes": 142,
        "comments": [
            {"id": "c1", "author": "David Lightman", "content": "Also remember to set an unhandled exception timeout so Stripe doesn't hammer your webhook server with retries.", "createdAt": "1 hour ago"},
            {"id": "c2", "author": "Ada Lovelace", "content": "The APIVerse webhooks replay feature caught an SSL cipher mismatch in our staging cluster instantly!", "createdAt": "45 mins ago"}
        ],
        "commentsCount": 2,
        "tags": ["stripe", "webhooks", "reliability"],
        "badge": "Security Sentinel",
        "createdAt": "2 hours ago"
    },
    {
        "id": "post_02",
        "author": "Neo Anderson",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        "title": "Shared Collection: Complete AI Agent Toolset (Gemini 3.5 + OpenAI + Upstash)",
        "content": "Importable APIVerse collection pre-configured with rate limit safety, token burn tracking, and Ultron prompt templates. Tested across 50,000 synthetic agent transactions.",
        "upvotes": 289,
        "comments": [
            {"id": "c3", "author": "Trinity", "content": "Downloaded the starter kit zip and deployed to Railway in under 2 minutes.", "createdAt": "3 hours ago"}
        ],
        "commentsCount": 1,
        "tags": ["ai", "agents", "starter-kit"],
        "badge": "Orbit Pioneer",
        "createdAt": "Yesterday"
    },
    {
        "id": "post_03",
        "author": "Grace Hopper",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        "title": "How to Prevent Cascading 429 Failures with Leaky Bucket Quotas",
        "content": "When dealing with third-party rate limits (like OpenAI Tier 1 or Twilio 100/min), always wrap client requests in a sliding window token bucket with jittered exponential retry backoff.",
        "upvotes": 95,
        "comments": [],
        "commentsCount": 0,
        "tags": ["architecture", "resilience", "rate-limiting"],
        "badge": "Core Navigator",
        "createdAt": "3 days ago"
    }
]

@router.get("/feed")
async def get_community_feed():
    return POSTS

@router.post("/posts")
async def create_post(payload: NewPostSchema):
    new_post = {
        "id": f"post_{len(POSTS) + 1:02d}",
        "author": payload.author,
        "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
        "title": payload.title,
        "content": payload.content,
        "upvotes": 1,
        "comments": [],
        "commentsCount": 0,
        "tags": payload.tags,
        "badge": "Astronaut Engineer",
        "createdAt": "Just now"
    }
    POSTS.insert(0, new_post)
    # Broadcast to all connected astronaut workspaces
    await realtime_manager.broadcast_workspace("ws_solar_alpha", {
        "type": "COMMUNITY_ACTIVITY",
        "workspaceId": "ws_solar_alpha",
        "senderId": payload.author,
        "timestamp": datetime.utcnow().isoformat(),
        "payload": {"action": "NEW_POST", "post": new_post}
    })
    return new_post

@router.post("/posts/{post_id}/upvote")
async def upvote_post(post_id: str):
    for p in POSTS:
        if p["id"] == post_id:
            p["upvotes"] += 1
            await realtime_manager.broadcast_workspace("ws_solar_alpha", {
                "type": "COMMUNITY_ACTIVITY",
                "workspaceId": "ws_solar_alpha",
                "timestamp": datetime.utcnow().isoformat(),
                "payload": {"action": "UPVOTE", "postId": post_id, "upvotes": p["upvotes"]}
            })
            return {"status": "SUCCESS", "upvotes": p["upvotes"]}
    raise HTTPException(status_code=404, detail="Post not found")

@router.post("/posts/{post_id}/comments")
async def add_comment(post_id: str, payload: NewCommentSchema):
    for p in POSTS:
        if p["id"] == post_id:
            new_c = {
                "id": f"c_{len(p['comments']) + 1}",
                "author": payload.author,
                "content": payload.content,
                "createdAt": "Just now"
            }
            p["comments"].append(new_c)
            p["commentsCount"] = len(p["comments"])
            await realtime_manager.broadcast_workspace("ws_solar_alpha", {
                "type": "COMMUNITY_ACTIVITY",
                "workspaceId": "ws_solar_alpha",
                "timestamp": datetime.utcnow().isoformat(),
                "payload": {"action": "NEW_COMMENT", "postId": post_id, "comment": new_c}
            })
            return {"status": "SUCCESS", "comment": new_c, "commentsCount": p["commentsCount"]}
    raise HTTPException(status_code=404, detail="Post not found")
