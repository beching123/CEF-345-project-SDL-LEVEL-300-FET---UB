# 🚀 MASTER DEPLOYMENT GUIDE - DO THIS NOW

## WHAT YOU HAVE

✅ Complete Docker system (frontend + backend)
✅ All code ready to deploy
✅ Configuration files ready
✅ Data storage ready
✅ Containers configured to link together

---

## WHAT TO DO - IN THIS EXACT ORDER

### ⏱️ TOTAL TIME: 35-40 minutes

---

## STEP 1: PUSH TO GITHUB (5 minutes)

### Why?
- Backup your code
- Enables deployment to Render
- Allows team collaboration

### Commands

Open PowerShell and run these commands one by one:

```powershell
# Navigate to project
cd "C:\Users\pc\Desktop\CEF-345-project-SDL-LEVEL-300-FET---UB"

# Configure git (one time only)
git config user.name "Your Full Name"
git config user.email "your.email@gmail.com"

# Stage all files
git add .

# Commit
git commit -m "Initial: Docker-ready Netlink system with JSON data storage"
```

### Create GitHub Repository

1. Go to https://github.com/new
2. Fill in:
   ```
   Repository name: netlink
   Description: Network issue reporting system with Docker
   Visibility: Public
   ```
3. **Don't** check "Initialize with README"
4. Click **Create Repository**
5. Copy the HTTPS URL shown (looks like: https://github.com/yourname/netlink.git)

### Push Code

Back in PowerShell, replace `yourname` in this command and run it:

```powershell
# Add GitHub as remote
git remote add origin https://github.com/yourname/netlink.git

# Push code
git branch -M main
git push -u origin main

# When prompted for password, enter your GitHub password
```

### Verify

1. Go to https://github.com/yourname/netlink
2. You should see all your files listed
3. ✅ Complete!

---

## STEP 2: TEST DOCKER LOCALLY (10 minutes)

### Why?
- Verify your system works
- Catch issues before Render deployment
- Test form → dashboard → map flow

### Build Docker Images

In PowerShell (same directory):

```powershell
# Build both images
docker-compose build

# This takes 3-5 minutes
# Wait for it to finish
```

**Expected output:**
```
Building netlink_backend ... DONE
Building netlink_frontend ... DONE
```

### Start Containers

```powershell
# Start both containers in background
docker-compose up -d

# Check they're running
docker ps

# You should see 2 containers listed
```

**Expected output:**
```
CONTAINER ID    IMAGE              STATUS
abc123...       netlink_backend    Up 1 minute
def456...       netlink_frontend   Up 1 minute
```

### Test Backend API

```powershell
# Test the API
curl http://localhost:3000/api/reports/count

# Should return: {"total":0}
```

If you get `{"total":0}`, backend is working! ✅

### Test Frontend Website

Open browser and go to: **http://localhost**

You should see:
- Netlink application loads ✅
- Report form visible ✅
- Dashboard shows "Total Reports: 0" ✅
- Map shows empty map ✅

---

## STEP 3: TEST FORM → DASHBOARD → MAP FLOW (5 minutes)

### Submit a Test Report

1. In browser, go to: **http://localhost/report**
2. Fill the form:
   ```
   Network: MTN
   Phone: +237123456789
   Issue: No signal
   Description: Testing the system
   ```
3. Click **Submit**

### Check Dashboard Updates

1. Go to: **http://localhost**
2. Dashboard should show:
   ```
   Total Reports: 1 ✅
   MTN: 1
   ORANGE: 0
   CAMTEL: 0
   ```

### Check Map Shows Pin

1. Still on http://localhost
2. Map section should show:
   ```
   A yellow pin (MTN) at the location ✅
   ```

**If you see all three ✅, your system works perfectly!**

---

## STEP 4: VERIFY DATA PERSISTENCE (3 minutes)

### Check Data File

In PowerShell:

```powershell
# View the data file
cat backend/data.json

# You should see your report in JSON format
```

### Test Restart Persistence

```powershell
# Stop all containers
docker-compose down

# Start them again
docker-compose up -d

# Check data still there
cat backend/data.json

# Your report should still exist ✅
```

---

## STEP 5: DEPLOY TO RENDER (15 minutes)

### Create Render Account

1. Go to https://render.com
2. Click **Sign Up**
3. Choose **Sign Up with GitHub**
4. Authorize Render to access GitHub

### Create Web Service

1. Click **Dashboard**
2. Click **Create New** → **Web Service**
3. Click **Connect Repository** next to your `netlink` repo
4. Click the `netlink` repository

### Configure Service

Fill in these fields:

```
Name: netlink-backend
Environment: Docker
Region: Frankfurt (or your region)
Branch: main
Dockerfile path: (leave blank, auto-detected)
```

Then click **Create Web Service**

### Wait for Build

Render will automatically:
1. Pull from GitHub
2. Build Docker images
3. Start containers
4. Assign you a URL

**Wait 5-10 minutes for build to complete.**

Watch the logs. When you see something like:
```
✅ Netlink Server running at http://localhost:3000
```

Your backend is live!

### Get Your URL

Once built, copy your service URL. It looks like:
```
https://netlink-backend.onrender.com
```

### Add Persistent Disk

1. In Render dashboard
2. Click your service
3. Go to **Settings**
4. Click **Add Disk**
5. Configure:
   ```
   Mount Path: /app/backend
   Size: 1 GB
   ```
6. Click **Add**
7. Service will restart with disk attached

### Test Your Live API

```powershell
# Replace with your actual URL
curl https://netlink-backend.onrender.com/api/reports/count

# Should return: {"total":1}
(Your test report should be there!)
```

---

## STEP 6: SHARE WITH YOUR TEAM (2 minutes)

### What to Share

Give your team these URLs:

```
For viewing data count:
https://netlink-backend.onrender.com/api/reports/count

(If you deployed frontend to Render as well)
For using the app:
https://netlink-frontend.onrender.com
```

### What Team Does

1. Open the URL in their browser
2. Fill out report form
3. Submit
4. They'll see their report on dashboard
5. Everyone sees all reports in real-time

---

## SUMMARY: What Happened

| Step | What | Time | Result |
|------|------|------|--------|
| 1 | Push to GitHub | 5 min | Code backed up |
| 2 | Build Docker locally | 5 min | Images created |
| 3 | Test system locally | 5 min | Verified form → dashboard → map |
| 4 | Verify persistence | 3 min | Data survives restart |
| 5 | Deploy to Render | 15 min | Live on internet |
| 6 | Share URLs | 2 min | Team can access |
| **Total** | **Complete System** | **~35 min** | **✅ Ready!** |

---

## How It Works (Simplified)

### Locally (Your Computer)

```
Frontend container    Backend container
(port 80)      →     (port 3000)    →   data.json
(React)              (Express)           (file)
↓
User sees app
```

### On Render (Internet)

```
Render frontend       Render backend
(cloud)         →     (cloud)        →   Render disk
(React)              (Express)           (persistent)
↓
Users anywhere see app
```

Same architecture, just running on Render's servers!

---

## If Something Goes Wrong

### Problem: "Port already in use"

```powershell
# In docker-compose.yml, change:
ports:
  - "3001:3000"  # Use 3001 instead of 3000

# Then:
docker-compose down
docker-compose build
docker-compose up -d
```

### Problem: "Docker daemon not running"

```
Open Docker Desktop application
Wait for it to fully load
Try command again
```

### Problem: "Frontend can't connect to backend on Render"

In `frontend/src/api/axios.js`:

```javascript
// Change from:
baseURL: 'http://localhost:3000'

// To:
baseURL: 'https://netlink-backend.onrender.com'
```

Then push to GitHub and Render auto-redeploys!

### Problem: "Build fails on Render"

Check Render logs:
1. Click service
2. Click **Logs** tab
3. Look for red error messages

Common fixes:
```bash
# Locally, reinstall deps
rm backend/node_modules package-lock.json
npm install

# Push again
git add .
git commit -m "Fix: reinstall dependencies"
git push origin main
```

---

## Verification Checklist

Before considering it done:

### Local Testing
- [ ] `docker-compose build` succeeds
- [ ] `docker-compose up -d` starts
- [ ] Backend API responds: `curl http://localhost:3000/api/reports/count`
- [ ] Frontend loads: `http://localhost`
- [ ] Submit form works
- [ ] Dashboard updates
- [ ] Map shows pin
- [ ] Data persists after restart

### GitHub
- [ ] https://github.com/yourname/netlink exists
- [ ] All files visible on GitHub
- [ ] Commit message shows

### Render Deployment
- [ ] Service builds successfully
- [ ] Service shows "running"
- [ ] Get service URL
- [ ] Add disk succeeds
- [ ] API responds: `curl https://yoururl/api/reports/count`

### Team Access
- [ ] Share URL with team
- [ ] Team can visit URL
- [ ] Team can submit reports
- [ ] Team sees each other's reports

---

## After You're Done

### You Have
✅ Working local system
✅ Code on GitHub
✅ Live app on Render
✅ Team can collaborate

### Your Team Can
✅ Submit network issue reports
✅ See reports on dashboard
✅ See locations on map
✅ Access from anywhere
✅ Work offline (with offline mode in React)

### Next Steps (Optional)
- [ ] Add user authentication
- [ ] Add data validation
- [ ] Add API rate limiting
- [ ] Migrate to real database (MySQL/PostgreSQL)
- [ ] Add monitoring/logging
- [ ] Custom domain name

---

## Key Files Reference

```
docker-compose.yml          ← Orchestrates everything
backend/Dockerfile          ← Backend image builder
backend/server.js           ← Express API
backend/dataStore.js        ← Data management
backend/data.json           ← Your data (shared)
frontend/Dockerfile         ← Frontend image builder
frontend/src/App.js         ← Main app
frontend/nginx.conf         ← Web server config
.gitignore                  ← What NOT to push
```

---

## You're Ready! 🎉

Your system is production-ready. Just follow the steps above and you'll be live in 35 minutes!

Questions? See the detailed guides:
- `GITHUB_PUSH_GUIDE.md` - GitHub help
- `DOCKER_DEPLOYMENT_DETAILED.md` - Docker details
- `CONTAINERS_LINKING_EXPLAINED.md` - How parts connect
- `DEPLOYMENT_STEPS.md` - Render deployment details

**Good luck! Your team will be impressed! 🚀**
