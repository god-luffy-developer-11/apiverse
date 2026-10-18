from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

class KeyVaultCreateSchema(BaseModel):
    name: str
    service: str
    environment: str = "PRODUCTION"
    secret_value: str
    rotation_days: int = 90
    tags: List[str] = []

class KeyVaultRevealSchema(BaseModel):
    reauth_password: str

class PlaygroundRunSchema(BaseModel):
    method: str
    url: str
    headers: Dict[str, str] = {}
    params: Dict[str, str] = {}
    auth_type: str = "none"
    auth_token: Optional[str] = None
    body_type: str = "json"
    body: Optional[str] = None

class UltronPromptSchema(BaseModel):
    message: str
    model: str = "GEMINI"
    context_keys: List[str] = []
    messages_history: List[Dict[str, Any]] = []
    include_playground_history: bool = True
    include_active_alerts: bool = True

class StarterKitConfigSchema(BaseModel):
    name: str
    stack: str # "nextjs" | "fastapi" | "express"
    selected_apis: List[str] # ["stripe", "openai", "supabase"]
    include_docker: bool = True
    include_auth: bool = True

class SetupVerifyStepSchema(BaseModel):
    api_name: str
    step_id: str
    provided_key: Optional[str] = None
