# GIT & DATA MANAGEMENT GUIDE

## Current .gitignore Configuration

Your `.gitignore` is properly set up to:

### ✅ EXCLUDED (Won't Be Tracked)
```
node_modules/              ← Rebuilt in containers
package-lock.json          ← Rebuilt in containers
frontend/build/            ← Built on deploy
.env                       ← Sensitive variables
.vscode/                   ← IDE settings (personal)
.DS_Store, Thumbs.db       ← OS files
*.log, *.tmp               ← Temp files
dist/, coverage/           ← Build outputs
```

### ✅ INCLUDED (Will Be Tracked)
```
backend/server.js          ← Your code
backend/dataStore.js       ← Your data layer
backend/Dockerfile         ← Container config
backend/package.json       ← Dependencies list
docker-compose.yml         ← Docker config
frontend/src/              ← React code
All documentation files    ← Guides
```

### ⚠️ OPTIONAL (Commented Out)
```
# backend/data.json
```

This is **intentionally commented out** because you decide whether to track user data.

---

## The Data.json Question: Track It or Not?

You have actual user submissions in `backend/data.json`. Should it be in Git?

### Scenario A: Track data.json (Recommended for Class Demo)

**Edit .gitignore:**
```bash
# Remove these lines:
# !backend/data.json

# Or just delete the comment
```

**Then:**
```bash
git add backend/data.json
git commit -m "Add sample data"
git push
```

**Benefits:**
- ✅ Everyone on team has same demo data
- ✅ Teacher can see submitted reports in GitHub
- ✅ Easy to showcase progress
- ✅ Can version control data changes
- ✅ Easier to share findings

**Drawbacks:**
- File grows with each submission (eventually large)
- Merge conflicts if multiple people submit simultaneously
- Sensitive user data in public repo (if public)

**When to use:**
- ✅ Class projects (team needs same data)
- ✅ Demonstrations (show teacher progress)
- ✅ Private repositories (data stays private)

---

### Scenario B: Don't Track data.json (Recommended for Production)

**Keep as is (already in .gitignore):**
```bash
# data.json remains ignored
# Each person gets fresh data.json
```

**Effects:**
```bash
git clone https://github.com/yourname/netlink.git
cd netlink

# backend/data.json does NOT exist yet
# First run creates empty data.json
docker-compose up -d

# Your data.json will be locally unique
```

**Benefits:**
- ✅ No merge conflicts on data
- ✅ Each environment is independent
- ✅ Data stays on specific servers
- ✅ Production data never leaks to GitHub

**Drawbacks:**
- Each deployment starts with empty data
- Team members can't share demo data

**When to use:**
- ✅ Production deployments
- ✅ Public repositories
- ✅ When data is sensitive

---

## Recommendation for Your Class Project

### Best Approach: Track Initial Data

1. **Populate test data locally:**
   ```bash
   npm start  # Both backend and frontend
   
   # Submit 5-10 test reports through the form
   # This creates useful data.json
   ```

2. **Track it in Git:**
   ```bash
   # Edit .gitignore - uncomment the line about data.json
   git add backend/data.json
   git commit -m "Add sample reports for demo"
   git push origin main
   ```

3. **Benefits for your team:**
   - ✅ Teacher can see data on GitHub
   - ✅ All team members have same demo data
   - ✅ Easy to showcase to classmates
   - ✅ Shows real submissions, not mock data

4. **Setup instructions for teammates:**
   ```bash
   git clone <repo>
   cd netlink
   
   # data.json already exists (from git)
   docker-compose up -d
   
   # App starts with sample data immediately
   ```

---

## Git Workflow for Your Team

### Initial Setup (Do Once)

```bash
# Person 1: Create repo
git init
git add .
git commit -m "Initial commit - Netlink demo system"
git push -u origin main
```

### Daily Work (Team Members)

```bash
# Start of day
git pull origin main

# Do your work
npm start  # Test locally
git add <files>
git commit -m "Fixed CORS issue"
git push origin main

# Team stays in sync
```

### Before Demo

```bash
# Pull latest from team
git pull origin main

# Verify data
cat backend/data.json

# Test everything
docker-compose up -d

# Demonstrate to teacher
```

---

## Important Files Not to Modify

These should never be edited or committed:

```bash
❌ Don't edit after git pull:
  - node_modules/           (will be deleted)
  - package-lock.json       (will be overwritten)
  - .env                    (use .env.example instead)
  - frontend/build/         (will be rebuilt)

❌ Don't commit:
  - Sensitive passwords
  - API keys
  - Personal IDE settings
  - Large build artifacts
```

---

## Docker & Git Integration

### When Using Docker for Deployment

```bash
# Your local work
git clone <repo>
cd netlink
git pull origin main

# Docker pulls same code
docker-compose build
docker-compose up -d

# Container runs exact same code + data
# Everyone gets identical environment
```

### Deployment Flow

```
Developer A commits code
         ↓
Push to GitHub
         ↓
CI/CD pulls from GitHub
         ↓
Docker builds from code
         ↓
Container runs on server
         ↓
Uses volume-mounted data.json
         ↓
App serves to users
```

---

## Branches for Team Collaboration

If your team is working on different features:

### Setup Branches

```bash
git checkout -b feature/dashboard
# Work on dashboard improvements

git checkout -b feature/map-markers
# Different person works on map

git checkout main
git merge feature/dashboard
git push origin main

# Dashboard changes now live
```

### Avoid Conflicts on data.json

**Rule:** Only merge data.json from main branch
```bash
# If data.json conflicts during merge
# Keep the version from main branch
git checkout --ours backend/data.json
git add backend/data.json
```

---

## Backup & Recovery

### Using Git as Backup

```bash
# See all changes to data.json
git log backend/data.json

# View specific version
git show HEAD~5:backend/data.json  # 5 commits ago

# Restore previous version
git checkout HEAD~3 -- backend/data.json
git commit -m "Restored data from 3 commits ago"
```

### Manual Backup

```bash
# Before risky operation
cp backend/data.json backend/data.json.backup

# If something breaks
cp backend/data.json.backup backend/data.json
```

### Git Stash (Temporary Save)

```bash
# Save work without committing
git stash

# Do something else
git checkout feature/new-branch

# Come back to saved work
git checkout feature/dashboard
git stash pop
```

---

## Troubleshooting Git Issues

### "I committed something I shouldn't have"

```bash
# Before pushing:
git reset --soft HEAD~1
# File is back, changes preserved

git reset --hard HEAD~1
# Changes are lost (careful!)
```

### "data.json has conflicts"

```bash
# Both people edited data.json
# Git doesn't know which version to use

# Option 1: Keep yours
git checkout --ours backend/data.json

# Option 2: Keep theirs
git checkout --theirs backend/data.json

# Option 3: Merge manually
# Edit the file, then:
git add backend/data.json
git commit -m "Merged data.json"
```

### ".gitignore isn't working"

```bash
# File already tracked? Need to remove it
git rm --cached backend/data.json
git commit -m "Remove data.json from tracking"

# Now .gitignore will ignore it
```

### "node_modules keeps getting committed"

```bash
# Make sure it's in .gitignore, then:
git rm -r --cached node_modules
git commit -m "Remove node_modules from tracking"
git push

# Teammates should delete local node_modules
# When they pull, it won't be there
# They run: npm install
```

---

## Summary Table

| Action | Command | Notes |
|--------|---------|-------|
| Start tracking data | `git add backend/data.json` | Edit .gitignore first |
| Stop tracking data | `git rm --cached backend/data.json` | Add to .gitignore |
| View data history | `git log backend/data.json` | See all versions |
| Restore old data | `git checkout HEAD~3 -- backend/data.json` | Go back 3 commits |
| Push to team | `git push origin main` | Share with everyone |
| Pull from team | `git pull origin main` | Get latest code |

---

## Final Recommendations

### For Your Class Demo

1. **Do track data.json** (track sample data)
   ```bash
   git add backend/data.json
   git commit -m "Add sample reports"
   ```

2. **Keep .gitignore as configured** (ignores node_modules, etc.)

3. **Push everything to GitHub**
   ```bash
   git push origin main
   ```

4. **When deploying to Docker:**
   ```bash
   docker-compose up -d
   # data.json is pulled from git
   # App starts with sample data
   ```

5. **Team members clone and run:**
   ```bash
   git clone <repo>
   cd netlink
   docker-compose up -d
   # Everyone has identical environment + data
   ```

---

## You're Ready

Your project is properly configured for:
- ✅ Team collaboration (Git + Docker)
- ✅ Data persistence (volume mounts)
- ✅ Easy deployment (docker-compose)
- ✅ Code sharing (GitHub)
- ✅ Demo showcase (tracked sample data)

Go build something great! 🚀
