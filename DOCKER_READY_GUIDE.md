# DOCKER DEPLOYMENT GUIDE - JSON Data System

## ✅ Docker Ready Status

**YES** - Your application is fully Docker-ready with the JSON data system.

---

## What's Been Updated for Docker

### 1. **docker-compose.yml** - UPDATED
- ❌ Removed MySQL service (no database needed)
- ✅ Backend service configured to use JSON file storage
- ✅ Volume mount for `data.json` persistence: `./backend/data.json:/app/backend/data.json`
- ✅ Frontend service configured
- ✅ Both services on same network for communication

### 2. **backend/Dockerfile** - UPDATED
- ✅ Multi-stage build (small final image)
- ✅ Alpine Linux (lightweight)
- ✅ Health check for auto-restart
- ✅ Non-root user (security)
- ✅ data.json support (copied to container)

### 3. **.gitignore** - UPDATED
- ✅ Properly configured for Docker deployment
- ✅ Excludes `node_modules/` (rebuilt in container)
- ✅ Excludes `package-lock.json` (rebuilt in container)
- ✅ Includes comment about `backend/data.json` (optional tracking)

### 4. **frontend/Dockerfile** - EXISTS
- ✅ Already configured for production deployment

---

## Data Persistence with Docker

### How Data Survives Container Restarts

**In docker-compose.yml:**
```yaml
backend:
  volumes:
    - ./backend/data.json:/app/backend/data.json
```

This line ensures:
- ✅ Data file exists on your local machine at `./backend/data.json`
- ✅ Container reads/writes to same file
- ✅ When container stops, data remains on disk
- ✅ When container restarts, data is still there

### Example Scenario

```bash
# User submits report while app is running
# data.json gets updated with new report

# You restart the container
docker-compose down
docker-compose up

# data.json still has all previous reports ✅
# No data loss
```

---

## Docker Deployment Steps

### 1. **Verify Docker is Installed**
```bash
docker --version
docker-compose --version
```

### 2. **Build Images**
```bash
docker-compose build
```

This will:
- Build backend image (Node.js app + dataStore)
- Build frontend image (React app)

### 3. **Start Services**
```bash
docker-compose up -d
```

This will:
- Start backend on port 3000
- Start frontend on port 80 (also 3001 for dev)
- Both on same Docker network
- Services auto-restart if they crash

### 4. **Verify Everything Works**
```bash
# Check running containers
docker-compose ps

# Check logs
docker-compose logs backend
docker-compose logs frontend

# Test API
curl http://localhost:3000/api/reports/count
# Should return: {"total":0} or more

# Open browser
http://localhost:80  # Frontend (production port)
http://localhost:3001  # Frontend (dev port)
```

### 5. **Submit a Report**
1. Go to http://localhost/report page
2. Fill form and submit
3. Check if data is saved to `backend/data.json`:
   ```bash
   cat backend/data.json
   # Should show your submitted report
   ```

### 6. **Restart and Verify Data Persists**
```bash
docker-compose down
# Your data.json still exists on disk

docker-compose up -d
# Containers restart

curl http://localhost:3000/api/reports/count
# Should still show your submitted report ✅
```

---

## Git & .gitignore Setup

### What Gets Committed to Git

**Should be committed:**
```
✅ backend/server.js
✅ backend/dataStore.js
✅ backend/Dockerfile
✅ backend/package.json
✅ frontend/Dockerfile
✅ docker-compose.yml
✅ All documentation
```

**Should NOT be committed:**
```
❌ node_modules/          (rebuilt in container)
❌ package-lock.json      (rebuilt in container)
❌ frontend/build/        (rebuilt in container)
❌ .env                   (sensitive, use .env.example)
❌ backend/data.json      (user data - optional)
```

### The Data Question: Track data.json or Not?

You have two options:

#### **Option A: Track data.json (Recommended for Class Demo)**
```bash
# Uncomment in .gitignore:
# !backend/data.json

git add backend/data.json
git commit -m "Add initial data"
```

**Benefits:**
- ✅ Everyone on team has same data
- ✅ Can demo with pre-populated data
- ✅ Easy to share progress with teacher
- ✅ Data is versioned

**Drawbacks:**
- ❌ File grows with each submission
- ❌ Merge conflicts if multiple branches add data

#### **Option B: Don't Track data.json (Recommended for Production)**
```bash
# Keep in .gitignore (current setup)
# Each deployment gets fresh data.json
```

**Benefits:**
- ✅ No merge conflicts
- ✅ Each environment independent
- ✅ Data is private per deployment

**Drawbacks:**
- ❌ Fresh data each deployment
- ❌ Need backups for important data

### For Your Class Demo: Use Option A

```bash
# Edit .gitignore
# Remove the comment from: !backend/data.json
```

Then:
```bash
git add backend/data.json
git commit -m "Add initial data storage"
git push
```

---

## Docker Commands Reference

### Start All Services
```bash
docker-compose up -d
```

### Stop All Services
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs backend      # Backend only
docker-compose logs frontend     # Frontend only
docker-compose logs              # All services
docker-compose logs -f backend   # Follow logs (live)
```

### Rebuild Images (after code changes)
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Remove Everything (careful!)
```bash
docker-compose down -v
# -v removes volumes too (includes data.json)
```

### Execute Command in Container
```bash
docker-compose exec backend npm start
docker-compose exec backend cat data.json
docker-compose exec frontend ls /app/frontend
```

---

## Environment Variables

### Current Setup (No Database Variables Needed)

**docker-compose.yml already has:**
```yaml
environment:
  NODE_ENV: ${NODE_ENV:-production}
  PORT: 3000
```

**Optional:** Create `.env` file for overrides
```env
NODE_ENV=production
REACT_APP_API_URL=http://localhost:3000
```

### Don't Need Anymore
```
❌ DB_HOST=mysql
❌ DB_USER=root
❌ DB_PASSWORD=...
❌ MYSQL_DATABASE=netlink_db
```

(These were for MySQL, no longer needed)

---

## Deployment to Production

### Option 1: Deploy to Render, Heroku, Railway
1. Push to GitHub with Docker files
2. Platform detects Dockerfile/docker-compose.yml
3. Automatically builds and deploys
4. Add volume mount for data.json persistence
5. Data survives deployments

### Option 2: Deploy to Own Server
```bash
# SSH into server
ssh user@your-server.com

# Clone repo
git clone https://github.com/yourname/netlink.git
cd netlink

# Start containers
docker-compose up -d

# Configure reverse proxy (Nginx) to route traffic
# Your app is now live at http://your-server.com
```

---

## Data Backup Strategy

### Automatic (Docker Volume)
```bash
# Data persists in volume automatically
docker-compose down
# data.json still exists

docker-compose up -d
# Data is back
```

### Manual Backup
```bash
# Before major changes
cp backend/data.json backend/data.backup.json

# After disaster
cp backend/data.backup.json backend/data.json
```

### Git-Based Backup (If tracking data.json)
```bash
git log backend/data.json     # See all versions
git show HEAD~1:backend/data.json  # View previous version
git revert <commit>           # Restore previous version
```

---

## Troubleshooting Docker Issues

### "Port 3000 already in use"
```bash
# Stop other containers
docker-compose down

# Or use different port
# Edit docker-compose.yml: "3000:3000" → "3002:3000"
```

### "Cannot connect to backend from frontend"
**Solution:** Both must be on same Docker network
- ✅ Already configured in docker-compose.yml
- Both services use `networks: - netlink_network`

### "data.json not persisting"
**Check volume mount:**
```bash
# View volume mounts
docker inspect netlink_backend | grep Mounts

# Should show:
# "Source": "/full/path/backend/data.json"
# "Destination": "/app/backend/data.json"
```

### "Permission denied on data.json"
```bash
# Fix permissions
chmod 644 backend/data.json
chmod 755 backend/

# Restart containers
docker-compose restart
```

### "Build fails: Cannot find module"
```bash
# Rebuild without cache
docker-compose build --no-cache backend
docker-compose up -d
```

---

## Docker vs Local Development

### Local Development (Faster for Changes)
```bash
cd backend && npm start
cd frontend && npm start
```

**Pros:**
- ✅ Fast iteration
- ✅ Easy debugging
- ✅ Direct file access

**Cons:**
- ❌ Different from production
- ❌ Environment dependencies

### Docker Development (Matches Production)
```bash
docker-compose up -d
```

**Pros:**
- ✅ Exact production environment
- ✅ Works on any machine
- ✅ Easy to deploy

**Cons:**
- ❌ Slightly slower
- ❌ Must rebuild images for code changes

### Recommendation
1. **For Development**: Use local (`npm start`)
2. **Before Deployment**: Test with Docker
3. **In Production**: Always use Docker

---

## Summary

| Aspect | Status | Notes |
|--------|--------|-------|
| Docker Ready | ✅ Yes | Updated for JSON system |
| Data Persistence | ✅ Yes | Volume mount keeps data.json |
| Production Ready | ✅ Yes | Multi-stage builds, health checks |
| Git Configuration | ✅ Yes | .gitignore properly configured |
| Database | ❌ No | Not needed (JSON file) |
| Quick Deployment | ✅ Yes | Just docker-compose up |
| Data Backups | ✅ Yes | Automatic via volume + git |
| Team Friendly | ✅ Yes | Easy to share and deploy |

---

## Next Steps

1. **Test locally first**: `npm start` (both terminals)
2. **Commit code**: `git add .` and `git commit`
3. **Test Docker**: `docker-compose up -d`
4. **Deploy**: Push to production platform

You're ready to deploy! 🚀
