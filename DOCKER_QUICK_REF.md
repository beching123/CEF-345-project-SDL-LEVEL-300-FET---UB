# Docker Quick Reference - Network Helper Cameroon

## Deploy in 3 Commands

```bash
# 1. Setup environment
cp .env.docker .env

# 2. Build & start
docker-compose up --build -d

# 3. Test
curl http://localhost:3000/api/reports/count
```

---

## Environment Variables at a Glance

| Variable | Docker Value | Dev Value | Purpose |
|----------|--------------|-----------|---------|
| `NODE_ENV` | `production` | `development` | Environment type |
| `FRONTEND_URL` | `http://localhost` | `http://localhost:3001` | CORS origin |
| `REACT_APP_API_URL` | `` (empty) | `http://localhost:3000` | API endpoint |

---

## What Was Fixed

| Issue | Cause | Fix |
|-------|-------|-----|
| 404 on API calls | Hardcoded localhost in axios | Environment-aware URL |
| CORS errors | Only allowed localhost:3001 | Accept Docker origins |
| Container can't reach backend | Different localhost per container | Use relative URLs + nginx proxy |

---

## Docker Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f
docker-compose logs backend

# Rebuild
docker-compose up --build -d

# Check status
docker-compose ps

# Test endpoints
curl http://localhost:3000/api/reports/count
curl http://localhost/
```

---

## File Changes Made

1. **frontend/src/api/axios.js** - Smart URL selection
2. **backend/server.js** - Flexible CORS + logging
3. **docker-compose.yml** - Proper environment config
4. **.env.docker** - Docker defaults (copy to .env)
5. **DOCKER_DEBUGGING.md** - Full troubleshooting guide

---

## How to Access

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost | 80 |
| Backend API | http://localhost:3000 | 3000 |
| Report Count | http://localhost:3000/api/reports/count | 3000 |

---

## Quick Troubleshooting

```bash
# Is backend responding?
curl http://localhost:3000/api/reports/count

# Can containers see each other?
docker exec netlink_frontend ping backend

# Are there CORS errors?
docker-compose logs backend | grep -i origin

# Is nginx proxying correctly?
curl http://localhost/api/reports/count

# What's in the logs?
docker-compose logs -f --tail=50
```

---

## Key Differences from Localhost Development

| Local Development | Docker |
|-------------------|--------|
| Frontend on :3001 | Frontend on :80 |
| Backend on :3000 | Backend on :3000 |
| API URL: `http://localhost:3000` | API URL: Relative `/api/*` |
| CORS: Allow :3001 | CORS: Allow `frontend` |
| Direct container access | Service names via Docker DNS |

---

## Architecture

```
Browser (http://localhost)
    ↓
Nginx (port 80, serves React)
    ↓ (proxies /api/* to...)
Backend (port 3000)
    ↓
data.json (file storage)
```

---

## Common Commands

```bash
# First time setup
cp .env.docker .env
docker-compose up --build -d

# Daily use
docker-compose up -d          # Start
docker-compose down           # Stop
docker-compose logs -f        # View logs
docker-compose ps             # Check status

# Debugging
curl http://localhost:3000/api/reports/count
docker-compose exec backend sh
docker-compose logs backend --tail=100
```

---

## Production Deployment

Before deploying to AWS/Azure/Heroku:

1. Set `NODE_ENV=production`
2. Set `FRONTEND_URL=https://your-domain.com`
3. Set `REACT_APP_API_URL=https://your-domain.com/api`
4. Enable HTTPS at load balancer/reverse proxy
5. Use persistent volume for data.json

---

## Logs to Check

```bash
# Startup logs
docker-compose logs

# Real-time logs
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100

# Show timestamps
docker-compose logs -f --timestamps
```

---

**Need help?** Check `DOCKER_DEBUGGING.md` for complete troubleshooting guide.
