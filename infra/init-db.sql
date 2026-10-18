-- APIVerse Initial Multi-Tenant Schema & Seeds
CREATE TABLE IF NOT EXISTS organizations (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    plan VARCHAR(32) DEFAULT 'TEAM_PRO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workspaces (
    id VARCHAR(64) PRIMARY KEY,
    org_id VARCHAR(64) REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    solar_system_name VARCHAR(128) DEFAULT 'Alpha-7',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS astronauts (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) REFERENCES workspaces(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(32) DEFAULT 'DEVELOPER',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_planet_keys (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) REFERENCES workspaces(id),
    service VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    key_prefix VARCHAR(32) NOT NULL,
    encrypted_value TEXT NOT NULL,
    health VARCHAR(32) DEFAULT 'OPTIMAL',
    environment VARCHAR(32) DEFAULT 'PRODUCTION',
    rate_limit_per_min INT DEFAULT 1000,
    cost_mtd NUMERIC(10,2) DEFAULT 0.00,
    last_rotated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial System
INSERT INTO organizations (id, name, plan) 
VALUES ('org_andromeda', 'Andromeda Orbital Systems', 'TEAM_PRO')
ON CONFLICT (id) DO NOTHING;

INSERT INTO workspaces (id, org_id, name, solar_system_name) 
VALUES ('ws_solar_alpha', 'org_andromeda', 'Production Operations', 'Alpha-7')
ON CONFLICT (id) DO NOTHING;

INSERT INTO astronauts (id, workspace_id, email, name, role) 
VALUES ('astro_01', 'ws_solar_alpha', 'shepard@apiverse.dev', 'Commander Shepard', 'OWNER')
ON CONFLICT (id) DO NOTHING;
