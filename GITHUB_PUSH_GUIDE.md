# EXACT COMMANDS TO PUSH TO GITHUB

## Step 1: Open PowerShell in Your Project Folder

```bash
cd "C:\Users\pc\Desktop\CEF-345-project-SDL-LEVEL-300-FET---UB"
```

---

## Step 2: Set Up Git (Do this only once)

```bash
git config user.name "Your Full Name"
git config user.email "your.email@gmail.com"
```

Replace with your actual name and email!

---

## Step 3: Check Current Status

```bash
git status
```

You'll see files in red (not yet added). That's normal.

---

## Step 4: Add All Files

```bash
git add .
```

Now run:
```bash
git status
```

Everything should be GREEN now (staged for commit).

---

## Step 5: Create First Commit

```bash
git commit -m "Initial commit: Docker-ready Netlink system with JSON file storage"
```

You should see output like:
```
[main (root-commit) abc1234] Initial commit...
 45 files changed, 3500 insertions(+)
 create mode 100644 Dockerfile
 create mode 100644 docker-compose.yml
 ...
```

---

## Step 6: Create GitHub Repository

**Do this in your web browser:**

1. Go to: https://github.com/new
2. Fill in:
   ```
   Repository name: netlink
   Description: Network issue reporting system with Docker
   Public ✓
   ```
3. **Do NOT** check "Initialize with README" (you already have one)
4. Click "Create Repository"

You'll see a page with commands. Copy this URL:
```
https://github.com/yourname/netlink.git
```

(Replace `yourname` with your actual GitHub username)

---

## Step 7: Add GitHub Remote

Back in PowerShell:

```bash
git remote add origin https://github.com/yourname/netlink.git
```

Replace `yourname` with your GitHub username!

Verify it worked:
```bash
git remote -v
```

You should see:
```
origin  https://github.com/yourname/netlink.git (fetch)
origin  https://github.com/yourname/netlink.git (push)
```

---

## Step 8: Push to GitHub

```bash
git branch -M main
git push -u origin main
```

You might get prompted for password:
```
Username for 'https://github.com': yourname
Password for 'https://yourname@github.com': 
```

Enter your GitHub password (or personal access token if you have 2FA).

You should see:
```
Counting objects: 45, done.
Compressing objects: 100% (42/42), done.
Writing objects: 100% (45/45), 125.45 KiB | 2.50 MiB/s, done.
Total 45 (delta 0), reused 0 (delta 0), pack-reused 0
To https://github.com/yourname/netlink.git
 * [new branch]      main -> main
Branch 'main' is set up to track remote branch 'main' from 'origin'.
```

✅ Success! Your code is on GitHub!

---

## Step 9: Verify on GitHub

Go to: https://github.com/yourname/netlink

You should see:
- All your files listed (backend/, frontend/, docker-compose.yml, etc.)
- Commit message at top
- "45 files" or similar count

---

## Step 10: What Got Pushed vs What Didn't?

### ✅ PUSHED (On GitHub):
- All .js files
- All Dockerfiles
- docker-compose.yml
- .gitignore
- package.json files
- nginx.conf
- CSS files
- HTML files
- README files
- data.json (empty structure)

### ❌ NOT PUSHED (Ignored by .gitignore):
- node_modules/ folders (huge! rebuilt during docker-compose build)
- .env files (sensitive)
- build/ folders (rebuilt during docker-compose build)
- IDE settings (.vscode/, .idea/)

This is GOOD! We don't want to push node_modules (too large).

---

## What to Do If You Make Changes Later

After you've pushed once, whenever you make changes:

```bash
# See what changed
git status

# Add changed files
git add .

# Commit
git commit -m "Description of change"

# Push to GitHub
git push origin main
```

---

## Complete Command Sequence (Copy-Paste)

If you want to do it all at once, run these commands in order:

```bash
cd "C:\Users\pc\Desktop\CEF-345-project-SDL-LEVEL-300-FET---UB"

git config user.name "Your Full Name"
git config user.email "your.email@gmail.com"

git status

git add .

git status

git commit -m "Initial commit: Docker-ready Netlink system with JSON file storage"

git remote add origin https://github.com/yourname/netlink.git

git remote -v

git branch -M main

git push -u origin main
```

Replace:
- "Your Full Name" with your actual name
- "your.email@gmail.com" with your real email
- "yourname" with your GitHub username

---

## You're Done! 🎉

Your code is now on GitHub!

Next steps:
1. Deploy using Docker locally: See `DOCKER_DEPLOYMENT_DETAILED.md`
2. Deploy to Render: See `DEPLOYMENT_STEPS.md`
