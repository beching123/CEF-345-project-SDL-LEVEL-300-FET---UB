# DOCKER DEPLOYMENT FIX - COMPREHENSIVE SUMMARY

## What Happened

Your Docker deployment was returning **404 errors** for API calls:
```
Dashboard.js:19  GET http://localhost:3000/api/reports/count 404 (Not Found)
Dashboard.js:20  GET http://localhost:3000/api/reports/count-by-network 404 (Not Found)
```

**Root Cause**: Frontend was trying to call `http://localhost:3000` - this doesn't work in Docker because each container has its own localhost.

---

## What Was Fixed

### 1. **Frontend API Client** ✅
**File**: `frontend/src/api/axios.js`

**Problem**: Hardcoded `http://localhost:3000`
```javascript
// ❌ BEFORE
baseURL: "http://localhost:3000"  // Doesn't work in Docker!
```

**Solution**: Environment-aware URL selection
```javascript
// ✅ AFTER
const getBaseURL = () => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  if (process.env.NODE_ENV === 'production') return '';  // Relative URL
  return 'http://localhost:3000';  // Development
};
```

### 2. **Backend CORS Configuration** ✅
**File**: `backend/server.js`

**Problem**: Only allowed `http://localhost:3001`
```javascript
// ❌ BEFORE  
const allowedOrigin = 'http://localhost:3001';  // Too strict!
```

**Solution**: Accept multiple origins including Docker service names
```javascript
// ✅ AFTER
if (origin && (origin.includes('localhost') || origin.includes('frontend'))) {
  res.setHeader('Access-Control-Allow-Origin', origin);
}
```

### 3. **Docker Compose Configuration** ✅
**File**: `docker-compose.yml`

**Added**:
- `FRONTEND_URL` environment variable for CORS
- `REACT_APP_API_URL` for frontend API configuration
- Health check dependencies
- Proper startup ordering

### 4. **Environment Variables** ✅
**Created**: `.env.docker`
```env
NODE_ENV=production
FRONTEND_URL=http://localhost
REACT_APP_API_URL=
REACT_APP_ENVIRONMENT=docker
```

---

## How to Deploy Now

### Step 1: Set Up Environment
```bash
cp .env.docker .env
```

### Step 2: Build and Start
```bash
docker-compose up --build -d
```

### Step 3: Verify
```bash
# Test backend
curl http://localhost:3000/api/reports/count

# Test frontend  
curl http://localhost/

# View logs
docker-compose logs -f
```

---

## How It Works in Docker

```
┌─────────────────┐
│ Browser         │
│ localhost:80    │
└────────┬────────┘
         │
    ┌────v────────────────────────┐
    │ Nginx (Frontend Container)  │
    │ - Serves React app          │
    │ - Proxies /api/* to backend │
    └────┬───────────────────────┬┘
         │                       │
    ┌────v────────┐      ┌──────v──────────┐
    │ React app   │      │ /api/* request  │
    │ calls /api/ │ ──→  │ ↓               │
    └─────────────┘      │ nginx.conf      │
                         │ proxy_pass      │
                         │ http://backend  │
                         └──────┬──────────┘
                                │
                         ┌──────v──────────┐
                         │ Backend Node.js │
                         │ :3000           │
                         │ Returns JSON    │
                         └─────────────────┘
```

**Key Point**: Frontend calls relative URL `/api/reports/count` → Nginx proxies to `http://backend:3000/api/reports/count` → Backend responds

---

## Environment Variables Explained

### Docker Deployment
```env
NODE_ENV=production              # Use production mode
FRONTEND_URL=http://localhost    # CORS allows this origin
REACT_APP_API_URL=               # Empty = use relative URLs
```

### Local Development
```env
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
REACT_APP_API_URL=http://localhost:3000
```

### Production (Cloud Deployment)
```env
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
REACT_APP_API_URL=https://your-domain.com/api
```

---

## Files Created/Modified

### Modified Files
1. **frontend/src/api/axios.js** - Added environment-aware URL selection
2. **backend/server.js** - Added flexible CORS + logging
3. **docker-compose.yml** - Added environment variables and health checks

### New Files
1. **.env.docker** - Docker environment defaults
2. **DOCKER_DEBUGGING.md** - Complete troubleshooting guide
3. **DOCKER_FIXES_SUMMARY.md** - Detailed explanation of all fixes
4. **DOCKER_QUICK_REF.md** - Quick reference for common tasks
5. **docker-setup.sh** - Automated setup script (Linux/Mac)
6. **docker-setup.bat** - Automated setup script (Windows)
7. **docker-healthcheck.sh** - Health check utility

---

## Quick Troubleshooting

### Error: Still Getting 404

```bash
# 1. Check backend is running
docker-compose logs backend

# 2. Test backend directly
curl http://localhost:3000/api/reports/count

# 3. Check nginx is proxying
docker exec netlink_frontend curl http://backend:3000/api/reports/count

# 4. Verify .env file
cat .env | grep -E "NODE_ENV|FRONTEND_URL"
```

### Error: CORS Block

```bash
# Check what origin is being rejected
docker-compose logs backend | grep -i "origin"

# Check Docker network
docker network inspect netlink_netlink_network

# Update FRONTEND_URL if needed
# Then restart: docker-compose down && docker-compose up -d
```

### Error: Can't Connect

```bash
# Check containers are running
docker-compose ps

# Check network connectivity
docker exec netlink_frontend ping backend

# Restart everything
docker-compose down && docker-compose up -d
```

---

## Testing Checklist

After deployment, verify:

- [ ] `curl http://localhost:3000/api/reports/count` returns JSON
- [ ] `curl http://localhost/` returns HTML
- [ ] Frontend loads at http://localhost
- [ ] Dashboard shows statistics
- [ ] No 404 errors in browser console
- [ ] No CORS errors in browser console

---

## Summary Table

| Issue | Before | After |
|-------|--------|-------|
| Frontend API URL | Hardcoded localhost:3000 | Environment-aware + relative URL |
| CORS Origin | Only localhost:3001 | Accepts Docker service names |
| Environment Config | Hardcoded | Environment variables |
| Docker Networking | Manually configured | Automatic via docker-compose |
| Debugging | Difficult | Logs + health checks |

---

## Next Steps

1. **Run docker-setup.bat** (Windows) or **docker-setup.sh** (Linux/Mac)
2. **Wait 5-10 seconds** for services to start
3. **Test**: curl http://localhost:3000/api/reports/count
4. **Access**: http://localhost
5. **Debug if needed**: docker-compose logs -f

---

## Key Takeaways

1. **In Docker**: Each container has its own localhost
2. **Solution**: Use relative URLs + nginx proxy
3. **CORS**: Must allow the actual hostname/origin (not localhost)
4. **Environment Variables**: Make code deployment-agnostic
5. **Networking**: Use container names (backend, frontend) to communicate

---

## Support Documents

- **DOCKER_QUICK_REF.md** - Quick commands and reference
- **DOCKER_DEBUGGING.md** - Detailed troubleshooting guide
- **DOCKER_FIXES_SUMMARY.md** - Technical details of all changes

---

## Example: Running Locally vs Docker

### Local Development
```bash
npm start  # Frontend on :3001
node server.js  # Backend on :3000
# Browser → localhost:3001 → calls localhost:3000/api/*
```

### Docker
```bash
docker-compose up -d
# Browser → localhost:80 → nginx → localhost/api/* 
#        → (proxied to) → backend:3000/api/*
```

---

**Your Docker deployment is now fixed!** 🎉

