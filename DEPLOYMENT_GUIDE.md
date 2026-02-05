# NETLINK - Network Issue Reporting Portal

**Project Status**: Week 9 (Testing Complete) + Week 10 (Docker & CI/CD Complete)

A full-stack application for reporting network issues across MTN, ORANGE, and CAMTEL networks in Cameroon.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Local Development](#local-development)
4. [Testing](#testing)
5. [Docker & Deployment](#docker--deployment)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Troubleshooting](#troubleshooting)
8. [Deployment Guides](#deployment-guides)
9. [What's Complete](#whats-complete)
10. [What Requires Manual Action](#what-requires-manual-action)

---

## Project Overview

NETLINK is a secure, encrypted network issue reporting system that allows users to:
- Report network issues with detailed information
- Track issues by network provider (MTN, ORANGE, CAMTEL)
- View network coverage maps
- Access FAQ and support resources

**Key Features:**
- ✅ Phone number validation (Cameroon network formats)
- ✅ Offline support with sync when online
- ✅ Geolocation tracking (with user consent)
- ✅ Comprehensive error handling
- ✅ Secure & encrypted transmission

---

## Architecture

### Backend (Node.js + Express)
```
backend/
├── app.js              # Express app with routes & middleware
├── server.js           # Server startup
├── test/
│   └── issue.test.js   # Jest + Supertest tests (20+ test cases)
├── Dockerfile          # Multi-stage Docker build
└── package.json        # Dependencies & Jest config
```

**API Endpoints:**
- `GET /api/issues` - Retrieve all reports
- `POST /report` - Submit new issue with validation

### Frontend (React 18 + React Router)
```
frontend/
├── src/
│   ├── App.js          # Main routing & layout
│   ├── pages/
│   │   └── ReportPage.js       # Form component
│   ├── components/
│   │   ├── Dashboard.js
│   │   └── MapComponent.js
│   ├── api/
│   │   └── axios.js    # API client
│   ├── setupTests.js   # Jest configuration
│   ├── App.test.js     # Component tests
│   └── pages/
│       └── ReportPage.test.js  # Form tests
├── Dockerfile          # Multi-stage build with Nginx
├── nginx.conf          # Production routing config
└── package.json        # Dependencies & test config
```

### Database (MySQL)
```
Database: netlink_db
Table: general_reports
  - id: INT (Primary Key)
  - network_type: VARCHAR(20) [MTN, ORANGE, CAMTEL]
  - phone: VARCHAR(20)
  - issue: VARCHAR(100)
  - description: TEXT
  - location_allowed: TINYINT(1)
  - created_at: TIMESTAMP

Views:
  - mtn_report (WHERE network_type = 'MTN')
  - orange_report (WHERE network_type = 'ORANGE')
  - camtel_report (WHERE network_type = 'CAMTEL')
```

---

## Local Development

### Prerequisites
- **Node.js 16+** ([Download](https://nodejs.org/))
- **MySQL 8.0+** ([Download](https://dev.mysql.com/downloads/mysql/))
- **Git**

### Setup Instructions

#### 1. Clone Repository
```bash
git clone <repository-url>
cd CEF-345-project-SDL-LEVEL-300-FET---UB
```

#### 2. Setup Database
```bash
# Start MySQL Server
# Windows: Services > MySQL80 > Start
# macOS: brew services start mysql@8.0
# Linux: sudo systemctl start mysql

# Create database and tables
mysql -u root -p < database/schema.sql
# Enter password: 123Aaase@ (or your configured password)
```

#### 3. Setup Backend
```bash
cd backend

# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev        # With hot-reload (requires nodemon)
# OR
npm start          # Regular start

# The backend will run on http://localhost:3000
```

#### 4. Setup Frontend (in new terminal)
```bash
cd frontend

# Install dependencies (if not already installed)
npm install

# Start development server
npm start

# The frontend will run on http://localhost:3000 (or auto-assigned port)
```

#### 5. Verify Communication
- Open [http://localhost:3000](http://localhost:3000) in browser
- Navigate to "Report" page
- Fill form and submit
- Check MySQL database: `SELECT * FROM general_reports;`

---

## Testing

### Backend Tests

**Run all backend tests:**
```bash
cd backend
npm test
```

**Run with coverage report:**
```bash
npm run test:coverage
```

**Run in watch mode (auto-rerun on changes):**
```bash
npm run test:watch
```

**Test Coverage:**
- ✅ 20+ test cases covering:
  - GET /api/issues endpoint
  - POST /report with valid data
  - Phone number validation (MTN, ORANGE, CAMTEL)
  - Error handling
  - Database operations (mocked)

### Frontend Tests

**Run all frontend tests:**
```bash
cd frontend
npm test
```

**Run with coverage:**
```bash
npm test -- --coverage --watchAll=false
```

**Test Coverage:**
- ✅ ReportPage component (form inputs, submission, validation)
- ✅ App component (routing, layout, navigation)
- ✅ API integration (mocked axios calls)
- ✅ Accessibility tests
- ✅ User interaction tests

---

## Docker & Deployment

### Prerequisites
- **Docker** ([Download](https://www.docker.com/products/docker-desktop))
- **Docker Compose** (included with Docker Desktop)

### Build & Run Locally with Docker

#### Option 1: Using docker-compose (Recommended)

```bash
# Build all services
docker-compose build

# Start all services (MySQL, Backend, Frontend)
docker-compose up

# Services will be available at:
# - Frontend: http://localhost
# - Backend API: http://localhost:3000
# - MySQL: localhost:3306
```

#### Option 2: Build Individual Services

**Backend:**
```bash
docker build -f backend/Dockerfile -t netlink-backend:latest .
docker run -e DB_HOST=localhost -p 3000:3000 netlink-backend:latest
```

**Frontend:**
```bash
docker build -f frontend/Dockerfile -t netlink-frontend:latest .
docker run -p 80:80 netlink-frontend:latest
```

### Environment Variables

Create `.env` file (template at `.env.example`):
```env
DB_HOST=mysql
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123Aaase@
DB_NAME=netlink_db
NODE_ENV=production
PORT=3000
REACT_APP_API_URL=http://localhost:3000
```

---

## CI/CD Pipeline

### GitHub Actions Workflows

Three workflows automatically run on push and pull requests:

#### 1. Backend Tests (`.github/workflows/backend-tests.yml`)
- Runs on Node 16.x, 18.x, 20.x
- Installs dependencies
- Runs Jest tests with coverage
- Uploads coverage to Codecov

**Trigger:** Changes in `backend/` folder

```bash
# Run manually from GitHub UI:
# Actions > Backend Tests > Run workflow
```

#### 2. Frontend Tests (`.github/workflows/frontend-tests.yml`)
- Runs on Node 16.x, 18.x, 20.x
- Installs dependencies
- Runs React tests
- Builds production bundle
- Uploads coverage to Codecov

**Trigger:** Changes in `frontend/` folder

#### 3. Full Stack Tests (`.github/workflows/tests.yml`)
- Runs both backend and frontend tests in parallel
- Waits for both to pass before integration check

**Trigger:** All push/PR to main & develop branches

### Viewing Test Results

1. Go to GitHub repository
2. Click "Actions" tab
3. Select workflow
4. View logs and coverage reports

### Push Code to Trigger Tests

```bash
git add .
git commit -m "Add new feature"
git push origin develop
# Tests will run automatically
```

---

## Troubleshooting

### Backend Issues

**Port 3000 already in use:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

**MySQL connection error:**
```bash
# Check MySQL is running
mysql -u root -p

# Verify credentials in .env:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123Aaase@
```

**Test failures:**
```bash
# Clear Jest cache
npm test -- --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Frontend Issues

**Port 3000 already in use:**
```bash
# Frontend will auto-assign next available port (3001, 3002, etc.)
# Or: npm start -- --port 5000
```

**Build fails:**
```bash
# Clear npm cache
npm cache clean --force

# Reinstall
rm -rf node_modules
npm install

# Build production
npm run build
```

### Docker Issues

**MySQL won't start:**
```bash
docker-compose down -v  # Remove volumes
docker-compose up mysql # Start just MySQL
```

**Backend can't connect to MySQL:**
```bash
# Check network connection
docker-compose exec backend ping mysql

# Verify environment variables
docker-compose config | grep DB_
```

**Port conflicts:**
```bash
# Change ports in docker-compose.yml:
services:
  frontend:
    ports:
      - "8080:80"  # Change from 80 to 8080
  backend:
    ports:
      - "3001:3000"  # Change from 3000 to 3001
```

---

## Deployment Guides

### Render.com Deployment

#### Step 1: Prepare Repository
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### Step 2: Create Render Web Service (Backend)

1. Go to [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect GitHub repository
4. Configure:
   - **Name**: `netlink-backend`
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Publish Port**: 3000
5. Add Environment Variables:
   ```
   DB_HOST: <Your MySQL Host>
   DB_USER: root
   DB_PASSWORD: 123Aaase@
   DB_NAME: netlink_db
   NODE_ENV: production
   ```
6. Click "Create Web Service"

#### Step 3: Create Render Web Service (Frontend)

1. Click "New" → "Web Service"
2. Configure:
   - **Name**: `netlink-frontend`
   - **Environment**: Docker
   - **Dockerfile Path**: `./frontend/Dockerfile`
   - **Publish Port**: 80
3. Add Environment Variables:
   ```
   REACT_APP_API_URL: https://netlink-backend-xxx.onrender.com
   ```
4. Click "Create Web Service"

#### Step 4: Setup MySQL Database

**Option A: Use Render PostgreSQL (requires code changes)**

**Option B: Use External MySQL Host**
- Configure via `.env` or environment variables
- Update connection string in backend

#### Step 5: Verify Deployment

```bash
# Test backend API
curl https://netlink-backend-xxx.onrender.com/api/issues

# Frontend auto-redirects to backend via Nginx config
```

---

### Railway.app Deployment

#### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Click "Deploy from GitHub repo"
4. Select repository

#### Step 2: Add Services

**MySQL:**
- Click "Add Service" → "MySQL"
- Set MYSQL_PASSWORD to your password

**Backend:**
- Click "Add Service" → "GitHub Repo"
- Configure:
  - Root Directory: `backend`
  - Start Command: `npm start`

**Frontend:**
- Click "Add Service" → "GitHub Repo"
- Configure:
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Start Command: `npm start` or serve from `build/`

#### Step 3: Configure Environment

```bash
# In Railway dashboard, set variables:
DB_HOST=${{ MySQL.MYSQL_HOST }}
DB_USER=root
DB_PASSWORD=${{ MySQL.MYSQL_PASSWORD }}
DB_NAME=netlink_db
REACT_APP_API_URL=${{ Backend_URL }}
```

---

### Fly.io Deployment

#### Step 1: Install Fly CLI

```bash
# macOS
brew install flyctl

# Windows (using Powershell)
choco install flyctl

# Linux
curl -L https://fly.io/install.sh | sh
```

#### Step 2: Login & Initialize

```bash
flyctl auth login
flyctl launch --builder=docker --no-deploy
```

#### Step 3: Configure `fly.toml`

```toml
[build]
dockerfile = "./backend/Dockerfile"

[[services]]
internal_port = 3000
protocol = "tcp"

[env]
DB_HOST = "mysql.internal"
DB_USER = "root"
DB_NAME = "netlink_db"
```

#### Step 4: Deploy

```bash
flyctl deploy
```

---

## What's Complete ✅

### PHASE 1: Environment Validation
- ✅ Repository scanned and analyzed
- ✅ Backend app/server structure properly separated
- ✅ Frontend React app with router configured
- ✅ Database schema fixed (added phone column)
- ✅ Dependencies verified

### PHASE 2: Testing
- ✅ **Backend Tests**: 20+ comprehensive tests
  - GET /api/issues endpoint
  - POST /report validation (MTN, ORANGE, CAMTEL)
  - Phone number format validation
  - Error handling
  - Database mocking

- ✅ **Frontend Tests**: Complete test suite
  - ReportPage component rendering
  - Form input/submission tests
  - API integration tests (mocked)
  - Accessibility tests

- ✅ **GitHub Actions CI/CD**
  - Backend test workflow (3 Node versions)
  - Frontend test workflow (3 Node versions)
  - Full stack integration workflow
  - Codecov coverage upload

### PHASE 3: Docker & Containerization
- ✅ **Backend Dockerfile**
  - Multi-stage build
  - Health checks
  - Non-root user
  - Proper signal handling

- ✅ **Frontend Dockerfile**
  - React build optimization
  - Nginx reverse proxy
  - API proxy configuration
  - Static asset caching

- ✅ **docker-compose.yml**
  - MySQL service with health check
  - Backend service with dependencies
  - Frontend service with Nginx
  - Network configuration
  - Volume persistence

- ✅ **Configuration Files**
  - `.env.example` template
  - `.dockerignore` for both services
  - `nginx.conf` for production routing

---

## What Requires Manual Action ⚠️

### **1. Database Setup (BEFORE running locally)**

```bash
# Install MySQL 8.0+
# Start MySQL server
# Run schema:
mysql -u root -p < database/schema.sql
```

**Or with Docker:**
```bash
docker-compose up mysql
```

### **2. Environment Variables**

Create `.env` file from `.env.example`:
```bash
cp .env.example .env
# Edit .env with your credentials
```

### **3. Running Applications Locally**

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm start

# Access: http://localhost:3000
```

### **4. Pushing to GitHub (for CI/CD)**

```bash
git add .
git commit -m "Complete Week 9 testing and Week 10 Docker setup"
git push origin main
# CI/CD workflows run automatically
```

### **5. Cloud Deployment**

Choose one of:
- **Render.com** - Web Services for Backend & Frontend
- **Railway.app** - Services + MySQL integration
- **Fly.io** - Docker-based deployment
- **AWS/Azure/GCP** - Traditional cloud providers

**Each requires:**
- GitHub repository connection
- Environment variable configuration
- Database setup
- Domain/SSL configuration (optional)

### **6. Testing Locally**

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# With Docker
docker-compose exec backend npm test
docker-compose exec frontend npm test
```

---

## Quick Start Checklist

- [ ] Clone repository: `git clone <url>`
- [ ] Install MySQL and start server
- [ ] Run database schema: `mysql -u root -p < database/schema.sql`
- [ ] Copy `.env.example` to `.env`
- [ ] `cd backend && npm start`
- [ ] `cd frontend && npm start` (new terminal)
- [ ] Open http://localhost:3000
- [ ] Fill form and submit to test
- [ ] `cd backend && npm test` (verify tests)
- [ ] `cd frontend && npm test` (verify tests)
- [ ] `docker-compose up` (optional Docker test)
- [ ] Push to GitHub to trigger CI/CD
- [ ] Deploy to Render/Railway/Fly.io

---

## Support & Documentation

- **Backend API Docs**: See `backend/app.js` for endpoint details
- **Frontend Components**: See `frontend/src/App.js` for routing
- **Database Schema**: See `database/schema.sql`
- **Test Coverage**: Run `npm run test:coverage`
- **Docker Docs**: See `docker-compose.yml` for service configuration

---

**Last Updated:** February 4, 2026  
**Status:** Production Ready ✅
