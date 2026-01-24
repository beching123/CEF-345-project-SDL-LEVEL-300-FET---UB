# ⚡ Quick Start Guide - NetLink

Get the complete Network Helper platform running in 5 minutes.

---

## 📋 Prerequisites Check
- [ ] Node.js 16+ installed (`node --version`)
- [ ] MySQL 5.7+ running (`mysql --version`)
- [ ] ~500MB disk space
- [ ] Ports 3000 (backend), 3002 (frontend), 3306 (MySQL) available

---

## 🚀 Step 1: Setup Database (2 min)

```bash
# Open MySQL
mysql -u root -p

# Paste this in MySQL console:
CREATE DATABASE IF NOT EXISTS netlink_db;
USE netlink_db;

# CREATE TABLES (from database/schema.sql)
CREATE TABLE IF NOT EXISTS general_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  network_type VARCHAR(20) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  issue VARCHAR(100) NOT NULL,
  description TEXT,
  location_allowed TINYINT(1) DEFAULT 0,
  issue_scale VARCHAR(50),
  is_offline TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_network (network_type),
  INDEX idx_created (created_at)
);

CREATE TABLE IF NOT EXISTS network_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  signal_strength INT,
  connection_type VARCHAR(50),
  issue_severity VARCHAR(20),
  bandwidth_mbps DECIMAL(10, 2),
  latency_ms INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES general_reports(id) ON DELETE CASCADE,
  INDEX idx_report (report_id)
);

CREATE TABLE IF NOT EXISTS device_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  device_model VARCHAR(100),
  os_type VARCHAR(50),
  os_version VARCHAR(50),
  app_version VARCHAR(20),
  location_lat DECIMAL(10, 8),
  location_long DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES general_reports(id) ON DELETE CASCADE,
  INDEX idx_report (report_id)
);

CREATE TABLE IF NOT EXISTS location_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address_landmark VARCHAR(255),
  radius_meters INT,
  issue_magnitude INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES general_reports(id) ON DELETE CASCADE,
  SPATIAL INDEX idx_geo (latitude, longitude),
  INDEX idx_report (report_id)
);

# Exit MySQL
exit;
```

✅ **Verify:** `mysql -u root -p netlink_db -e "SHOW TABLES;"`

---

## 🔧 Step 2: Setup Backend (1 min)

```bash
cd backend

# Install dependencies
npm install
# Should complete in ~30 seconds

# ⚠️ IMPORTANT: Update credentials in server.js
nano server.js
# Find line: password: '123Aaase@',
# Replace with your MySQL password
# Save (Ctrl+X, Y, Enter)
```

**Test backend:**
```bash
npm start
# Expected output:
# Netlink Server live at http://localhost:3000
```

✅ **Verify:** Open another terminal and run:
```bash
curl http://localhost:3000/api/reports/count
# Should return: {"total":0}
```

---

## 🎨 Step 3: Setup Frontend (1.5 min)

In a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install
# May take ~1 minute depending on internet

# Start dev server
npm start
# Should open http://localhost:3002 automatically
```

✅ **Verify:** Browser shows NetLink dashboard with navigation menu

---

## 🧪 Step 4: Test Everything (30 sec)

### Test 1: Online Report
1. Click **"Report Issue"** tab
2. Status badge shows: **🟢 Online**
3. Fill form:
   - Network: MTN
   - Phone: 671234567
   - Issue: Slow Internet Speed
   - Scale: Street
   - Description: Test report
   - Enable location consent ✓
4. Click **"Submit Report"**
5. Success: ✅ "Report submitted successfully"

### Test 2: Dashboard
1. Click **"Dashboard"** tab
2. Total Reports card should show: **1**

### Test 3: Map
1. Click **"Target Map"** tab
2. Should see your report in the data table
3. SVG visualization shows concentric circles

### Test 4: Offline Mode
1. Open DevTools: F12 → Application → Service Workers
2. Check: **"Offline"** ✓
3. Go to **"Report Issue"**
4. Status badge shows: **🔴 Offline Mode**
5. New fields appear: Latitude, Longitude, Landmark
6. Fill and submit
7. Success: 📦 "Report saved locally"
8. Uncheck offline
9. Status: ✅ "Successfully synced 1 offline report"

---

## 📊 System Running Checklist

```
Backend (Port 3000):
□ Terminal shows "Netlink Server live at http://localhost:3000"
□ curl http://localhost:3000/api/reports/count returns JSON

Frontend (Port 3002):
□ Browser shows NetLink navbar with 3 tabs
□ Console shows no red errors
□ Navigation works between all pages

Database (MySQL):
□ Tables exist: general_reports, network_details, device_logs, location_history
□ Can query: SELECT COUNT(*) FROM general_reports;

✅ All systems operational!
```

---

## 🎯 Architecture Summary

```
React Frontend (3002)
    ↓ axios + interceptors
Express Backend (3000)
    ↓ manual CORS
MySQL (netlink_db)
    ↓ transactions
4-Table Storage
```

**Key Features:**
- ✅ Manual CORS (no cors package)
- ✅ Axios interceptors with logging
- ✅ Offline-first with localStorage queue
- ✅ Multi-table transactions with rollback
- ✅ Target map visualization
- ✅ Real-time dashboard

---

## 📱 Form Fields Reference

### Report Form (Online)
- **Network Type:** MTN, ORANGE, CAMTEL
- **Phone:** Cameroon format (e.g., 671234567)
- **Issue:** slow-speed, no-connection, call-drops, data-issues, poor-coverage
- **Issue Scale:** Street (50m), Neighborhood (250m), City (500m), Citywide (1000m)
- **Description:** Free text (max 300 chars)
- **Location Consent:** Toggle to enable/disable

### Report Form (Offline - Additional)
- **Latitude:** Decimal (e.g., 3.8667)
- **Longitude:** Decimal (e.g., 11.5167)
- **Landmark:** Nearest street/area name

---

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "Connection Lost - CORS Error" | Check backend running on 3000 |
| "Cannot POST /api/reports" | Verify backend axios.js path |
| MySQL "Access Denied" | Update password in server.js |
| Frontend blank page | Check console (F12), restart npm |
| Offline queue not syncing | Go online, refresh page, check console |

---

## 📝 Next Steps

1. **Customize Colors:**
   - Edit `#1A237E` (navy) and `#FFCC00` (yellow) in component styles

2. **Add More Networks:**
   - Update regex validation in backend/server.js lines 50-55
   - Add options in frontend/src/pages/ReportPage.js

3. **Deploy to Production:**
   - Use HTTPS (enable in Express)
   - Update CORS origin to production domain
   - Use environment variables for credentials
   - Set up database backups

4. **Scale Infrastructure:**
   - Use connection pooling with higher limits
   - Add Redis for caching
   - Set up CDN for static assets
   - Consider microservices for growth

---

## 📞 Support Commands

```bash
# Check if services are running
netstat -an | grep -E "3000|3002|3306"

# Restart everything
pkill -f "node server.js"
pkill -f "react-scripts start"
# Then restart manually

# Check database size
mysql -u root -p -e "SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb FROM information_schema.TABLES WHERE table_schema = 'netlink_db' ORDER BY size_mb DESC;"

# Clear all reports (⚠️ be careful!)
mysql -u root -p netlink_db -e "TRUNCATE TABLE location_history; TRUNCATE TABLE device_logs; TRUNCATE TABLE network_details; TRUNCATE TABLE general_reports;"
```

---

**You're now running NetLink! 🎉**

For detailed documentation, see: [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
