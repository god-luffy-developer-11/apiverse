# APIVerse — The Developer Operating System for Working with APIs

> Commercial-grade, multi-tenant SaaS that visualizes and operates your entire API infrastructure in real-time as a living 3D cosmic galaxy.

---

## 🌌 The Celestial Concept
- **Dashboard = The Galaxy**: An interactive, living 3D star map showing real-time requests, throughput, and system health.
- **Features = The Universe**: Each system capability is a star system you warp between using instantaneous Cmd+K transitions.
- **API Keys = Planets**: 
  - Size maps to request volume
  - Color maps to health status
  - Rings visualize rate-limit capacity
  - Moons represent scoped environments and sub-keys
  - Red cracked glow pulses if a key is expired or leaked
- **Requests = Comets & Light Beams**: Live HTTP traffic animates dynamically between client coordinates and target API planets.
- **Alerts = Solar Flares & Supernovas**: Threshold breaches trigger radiant coronal discharge pulses over affected planets.
- **Ultron = The Destroyed Singularity**: An AI developer intelligence represented by a shattered, cursor-reactive black hole with custom GLSL gravitational lensing shaders.

---

## 🛠️ Monorepo Architecture
```text
apiverse/
├── apps/
│   ├── api/            # FastAPI, asyncpg, Redis Pub/Sub, AES-256-GCM Vault, SSRF Proxy
│   └── web/            # Next.js 14 App Router, Three.js/R3F, GLSL Shaders, Tailwind, cmdk
├── packages/
│   ├── config/         # Shared Tailwind tokens, TSConfigs, ESLint configurations
│   ├── types/          # Strict TypeScript interfaces and real-time event envelopes
│   ├── ui/             # Space-themed Glassmorphism UI design system
│   └── utils/          # Cryptography, formatting, and timing utilities
└── infra/
    ├── docker-compose.yml # PostgreSQL, Redis, FastAPI, Next.js orchestration
    ├── Dockerfile.api
    ├── Dockerfile.web
    ├── init-db.sql     # Multi-tenant schema & database seed scripts
    └── redis.conf      # Redis LRU configuration for sub-second Pub/Sub
```

---

## ⚡ Real-Time Architecture
- **Bidirectional WebSockets** (`/ws/{workspace_id}`) for cursor presence, shared playgrounds, team collaboration, and typing indicators.
- **Server-Sent Events (SSE)** for token-by-token Ultron AI completions and live galaxy telemetry streams.
- **Redis Pub/Sub Fan-out**: Tenant-isolated channels (`workspace:{workspace_id}`) ensuring horizontal scaling.
- **Zero Refresh Guarantee**: Optimistic UI state sync with exponential backoff auto-reconnect and reconnect event replay.

---

## 🔐 Zero-Trust Security Policy
1. **AES-256-GCM Vault**: API keys are encrypted at rest using 96-bit unique nonces. The master encryption key is never persisted in the database.
2. **SSRF Protection Proxy**: Playground execution rigorously validates all target URLs, blocking RFC 1918 private subnets, loopbacks, link-local, and AWS/GCP cloud metadata addresses (`169.254.169.254`).
3. **Secret Redaction**: Plaintext secrets are never logged, returned in public endpoints, or leaked in frontend state. Secret reveal requires master password re-authentication and commits to an immutable audit trail.

---

## 🚀 Quickstart & Boot
### 1. Docker Compose (Full Stack)
```bash
cd infra
docker compose up --build -d
```
- Web Application: `http://localhost:3000`
- API Backend & Swagger Docs: `http://localhost:8000/docs`

### 2. Local Development (PNPM Monorepo)
```bash
# Install dependencies
pnpm install

# Run backend (in apps/api)
cd apps/api && python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Run frontend (in apps/web)
cd apps/web
pnpm dev
```
