# DEPLOYMENT GUIDE - Step by Step

## Choose Your Platform

### **RECOMMENDED: Render.com (Easiest)**
- Free tier available
- Auto-deploys from GitHub
- Detects Docker automatically
- Simple setup

### **Alternative: Railway.app**
- Similar to Render
- Good free tier
- Also auto-deploys from GitHub

### **Alternative: Heroku** 
- Was free, now paid
- Still has hobby tier
- Works the same way

I'll show Render.com steps (works same for others).

---

## STEP 1: Push Code to GitHub

### 1.1 Create GitHub Repo (If You Don't Have One)

Go to: https://github.com/new

Fill in:
```
Repository name: netlink
Description: Network issue reporting system
Public or Private: Public
```

Click "Create Repository"

### 1.2 Configure Git Locally

```bash
cd C:\Users\pc\Desktop\CEF-345-project-SDL-LEVEL-300-FET---UB

git config user.name "Your Name"
git config user.email "your.email@example.com"

git remote add origin https://github.com/yourname/netlink.git
```

Replace `yourname` with your actual GitHub username.

### 1.3 Commit Everything

```bash
git add .
git commit -m "Initial commit: Docker-ready Netlink system with JSON data storage"
```

### 1.4 Push to GitHub

```bash
git branch -M main
git push -u origin main
```

**Verify:** Go to https://github.com/yourname/netlink - should see all your files

---

## STEP 2: Sign Up on Render.com

### 2.1 Create Account

Go to: https://render.com

Click "Sign Up"

Choose: "Sign up with GitHub" (easier)

**Authorize** Render to access your GitHub

### 2.2 You're In

You should see dashboard with "Create New" button

---

## STEP 3: Deploy on Render

### 3.1 Click "Create New" → "Web Service"

### 3.2 Connect Your Repository

```
Connect a repository
↓
Select: yourname/netlink
↓
Click "Connect"
```

### 3.3 Configure Service

Fill in these fields:

```
Name: netlink-backend
Environment: Docker
Region: Frankfurt (or closest to you)
Branch: main
```

Click "Create Web Service"

### 3.4 Wait for Build

Render will:
1. Detect Dockerfile
2. Build Docker image
3. Start container
4. Assign you a URL

Takes ~5-10 minutes.

You'll see logs scrolling. Watch for:
```
✅ Netlink Server running at http://localhost:3000
```

---

## STEP 4: Add Data Persistence

### 4.1 Stop the Service

In Render dashboard:
- Click your service
- Go to "Settings"
- Click "Suspend" (pause it)

### 4.2 Add Disk

While suspended:
- Scroll down to "Disks"
- Click "Add Disk"

Configure:
```
Mount Path: /app/backend
Size: 1 GB
```

Click "Add Disk"

### 4.3 Restart Service

- Click "Resume"
- Wait for redeploy

---

## STEP 5: Test Your Deployment

### 5.1 Get Your URL

In Render dashboard, copy your service URL.

Example: `https://netlink-backend.onrender.com`

### 5.2 Test Backend

```bash
# Test the API
curl https://netlink-backend.onrender.com/api/reports/count

# Should return:
{"total":0}
```

### 5.3 Deploy Frontend (Optional - If Running Backend Only)

If you want frontend also on Render:

**In Render Dashboard:**
- Click "Create New" → "Web Service"
- Select: yourname/netlink
- Configure:
  ```
  Name: netlink-frontend
  Environment: Docker
  Dockerfile path: frontend/Dockerfile
  Region: Same as backend
  ```

**But easier:** Use Vercel for frontend (React optimization)

---

## STEP 6: Connect Frontend to Backend (If Separate)

### 6.1 Update Frontend API URL

If you deployed frontend separately, you need to point it to backend.

Edit: `frontend/src/api/axios.js`

Change:
```javascript
baseURL: "http://localhost:3000"  // Old (local)
```

To:
```javascript
baseURL: "https://netlink-backend.onrender.com"  // New (production)
```

### 6.2 Push Changes

```bash
git add frontend/src/api/axios.js
git commit -m "Update API URL for production"
git push origin main
```

Render auto-redeploys!

---

## STEP 7: Verify Everything Works

### 7.1 Test Backend API

```bash
curl https://netlink-backend.onrender.com/api/reports/count
# Returns: {"total":0}

curl https://netlink-backend.onrender.com/api/reports/count-by-network
# Returns: {"mtn":0,"orange":0,"camtel":0}
```

### 7.2 Test Frontend (If Deployed)

```
https://netlink-frontend.onrender.com
# Should load the app
```

### 7.3 Test Form Submission

1. Go to http://yoururl/report
2. Fill form
3. Submit
4. Go to http://yoururl/
5. Dashboard should show count = 1 ✅

### 7.4 Test Map

1. Go to http://yoururl/map
2. Should see pin at your reported location ✅

---

## STEP 8: Check Data Persistence

### 8.1 Access Container Shell (Render)

In Render dashboard:
- Go to your service
- Click "Shell" tab

```bash
# View data file
cat data.json

# Should show your submitted reports ✅
```

### 8.2 Data Should Have Your Report

```json
{
  "reports": [
    {"id": 1707..., "networkType": "MTN", ...}
  ],
  "locations": [...]
}
```

---

## Complete Deployment Checklist

- [ ] GitHub account created
- [ ] Code pushed to GitHub repo
- [ ] Render.com account created
- [ ] Connected GitHub to Render
- [ ] Created web service for backend
- [ ] Build completed (check logs)
- [ ] Got service URL
- [ ] Added disk for data persistence
- [ ] Tested /api/reports/count endpoint
- [ ] Updated frontend API URL (if separate)
- [ ] Deployed frontend (or used Vercel)
- [ ] Tested form submission
- [ ] Verified dashboard counts
- [ ] Verified map pins appear
- [ ] Verified data persists in Shell

---

## Troubleshooting Deployment

### Problem: Build Fails

**Check logs in Render:**
1. Go to your service
2. Click "Logs" tab
3. Look for red errors

Common issues:
```
❌ "Cannot find module"
→ Run: npm install locally, push again

❌ "Port already in use"
→ Already deployed, just redeploy

❌ "Docker build failed"
→ Check Dockerfile syntax
```

### Problem: API Returns 500 Error

**Check logs:**
```bash
# In Render Shell
cat /var/log/container.log
```

**Most likely:** data.json permissions

**Fix:**
```bash
chmod 644 /app/backend/data.json
chmod 755 /app/backend
```

### Problem: Frontend Can't Connect to Backend

**Check CORS:**
```javascript
// backend/server.js
Access-Control-Allow-Origin: http://localhost:3001  // ❌ Wrong for production
```

**Fix:**
```javascript
Access-Control-Allow-Origin: https://yourdomain.com  // ✅ Correct
```

Or use environment variable:
```javascript
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
```

### Problem: Data Doesn't Persist

**Check disk mount:**
1. Go to Render dashboard
2. Click service
3. Go to "Settings"
4. Scroll to "Disks"
5. Should show mounted disk at `/app/backend`

If missing: Add disk again

---

## Environment Variables (Optional)

Create `.env` file for sensitive data:

```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://netlink-frontend.onrender.com
```

In Render dashboard:
1. Go to service
2. Click "Environment"
3. Add variables

---

## Custom Domain (Optional)

### Add Domain to Render

1. Go to service settings
2. Click "Custom Domains"
3. Add your domain (e.g., netlink.example.com)
4. Follow DNS instructions

---

## Monitoring Your Deployment

### View Logs Anytime

```bash
# In Render dashboard
Service → Logs

# See real-time requests
GET /api/reports/count
POST /api/reports
GET /api/map/locations
```

### Set Up Alerts

In Render dashboard:
- Service → Notifications
- Enable email alerts for crashes

---

## Quick Reference URLs

Once deployed:

```
Backend API:     https://netlink-backend.onrender.com
Frontend:        https://netlink-frontend.onrender.com (if deployed)
Test Count API:  https://netlink-backend.onrender.com/api/reports/count
Test Map API:    https://netlink-backend.onrender.com/api/map/locations
```

---

## Update Your Code (After Deployment)

Make changes locally:

```bash
git add .
git commit -m "Fixed bug X"
git push origin main
```

Render automatically:
1. Detects the push
2. Rebuilds Docker image
3. Redeploys your app
4. ~5 minutes later: live ✅

---

## Backup Your Data

### Download data.json

In Render Shell:
```bash
cat data.json > backup.json
# Copy output, save to file
```

Or use git (if tracking data.json):
```bash
git pull
cat backend/data.json  # See data locally
```

---

## Summary

| Step | Time | Action |
|------|------|--------|
| 1 | 5 min | Push to GitHub |
| 2 | 2 min | Sign up on Render |
| 3 | 10 min | Create service, wait for build |
| 4 | 5 min | Add disk for persistence |
| 5 | 2 min | Test APIs |
| 6 | 5 min | Update frontend URL |
| 7 | 5 min | Test submission, map, dashboard |
| 8 | 2 min | Verify data persists |
| **Total** | **~35 min** | **Live on internet!** |

---

## You're Live! 🎉

Your app is now:
- ✅ Deployed on Render
- ✅ Running in Docker containers
- ✅ Data persists in disk
- ✅ Accessible from anywhere
- ✅ Auto-redeploys on git push
- ✅ Team can submit reports
- ✅ Everyone sees same data
- ✅ Teacher can visit the URL

**Go share the URL with your team!**

Example: `https://netlink-backend.onrender.com/api/reports/count`

They can also access the frontend (if deployed) and submit reports.

All data shows up on map and dashboard in real-time. 🚀
