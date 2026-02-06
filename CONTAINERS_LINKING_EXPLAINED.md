# HOW CONTAINERS LINK TOGETHER - Visual Guide

## Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          USER'S BROWSER                                     │
│                      (http://localhost)                                     │
└───────────────────────────────────────────────────────────────────────────┬─┘
                                                                            │
                                                                            │ HTTP
                                                                            │ GET/POST
                                                                            │
                ┌───────────────────────────────────────────────────────────┘
                │
                ▼
    ┌───────────────────────────────────────────┐
    │       FRONTEND DOCKER CONTAINER           │
    │              netlink_frontend             │
    │          (Port: 80 to localhost)          │
    │                                           │
    │   ┌─────────────────────────────────────┐ │
    │   │   NGINX WEB SERVER                  │ │
    │   │   Listens on port 80                │ │
    │   │   Serves React files (HTML/JS/CSS) │ │
    │   └─────────────────────────────────────┘ │
    │                                           │
    │   ┌─────────────────────────────────────┐ │
    │   │   REACT APPLICATION (In Browser)    │ │
    │   │                                     │ │
    │   │  Components:                        │ │
    │   │  - Dashboard.js                     │ │
    │   │  - MapComponent.js                  │ │
    │   │  - ReportPage.js                    │ │
    │   │  - axios.js (API calls)             │ │
    │   │                                     │ │
    │   │  axios config:                      │ │
    │   │  baseURL: "http://backend:3000"    │ │
    │   │  withCredentials: false             │ │
    │   └─────────────────────────────────────┘ │
    └───────┬──────────────────────────────────┘
            │
            │ HTTP request to:
            │ http://backend:3000/api/...
            │
            │ (Docker DNS translates
            │  "backend" to backend container IP)
            │
            ▼
    ┌──────────────────────────────────────────────┐
    │   BACKEND DOCKER CONTAINER                   │
    │   netlink_backend                            │
    │   (Port: 3000 to localhost)                  │
    │                                              │
    │   ┌──────────────────────────────────────┐  │
    │   │   NODE.JS + EXPRESS                  │  │
    │   │   server.js                          │  │
    │   │   Listens on port 3000               │  │
    │   │                                      │  │
    │   │   CORS Headers:                      │  │
    │   │   Access-Control-Allow-Origin:      │  │
    │   │   http://localhost:3001              │  │
    │   │   (specific, not wildcard)           │  │
    │   │                                      │  │
    │   │   Routes:                            │  │
    │   │   GET /api/reports/count             │  │
    │   │   GET /api/reports/count-by-network  │  │
    │   │   GET /api/map/locations             │  │
    │   │   POST /api/reports (form submit)    │  │
    │   └──────────────┬───────────────────────┘  │
    │                  │                           │
    │                  │ Calls                     │
    │                  ▼                           │
    │   ┌──────────────────────────────────────┐  │
    │   │   dataStore.js                       │  │
    │   │                                      │  │
    │   │   Functions:                         │  │
    │   │   - readData()                       │  │
    │   │   - writeData()                      │  │
    │   │   - getReportCount()                 │  │
    │   │   - getCountByNetwork()              │  │
    │   │   - getLocations()                   │  │
    │   │   - addReport()                      │  │
    │   │                                      │  │
    │   │   Reads/Writes to:                   │  │
    │   │   /app/backend/data.json             │  │
    │   └──────────────┬───────────────────────┘  │
    │                  │                           │
    │                  │ File I/O                  │
    │                  │ (using Node fs module)    │
    │                  ▼                           │
    │   ┌──────────────────────────────────────┐  │
    │   │   data.json (shared volume)          │  │
    │   │                                      │  │
    │   │   {                                  │  │
    │   │     "reports": [                     │  │
    │   │       {                              │  │
    │   │         "id": 1707...                │  │
    │   │         "networkType": "MTN",        │  │
    │   │         "issue": "No signal",        │  │
    │   │         "location": {                │  │
    │   │           "lat": 3.848,              │  │
    │   │           "lng": 11.5021             │  │
    │   │         }                            │  │
    │   │       }                              │  │
    │   │     ]                                │  │
    │   │   }                                  │  │
    │   └──────────────────────────────────────┘  │
    └──────────────────────────────────────────────┘
            ▲
            │
            │ VOLUME MOUNT
            │ Shared with host machine
            │
            │ Container path:    /app/backend/data.json
            │ Host machine path: C:\Users\pc\Desktop\...\backend\data.json
            │
            ▼
    ┌──────────────────────────────────────────┐
    │    YOUR COMPUTER (Host Machine)          │
    │    File system                           │
    │                                          │
    │    C:\Users\pc\Desktop\CEF-345-...\      │
    │    └── backend/                          │
    │        └── data.json  ← Can edit anytime │
    │                                          │
    │    You can:                              │
    │    - View with: cat data.json            │
    │    - Edit with: notepad data.json        │
    │    - Back up easily                      │
    │    - Check persistence after restart     │
    └──────────────────────────────────────────┘
```

---

## Step-by-Step Example: Submit a Report

### **Step 1: User Fills Form**

```
Browser shows form at: http://localhost/report

User fills:
- Network: MTN
- Phone: +237123456789
- Issue: No signal
- Description: Cannot connect at all
- Location: [Uses geolocation API]

User clicks: Submit
```

### **Step 2: ReportPage.js Sends POST**

```javascript
// frontend/src/pages/ReportPage.js

const response = await apiClient.post(
  '/api/reports',      // Route
  {
    networkType: 'MTN',
    phone: '+237123456789',
    issue: 'No signal',
    description: 'Cannot connect',
    latitude: 3.848,
    longitude: 11.5021
  }                    // Data
);

// axios makes HTTP request:
// POST http://backend:3000/api/reports
// with JSON body containing form data
```

### **Step 3: HTTP Request Travels to Backend**

```
Browser makes POST request:
↓
Browser connects to: backend:3000
↓
Docker DNS translates:
  "backend" → 172.18.0.2 (backend container's IP)
↓
Express server.js receives the request
```

### **Step 4: Express Routes the Request**

```javascript
// backend/server.js

app.post('/api/reports', (req, res) => {
  // req.body contains the form data
  
  const report = {
    networkType: req.body.networkType,
    phone: req.body.phone,
    issue: req.body.issue,
    description: req.body.description,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    timestamp: new Date()
  };

  // Call dataStore to save
  const result = dataStore.addReport(report);

  // Send response back to frontend
  res.json({ success: true, reportId: result.id });
});
```

### **Step 5: dataStore.js Saves to File**

```javascript
// backend/dataStore.js

function addReport(reportData) {
  // Step 1: Read current data
  const data = readData();
  // data = { reports: [...], locations: [...] }

  // Step 2: Add new report
  const report = {
    id: Date.now(),
    ...reportData
  };
  data.reports.push(report);

  // Step 3: Create location pin
  const location = {
    lat: reportData.latitude,
    lng: reportData.longitude,
    network: reportData.networkType,
    magnitude: 3
  };
  data.locations.push(location);

  // Step 4: Write back to file
  writeData(data);
  // File written to: /app/backend/data.json
  // Which is shared with host via volume mount

  return report;
}
```

### **Step 6: data.json Updated on Disk**

```
Container writes to: /app/backend/data.json
↓
Volume mount translates to:
C:\Users\pc\Desktop\...\backend\data.json
↓
YOUR FILE on host machine updated!

You can check:
PowerShell: cat C:\Users\pc\Desktop\...\backend\data.json
```

### **Step 7: Backend Responds to Frontend**

```javascript
// server.js sends response
res.json({ 
  success: true,
  reportId: 1707...
});

// Response travels back to frontend
// HTTP 200 OK with JSON body
```

### **Step 8: React Updates Dashboard**

```javascript
// frontend/src/components/Dashboard.js

// This runs every 5 seconds via setInterval

const response = await apiClient.get('/api/reports/count');
const count = response.data.total;
// count = 1 (was 0, now has our report)

setReportCount(count);
// React re-renders, shows "Total Reports: 1"
```

### **Step 9: React Updates Map**

```javascript
// frontend/src/components/MapComponent.js

// This runs every 10 seconds via setInterval

const response = await apiClient.get('/api/map/locations');
const locations = response.data;
// locations = [{ lat: 3.848, lng: 11.5021, network: 'MTN' }]

setLocations(locations);
// React renders Leaflet map with new pin
// User sees: Yellow pin (MTN) at location
```

### **Result: User Sees Updates**

```
1. Form submitted
2. Dashboard: "Total Reports: 1" ✅
3. Dashboard: "MTN: 1, ORANGE: 0, CAMTEL: 0" ✅
4. Map: Yellow pin appears ✅
5. Data file: data.json contains report ✅
```

---

## Network Communication Flow

### **Container-to-Container Communication**

```
Frontend Container                Backend Container
(172.18.0.3)                      (172.18.0.2)
     │                                 │
     │                                 │
     └─ POST /api/reports ────────────→│
        (via DNS: http://backend:3000) │
        Docker translates 'backend'    │
        to actual container IP         │
        (172.18.0.2)                   │
     │                                 │
     │                                 │
     │←─ JSON response ────────────────┤
        { success: true }              │
     │                                 │
```

### **Both on Same Docker Network**

```
docker-compose.yml:

services:
  backend:
    networks:
      - netlink_network    ← Connected here

  frontend:
    networks:
      - netlink_network    ← Connected here

networks:
  netlink_network:
    driver: bridge         ← Virtual network
```

### **What This Means**

```
Frontend can reach backend via hostname: http://backend:3000
Backend can reach frontend via hostname: http://frontend:80
Both can reach database/storage if it existed

Without same network:
- Frontend tries: http://backend:3000
- ERROR: "backend" not found
- Containers isolated, can't talk
```

---

## Volume Mount Details

### **What is a Volume Mount?**

```
docker-compose.yml:
  volumes:
    - ./backend/data.json:/app/backend/data.json

This means:
┌─────────────────────────────────────┐
│ Host Machine                        │
│ C:\Users\pc\Desktop\...\data.json   │  ← Your file
│          │                          │
│          │ MOUNT POINT              │
│          │ (shared access)          │
│          ▼                          │
│      /app/backend/data.json ←─────┐ │
│      Container can read/write here │ │
└─────────────────────────────────────┘

When container writes to /app/backend/data.json:
→ Actually writes to C:\Users\pc\Desktop\...\data.json

When you check your file:
→ You see what container wrote
```

### **Why Volumes Matter**

```
Without volume mount:
  Container → writes to /app/backend/data.json
  Container stops or restarts
  /app/backend/data.json disappears
  Data is LOST ❌

With volume mount:
  Container → writes to /app/backend/data.json
  Actually written to C:\Users\pc\Desktop\...\data.json
  Container stops or restarts
  File still there on host machine
  Data is SAFE ✅
```

---

## Port Mapping Details

### **How Ports Work**

```
docker-compose.yml:

backend:
  ports:
    - "3000:3000"
       │      │
       │      └─ Container port (inside Docker)
       └─ Host port (your computer)

This means:
Your computer         Container
localhost:3000    →   :3000 (inside backend)
```

### **Real Example**

```
Browser URL: http://localhost:3000/api/reports/count

Your computer:
  "I need to access localhost:3000"
         ↓
Docker sees port 3000 is mapped
         ↓
Docker redirects to: backend container port 3000
         ↓
Express server.js receives request
         ↓
Processes /api/reports/count
         ↓
Returns JSON to localhost:3000
         ↓
Browser displays: {"total": 1}
```

### **Multiple Services Same Port?**

```
PROBLEM: Both need port 3000?
  backend:   ports: ["3000:3000"]  ← uses localhost:3000
  other:     ports: ["3000:3000"]  ← ERROR! port already in use

SOLUTION: Map to different host port
  backend:   ports: ["3000:3000"]  ← localhost:3000
  other:     ports: ["3001:3000"]  ← localhost:3001
                                     (but 3000 inside container)
```

---

## CORS Headers Explained

### **Why We Fixed It**

Original problem:
```javascript
// frontend/src/api/axios.js
withCredentials: true

// backend/server.js
res.header('Access-Control-Allow-Origin', '*');
// Wildcard!
```

Error:
```
Cannot use wildcard (*) with credentials mode 'include'
You either need:
  1. withCredentials: true + specific origin
  2. withCredentials: false + any origin
```

Our fix:
```javascript
// frontend/src/api/axios.js
withCredentials: false    ← No credentials needed

// backend/server.js  
res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
// Specific origin
```

This works because:
```
Browser sees:
  CORS request from: http://localhost:3001
  Allow origin header: http://localhost:3001
  Credentials mode: false
  ✅ MATCH! Request allowed
```

---

## Complete Request-Response Example

```
1. USER ACTION
   User at http://localhost clicks "View Count"

2. JAVASCRIPT
   // frontend/src/components/Dashboard.js
   const response = await apiClient.get('/api/reports/count');

3. AXIOS SENDS
   GET http://backend:3000/api/reports/count
   Headers:
     Origin: http://localhost:3001
     Accept: application/json

4. DOCKER NETWORK
   Docker DNS translates: backend → 172.18.0.2

5. EXPRESS RECEIVES
   GET /api/reports/count
   // backend/server.js
   app.get('/api/reports/count', (req, res) => {
     const count = dataStore.getReportCount();
     res.json({ total: count });
   });

6. DATASTORE READS FILE
   // backend/dataStore.js
   function getReportCount() {
     const data = readData();  // Reads /app/backend/data.json
     return data.reports.length;
   }

7. FILE SYSTEM (VOLUME MOUNT)
   Container: /app/backend/data.json
   Host: C:\Users\pc\Desktop\...\data.json
   File contains: {"reports": [...],"locations": [...]}

8. RESPONSE BUILDS
   server.js returns:
   {
     "total": 1
   }

9. CORS CHECK
   Backend adds headers:
   Access-Control-Allow-Origin: http://localhost:3001
   Access-Control-Allow-Methods: GET, POST
   
10. RESPONSE SENT
    HTTP 200 OK
    Body: {"total": 1}

11. BROWSER RECEIVES
    JavaScript gets response
    setReportCount(1)

12. REACT RE-RENDERS
    Dashboard component updates
    Displays: "Total Reports: 1"

13. USER SEES
    Dashboard shows: 1 report submitted ✅
```

---

## Summary

Your Docker system has 3 main pieces that work together:

1. **Frontend Container**
   - Serves React app on port 80
   - Browser runs JavaScript
   - JavaScript makes HTTP calls to backend

2. **Backend Container**
   - Express API on port 3000
   - Processes requests
   - Reads/writes to data.json

3. **Shared Volume**
   - data.json mounted from host
   - Persists data across restarts
   - You can edit/backup anytime

These 3 pieces connect via:
- **Docker Network** (container-to-container communication)
- **Port Mapping** (outside world → containers)
- **Volume Mount** (persistent storage)

When deployed to Render, same architecture applies, just running on Render's servers instead of your computer!
