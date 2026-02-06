# DOCKER DEPLOYMENT - DEBUGGING & SETUP GUIDE

## Issue Analysis - 404 Errors in Docker

### Root Causes Identified & Fixed:

#### **Issue #1: Hardcoded localhost:3000 in Frontend**
- **Problem**: `frontend/src/api/axios.js` used `baseURL: "http://localhost:3000"``
- **Why It Failed in Docker**: Frontend and backend in separate containers; localhost is different for each
- **Solution**: ✅ Updated to use relative URLs or environment variable
```javascript
// NEW: Uses REACT_APP_API_URL env var or relative URL
const getBaseURL = () => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  if (process.env.NODE_ENV === 'production') return ''; // Relative URL
  return 'http://localhost:3000'; // Dev
};
```

#### **Issue #2: CORS Not Allowing Docker Container Origins**
- **Problem**: Backend only allowed `http://localhost:3001`; didn't account for Docker names
- **Why It Failed in Docker**: Requests came from `http://frontend` or container IP
- **Solution**: ✅ Updated to accept Docker service names and multiple origins
```javascript
// NEW: Allows localhost, Docker service names, and env variable
if (origin && (origin.includes('localhost') || origin.includes('frontend'))) {
  res.setHeader('Access-Control-Allow-Origin', origin);
}
```

#### **Issue #3: Missing Environment Variables**
- **Problem**: No .env file for Docker with proper configuration
- **Solution**: ✅ Created `.env.docker` with proper values

---

## Docker Deployment Steps

### 1. **Prepare Environment File**
```bash
# Create Docker environment file
cat > .env << 'EOF'
NODE_ENV=production
FRONTEND_URL=http://localhost
REACT_APP_API_URL=
REACT_APP_ENVIRONMENT=docker
EOF
```

### 2. **Build Docker Images**
```bash
docker-compose build
```

### 3. **Start Containers**
```bash
docker-compose up -d
```

### 4. **Verify Health**
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Test backend health
curl http://localhost:3000/api/reports/count

# Test frontend
curl http://localhost/
```

---

## Environment Variables Explained

### **REQUIRED ENVIRONMENT VARIABLES**

| Variable | Purpose | Docker Value | Dev Value |
|----------|---------|--------------|-----------|
| `NODE_ENV` | Environment type | `production` | `development` |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost` | `http://localhost:3001` |
| `REACT_APP_API_URL` | Frontend API endpoint | `` (empty = relative) | `http://localhost:3000` |
| `PORT` | Backend port | `3000` | `3000` |

### **OPTIONAL ENVIRONMENT VARIABLES**

| Variable | Purpose | Default |
|----------|---------|---------|
| `REACT_APP_ENVIRONMENT` | Environment identifier | `docker` |
| `LOG_LEVEL` | Logging verbosity | `info` |

---

## How It Works in Docker

### **Request Flow**
```
Browser → Nginx (port 80) → /api/* proxy → Backend (port 3000)
          ↓
        Serves React app
        ↓
        When API call made (/api/reports/count)
        ↓
        Nginx intercepts (nginx.conf)
        ↓
        Proxies to http://backend:3000 (Docker service name)
        ↓
        Backend processes & returns
```

### **Key Files**
1. **nginx.conf** - Proxies `/api/*` to backend service
2. **docker-compose.yml** - Defines services and networking
3. **Dockerfile (backend)** - Node.js service
4. **Dockerfile (frontend)** - Nginx service
5. **axios.js** - Frontend API client (uses relative URLs in Docker)
6. **server.js** - Backend with flexible CORS

---

## Troubleshooting

### **Error: 404 /api/reports/count**

**Cause**: API endpoint not found or CORS blocking
**Solution**:
```bash
# Check backend is running
docker-compose logs backend

# Verify endpoint accessible
curl http://localhost:3000/api/reports/count

# Check nginx proxy config
docker exec netlink_frontend cat /etc/nginx/conf.d/default.conf
```

### **Error: CORS Origin Not Allowed**

**Cause**: Frontend origin not in CORS whitelist
**Solution**:
```bash
# Check what origin is being rejected
docker-compose logs backend | grep "Origin:"

# Update FRONTEND_URL in .env if needed
```

### **Error: Frontend Can't Reach Backend**

**Cause**: Service names or DNS not resolving
**Solution**:
```bash
# Verify network connectivity
docker exec netlink_frontend ping backend

# Check services are on same network
docker network inspect netlink_netlink_network
```

---

## Testing Checklist

- [ ] Docker images built successfully
- [ ] Containers started without errors
- [ ] Backend health check passing: `curl http://localhost:3000/api/reports/count`
- [ ] Frontend loading: `curl http://localhost/`
- [ ] No CORS errors in browser console
- [ ] Dashboard showing report counts
- [ ] Map loading and displaying

---

## Cleanup

```bash
# Stop containers
docker-compose down

# Remove volumes (if needed)
docker-compose down -v

# Remove images
docker rmi <image-id>
```

---

## Key Configuration Files

### docker-compose.yml
- **Settings**: Ports, environment variables, volumes, health checks
- **Services**: `backend` and `frontend`
- **Network**: `netlink_network` for inter-container communication

### nginx.conf
- **Proxy rule**: `location /api/ { proxy_pass http://backend:3000; }`
- **This allows frontend to call `/api/*` and have it automatically proxy to backend**

### axios.js (Frontend)
- **Development**: Uses `http://localhost:3000`
- **Docker/Production**: Uses relative URLs (Nginx proxies)
- **Fallback**: Can use `REACT_APP_API_URL` environment variable

---

## Production Deployment Notes

For cloud deployment (AWS, Azure, GCP, etc.):

1. **Update FRONTEND_URL** to your domain:
   ```bash
   FRONTEND_URL=https://your-domain.com
   ```

2. **Update nginx.conf** proxy address if needed:
   ```nginx
   proxy_pass https://backend-service-name:3000;
   ```

3. **Enable HTTPS** with reverse proxy/load balancer

4. **Mount data volume** for persistence:
   ```yaml
   volumes:
     - netlink_data:/app/backend
   ```

---

## Questions?

Check logs: `docker-compose logs -f`
Test endpoints: `curl http://localhost:3000/api/reports/count`
