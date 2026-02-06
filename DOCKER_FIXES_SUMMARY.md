# Docker Deployment - Issues Fixed & Setup Guide

## Summary of Issues Found & Fixed

### Problem
When deploying to Docker, the frontend was getting **404 errors** for these API endpoints:
- `GET http://localhost:3000/api/reports/count`
- `GET http://localhost:3000/api/reports/count-by-network`

### Root Causes

#### 1. **Hardcoded localhost:3000 in Frontend (CRITICAL)**
**File**: `frontend/src/api/axios.js`
**Problem**: 
```javascript
// OLD - BROKEN IN DOCKER
const api = axios.create({
  baseURL: "http://localhost:3000",  // ❌ Wrong! Can't reach backend this way
  ...
});
```

**Why**: In Docker, frontend and backend run in **separate containers**. `localhost:3000` doesn't exist inside the frontend container.

**Fix Applied**:
```javascript
// NEW - WORKS EVERYWHERE
const getBaseURL = () => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  
  if (process.env.NODE_ENV === 'production') {
    return '';  // ✅ Relative URL - Nginx proxies /api/* to backend
  }
  
  return 'http://localhost:3000';  // Development only
};
```

---

#### 2. **CORS Not Allowing Docker Container Origins (CRITICAL)**
**File**: `backend/server.js`
**Problem**:
```javascript
// OLD - ONLY ALLOWS localhost:3001
const allowedOrigin = 'http://localhost:3001';  // ❌ Rejects Docker container origins
```

**Why**: In Docker, the frontend container has a different origin (e.g., `http://frontend` or container IP)

**Fix Applied**:
```javascript
// NEW - ACCEPTS MULTIPLE ORIGINS
const origin = req.headers.origin;
if (origin && (origin.includes('localhost') || origin.includes('frontend'))) {
  res.setHeader('Access-Control-Allow-Origin', origin);
}
```

---

#### 3. **Missing Environment Variables**
**Problem**: No way to configure API URLs for different environments
**Fix Applied**: Created `.env.docker` with proper Docker defaults:
```env
NODE_ENV=production
FRONTEND_URL=http://localhost
REACT_APP_API_URL=
```

---

#### 4. **Docker Compose Network Issues**
**File**: `docker-compose.yml`
**Updates**:
- Added `FRONTEND_URL` environment variable
- Added `condition: service_healthy` to wait for backend to be ready
- Improved health check configuration
- Added `start_period` to frontend health check

---

## How It Works Now

### Request Flow in Docker

```
┌─────────────────────────────────────────────────────┐
│ Browser at http://localhost:80                      │
├─────────────────────────────────────────────────────┤
│ Requests: GET /api/reports/count                    │
└──────────────┬──────────────────────────────────────┘
               │
        ┌──────v──────────────────────┐
        │ Nginx (Port 80)             │
        │ ✅ Serves React app         │
        │ ✅ Proxies /api/* to...     │
        └──────┬──────────────────────┘
               │
        ┌──────v──────────────────────┐
        │ http://backend:3000         │
        │ (Docker service name)       │
        └──────┬──────────────────────┘
               │
        ┌──────v──────────────────────┐
        │ Backend Container           │
        │ ✅ Processes request        │
        │ ✅ Returns JSON response    │
        └────────────────────────────┘
```

### Key Components

| Component | In Docker | In Development |
|-----------|-----------|-----------------|
| Frontend | Served by Nginx:80 | React dev server:3001 |
| Backend | Node:3000 | Node:3000 |
| API URL | Relative `/api/*` | `http://localhost:3000` |
| CORS Origin | `http://frontend` | `http://localhost:3001` |

---

## Files Changed

### 1. `frontend/src/api/axios.js`
✅ **Changed**: Hardcoded localhost → Environment-aware URLs
- Uses `REACT_APP_API_URL` if set
- Uses relative URLs in production (Docker)
- Falls back to localhost in development
- Added request/response logging

### 2. `backend/server.js`
✅ **Changed**: Strict CORS → Flexible CORS
- Accepts Docker container names
- Accepts multiple localhost variants
- Respects `FRONTEND_URL` environment variable
- Added logging middleware for debugging

### 3. `docker-compose.yml`
✅ **Changed**: Added environment variables
- `FRONTEND_URL`: For CORS configuration
- `REACT_APP_API_URL`: For frontend API configuration
- Added health check dependencies
- Improved container startup order

### 4. `.env.docker`
✅ **Created**: Docker environment defaults
```env
NODE_ENV=production
FRONTEND_URL=http://localhost
REACT_APP_API_URL=
REACT_APP_ENVIRONMENT=docker
```

### 5. `DOCKER_DEBUGGING.md`
✅ **Created**: Complete debugging and troubleshooting guide

---

## Environment Variables Needed

When deploying to Docker, set these variables in `.env`:

```bash
# Required
NODE_ENV=production
FRONTEND_URL=http://localhost

# Optional (uses default if not set)
REACT_APP_API_URL=
REACT_APP_ENVIRONMENT=docker
```

### For Production (e.g., AWS, Heroku, etc.)

```bash
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
REACT_APP_API_URL=https://your-domain.com/api
```

### For Local Development

```bash
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
REACT_APP_API_URL=http://localhost:3000
```

---

## How to Deploy

### Option 1: Automated (Recommended)

**Windows**:
```bash
./docker-setup.bat
```

**Linux/Mac**:
```bash
chmod +x docker-setup.sh
./docker-setup.sh
```

### Option 2: Manual

```bash
# 1. Create environment file
cp .env.docker .env

# 2. Build images
docker-compose build

# 3. Start containers
docker-compose up -d

# 4. Test
curl http://localhost:3000/api/reports/count
curl http://localhost/
```

---

## Testing the Fix

After deployment:

```bash
# ✅ Test Backend
curl http://localhost:3000/api/reports/count
# Should return: {"total":0} or {"total":N}

# ✅ Test Frontend
curl http://localhost/
# Should return HTML

# ✅ Check Logs
docker-compose logs -f

# ✅ Check Network
docker network inspect netlink_netlink_network
```

---

## Troubleshooting

### Error: 404 /api/reports/count

```bash
# Check backend is running
docker-compose ps

# Check logs
docker-compose logs backend

# Test backend directly
curl http://localhost:3000/api/reports/count

# Test nginx proxy
docker exec netlink_frontend cat /etc/nginx/conf.d/default.conf
```

### Error: CORS Block

**Browser**: Check console for CORS error
```bash
# Check what origin is being sent
docker-compose logs backend | grep -i "origin:"

# Check Docker network
docker network inspect netlink_netlink_network
```

### Error: Cannot Connect to Backend

```bash
# Test from frontend container
docker exec netlink_frontend ping backend

# Check DNS resolution
docker exec netlink_frontend nslookup backend

# Check network connectivity
docker network inspect netlink_netlink_network
```

---

## Key Learning: How Docker Networking Works

In Docker:

1. **Each container has its own localhost** - Can't use `localhost:3000` from frontend
2. **Service names resolve in the network** - Use `http://backend:3000` instead
3. **Nginx can act as a proxy** - Convert `/api/*` requests to `http://backend:3000/api/*`
4. **Environment variables configure origins** - `CORS_ORIGIN`, `FRONTEND_URL` must match actual origins

---

## Summary Checklist

- ✅ Fixed axios to use environment-aware URLs
- ✅ Fixed backend CORS to accept Docker origins
- ✅ Added flexible environment variables
- ✅ Created .env.docker with defaults
- ✅ Created setup scripts (Windows & Linux)
- ✅ Created debugging guide
- ✅ Improved docker-compose.yml
- ✅ Added logging for debugging

---

## Next Steps

1. **Copy .env.docker to .env** (customize if needed)
2. **Run docker-setup.bat or docker-setup.sh**
3. **Wait 5-10 seconds for services to be ready**
4. **Test at http://localhost**
5. **Check logs if issues: `docker-compose logs -f`**

---

Questions? Check:
- `DOCKER_DEBUGGING.md` - Comprehensive troubleshooting
- `docker-compose logs` output
- Browser console for CORS/network errors
