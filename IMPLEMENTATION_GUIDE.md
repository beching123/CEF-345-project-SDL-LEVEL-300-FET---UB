# 🌐 NetLink - Professional Network Helper Platform

A complete full-stack network reporting system for Cameroon's telecom ecosystem (MTN, ORANGE, CAMTEL) with offline-first architecture, real-time visualization, and multi-table data persistence.

---

## 🎯 Project Overview

**NetLink** is a professional network issue reporting platform designed to work reliably on 4GB RAM machines while maintaining enterprise-grade data integrity. The system captures network issues in real-time, persists them in multiple tables simultaneously, and visualizes them on an interactive map.

### Key Features Implemented:

✅ **CHAPTER 1: Core Architecture & Performance**
- Manual CORS headers (no `cors` package)
- Axios request/response interceptors with detailed logging
- Connection pooling with immediate `connection.release()`
- React.memo optimization for MapComponent

✅ **CHAPTER 2: "Trusted Helper" UI & Branding**
- Professional Inter font typography (700 weight headers, 400 body)
- Brand palette: Deep Navy (#1A237E) + MTN Yellow (#FFCC00)
- Live dashboard with real-time statistics from backend
- Fixed navigation bar with active state tracking

✅ **CHAPTER 3: Offline-First Report Form**
- `navigator.onLine` detection with UI state changes
- LocalStorage sync queue for offline reports
- Auto-flush on `window.addEventListener('online')`
- Manual latitude/longitude input fields when offline
- Landmark/address text for offline locations

✅ **CHAPTER 4: Target Map Visualization**
- Nested circle logic (Outer: MTN Yellow, Inner: Status Color)
- Concentric circles showing provider identity + issue severity
- Dynamic radius scaling based on "Issue Scale" dropdown
- Color coding: Red (Critical), Orange (Warning), Green (Healthy)

✅ **CHAPTER 5: Multi-Table Database Sync**
- Single transaction for all 4 tables:
  1. `general_reports` - Main submission
  2. `network_details` - Signal, bandwidth, latency
  3. `device_logs` - Device model, OS, location
  4. `location_history` - Geo-coordinates, radius, landmarks
- Automatic rollback on any insertion failure
- Zero partial-data bugs

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard.js           # Live statistics dashboard
│   │   └── MapComponent.js        # Target visualization (React.memo)
│   ├── pages/
│   │   └── ReportPage.js          # Offline-first report form
│   ├── api/
│   │   └── axios.js               # Interceptors + error handling
│   ├── App.js                     # Navigation & branding
│   └── index.js
├── package.json                   # axios dependency added
└── README.md

backend/
├── server.js                      # Manual CORS, transaction routes
├── package.json                   # mysql2 (not cors)
└── README.md

database/
├── schema.sql                     # 4 tables + relationships
└── README.md
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 16+
- MySQL 5.7+
- 4GB RAM minimum

### Backend Setup

```bash
cd backend
npm install
```

Then update credentials in `server.js`:
```javascript
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'YOUR_PASSWORD',  // ← Update this
  database: 'netlink_db',
  // ...
});
```

Start the backend on **port 3000**:
```bash
npm start
# Output: "Netlink Server live at http://localhost:3000"
```

### Database Setup

```bash
cd database
mysql -u root -p < schema.sql
# Creates: netlink_db with 4 tables + views
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3002
# (React dev server default port)
```

---

## 🏗️ Architecture Details

### Backend Routes

#### **GET /api/reports/count**
Returns total number of reports (for dashboard).
```javascript
GET /api/reports/count
→ { "total": 42 }
```

#### **GET /api/map/locations**
Fetches all locations with severity and provider info.
```javascript
GET /api/map/locations
→ Array of location objects with coordinates, radius, severity
```

#### **POST /api/reports** (Main endpoint)
Submits report with transaction handling.

**Request body:**
```json
{
  "networkType": "MTN",
  "phone": "671234567",
  "issue": "no-connection",
  "description": "No signal in Akwa",
  "issueScale": "Neighborhood",
  "latitude": 3.8667,
  "longitude": 11.5167,
  "addressLandmark": "Near Carrefour Yaounde",
  "issueSeverity": "Critical",
  "isOffline": false
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Report submitted successfully",
  "reportId": 42
}
```

### Database Schema

#### **general_reports**
- `id` (PK)
- `network_type` (MTN/ORANGE/CAMTEL)
- `phone` (validated)
- `issue` (issue type)
- `description` (user text)
- `location_allowed` (boolean)
- `issue_scale` (Street/Neighborhood/City/Citywide)
- `is_offline` (boolean)
- `created_at` (timestamp)

#### **network_details**
- `id` (PK)
- `report_id` (FK → general_reports.id)
- `signal_strength` (1-5)
- `connection_type` (4G/3G/2G/WiFi)
- `issue_severity` (Critical/Warning/Healthy)
- `bandwidth_mbps` (float)
- `latency_ms` (int)

#### **device_logs**
- `id` (PK)
- `report_id` (FK)
- `device_model` (string)
- `os_type` (Web/Android/iOS)
- `os_version` (string)
- `app_version` (string)
- `location_lat` (decimal 10,8)
- `location_long` (decimal 11,8)

#### **location_history**
- `id` (PK)
- `report_id` (FK)
- `latitude` (decimal 10,8) - Spatial index
- `longitude` (decimal 11,8)
- `address_landmark` (string)
- `radius_meters` (int) - Calculated from magnitude
- `issue_magnitude` (int) - Scale factor
- **Spatial index for geo-queries**

### Transaction Flow (Backend)

```
1. BEGIN TRANSACTION
2. INSERT general_reports → Get insertId
3. INSERT network_details (use insertId)
4. INSERT device_logs (use insertId)
5. INSERT location_history (use insertId)
6. COMMIT
   └─ ON ERROR: ROLLBACK + return 500
```

---

## 🔌 Frontend Components

### Dashboard.js
- Real-time report counter from `/api/reports/count`
- Network statistics cards
- Health bar visualization
- Auto-refreshes every 5 seconds

### ReportPage.js
**Online Mode:**
- Standard form submission
- Direct backend POST on submit

**Offline Mode:**
- Manual latitude/longitude inputs
- Landmark text field
- LocalStorage sync queue persistence
- Auto-flush on reconnection

**Form Fields:**
- Network type (select)
- Phone number (validated)
- Issue type (select)
- Issue scale (Street/Neighborhood/City) → determines map radius
- Description (textarea)
- Location consent (checkbox)
- *Offline fields:* manual coords + landmark

### MapComponent.js
**Performance:**
- Wrapped in `React.memo` to prevent re-renders
- Only fetches on mount + 10s interval

**Visualization:**
- SVG canvas rendering
- Concentric circles per report:
  - **Outer ring:** MTN Yellow (#FFCC00) - Fixed 2px stroke
  - **Inner circle:** Status-based color with 25% radius of outer
  - **Radius formula:** `magnitude * 50` meters → pixels
- Color mapping:
  - 🔴 Red: Critical
  - 🟠 Orange: Warning
  - 🟢 Green: Healthy

### App.js
- React Router with 3 main routes
- Fixed navbar with active state tracking
- Professional branding
- Footer with data privacy notice

---

## 🔌 Connection Flow

### Online Scenario
```
User → Frontend (3002)
  ↓ (axios + interceptor)
Backend (3000) [Manual CORS headers]
  ↓ (transaction)
MySQL (netlink_db)
  ↓ (4-table insert)
Success response → Frontend → Alert
```

### Offline Scenario
```
User → ReportPage detects navigator.onLine = false
  ↓ (form switches to manual input mode)
User submits → localStorage.syncQueue += report
  ↓ (no network request)
Browser detects 'online' event
  ↓ (syncOfflineQueue() fires)
Flush all queued reports to backend
  ↓ (transaction handles each)
Success notification
```

---

## 🛡️ Error Handling

### Axios Interceptors
**Request Logging:**
```javascript
🔵 [API REQUEST] method: POST, url: /api/reports, timestamp: ...
```

**Response Errors:**
```javascript
❌ [API ERROR - RESPONSE] status: 404, message: "Endpoint Not Found"
❌ [API ERROR - CORS] "Network/CORS Error. Backend not running on port 3000"
```

**Custom Event:**
```javascript
window.dispatchEvent(new CustomEvent('connectionError', {
  detail: { message, httpStatus }
}))
```

Captured by ReportPage to display user-friendly notifications:
- ✉️ Online: "Report submitted successfully!"
- 📡 Offline: "Saved locally. Will sync when online."
- ❌ Error: "Connection Lost - [specific reason]"

### Backend Transaction Rollback
If any INSERT fails:
```javascript
await connection.rollback();
res.status(500).json({
  status: "error",
  message: "Database error: All changes rolled back"
})
```

---

## 🎨 Branding & Design

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Deep Navy | #1A237E | Primary text, navbar bg, cards |
| MTN Yellow | #FFCC00 | Accents, buttons, map outer circles |
| Green (Healthy) | #00FF00 | Status indicator - healthy |
| Orange (Warning) | #FFA500 | Status indicator - warning |
| Red (Critical) | #FF0000 | Status indicator - critical |
| Neutral Gray | #F5F5F5 | Page background |
| White | #FFFFFF | Card backgrounds |

### Typography
- **Font:** Inter (Google Fonts)
- **Headers:** Weight 700 (bold)
- **Body:** Weight 400 (regular)
- **Labels:** Weight 600 (semibold)

---

## 📊 Performance Optimizations

1. **Memory (4GB budget):**
   - `connection.release()` after every query
   - `React.memo` on MapComponent
   - No large data structures in memory
   - 10s refresh intervals (not real-time streaming)

2. **Database:**
   - Connection pooling (limit: 10)
   - Spatial indices on location_history
   - Transactions for atomicity
   - Indexed foreign keys

3. **Frontend:**
   - Lazy loading via React Router
   - SVG rendering (lightweight)
   - Interval-based polling (not WebSockets)

---

## 🧪 Testing the System

### 1. Start Services
```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend
cd frontend && npm start

# Terminal 3: MySQL (if needed)
mysql -u root -p netlink_db
```

### 2. Test Online Flow
- Navigate to http://localhost:3002
- Go to "Report Issue" page
- Status should show "🟢 Online"
- Fill form and submit
- Check console: `✅ [API SUCCESS]`
- Check dashboard: total should increment

### 3. Test Offline Flow
- Open DevTools (F12) → Application → Service Workers
- Check "Offline" box
- Go to "Report Issue"
- Status should show "🔴 Offline Mode"
- Fill form + enable location consent
- Manual lat/long fields appear
- Submit → "📦 Report saved locally"
- Uncheck offline
- Status button appears to flush queue
- Check "Syncing X offline reports..."

### 4. Test Map
- Submit 2-3 reports with different severity
- Go to "Target Map"
- See nested circles:
  - Yellow outer ring (MTN identity)
  - Colored inner circle (status)
  - Radius depends on "Issue Scale"

---

## 🔍 API Examples

### Create Report (cURL)
```bash
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3002" \
  -d '{
    "networkType": "MTN",
    "phone": "671234567",
    "issue": "no-connection",
    "description": "Complete outage in Akwa",
    "issueScale": "City",
    "latitude": 3.8667,
    "longitude": 11.5167,
    "addressLandmark": "Carrefour Yaounde",
    "issueSeverity": "Critical",
    "isOffline": false
  }'
```

### Get Report Count
```bash
curl http://localhost:3000/api/reports/count
# → {"total": 5}
```

### Get Map Locations
```bash
curl http://localhost:3000/api/map/locations
# → [{"id": 1, "latitude": 3.8667, "longitude": 11.5167, ...}, ...]
```

---

## 📝 Database Queries

### View All Reports with Details
```sql
SELECT 
  gr.id,
  gr.network_type,
  gr.issue,
  nd.issue_severity,
  lh.latitude,
  lh.longitude,
  gr.created_at
FROM general_reports gr
LEFT JOIN network_details nd ON nd.report_id = gr.id
LEFT JOIN location_history lh ON lh.report_id = gr.id
ORDER BY gr.created_at DESC;
```

### Count Reports by Severity
```sql
SELECT 
  nd.issue_severity,
  COUNT(*) as count
FROM network_details nd
GROUP BY nd.issue_severity;
```

### Find Critical Issues Near Location
```sql
SELECT lh.* FROM location_history lh
JOIN network_details nd ON nd.report_id = lh.report_id
WHERE nd.issue_severity = 'Critical'
ORDER BY ABS(lh.latitude - 3.8667) + ABS(lh.longitude - 11.5167)
LIMIT 10;
```

---

## 🚨 Troubleshooting

### CORS Error
**Problem:** "Connection Lost - Network/CORS Error"
**Solution:**
1. Ensure backend is running on port 3000
2. Check `res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3002')` in server.js
3. Verify frontend is on port 3002

### Database Connection Failed
**Problem:** "Cannot connect to MySQL"
**Solution:**
1. Verify MySQL is running
2. Check credentials in backend/server.js
3. Run `mysql -u root -p` to test connection
4. Ensure `netlink_db` exists

### Reports Not Persisting
**Problem:** Form submits but data missing
**Solution:**
1. Check browser console for error details
2. Verify all 4 tables exist: `SHOW TABLES;`
3. Check foreign key constraints
4. Ensure transaction completed successfully

### Offline Queue Not Syncing
**Problem:** Reports stuck in localStorage
**Solution:**
1. Open DevTools → Application → LocalStorage
2. Check `syncQueue` content
3. Manually trigger: Go online and refresh page
4. Check browser console for sync logs

---

## 📚 API Documentation

### Endpoints Summary

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/reports/count` | Total report count |
| GET | `/api/map/locations` | All locations for map |
| POST | `/api/reports` | Submit new report (transaction) |
| POST | `/report` | Legacy endpoint (single table) |

### Status Codes
- **200:** Success
- **403:** Validation failed (invalid phone format)
- **500:** Database error (transaction rolled back)

---

## 🔐 Security Notes

1. **Phone validation:** Regex for Cameroon networks only
2. **CORS:** Restricted to `http://localhost:3002`
3. **Data privacy:** Users opt-in to location tracking
4. **Encryption:** Use HTTPS in production (currently HTTP)

---

## 🎓 Learning Resources

- [React Router v7](https://reactrouter.com/)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)
- [MySQL Transactions](https://dev.mysql.com/doc/refman/8.0/en/commit.html)
- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [navigator.onLine](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine)

---

## 📞 Support

For issues or questions:
1. Check browser console logs (Ctrl+F12)
2. Review backend logs (terminal where `npm start` runs)
3. Check MySQL query logs if needed
4. Verify all services running on correct ports

---

**Built with ❤️ for Cameroon's network ecosystem**

*NetLink: Connecting communities through reliable network reporting.*
