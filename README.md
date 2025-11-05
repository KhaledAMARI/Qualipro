# QualiPro Test - Docker Setup

This repository contains a Node.js/Express backend and a Quasar (Vue) client, both containerized with Docker Compose.

## Prerequisites
- Docker
- Docker Compose (v2+)

## Services and Ports
- Backend (Express): http://localhost:3000
- Client (Quasar dev): http://localhost:9000
- MySQL: localhost:3306 (container name: `qualipro-mysql`)

All services are attached to the `app_net` Docker network for inter-container communication. The client dev server proxies `/api` and `/health` to the backend at `http://backend:3000` via Quasar's devServer proxy.

## Quick start
From the project root:

```bash
docker compose up -d --build
```

Then open:
- Client: http://localhost:9000
- Backend health: http://localhost:3000/health

## Useful commands
- View running containers
```bash
docker ps
```

- Tail logs
```bash
docker logs -f qualipro-client
# or
docker logs -f qualipro-backend
```

- Rebuild a single service
```bash
docker compose build client
# or
docker compose build backend
```

- Restart a single service
```bash
docker compose up -d client
# or
docker compose up -d backend
```

- Full rebuild without cache
```bash
docker compose build --no-cache
docker compose up -d
```

- Stop everything
```bash
docker compose down
```

## Notes
- Client runs in development mode (Quasar dev) and is configured to bind to `0.0.0.0` on port `9000` inside the container for host access.
- The Quasar dev proxy in `client/quasar.config.js` forwards `/api` and `/health` to `http://backend:3000`, which is the backend service name on the Docker network.
- Backend environment variables are defined in `docker-compose.yml` and default to MySQL credentials provided under the `db` service.
- Database data is persisted in the named volume `db_data`.
