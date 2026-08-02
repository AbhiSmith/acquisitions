# Docker + Neon Local setup (development) and Production deployment

This document explains how to run the acquisitions service locally using Neon Local
and how to run it in production using a Neon Cloud database.

Files added:
- Dockerfile
- docker-compose.dev.yml  (development: app + Neon Local)
- docker-compose.prod.yml (production: app only; connects to Neon Cloud via DATABASE_URL)
- .env.development
- .env.production (example)
- Updated src/config/database.js to enable Neon Local serverless configuration when NEON_LOCAL=true

---

Quick summary

- Development (local):
  - Use docker-compose.dev.yml to start the Neon Local proxy and the app.
  - Neon Local will create ephemeral branches by default (set PARENT_BRANCH_ID in .env.development).
  - The app connects to Neon Local at host `neon-local:5432` inside the compose network.

- Production:
  - Do NOT use Neon Local.
  - Set DATABASE_URL to your Neon Cloud URL via environment variables or your platform's secret manager.
  - Use docker-compose.prod.yml for a container-only setup (no Neon Local). In most platforms you will instead use a registry image and orchestrator/host-specific deployment.

---

Development: run with Neon Local (docker-compose)

1. Install Docker and Docker Compose.

2. Copy `.env.development` and fill in your Neon credentials:
   - NEON_API_KEY
   - NEON_PROJECT_ID
   - PARENT_BRANCH_ID (optional — branch to create ephemeral branches from)

   Example:
   ```ini
   NEON_API_KEY=sk_live_...
   NEON_PROJECT_ID=proj_...
   PARENT_BRANCH_ID=main
   DATABASE_URL=postgres://user:password@neon-local:5432/dbname
   ```

   Notes:
   - DATABASE_URL must point to `neon-local` (service name) so the Neon Local container proxies traffic to Neon Cloud.
   - The app is configured to detect Neon Local when `NEON_LOCAL=true` or NODE_ENV=development and set the Neon serverless driver endpoint appropriately.

3. Start the environment:

   ```bash
   docker compose -f docker-compose.dev.yml up --build
   ```

   What happens:
   - `neon-local` container starts and (by default) creates an ephemeral branch derived from PARENT_BRANCH_ID.
   - `app` container starts in development mode (npm run dev) and connects to Neon Local at `neon-local:5432`.
   - The server is exposed on host port 3000.

4. Stop the environment:

   ```bash
   docker compose -f docker-compose.dev.yml down
   ```

   - If ephemeral branches were created and DELETE_BRANCH=true, Neon Local will delete the ephemeral branch when the container stops.

Notes about Neon Local and the serverless driver

- The Neon Local container exposes an HTTP endpoint used by the Neon serverless driver. The app's configuration will set `neonConfig.fetchEndpoint` to `http://neon-local:5432/sql` when `NEON_LOCAL=true` (see `src/config/database.js`).
- No changes to your DATABASE_URL are required; it should still look like a normal Postgres connection string but point to `neon-local` inside the compose network.

---

Production: deploy with Neon Cloud

1. Ensure the production host/cluster has the environment variable `DATABASE_URL` set to the Neon Cloud connection string, e.g.:

   ```ini
   DATABASE_URL=postgres://<user>:<password>@<project>.neon.tech:5432/<database>
   ```

2. Build and run the production image (example using docker-compose.prod.yml):

   ```bash
   docker compose -f docker-compose.prod.yml up --build -d
   ```

   Notes:
   - docker-compose.prod.yml runs only the `app` service. The database is the Neon Cloud service referenced by DATABASE_URL.
   - In most production setups, you should push the image to a registry and deploy via your orchestrator (Kubernetes, ECS, Fly, Render, etc.) and inject DATABASE_URL using the platform's secret management.

Security and secrets

- NEVER commit real secrets (API keys, DB passwords) to source control. Use .env.* files only for local development and add them to `.gitignore`.
- In production, use your platform's secret manager or environment variable injection.

Troubleshooting

- If the app cannot connect to the DB in development, ensure:
  - NEON_API_KEY and NEON_PROJECT_ID are correct in `.env.development`.
  - The `neon-local` container is healthy and listening on 5432.
  - The app's `NEON_LOCAL=true` is set in the app environment (docker-compose.dev.yml already sets this).

- For JavaScript apps using the serverless driver, `neonConfig.poolQueryViaFetch = true` and `neonConfig.useSecureWebSocket = false` are configured in `src/config/database.js` while running with Neon Local.

If you want, I can also:
- Add a Makefile with common commands
- Create a Kubernetes manifest for production
- Add GitHub Actions to build and push the image to a registry

