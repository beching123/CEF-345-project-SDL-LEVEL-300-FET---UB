# DOCKER DEPLOYMENT GUIDE - Detailed Step by Step

## How Docker Works With Your System

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Computer                            │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            DOCKER ENVIRONMENT                        │  │
│  │                                                      │  │
│  │  ┌──────────────────┐      ┌──────────────────┐    │  │
│  │  │ Backend Service  │      │ Frontend Service │    │  │
│  │  │ (Docker Image)   │      │ (Docker Image)   │    │  │
│  │  │                  │      │                  │    │  │
│  │  │ ┌──────────────┐ │      │ ┌──────────────┐ │    │  │
│  │  │ │ Node.js      │ │      │ │ Nginx Server │ │    │  │
│  │  │ │ Express      │ │      │ │ React App    │ │    │  │
│  │  │ │ server.js    │ │      │ │ (built)      │ │    │  │
│  │  │ └──────────────┘ │      │ └──────────────┘ │    │  │
│  │  │                  │      │                  │    │  │
│  │  │ Port: 3000      │      │ Port: 80         │    │  │
│  │  └──────────────────┘      └──────────────────┘    │  │
│  │           │                        │               │  │
│  │           └────────────────────────┘               │  │
│  │              (Network Bridge)                      │  │
│  │           netlink_network                          │  │
│  │                                                    │  │
│  │  ┌──────────────────────────────────────────┐    │  │
│  │  │  Shared Volume (Storage)                 │    │  │
│  │  │  ./backend/data.json                     │    │  │
│  │  │  (Persists data across restarts)        │    │  │
│  │  └──────────────────────────────────────────┘    │  │
│  │                                                    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  Ports Open to Outside World:                         │
│  - localhost:80 (Frontend)                            │
│  - localhost:3000 (Backend API)                       │
└────────────────────────────────────────────────────────┘
```

---

## Part 1: How Containers Link Together

### **Container 1: Backend (Node.js + Express)**

**What it contains:**
- Node.js runtime
- Express server (server.js)
- dataStore.js (reads/writes data.json)
- All npm packages

**What it does:**
- Listens on port 3000
- Accepts HTTP requests from frontend
- Reads/writes to `/app/backend/data.json`
- Returns JSON responses

**Network name:** `backend` (inside docker network)

**Key file:** `backend/Dockerfile` (tells Docker how to build it)

### **Container 2: Frontend (React + Nginx)**

**What it contains:**
- React application (compiled/built)
- Nginx web server (serves React files)
- nginx.conf (routing config)

**What it does:**
- Listens on port 80
- Serves HTML/CSS/JS to browser
- Browser's JavaScript makes API calls to backend
- Shows dashboard, map, report form

**Network name:** `frontend` (inside docker network)

**Key file:** `frontend/Dockerfile` (tells Docker how to build it)

### **Shared Network: `netlink_network`**

```yaml
networks:
  netlink_network:
    driver: bridge
```

This creates a virtual network that both containers connect to.

**How they communicate:**
```
Frontend browser code makes request:
GET http://backend:3000/api/reports/count

Docker translates:
http://backend:3000 → internal IP of backend container

Backend responds with JSON

Frontend displays on dashboard
```

### **Shared Storage: Volume Mount**

```yaml
volumes:
  - ./backend/data.json:/app/backend/data.json
```

This means:
```
Your computer:     C:\Users\pc\Desktop\...\backend\data.json
Inside container:  /app/backend/data.json
```

When backend container writes to `/app/backend/data.json`, it actually writes to your computer's file.

**Why this matters:**
- Data persists even after container stops
- Data is not lost on restart
- You can check data on your computer anytime

---

## Part 2: Docker Build Process

When you run `docker-compose build`, this happens:

### **Step 1: Read docker-compose.yml**
```
"I need to build 2 services: backend and frontend"
"Use this Dockerfile for each"
```

### **Step 2: Build Backend**

Docker executes `backend/Dockerfile`:

```dockerfile
# Stage 1: Builder
FROM node:18-alpine
↓
WORKDIR /app/backend
↓
COPY backend/package*.json ./
↓
RUN npm install          ← Installs dependencies
↓
COPY backend/ .          ← Copies all .js files
↓
RUN npm test             ← Runs tests

# Stage 2: Production (slim down image)
FROM node:18-alpine      ← Fresh container
↓
COPY from builder        ← Only copy necessary files
↓
Result: backend image (~300 MB)
```

**Output:** `netlink_backend` image ready to run

### **Step 3: Build Frontend**

Docker executes `frontend/Dockerfile`:

```dockerfile
# Stage 1: Builder
FROM node:18-alpine
↓
COPY frontend/package*.json ./
↓
RUN npm install          ← Install React dependencies
↓
COPY frontend/ .         ← Copy React code
↓
RUN npm run build        ← Build React (creates optimized files)

# Stage 2: Nginx
FROM nginx:alpine        ← Fresh lightweight container
↓
COPY built files         ← Copy optimized React files
↓
Result: frontend image (~50 MB)
```

**Output:** `netlink_frontend` image ready to run

---

## Part 3: Docker Run Process

When you run `docker-compose up`, this happens:

### **Step 1: Create Network**
```
Docker creates: netlink_network (bridge)
Both containers will connect to this network
```

### **Step 2: Start Backend Container**
```
docker run --name netlink_backend \
  --network netlink_network \
  -p 3000:3000 \
  -v ./backend/data.json:/app/backend/data.json \
  netlink_backend

Result:
✅ Container ID: abc123def456
✅ Running: Node.js server.js
✅ Listening on port 3000
✅ Mounted volume for data
```

### **Step 3: Start Frontend Container**
```
docker run --name netlink_frontend \
  --network netlink_network \
  -p 80:80 \
  --depends_on backend \
  netlink_frontend

Result:
✅ Container ID: xyz789uvw012
✅ Running: Nginx server
✅ Listening on port 80
✅ Serving React app
```

### **Step 4: Network Magic**
```
Both containers now on netlink_network

Frontend container can access backend via:
http://backend:3000          ← Docker DNS resolves this

Real request flow:
Browser → Nginx (port 80)
       → React JavaScript
       → axios.get('http://backend:3000/api/reports/count')
       → Docker translates to backend container IP
       → Express on backend
       → dataStore.js reads data.json
       → Returns JSON to browser
       → Dashboard displays data
```

---

## Part 4: Step-by-Step Docker Commands

### **Prerequisites**

Make sure you have:
- Docker Desktop installed
- Running on your computer
- You have admin/user privileges

### **Command 1: Build All Images**

```bash
cd C:\Users\pc\Desktop\CEF-345-project-SDL-LEVEL-300-FET---UB

docker-compose build
```

What happens:
```
Building netlink_backend ... DONE
Building netlink_frontend ... DONE

Images created:
- netlink_backend:latest     (~300 MB)
- netlink_frontend:latest    (~50 MB)

Time: ~5-10 minutes (first time only)
```

**Check images were created:**
```bash
docker images | findstr netlink
```

You should see:
```
netlink_backend       latest    abc123    15 minutes ago    300MB
netlink_frontend      latest    xyz789    10 minutes ago    50MB
```

### **Command 2: Start All Containers**

```bash
docker-compose up
```

Or run in background:
```bash
docker-compose up -d
```

What happens:
```
Creating netlink_network ... DONE
Creating netlink_backend ... DONE
Creating netlink_frontend ... DONE

✅ Backend listening on localhost:3000
✅ Frontend listening on localhost:80
```

Check if running:
```bash
docker ps
```

You should see:
```
CONTAINER ID    IMAGE                STATUS         PORTS
abc123...       netlink_backend      Up 2 minutes   3000->3000/tcp
xyz789...       netlink_frontend     Up 1 minute    80->80/tcp
```

### **Command 3: View Logs**

```bash
# All containers
docker-compose logs

# Only backend
docker-compose logs backend

# Only frontend
docker-compose logs frontend

# Follow logs (live)
docker-compose logs -f
```

Look for:
```
backend    | Netlink Server running at http://localhost:3000  ✅
frontend   | nginx: ... worker processes started               ✅
```

---

## Part 5: Testing Docker Locally

### **Test 1: Backend API (Port 3000)**

```bash
# In PowerShell, test backend
curl http://localhost:3000/api/reports/count

# Should return:
{"total":0}
```

If you see `{"total":0}`, backend is working! ✅

### **Test 2: Frontend Website (Port 80)**

```bash
# In your browser
http://localhost:80
or simply
http://localhost
```

You should see:
- Netlink application loads
- Report form visible
- Dashboard shows "Total Reports: 0"
- Map shows empty map

If you see all of this, frontend is working! ✅

### **Test 3: Containers Can Talk (Network Test)**

```bash
# Get inside backend container
docker exec -it netlink_backend sh

# Inside container, test frontend
wget http://frontend:80/index.html

# Should download (connection works) ✅
exit
```

### **Test 4: Data Persistence**

1. Submit a report through the form (localhost/report)
2. Check your computer's file:

```bash
# On your computer (PowerShell)
cat C:\Users\pc\Desktop\CEF-345-project-SDL-LEVEL-300-FET---UB\backend\data.json
```

You should see:
```json
{
  "reports": [
    {"id": 1707..., "networkType": "MTN", ...}
  ],
  "locations": [...]
}
```

Data persisted! ✅

### **Test 5: Restart and Data Survives**

```bash
# Stop containers
docker-compose down

# Start again
docker-compose up -d

# Check data still there
cat C:\Users\pc\Desktop\CEF-345-project-SDL-LEVEL-300-FET---UB\backend\data.json
```

You should still see your report! ✅

---

## Part 6: Fixing Common Docker Issues

### **Issue: "Docker daemon not running"**

Solution:
```
1. Open Docker Desktop application
2. Wait for it to fully load
3. Try command again
```

### **Issue: "Port 3000 already in use"**

Solution:
```bash
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill it (replace PID with actual number)
taskkill /PID 12345 /F

# Or change port in docker-compose.yml
ports:
  - "3001:3000"   # Changed from 3000:3000
```

### **Issue: "Cannot connect to http://backend:3000 from frontend"**

This means containers aren't on same network.

Solution:
```bash
# Check networks
docker network ls

# Verify both containers on netlink_network
docker network inspect netlink_network
```

Check `docker-compose.yml` has both services under `networks: netlink_network`

### **Issue: "Data not persisting after restart"**

This means volume mount not working.

Solution:
```bash
# Check volume is mounted
docker inspect netlink_backend | findstr -A 5 "Mounts"

# Should show:
"Source": "C:\\Users\\pc\\Desktop\\...\\backend\\data.json"
"Destination": "/app/backend/data.json"

# If missing, check docker-compose.yml volumes section
```

### **Issue: "Containers won't start (health check failed)"**

Solution:
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Disable health check temporarily
# In docker-compose.yml, comment out healthcheck sections
# Then restart:
docker-compose down
docker-compose up -d
```

---

## Part 7: When You Deploy to Render.com

After Docker works locally, deployment on Render is simple:

### **What Happens on Render:**

1. Render pulls your GitHub repo
2. Sees `docker-compose.yml`
3. Builds images (same as your `docker-compose build`)
4. Starts containers (same as your `docker-compose up`)
5. Exposes port 80 to internet

### **Key Difference: Data Storage**

On your computer:
```
docker-compose.yml:
  volumes:
    - ./backend/data.json:/app/backend/data.json
    ↑ This is relative path on YOUR computer
```

On Render:
```
Render uses persistent disk instead of volume

docker-compose.yml (no change needed):
  volumes:
    - ./backend/data.json:/app/backend/data.json
    ↑ Render automatically persists this
```

---

## Part 8: Docker Commands Reference

### **Build & Start**
```bash
# Build all images
docker-compose build

# Start all containers
docker-compose up

# Start in background
docker-compose up -d

# Stop all containers
docker-compose down

# Rebuild and start fresh
docker-compose down && docker-compose build && docker-compose up -d
```

### **View Status**
```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# View logs
docker-compose logs

# View logs for specific service
docker-compose logs backend

# Follow logs (live)
docker-compose logs -f backend
```

### **Debug Inside Container**
```bash
# Open shell inside container
docker exec -it netlink_backend sh

# Run command inside container
docker exec netlink_backend npm test

# View container details
docker inspect netlink_backend
```

### **Clean Up**
```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove everything (careful!)
docker system prune -a
```

---

## Part 9: Complete Testing Checklist

- [ ] `docker-compose build` completes successfully
- [ ] `docker-compose up -d` starts without errors
- [ ] `docker ps` shows 2 running containers
- [ ] `curl http://localhost:3000/api/reports/count` returns `{"total":0}`
- [ ] `http://localhost` loads the app
- [ ] Dashboard visible with "Total Reports: 0"
- [ ] Map visible (empty)
- [ ] Report form loads at `/report`
- [ ] Submit a test report
- [ ] `data.json` file on computer updated with report
- [ ] Dashboard now shows "Total Reports: 1"
- [ ] Map shows a pin at submitted location
- [ ] `docker-compose down` stops containers
- [ ] `docker-compose up -d` starts them again
- [ ] Data still there (report count still 1)
- [ ] Test passed: Persistence works! ✅

---

## Part 10: Summary

### **Your System Structure:**

```
github.com/yourname/netlink/
├── docker-compose.yml          ← Orchestrates everything
├── backend/
│   ├── Dockerfile              ← Build backend image
│   ├── server.js               ← Express server
│   ├── dataStore.js            ← Data management
│   ├── data.json               ← Shared storage (volume mounted)
│   └── package.json
├── frontend/
│   ├── Dockerfile              ← Build frontend image
│   ├── nginx.conf              ← Nginx routing
│   ├── src/
│   │   ├── App.js
│   │   ├── api/axios.js        ← API calls
│   │   └── components/
│   │       ├── Dashboard.js    ← Shows reports count
│   │       └── MapComponent.js ← Shows pins
│   └── package.json
└── .gitignore                  ← Ignores node_modules, etc.
```

### **How Data Flows:**

```
User submits form at http://localhost/report
           ↓
ReportPage.js POSTs to http://backend:3000/api/reports
           ↓
Backend server.js routes POST /api/reports
           ↓
dataStore.addReport() called
           ↓
data.json updated (shared volume)
           ↓
Dashboard.js polls GET http://backend:3000/api/reports/count (every 5s)
           ↓
Dashboard shows count++
           ↓
MapComponent.js polls GET http://backend:3000/api/map/locations (every 10s)
           ↓
MapComponent renders new pin
```

### **When You Push to GitHub:**

```bash
git add .
git commit -m "Message"
git push origin main
```

GitHub gets:
- All source code
- All Dockerfiles
- docker-compose.yml
- .gitignore

Node_modules NOT included (they're huge, rebuilt during docker-compose build)

### **When You Deploy to Render:**

```
Render pulls from GitHub
         ↓
Sees docker-compose.yml
         ↓
Runs docker-compose build
         ↓
Runs docker-compose up
         ↓
Adds persistent disk for data.json
         ↓
Exposes port 80 to internet
         ↓
Your app is live! 🎉
```

---

## Ready to Deploy?

1. ✅ Push to GitHub (see Part 1 commands above)
2. ✅ Test Docker locally (`docker-compose up -d`)
3. ✅ Check all tests pass (see checklist above)
4. ✅ Deploy to Render (see DEPLOYMENT_STEPS.md)

All three parts use the SAME docker-compose.yml and Dockerfiles. No changes needed!

Your system is ready. Just push and deploy! 🚀
