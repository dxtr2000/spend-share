# Spend Share

Spend Share is a Vue 3 PWA for recording shared payments and calculating optimized settlements.

## Stack

- **Frontend** (`frontend/`): Vue 3, Vite, TypeScript, Tailwind, Reka UI, Pinia, `vite-plugin-pwa`
- **Backend** (`backend/`): Fastify + `better-sqlite3`, written in TypeScript (run via `tsx` in dev, compiled with `tsc` for prod)
- **Shared** (`shared/`): TypeScript domain types consumed by both packages
- Root: npm workspaces, ESLint config, `concurrently` for dev

## Setup

```bash
npm install
npm run dev
```

`npm run dev` boots the API (`backend`, port 3001) and the Vite dev server (which proxies `/api` to the API). Trips, members, expenses, and settlements are stored in `data/spend-share.sqlite` (SQLite) on this device.

## Scripts (run from the repo root)

| Script              | What it does                                                              |
| ------------------- | ------------------------------------------------------------------------ |
| `npm run dev`       | API (`tsx watch`) + web (Vite) concurrently                               |
| `npm run build`     | Builds backend (`tsc`) then frontend (`vue-tsc` + `vite build`)           |
| `npm run preview`   | Preview the built frontend                                               |
| `npm run typecheck` | Type-checks backend (`tsc --noEmit`) and frontend (`vue-tsc`)             |
| `npm run test`      | Runs frontend Vitest suite                                                |
| `npm run lint`      | ESLint across all packages                                                |

Per-package scripts are also available via `npm --workspace @spend-share/<pkg> run <script>`.

## Environment

| Variable   | Default     | Description                          |
| ---------- | ----------- | ------------------------------------ |
| `PORT`     | `3001`      | API server port                      |
| `HOST`     | `0.0.0.0`   | API server host                      |
| `DATA_DIR` | `data`      | SQLite data directory                |
| `PUBLIC_DIR` | unset     | Built frontend directory served by the backend |

## Docker deploy

The production image builds the Vue PWA and serves it from the Fastify backend. SQLite data is stored in `/app/data`.

```bash
cp .env.example .env
docker compose up -d --build
```

The app is available on `http://localhost:3001` by default. Change `SPEND_SHARE_PORT` in `.env` if your host port is already used.

### Traefik server setup

If you use the existing `/opt/docker` Traefik stack, copy this repo to `/opt/docker/spend-share`, then add the service from `docker-compose.traefik.example.yml` under your current compose file's `services:` block.

Update the hostname in this label before starting it:

```yaml
- "traefik.http.routers.spend-share.rule=Host(`spend.hbworks.xyz`)"
```

Then deploy:

```bash
docker compose up -d --build spend-share
docker compose logs -f spend-share
```

For an existing reverse proxy, point your domain to the container port:

```nginx
location / {
  proxy_pass http://127.0.0.1:3001;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}
```

Useful commands:

```bash
docker compose logs -f
docker compose pull
docker compose up -d --build
docker compose down
```

The named volume `spend-share-data` keeps `spend-share.sqlite` across deploys.

## Checks

```bash
npm run typecheck
npm run test
npm run build
```
