# QUICK START - DO THIS NOW

## 1️⃣ PUSH TO GITHUB (5 minutes)

Open PowerShell and run:

```bash
cd "C:\Users\pc\Desktop\CEF-345-project-SDL-LEVEL-300-FET---UB"

git config user.name "Your Name"
git config user.email "your.email@gmail.com"

git add .
git commit -m "Initial commit: Docker-ready Netlink system"

git remote add origin https://github.com/yourname/netlink.git

git branch -M main
git push -u origin main
```

✅ **Verify:** Go to https://github.com/yourname/netlink - see all files there

---

## 2️⃣ TEST DOCKER LOCALLY (5 minutes)

Still in PowerShell:

```bash
# Build Docker images
docker-compose build

# Start containers
docker-compose up -d

# Check status
docker ps

# Test backend API
curl http://localhost:3000/api/reports/count
# Should return: {"total":0}

# Test frontend
# Open browser to: http://localhost
# Should see Netlink app
```

✅ **Verify:** 
- Both containers running
- Backend API responds
- Frontend loads

---

## 3️⃣ TEST FORM SUBMISSION (2 minutes)

In browser:

1. Go to: http://localhost/report
2. Fill the form:
   - Network: MTN
   - Phone: +237123456789
   - Issue: Test signal
   - Description: Testing the system
3. Click **Submit**

Then:

1. Go to: http://localhost/
2. Check Dashboard shows **"Total Reports: 1"** ✅
3. Check Map shows **a pin** ✅

---

## 4️⃣ TEST DATA PERSISTENCE (1 minute)

In PowerShell:

```bash
# View your data file
cat backend/data.json

# Should show your submitted report
```

Then:

```bash
# Stop containers
docker-compose down

# Start them again
docker-compose up -d

# Check data still there
cat backend/data.json

# Your report should still exist ✅
```

---

## 5️⃣ DEPLOY TO RENDER (10 minutes)

See `DEPLOYMENT_STEPS.md` for complete guide.

Quick version:
1. Go to: https://render.com/
2. Sign up with GitHub
3. Click "Create Service" → Select your `netlink` repo
4. Configure: name = `netlink`, environment = Docker
5. Click "Create Service"
6. Wait for build to complete (~5-10 min)
7. Get the URL: `https://netlink-backend.onrender.com`
8. Test: `https://netlink-backend.onrender.com/api/reports/count`
9. Share URL with team! 🎉

---

## Understanding the System

```
Your computer (localhost)
├── Frontend on port 80
│   └── React app + Nginx
├── Backend on port 3000
│   └── Express server + dataStore
└── data.json file
    └── Shared via volume mount

When deployed to Render
├── Frontend on render domain
│   └── Same React + Nginx
├── Backend on render domain
│   └── Same Express + dataStore
└── data.json file
    └── Stored on Render's disk
```

### How They Link Together

1. **User visits** http://localhost (or render URL)
2. **Browser loads** React app (frontend container)
3. **React JavaScript** makes HTTP calls:
   - `GET http://backend:3000/api/reports/count` (or render URL)
   - `GET http://backend:3000/api/map/locations`
4. **Backend Express** processes requests
5. **dataStore.js** reads/writes `data.json`
6. **Frontend** displays dashboard and map
7. **User submits** form
8. **Backend** saves to `data.json`
9. **Frontend polls** (every 5s) and **updates display**

---

## File Structure Reference

```
Your Project
│
├── docker-compose.yml          ← Orchestrates both containers
├── .gitignore                  ← Prevents uploading node_modules
│
├── backend/
│   ├── Dockerfile              ← Build backend image
│   ├── server.js               ← Express API (all routes)
│   ├── dataStore.js            ← Manages data.json
│   ├── data.json               ← Data storage (shared via volume)
│   └── package.json
│
├── frontend/
│   ├── Dockerfile              ← Build frontend image
│   ├── nginx.conf              ← Web server config
│   ├── src/
│   │   ├── api/axios.js        ← API client (withCredentials: false)
│   │   └── components/
│   │       ├── Dashboard.js    ← Shows reports count
│   │       └── MapComponent.js ← Shows pins
│   └── package.json
│
├── GITHUB_PUSH_GUIDE.md        ← How to push to GitHub
├── DOCKER_DEPLOYMENT_DETAILED.md ← How Docker works
├── CONTAINERS_LINKING_EXPLAINED.md ← How parts connect
└── DEPLOYMENT_STEPS.md         ← How to deploy on Render
```

---

## Common Commands

### Docker Commands

```bash
# Build images
docker-compose build

# Start containers (background)
docker-compose up -d

# Stop containers
docker-compose down

# View status
docker ps

# View logs
docker-compose logs backend
docker-compose logs frontend

# Enter container shell
docker exec -it netlink_backend sh
```

### Git Commands

```bash
# Check status
git status

# Add files
git add .

# Commit
git commit -m "Message"

# Push to GitHub
git push origin main
```

### Test Commands

```bash
# Test backend
curl http://localhost:3000/api/reports/count

# Test frontend
http://localhost

# View data file
cat backend/data.json
```

---

## Troubleshooting

### Port Already in Use
```bash
# Change ports in docker-compose.yml
ports:
  - "3001:3000"  # Use 3001 instead of 3000
```

### Docker Not Running
```
Open Docker Desktop app and wait for it to start
```

### Frontend Can't Connect to Backend
```bash
# Check both on same network
docker network inspect netlink_network

# Should show both containers listed
```

### Data Not Persisting
```bash
# Check volume mounted correctly
docker inspect netlink_backend | findstr Mounts

# Should show data.json mounted
```

### Git Push Fails
```bash
# Make sure you have:
git config user.name "Your Name"
git config user.email "your@email.com"

# And you've created repo on GitHub
# https://github.com/new
```

---

## Next Steps Checklist

- [ ] **Step 1:** Run git push (see section 1)
- [ ] **Step 2:** Build and start Docker locally (see section 2)
- [ ] **Step 3:** Test form submission (see section 3)
- [ ] **Step 4:** Verify data persists (see section 4)
- [ ] **Step 5:** Deploy to Render (see section 5)
- [ ] **Step 6:** Share live URL with team!

---

## You're Ready! 🚀

All the guides are created:
- `GITHUB_PUSH_GUIDE.md` - Push to GitHub
- `DOCKER_DEPLOYMENT_DETAILED.md` - How Docker works
- `CONTAINERS_LINKING_EXPLAINED.md` - How parts connect
- `DEPLOYMENT_STEPS.md` - Deploy on Render

Just follow them in order and you're live!
