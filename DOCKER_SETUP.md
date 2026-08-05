# Docker Setup Guide for Acquisitions API

This guide explains how to run the Acquisitions service using Docker with different
configurations for development and production environments.

## Overview

- **Development**: uses Neon Local via Docker Compose to proxy a local Postgres endpoint
  to your Neon Cloud database and automatically create ephemeral branches.
- **Production**: runs only the application container and connects directly to Neon Cloud
  using `DATABASE_URL` from environment variables.

## Files

- `Dockerfile` - builds the application image
- `docker-compose.dev.yml` - development stack with Neon Local + app
- `docker-compose.prod.yml` - production stack with app only
- `.env.development` - local development environment variables
- `.env.production` - production environment variables example
- `.dockerignore` - files excluded from Docker build context

## Prerequisites

1. Docker & Docker Compose installed
2. Neon account with a project created
3. Neon API key and Neon Project ID

## Development Setup

1. Copy and edit `.env.development` with your Neon credentials:

```ini
NEON_API_KEY=your_neon_api_key_here
NEON_PROJECT_ID=your_neon_project_id_here
PARENT_BRANCH_ID=main
DELETE_BRANCH=true
DATABASE_URL=postgres://user:password@neon-local:5432/dbname
PORT=3000
```

2. Start the development environment:

```bash
docker compose -f docker-compose.dev.yml --env-file .env.development up --build
```

or using the package script:

```bash
npm run dev:docker
```

3. Access the app at:

```text
http://localhost:3000
```

### Stopping development

```bash
docker compose -f docker-compose.dev.yml down
```

### Notes

- `neon-local` is the service name inside Docker Compose, so `DATABASE_URL`
  points to `postgres://...@neon-local:5432/...`.
- The app config in `src/config/database.js` detects `NEON_LOCAL=true` or
  `NODE_ENV=development` and configures the Neon serverless driver to use
  `http://neon-local:5432/sql`.
- Neon Local will create an ephemeral branch by default from `PARENT_BRANCH_ID`.

## Production Setup

1. Create or configure `.env.production` with your Neon Cloud database URL:

```ini
DATABASE_URL=postgres://<user>:<password>@<project>.neon.tech:5432/<database>
PORT=3000
```

2. Start production:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d
```

or using the package script:

```bash
npm run prod:docker
```

3. Access the app at:

```text
http://localhost:3000
```

### Stopping production

```bash
docker compose -f docker-compose.prod.yml down
```

## Environment Variable Behavior

- Development uses `.env.development` and Neon Local.
- Production uses `.env.production` and does not run Neon Local.
- `DATABASE_URL` must be injected via env vars, not hardcoded.

## Common Commands

```bash
npm run dev:docker
npm run prod:docker
npm run db:migrate
```

## Security

- Do not commit real secrets into git.
- Use `.env.production` only as an example file and supply real secrets via your
  deployment platform.
- Add `.neon_local/` to `.gitignore` for Neon Local metadata.

## Troubleshooting

- If the app cannot connect in development, verify `NEON_API_KEY`, `NEON_PROJECT_ID`,
  and `PARENT_BRANCH_ID` in `.env.development`.
- Ensure Docker is running.
- If the app cannot connect in production, verify `DATABASE_URL` is set correctly.
