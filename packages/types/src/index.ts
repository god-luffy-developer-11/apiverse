export type Role = 'OWNER' | 'ADMIN' | 'DEVELOPER' | 'VIEWER';

export type ModelProvider = 'OPENAI' | 'ANTHROPIC' | 'GEMINI';

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export type KeyHealth = 'OPTIMAL' | 'DEGRADED' | 'EXPIRED' | 'LEAKED' | 'RATE_LIMITED';

export type EnvironmentTag = 'PRODUCTION' | 'STAGING' | 'DEVELOPMENT' | 'SANDBOX';

export type UltronState = 'idle' | 'listening' | 'thinking' | 'streaming' | 'error' | 'success';

export interface AstronautUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  role: Role;
  workspaceId: string;
  organizationId: string;
  color: string;
  lastActive: string;
}

export interface WorkspacePresence {
  userId: string;
  name: string;
  avatarUrl: string;
  color: string;
  currentOrbit: string; // current active page or planet
  cursor?: { x: number; y: number };
  typingInUltron?: boolean;
}

export interface ApiKeyPlanet {
  id: string;
  name: string;
  service: string; // e.g. "Stripe", "OpenAI", "Twilio"
  environment: EnvironmentTag;
  keyPrefix: string; // e.g. "sk_live_..."
  health: KeyHealth;
  requestsLast24h: number;
  rateLimitPerMinute: number;
  currentMinuteUsage: number;
  subKeysCount: number;
  expiresAt: string | null;
  lastUsedAt: string | null;
  costMonthToDate: number;
  coordinates: [number, number, number]; // 3D orbit position
}

export interface KeyVaultSecret {
  id: string;
  keyName: string;
  service: string;
  environment: EnvironmentTag;
  encryptedValue?: string;
  preview: string;
  rotationIntervalDays: number;
  lastRotatedAt: string;
  health: KeyHealth;
  leakAuditPassed: boolean;
  scopedIps?: string[];
  tags: string[];
}

export interface ApiEndpointSpec {
  id: string;
  apiName: string;
  category: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  summary: string;
  description: string;
  authType: 'API_KEY' | 'BEARER' | 'OAUTH2' | 'BASIC' | 'NONE';
  pricing: 'FREE' | 'FREEMIUM' | 'PAID' | 'OPEN_SOURCE';
  latencyMs: number;
  uptime99: number;
  freeTierLimit: string;
  constellation: string;
}

export interface PlaygroundRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers: Record<string, string>;
  params: Record<string, string>;
  auth: {
    type: 'none' | 'bearer' | 'apiKey' | 'basic';
    token?: string;
    key?: string;
    value?: string;
  };
  bodyType: 'json' | 'form' | 'raw';
  body: string;
}

export interface TimingWaterfall {
  dnsLookupMs: number;
  tcpHandshakeMs: number;
  tlsNegotiationMs: number;
  timeToFirstByteMs: number;
  contentDownloadMs: number;
  totalDurationMs: number;
}

export interface PlaygroundResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  sizeBytes: number;
  timing: TimingWaterfall;
  timestamp: string;
}

export interface CometTelemetryEvent {
  id: string;
  timestamp: string;
  service: string;
  endpoint: string;
  method: string;
  status: number;
  latencyMs: number;
  sourcePlanetId: string;
  destPlanetId?: string;
}

export interface SolarFlareAlert {
  id: string;
  ruleName: string;
  service: string;
  severity: AlertSeverity;
  message: string;
  planetId: string;
  triggeredAt: string;
  acknowledged: boolean;
  aiIncidentSummary?: string;
}

export interface UltronMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  model: ModelProvider;
  tokensUsed?: number;
  costUsd?: number;
  actionPayload?: {
    type: 'INSERT_PLAYGROUND' | 'CREATE_ALERT' | 'SAVE_COLLECTION' | 'EXPORT_STARTER_KIT';
    data: any;
  };
}

export interface RealtimeEnvelope<T = any> {
  type: 
    | 'PRESENCE_UPDATE'
    | 'CURSOR_MOVE'
    | 'TELEMETRY_COMET'
    | 'SOLAR_FLARE_ALERT'
    | 'VAULT_HEALTH_UPDATE'
    | 'PLAYGROUND_COLLAB_SYNC'
    | 'ULTRON_STREAM_CHUNK'
    | 'COMMUNITY_ACTIVITY';
  workspaceId: string;
  senderId?: string;
  timestamp: string;
  payload: T;
}
