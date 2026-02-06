# Testing Guide - Verify Everything Works

## Pre-Test Checklist

- [ ] You have Node.js installed (`node --version` should show v14+)
- [ ] Both `backend` and `frontend` folders have `package.json`
- [ ] You have the 4 new files:
  - [ ] `backend/dataStore.js`
  - [ ] `backend/data.json`
  - [ ] `frontend/src/api/axios.js` (modified)
  - [ ] `backend/server.js` (modified)

---

## Test 1: Backend Startup

### Run
```bash
cd backend
npm start
```

### Expected Output
```
✅ Netlink Server running at http://localhost:3000
📊 Dashboard: http://localhost:3000
🗺️  Map: http://localhost:3000/map
```

### If You See Errors
| Error | Solution |
|-------|----------|
| `Cannot find module 'express'` | Run `npm install` |
| `Cannot find module './dataStore'` | Check `dataStore.js` exists in backend folder |
| `Port 3000 already in use` | Kill other process or use different port |
| `ReferenceError: db is not defined` | You still have old code; use new server.js |

### Success
- [x] Server starts without errors
- [x] Listening on port 3000

---

## Test 2: Frontend Startup

### Run (in new terminal)
```bash
cd frontend
npm start
```

### Expected Output
```
Compiled successfully!

You can now view frontend in the browser.
  Local:      http://localhost:3001
```

### If Browser Opens
- Should show the application
- If you see blank page, open browser dev tools (F12)
- Check console for errors

### Success
- [x] Frontend compiles
- [x] App displays at http://localhost:3001
- [x] No CORS errors in console

---

## Test 3: CORS Verification

### Step 1: Open Browser Console
```
Press F12 → Click "Console" tab
```

### Step 2: Check for CORS Errors
Look for messages like:
```
❌ Access to XMLHttpRequest blocked by CORS policy
❌ Access-Control-Allow-Origin is wildcard
```

### Success Criteria
- [x] No CORS errors in console
- [x] Network tab shows successful GET requests to http://localhost:3000

---

## Test 4: API Endpoint Testing

### Test via Browser Console
```javascript
// Test 1: Get report count
fetch('http://localhost:3000/api/reports/count')
  .then(r => r.json())
  .then(d => console.log('Reports:', d))

// Should print: Reports: { total: 0 }

// Test 2: Get network counts
fetch('http://localhost:3000/api/reports/count-by-network')
  .then(r => r.json())
  .then(d => console.log('Networks:', d))

// Should print: Networks: { mtn: 0, orange: 0, camtel: 0 }
```

### Success
- [x] Both endpoints return 200 status
- [x] Responses are valid JSON
- [x] Count is 0 (no reports yet)

---

## Test 5: Submit First Report

### Step 1: Navigate to Form
- Go to http://localhost:3001 (Report Page)
- Or click "Report Issue" link

### Step 2: Fill Form
- **Network**: Select "MTN"
- **Phone**: Enter `677123456` (valid MTN format)
- **Issue**: Type "Test Issue"
- **Description**: Type "Testing the system"
- **Location**: Click "Allow Location" (optional but good for map test)

### Step 3: Submit
- Click the Submit button
- Should see success message

### Step 4: Verify Data Saved
```bash
# Terminal: Check the data file
cat backend/data.json
```

Should show:
```json
{
  "reports": [
    {
      "id": <timestamp>,
      "networkType": "MTN",
      "phone": "677123456",
      ...
    }
  ],
  "locations": [...]
}
```

### Success
- [x] Form submits successfully
- [x] No errors in browser console
- [x] data.json file updated
- [x] Can see the report in data.json

---

## Test 6: Dashboard Live Update

### Step 1: Check Initial State
```
http://localhost:3000
```
Should show count = 0

### Step 2: Submit Report (if not done in Test 5)
Go to form and submit a report

### Step 3: Check Dashboard Again
```
Refresh the dashboard page (F5)
```
Should now show:
- Total Reports: 1
- MTN: 1 (or appropriate network)
- Last Update: Recent timestamp

### Success
- [x] Count incremented from 0 to 1
- [x] Network breakdown updated
- [x] Timestamp refreshed

---

## Test 7: Multi-User Synchronization

### Step 1: Open Two Browser Windows

**Window A**: http://localhost:3000 (Dashboard)
**Window B**: http://localhost:3001 (Report Form)

### Step 2: Submit Report in Window B
- Fill and submit a new report
- Note the count in Window A

### Step 3: Refresh Window A
```
Press F5 in Window A
```

### Expected
- Window A count increases by 1
- Both users see the same data

### Success
- [x] Data persists across sessions
- [x] Multiple users see consistent data
- [x] Real-time updates work (after refresh)

---

## Test 8: Data Persistence

### Step 1: Submit Reports (3-4)
Use the form to submit several reports

### Step 2: Stop the Backend Server
```bash
# Press Ctrl+C in backend terminal
```

### Step 3: Verify data.json
```bash
cat backend/data.json
# Should show 3-4 reports
```

### Step 4: Restart Backend
```bash
npm start
```

### Step 5: Check Dashboard
```
Go to http://localhost:3000
```
Should still show the same count as before

### Success
- [x] Data survives server restart
- [x] No data loss
- [x] Reports in data.json match dashboard count

---

## Test 9: Map Display

### Prerequisites
- Submit at least one report **with location enabled**

### Steps
1. Go to `http://localhost:3000/map` (if map page exists)
2. Should see Leaflet map
3. Should see pins at submitted locations
4. Each pin should show network type

### Success
- [x] Map loads without errors
- [x] Pins appear for reports with locations
- [x] Can click pins to see details

---

## Test 10: Phone Number Validation

### Test Valid Numbers
Submit these - should **succeed**:
- MTN: `677123456`, `678123456`, `650123456`
- ORANGE: `699123456`, `655123456`
- CAMTEL: `624212345`, `621234567`

### Test Invalid Numbers
Submit these - should **fail** with validation error:
- `123456789` (wrong format)
- `111111111` (all 1s)
- `987654321` (invalid pattern)

### Success
- [x] Valid numbers accepted
- [x] Invalid numbers rejected with clear message
- [x] Validation error visible in browser

---

## Test 11: Network Type Coverage

### Submit Reports for Each Network
1. **MTN** with phone `677123456`
2. **ORANGE** with phone `699123456`
3. **CAMTEL** with phone `624212345`

### Check Dashboard
Should show:
- Total Reports: 3
- MTN: 1
- ORANGE: 1
- CAMTEL: 1

### Success
- [x] All three networks recorded
- [x] Counts are accurate
- [x] Dashboard shows breakdown

---

## Test 12: Browser Console - No Errors

### Steps
1. Open browser (http://localhost:3001)
2. Press F12 to open DevTools
3. Click "Console" tab
4. Look for any red errors

### Expected
```
✅ No red error messages
✅ Possible yellow warnings (OK)
✅ CORS errors should be GONE
✅ Logs from app (OK)
```

### Success
- [x] No JavaScript errors
- [x] No CORS errors
- [x] No unhandled promise rejections

---

## Test 13: Docker Readiness

### Check Docker Files Exist
```bash
ls -la
# Should see:
# - docker-compose.yml
# - Dockerfile (root level)
# - backend/Dockerfile
# - frontend/Dockerfile
```

### Verify data.json Path
The docker-compose.yml should have:
```yaml
volumes:
  - ./backend/data.json:/app/data.json
```

This ensures data persists even if container is recreated.

### Success
- [x] Docker files exist
- [x] Volume mount configuration correct
- [x] System ready for Docker deployment

---

## Troubleshooting Matrix

| Symptom | Cause | Fix |
|---------|-------|-----|
| "CORS error" in console | Old axios config | Check `withCredentials: false` in axios.js |
| "Cannot find dataStore" | Missing file | Verify `backend/dataStore.js` exists |
| Dashboard shows 0 forever | Form doesn't submit | Check form validation, submit with valid number |
| No map pins | Location not allowed | Submit report with location enabled |
| Data lost after restart | Volume not mounted in Docker | Add volume to docker-compose.yml |
| Port 3000 in use | Another app using port | `lsof -i :3000` to find, kill process |
| Port 3001 in use | Another React app | `lsof -i :3001` to find, kill process |

---

## Performance Benchmarks

### Expected Response Times
| Endpoint | Typical Time |
|----------|-------------|
| `/api/reports/count` | <5ms |
| `/api/reports/count-by-network` | <5ms |
| `/api/map/locations` | <10ms |
| `POST /api/reports` | <20ms |

If significantly slower, check:
1. data.json file isn't huge
2. No other processes consuming CPU
3. Disk isn't full

---

## Final Verification Checklist

- [ ] Backend starts without errors
- [ ] Frontend compiles without errors
- [ ] No CORS errors in console
- [ ] Can submit report successfully
- [ ] data.json file contains submitted report
- [ ] Dashboard count updates after refresh
- [ ] Can submit reports for all 3 networks
- [ ] Data persists after server restart
- [ ] Multiple browser windows see same data
- [ ] Map displays pins (if location enabled)
- [ ] Phone number validation works
- [ ] No JavaScript errors in console

## All Passing? 🎉

You're ready to:
1. **Demo to your teacher**: Show live form submission and dashboard updates
2. **Deploy with Docker**: Volume mount will persist the data
3. **Rest easy**: You've solved the problem with the right tool for the job

Good luck with your presentation!
