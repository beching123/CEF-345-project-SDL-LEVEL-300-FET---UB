# 🐳 DOCKER DEPLOYMENT GUIDE - STEP BY STEP

**For uploading NETLINK to Docker Hub and deploying to cloud platforms**

---

## Table of Contents
1. [Docker Hub Setup](#docker-hub-setup)
2. [Build Docker Images](#build-docker-images)
3. [Push to Docker Hub](#push-to-docker-hub)
4. [Deploy with docker-compose](#deploy-with-docker-compose)
5. [Deploy to Cloud Platforms](#deploy-to-cloud-platforms)
6. [Troubleshooting](#troubleshooting)

---

## 1. Docker Hub Setup

### Create Docker Hub Account

1. Go to [hub.docker.com](https://hub.docker.com)
2. Click **Sign Up**
3. Fill in:
   - **Username**: `yourusername` (will use for pushing images)
   - **Email**: your email
   - **Password**: strong password
4. Verify email
5. Login

### Create Docker Hub Repositories

**After login:**

1. Click **Create Repository**
2. Repository name: `netlink-backend`
   - Visibility: Public
   - Click **Create**
3. Repeat for:
   - `netlink-frontend`
   - `netlink-mysql`

**Your Docker Hub URLs:**
```
docker.io/yourusername/netlink-backend:latest
docker.io/yourusername/netlink-frontend:latest
docker.io/yourusername/netlink-mysql:latest
```

---

## 2. Build Docker Images

### Install Docker

**Windows:**
- Download [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Install and start

**macOS:**
```bash
brew install docker docker-compose
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo usermod -aG docker $USER
```

### Build Backend Image

```bash
cd C:\Users\KIRIA\Desktop\CEF-345-project-SDL-LEVEL-300-FET---UB

docker build -f backend/Dockerfile -t netlink-backend:latest .
```

**Output:** `Successfully tagged netlink-backend:latest`

### Build Frontend Image

```bash
docker build -f frontend/Dockerfile -t netlink-frontend:latest .
```

**Output:** `Successfully tagged netlink-frontend:latest`

### Verify Builds

```bash
docker images
```

**Should show:**
```
REPOSITORY              TAG         IMAGE ID
netlink-frontend        latest      abc123...
netlink-backend         latest      def456...
```

---

## 3. Push to Docker Hub

### Login to Docker Hub

```bash
docker login
```

**Enter:**
- Username: your Docker Hub username
- Password: your Docker Hub password

**Output:** `Login Succeeded`

### Tag Images

**Backend:**
```bash
docker tag netlink-backend:latest yourusername/netlink-backend:latest
```

**Frontend:**
```bash
docker tag netlink-frontend:latest yourusername/netlink-frontend:latest
```

### Push Images

**Backend (this will take a few minutes):**
```bash
docker push yourusername/netlink-backend:latest
```

**Frontend:**
```bash
docker push yourusername/netlink-frontend:latest
```

**Output:**
```
The push refers to repository [docker.io/yourusername/netlink-backend]
latest: digest: sha256:abc123... size: 50000
```

### Verify on Docker Hub

1. Go to [hub.docker.com](https://hub.docker.com)
2. Click your profile > **My Repositories**
3. You should see:
   - `netlink-backend`
   - `netlink-frontend`

---

## 4. Deploy with docker-compose

### Run Full Stack Locally

```bash
docker-compose up
```

**What happens:**
- Downloads MySQL image
- Builds backend from Dockerfile
- Builds frontend from Dockerfile
- Creates network
- Starts all services

**Services available at:**
- Frontend: http://localhost
- Backend API: http://localhost:3000
- MySQL: localhost:3306

### Stop Services

```bash
# Stop but keep containers
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove everything (including volumes)
docker-compose down -v
```

---

## 5. Deploy to Cloud Platforms

### Option A: Render.com (EASIEST)

#### Step 1: Push Code to GitHub

```bash
git add .
git commit -m "Add Docker setup and testing"
git push origin main
```

#### Step 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Click **Sign up**
3. Connect GitHub account

#### Step 3: Deploy Backend

1. Click **New** → **Web Service**
2. Select your GitHub repository
3. Configure:
   - **Name**: `netlink-backend`
   - **Environment**: `Docker`
   - **Region**: Choose closest to Cameroon (Europe recommended)
   - **Branch**: `main`
4. Add Environment Variables:
   ```
   DB_HOST=your-mysql-host
   DB_USER=root
   DB_PASSWORD=123Aaase@
   DB_NAME=netlink_db
   NODE_ENV=production
   ```
5. Click **Create Web Service**

#### Step 4: Deploy Frontend

1. Click **New** → **Web Service**
2. Same process but:
   - **Name**: `netlink-frontend`
   - **Environment**: `Docker`
3. Add Environment:
   ```
   REACT_APP_API_URL=https://netlink-backend-xxx.onrender.com
   ```

#### Step 5: Setup Database

Use one of:
- **Render PostgreSQL** (free tier) - requires code changes
- **External MySQL** - use your own MySQL host
- **Railway MySQL** (if deploying to Railway)

**Database Deployment:**
1. Setup MySQL externally (Railway, PlanetScale, AWS RDS)
2. Run schema: `mysql -h your-host -u root -p < database/schema.sql`
3. Update environment variables with database host

#### Step 6: Deploy

- Render auto-deploys on git push
- Watch logs: Dashboard > Service > **Logs**
- Your site: `https://netlink-backend-xxx.onrender.com`

---

### Option B: Railway.app

#### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click **New Project**
3. Select **GitHub Repo**
4. Choose your repository

#### Step 2: Add Services

**MySQL Service:**
```bash
railway add mysql
```

**Backend Service:**
```bash
railway add
# Select your repo
# Root Directory: backend
# Start Command: npm start
```

**Frontend Service:**
```bash
railway add
# Select your repo  
# Root Directory: frontend
# Build Command: npm run build
# Start Command: serve -s build -l 3000
```

#### Step 3: Configure Environment

In Railway dashboard:
```
DB_HOST=${{ MySQL.MYSQL_HOST }}
DB_USER=root
DB_PASSWORD=${{ MySQL.MYSQL_PASSWORD }}
DB_NAME=netlink_db
REACT_APP_API_URL=${{ RAILWAY_PUBLIC_DOMAIN }}/api
```

#### Step 4: Deploy

```bash
npm install -g @railway/cli
railway login
railway up
```

---

### Option C: Fly.io

#### Step 1: Install Fly CLI

**Windows (PowerShell as Admin):**
```powershell
choco install flyctl
```

**macOS:**
```bash
brew install flyctl
```

**Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

#### Step 2: Login & Initialize

```bash
flyctl auth login
cd CEF-345-project-SDL-LEVEL-300-FET---UB
flyctl launch --builder=docker --no-deploy
```

#### Step 3: Configure `fly.toml`

```toml
[build]
dockerfile = "./backend/Dockerfile"

[[services]]
internal_port = 3000
protocol = "tcp"
auto_stop_machines = true
auto_start_machines = true

[env]
NODE_ENV = "production"
PORT = "3000"

[env.production]
DB_HOST = "mysql.internal"
DB_USER = "root"
DB_NAME = "netlink_db"
```

#### Step 4: Deploy

```bash
# Deploy backend
flyctl deploy

# View logs
flyctl logs

# Deploy frontend (separate app)
flyctl apps create netlink-frontend
flyctl deploy -a netlink-frontend
```

---

### Option D: AWS ECS (Elastic Container Service)

#### Step 1: Push to AWS ECR

```bash
# Create repository
aws ecr create-repository --repository-name netlink-backend

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account-id.dkr.ecr.us-east-1.amazonaws.com

# Tag image
docker tag netlink-backend:latest your-account-id.dkr.ecr.us-east-1.amazonaws.com/netlink-backend:latest

# Push
docker push your-account-id.dkr.ecr.us-east-1.amazonaws.com/netlink-backend:latest
```

#### Step 2: Create ECS Task Definition

AWS Console > ECS > Task Definitions > Create new task definition
- Container image: your ECR URL
- Memory: 512 MB
- CPU: 256
- Environment variables

#### Step 3: Create Service

ECS > Clusters > Create service
- Task definition: netlink-backend
- Number of tasks: 1
- Load balancer: optional

---

## 6. Troubleshooting

### Docker Build Fails

```bash
# Clear Docker cache
docker system prune -a

# Rebuild
docker build -f backend/Dockerfile -t netlink-backend:latest .
```

### Can't push to Docker Hub

```bash
# Check if logged in
docker info | grep Username

# Login again
docker login

# Verify tag format
docker images | grep netlink
# Should show: yourusername/netlink-backend:latest
```

### Container won't start

```bash
# Check logs
docker logs container_id

# Run with debugging
docker run -it yourusername/netlink-backend:latest bash
```

### Database connection fails

```bash
# Check if MySQL is running
docker-compose ps

# Restart services
docker-compose restart

# Check database logs
docker-compose logs mysql
```

### Port already in use

```bash
# Kill process using port
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :3000
kill -9 <PID>
```

---

## Complete Deployment Checklist

- [ ] Create Docker Hub account
- [ ] Create Docker Hub repositories (backend, frontend)
- [ ] Install Docker Desktop
- [ ] Build backend: `docker build -f backend/Dockerfile -t netlink-backend:latest .`
- [ ] Build frontend: `docker build -f frontend/Dockerfile -t netlink-frontend:latest .`
- [ ] Tag images with Docker Hub username
- [ ] Push to Docker Hub: `docker push yourusername/netlink-backend:latest`
- [ ] Test locally: `docker-compose up`
- [ ] Push code to GitHub: `git push origin main`
- [ ] Choose cloud platform (Render/Railway/Fly.io/AWS)
- [ ] Connect GitHub to cloud platform
- [ ] Configure environment variables
- [ ] Deploy backend service
- [ ] Deploy frontend service
- [ ] Setup database (external or cloud MySQL)
- [ ] Test deployed URLs
- [ ] Configure custom domain (optional)

---

## Quick Reference Commands

```bash
# Build
docker build -f backend/Dockerfile -t netlink-backend:latest .

# Run
docker run -p 3000:3000 netlink-backend:latest

# Docker Compose
docker-compose up          # Start
docker-compose down        # Stop & remove
docker-compose logs        # View logs

# Docker Hub
docker login               # Login
docker tag netlink-backend:latest yourusername/netlink-backend:latest
docker push yourusername/netlink-backend:latest

# View images
docker images

# View containers
docker ps                  # Running
docker ps -a               # All

# Remove
docker rmi netlink-backend:latest    # Remove image
docker rm container_id               # Remove container
```

---

## Support

**Docker Documentation:** https://docs.docker.com/
**Docker Hub:** https://hub.docker.com/
**Render Docs:** https://render.com/docs/
**Railway Docs:** https://docs.railway.app/
**Fly.io Docs:** https://fly.io/docs/

---

**End of Docker Deployment Guide**
