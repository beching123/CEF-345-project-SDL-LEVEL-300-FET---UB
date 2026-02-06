# DOCKER SYSTEM - VISUAL EXPLANATION

## How Your Docker System Works

### The Big Picture

```
┌──────────────────────────────────────────────────────────────┐
│                   YOUR COMPUTER                              │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           DOCKER (Containerization)                   │ │
│  │                                                        │ │
│  │  ┌──────────────────┐        ┌──────────────────────┐ │ │
│  │  │   CONTAINER 1    │        │   CONTAINER 2        │ │ │
│  │  │   Frontend       │        │   Backend            │ │ │
│  │  │   (nginx + React)│        │   (Express + Node)   │ │ │
│  │  │                  │        │                      │ │ │
│  │  │ React App        │◄──────►│ API Server           │ │ │
│  │  │ JavaScript       │        │ dataStore.js         │ │ │
│  │  │ Port: 80         │        │ Port: 3000           │ │ │
│  │  └──────────────────┘        └──────────────────────┘ │ │
│  │                                        ▲               │ │
│  │                                        │               │ │
│  │                              (reads/writes)            │ │
│  │                                        │               │ │
│  │                                        ▼               │ │
│  │                          ┌──────────────────────────┐  │ │
│  │                          │   SHARED VOLUME          │  │ │
│  │                          │   data.json              │  │ │
│  │                          │   (JSON file storage)    │  │ │
│  │                          └──────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Outside Docker:                                            │
│  User's browser on localhost                               │
│  Can access port 80 (frontend)                             │
│  Can access port 3000 (backend API)                        │
└──────────────────────────────────────────────────────────────┘
```

---

## Container 1: Frontend (React + Nginx)

### Inside the Container

```
┌──────────────────────────────────────┐
│  Frontend Docker Container           │
│  netlink_frontend                    │
│                                      │
│  ┌──────────────────────────────┐   │
│  │  Nginx Web Server            │   │
│  │  - Serves HTML/CSS/JS        │   │
│  │  - Listens on port 80        │   │
│  │  - Reverse proxy for React   │   │
│  └──────────────────────────────┘   │
│           ▼                          │
│  ┌──────────────────────────────┐   │
│  │  React Application (Browser) │   │
│  │                              │   │
│  │  App.js                      │   │
│  │  ├─ Dashboard.js             │   │
│  │  ├─ MapComponent.js          │   │
│  │  ├─ ReportPage.js            │   │
│  │  └─ api/axios.js             │   │
│  │                              │   │
│  │  HTTP Requests via axios:    │   │
│  │  GET /api/reports/count      │   │
│  │  GET /api/map/locations      │   │
│  │  POST /api/reports           │   │
│  └──────────────────────────────┘   │
└──────────────────────────────────────┘
         ▲              │
         │              │ HTTP Calls
         │ Serves HTML  │
         │              ▼
      Browser        Backend API
```

### What It Does

```
User Action              Frontend Response
─────────────────────────────────────────────────
1. User opens app   →   Nginx serves index.html
                        React loads in browser

2. Page loads       →   Dashboard.js calls:
                        GET /api/reports/count
                        (Every 5 seconds)

3. Dashboard        →   MapComponent.js calls:
   refreshes            GET /api/map/locations
                        (Every 10 seconds)

4. Map refreshes    →   User sees updated count
                        and map pins

5. User fills form  →   ReportPage.js collects
                        form data

6. User submits     →   POST /api/reports
                        with form data

7. Backend saves    →   Dashboard auto-updates
   (polls every 5s)     Shows new count
```

---

## Container 2: Backend (Express + Node.js)

### Inside the Container

```
┌────────────────────────────────────────┐
│  Backend Docker Container              │
│  netlink_backend                       │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  Node.js + Express               │ │
│  │  server.js                       │ │
│  │  - Listens on port 3000          │ │
│  │  - CORS configured               │ │
│  │  - API routes defined            │ │
│  │                                  │ │
│  │  Routes:                         │ │
│  │  GET  /api/reports/count         │ │
│  │  GET  /api/reports/count-by-net  │ │
│  │  GET  /api/map/locations         │ │
│  │  POST /api/reports               │ │
│  └────────────────┬──────────────────┘ │
│                   │                    │
│                   │ Calls              │
│                   ▼                    │
│  ┌──────────────────────────────────┐ │
│  │  dataStore.js                    │ │
│  │                                  │ │
│  │  Functions:                      │ │
│  │  - readData()      ← Load file   │ │
│  │  - writeData()     ← Save file   │ │
│  │  - getReportCount()              │ │
│  │  - getCountByNetwork()           │ │
│  │  - getLocations()                │ │
│  │  - addReport()                   │ │
│  └────────────────┬──────────────────┘ │
│                   │                    │
│                   │ File I/O           │
│                   ▼                    │
│  ┌──────────────────────────────────┐ │
│  │  /app/backend/data.json          │ │
│  │  (Inside container)              │ │
│  │                                  │ │
│  │  Contains:                       │ │
│  │  {                               │ │
│  │    "reports": [...],             │ │
│  │    "locations": [...]            │ │
│  │  }                               │ │
│  └──────────────────────────────────┘ │
└────────────────────────────────────────┘
         ▲              │
         │              │ HTTP Response
         │ HTTP Request │ (JSON data)
         │              ▼
      Frontend       Browser
      (React)       (displays data)
```

### What It Does

```
Frontend Request         Backend Processing       Response
──────────────────────────────────────────────────────────
GET /api/reports/count

  ↓
  
Express receives request
  ↓
  
Calls: dataStore.getReportCount()
  ↓
  
dataStore reads /app/backend/data.json
  ↓
  
Counts number of reports
  ↓
  
Returns count to server
  ↓
  
Express sends JSON:  {"total": 5}
                        ↓
                      Browser receives
                        ↓
                      Dashboard.js gets count
                        ↓
                      React displays: "Total: 5"
                        ↓
                      User sees updated dashboard
```

---

## The Connection: Docker Network

### How They Talk

```
Frontend Container             Backend Container
(172.18.0.3)                  (172.18.0.2)
    │                              │
    │                              │
    │  axios.get(                  │
    │    'http://backend:3000'     │
    │  )                           │
    │                              │
    └──────────────────────────────┘
           (Docker Network)
           (netlink_network)


Step by step:
─────────────

1. Frontend code: axios.get('http://backend:3000')
   
2. Browser/Container sends HTTP request to: "backend:3000"

3. Docker DNS resolution:
   "backend" → 172.18.0.2 (backend container IP)

4. Request arrives at backend:3000
   Express server receives it

5. Express processes request
   Reads data.json via dataStore

6. Response sent back: {"total": 5}

7. Frontend receives JSON
   React updates state

8. Component re-renders
   User sees updated data
```

---

## The Storage: Volume Mount

### How Data Persists

```
┌─────────────────────────────────────────────────────────┐
│                  DOCKER VOLUME MOUNT                    │
│                                                         │
│  Host Machine                  Container               │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  C:\Users\pc\...               /app/backend/           │
│  \backend\                      data.json               │
│  data.json        ◄────mount───►                       │
│  (Your computer)   (shared      (Inside container)     │
│                     access)                             │
│                                                         │
│  When container writes to:                             │
│  /app/backend/data.json                                │
│           ↓                                            │
│  Actually writes to:                                   │
│  C:\Users\pc\Desktop\...\backend\data.json             │
│           ↓                                            │
│  Your file on disk is updated!                        │
│           ↓                                            │
│  Data survives container restart ✅                    │
└─────────────────────────────────────────────────────────┘
```

### Timeline: Persistence Example

```
Time    Event                           data.json Status
────────────────────────────────────────────────────────
T0      docker-compose up               File exists on host
        Containers start
        Mount volume
  
T1      User submits report             Backend writes new report
        POST /api/reports               File updated on host
        
T2      User views dashboard            Dashboard shows 1 report ✅
        GET /api/reports/count          File read from host

T3      docker-compose down             Containers stop
        Containers removed              File still exists on host ✅

T4      docker-compose up               Containers restart
        Mount volume again              File mounted again
        
T5      User views dashboard            Dashboard shows 1 report ✅
        GET /api/reports/count          Data persisted! ✅

T6      Check on host                   File still there
        cat backend/data.json           Can view anytime
```

---

## The Build Process: docker-compose build

### Step 1: Build Backend

```
docker-compose.yml:
  backend:
    build:
      context: .
      dockerfile: ./backend/Dockerfile
        ↓
        
Executes backend/Dockerfile:
        ↓
  FROM node:18-alpine
  (Start with Node.js 18 base image)
        ↓
  WORKDIR /app/backend
  (Set working directory)
        ↓
  COPY backend/package*.json ./
  (Copy dependency files)
        ↓
  RUN npm install
  (Install dependencies)
        ↓
  COPY backend/ .
  (Copy application code)
        ↓
  EXPOSE 3000
  (Declare port)
        ↓
  CMD ["node", "server.js"]
  (Start command)
        ↓
Result: netlink_backend image (300MB)
```

### Step 2: Build Frontend

```
docker-compose.yml:
  frontend:
    build:
      context: .
      dockerfile: ./frontend/Dockerfile
        ↓
        
Executes frontend/Dockerfile:
        ↓
  FROM node:18-alpine
  (Start with Node.js 18)
        ↓
  COPY frontend/package*.json ./
  (Copy dependency files)
        ↓
  RUN npm install
  (Install React dependencies)
        ↓
  RUN npm run build
  (Build React for production)
        ↓
  FROM nginx:alpine
  (Switch to Nginx for serving)
        ↓
  COPY built files to /usr/share/nginx/html
  (Copy built React files)
        ↓
  EXPOSE 80
  (Declare port)
        ↓
Result: netlink_frontend image (50MB)
```

---

## The Startup Process: docker-compose up

### What Happens

```
docker-compose up -d
        ↓
Read docker-compose.yml
        ↓
Create network: netlink_network (bridge)
        ↓
Start backend container:
  ├─ Create container from netlink_backend image
  ├─ Connect to netlink_network
  ├─ Map port 3000:3000
  ├─ Mount volume for data.json
  ├─ Start Express server
  └─ Health check runs: curl localhost:3000/api/reports/count
        ↓
Start frontend container:
  ├─ Create container from netlink_frontend image
  ├─ Connect to netlink_network
  ├─ Map ports 80:80 and 3001:3001
  ├─ Start Nginx server
  ├─ Serve React files
  └─ Health check runs: wget localhost/index.html
        ↓
Both containers running on same network ✅
Both can communicate ✅
Ports open to outside ✅

Result:
  Frontend: localhost:80 (http://localhost)
  Backend: localhost:3000
  Both connected: netlink_network
  Data mounted: ./backend/data.json
```

---

## Complete User Journey

### Step 1: User Opens App

```
Browser                 Frontend Container        Backend Container
────────                ──────────────────        ─────────────────
User types:
http://localhost
    │
    ├─→ Nginx receives request
    │   └─→ Serves index.html
    │
    └─← React app loads
        └─← JavaScript downloaded
```

### Step 2: Dashboard Loads

```
React Component              Backend API           data.json
─────────────────            ───────────          ──────────
Dashboard.js runs:
  useEffect(() => {
    setInterval(() => {
      axios.get(
        '/api/reports/count'
      )
    }, 5000)
  })
    │
    ├─→ Frontend calls:
    │   GET http://backend:3000/api/reports/count
    │
    ├────────────────────→ Express receives
    │                      └─→ Calls dataStore.getReportCount()
    │
    ├────────────────────→ dataStore reads
    │                      file via fs.readFileSync()
    │                      └─→ /app/backend/data.json
    │
    ├────────────────────→ volume mount translated
    │                      to host file
    │
    ├←──────────────────── Returns: {"total": 0}
    │
    └─ React setState(0)
      Dashboard displays: "Total Reports: 0"
```

### Step 3: User Submits Form

```
Form                   ReportPage.js            Backend API           Storage
────                   ─────────────            ───────────           ───────
User fills:
Network: MTN
Phone: +237...
Issue: No signal
    │
    └─ User clicks Submit
       │
       └─→ ReportPage.js collects form data
           │
           └─→ axios.post('/api/reports', formData)
               │
               ├──→ Express receives POST request
               │    └─→ Calls dataStore.addReport(formData)
               │
               ├──→ dataStore:
               │    1. readData() - reads file
               │    2. Add to reports array
               │    3. Add to locations array
               │    4. writeData() - writes file
               │
               ├──→ Volume mount
               │    saves to host file
               │
               └←── Returns: {success: true}
                    
                    Form clears
                    Success message shown
```

### Step 4: Dashboard Auto-Updates

```
Timer runs              Dashboard polls          Backend reads          Display updates
──────────              ──────────────          ────────────           ───────────────
Every 5 seconds
    │
    └─→ axios.get('/api/reports/count')
        │
        ├──→ Backend reads data.json
        │    └─→ Finds: 1 report
        │
        └←── Returns: {"total": 1}
             │
             └─→ React setState(1)
                 │
                 └─→ Component re-renders
                     │
                     └─→ Dashboard shows: "Total Reports: 1" ✅
```

### Step 5: Map Updates

```
Timer runs              MapComponent polls       Backend reads          Map renders
──────────              ──────────────────      ────────────           ────────────
Every 10 seconds
    │
    └─→ axios.get('/api/map/locations')
        │
        ├──→ Backend reads data.json
        │    └─→ Finds: [{lat: 3.848, lng: 11.5021, ...}]
        │
        └←── Returns: [location object]
             │
             └─→ React setState(locations)
                 │
                 └─→ Leaflet renders pin
                     │
                     └─→ Map shows yellow pin at location ✅
```

---

## Deployment to Render

### What Changes

```
Local Docker                          Render Docker
────────────────────────────────────────────────────
Your computer         →    Render's servers
localhost:80          →    your-app.onrender.com
localhost:3000        →    your-api.onrender.com
./backend/data.json   →    Render persistent disk
Host network          →    Internet (public)

Same docker-compose.yml ✅
Same Dockerfile files ✅
Same application code ✅
Same data flow ✅

Only difference:
- Runs on Render servers
- Accessible from internet
- Data on Render's disk
- Not on your computer
```

### Render Deployment Flow

```
1. You push to GitHub
   git push origin main
       │
       └─→ GitHub has your code

2. Render watches GitHub
   Detects new push
       │
       └─→ Automatically starts build

3. Render builds
   docker-compose build
       │
       ├─→ Builds backend image
       ├─→ Builds frontend image
       └─→ Creates containers

4. Render starts
   docker-compose up
       │
       ├─→ Starts backend on port 3000
       ├─→ Starts frontend on port 80
       └─→ Mounts persistent disk

5. Render exposes to internet
   https://your-service.onrender.com
       │
       └─→ Your app is live!

6. Users access
   Anyone can visit your URL
   Submit reports
   See dashboard
   View map
```

---

## Summary: How It All Works Together

```
User clicks form → Form submits → Backend saves → File updated
    ↑                                ↑              ↑
    │                                │              │
    └────── Auto-polls every 5s ─────┘              │
                                                    │
Frontend displays ← Backend responds ← Reads file ─┘
    ↓
User sees:
  Dashboard updated
  New pin on map
  Form cleared
  Success message
```

**All of this happens in Docker containers on a shared network with persistent storage!**
