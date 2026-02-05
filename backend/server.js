const express = require("express");
const path = require("path");
const mysql = require("mysql2/promise");
const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin-", "http://localhost:3001");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With Content-Type, Accept");
  next();
})

const cors = require('cors');
const PORT = 3000;

// 1. Connection Pool to MySQL with promise support for transactions
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'bachankwi001#', 
  database: 'netlink_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 2. MANUAL CORS HEADERS (No cors package needed)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
app.use(cors());
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use(express.json());

// 3. DIAGNOSTIC ENDPOINT: Get total reports for live dashboard
app.get("/api/reports/count", async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    const [rows] = await connection.query("SELECT COUNT(*) as total FROM general_reports");
    connection.release(); // Free up RAM immediately
    res.json({ total: rows[0].total });
  } catch (err) {
    console.error("Count Error:", err);
    if (connection) connection.release();
    res.status(500).json({ error: "Failed to get report count" });
  }
});

// 3B. GET reports count by network type
app.get("/api/reports/count-by-network", async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    const [rows] = await connection.query(`
      SELECT network_type, COUNT(*) as count 
      FROM general_reports 
      GROUP BY network_type
    `);
    connection.release();
    
    // Format response
    const counts = {
      mtn: 0,
      orange: 0,
      camtel: 0
    };
    
    rows.forEach(row => {
      if (row.network_type) {
        const networkKey = row.network_type.toLowerCase();
        counts[networkKey] = row.count;
      }
    });
    
    res.json(counts);
  } catch (err) {
    console.error("Network Count Error:", err);
    if (connection) connection.release();
    res.status(500).json({ error: "Failed to get network counts" });
  }
});

// 4. GET all locations for map visualization
app.get("/api/map/locations", async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    const [rows] = await connection.query(`
      SELECT 
        lh.id,
        lh.latitude,
        lh.longitude,
        lh.address_landmark,
        lh.radius_meters,
        lh.issue_magnitude,
        nd.issue_severity,
        gr.network_type
      FROM location_history lh
      JOIN general_reports gr ON lh.report_id = gr.id
      LEFT JOIN network_details nd ON nd.report_id = gr.id
      ORDER BY lh.created_at DESC
      LIMIT 100
    `);
    connection.release();
    res.json(rows);
  } catch (err) {
    console.error("Map Error:", err);
    if (connection) connection.release();
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

// 5. MAIN REPORT ENDPOINT with MULTI-TABLE TRANSACTION
app.post("/api/reports", async (req, res) => {
  const {
    networkType,
    phone,
    issue,
    description,
    locationAllowed,
    issueScale,
    latitude,
    longitude,
    addressLandmark,
    deviceModel,
    osType,
    osVersion,
    appVersion,
    signalStrength,
    connectionType,
    issueSeverity,
    bandwidthMbps,
    latencyMs,
    isOffline
  } = req.body;

  // Data validation
  const cleanPhone = String(phone).trim();
  let isValid = false;
  const mtnRegex = /^(67|68|650|651|652|653|654)\d{6,7}$/;
  const orangeRegex = /^(69|655|656|657|658|659)\d{6,7}$/;
  const camtelRegex = /^(6242|6243|62)\d{6,7}$/;

  if (networkType === "MTN" && mtnRegex.test(cleanPhone)) isValid = true;
  else if (networkType === "ORANGE" && orangeRegex.test(cleanPhone)) isValid = true;
  else if (networkType === "CAMTEL" && camtelRegex.test(cleanPhone)) isValid = true;

  if (!isValid) {
    return res.status(403).json({
      status: "error",
      message: `Validation Failed: The phone number does not match a valid ${networkType} format.`
    });
  }

  let connection;
  try {
    connection = await db.getConnection();
    
    // BEGIN TRANSACTION
    await connection.beginTransaction();

    // 1. INSERT INTO general_reports
    const [generalResult] = await connection.query(
      "INSERT INTO general_reports (network_type, phone, issue, description, location_allowed, issue_scale, is_offline) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [networkType, cleanPhone, issue, description, locationAllowed ? 1 : 0, issueScale || 'Street', isOffline ? 1 : 0]
    );
    const reportId = generalResult.insertId;

    // 2. INSERT INTO network_details
    await connection.query(
      "INSERT INTO network_details (report_id, signal_strength, connection_type, issue_severity, bandwidth_mbps, latency_ms) VALUES (?, ?, ?, ?, ?, ?)",
      [reportId, signalStrength || null, connectionType || null, issueSeverity || 'Warning', bandwidthMbps || null, latencyMs || null]
    );

    // 3. INSERT INTO device_logs
    await connection.query(
      "INSERT INTO device_logs (report_id, device_model, os_type, os_version, app_version, location_lat, location_long) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [reportId, deviceModel || null, osType || null, osVersion || null, appVersion || null, latitude || null, longitude || null]
    );

    // 4. Calculate radius based on issue scale and insert into location_history
    const magnitudeMap = { 'Street': 1, 'Neighborhood': 5, 'City': 10, 'Citywide': 20 };
    const magnitude = magnitudeMap[issueScale] || 1;
    const radiusMeters = magnitude * 50;

    await connection.query(
      "INSERT INTO location_history (report_id, latitude, longitude, address_landmark, radius_meters, issue_magnitude) VALUES (?, ?, ?, ?, ?, ?)",
      [reportId, latitude || 0, longitude || 0, addressLandmark || 'Unknown Location', radiusMeters, magnitude]
    );

    // COMMIT TRANSACTION
    await connection.commit();
    connection.release(); // Free up RAM

    res.status(200).json({
      status: "success",
      message: "Report submitted successfully",
      reportId: reportId
    });

  } catch (err) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error("Rollback Error:", rollbackErr);
      }
      connection.release();
    }
    console.error("Report Submission Error:", err);
    res.status(500).json({
      status: "error",
      message: "Database error: Failed to save report. All changes rolled back."
    });
  }
});

// 6. Legacy endpoint for backward compatibility
app.post("/report", async (req, res) => {
  const {networkType, phone, issue, description, locationAllowed } = req.body;

  const cleanPhone = String(phone).trim();
  let isValid = false;
  const mtnRegex = /^(67|68|650|651|652|653|654)\d{6,7}$/;
  const orangeRegex = /^(69|655|656|657|658|659)\d{6,7}$/;
  const camtelRegex = /^(6242|6243|62)\d{6,7}$/;

  if (networkType === "MTN" && mtnRegex.test(cleanPhone)) isValid = true;
  else if (networkType === "ORANGE" && orangeRegex.test(cleanPhone)) isValid = true;
  else if (networkType === "CAMTEL" && camtelRegex.test(cleanPhone)) isValid = true;

  if (!isValid) {
    return res.status(403).json({
      status: "error",
      message: `Validation Failed: The phone number does not match a valid ${networkType} format.`
    });
  }

  let connection;
  try {
    connection = await db.getConnection();
    const [result] = await connection.query(
      "INSERT INTO general_reports (network_type, phone, issue, description, location_allowed) VALUES (?, ?, ?, ?, ?)",
      [networkType, cleanPhone, issue, description, locationAllowed ? 1 : 0]
    );
    connection.release(); // Free up RAM
    res.status(200).json({
      status: "success",
      message: "Success! Your report has been sent."
    });
  } catch (err) {
    if (connection) connection.release();
    console.error("Report Error:", err);
    res.status(500).json({ status: "error", message: "Database Error: Could not save report." });
  }
});

app.listen(PORT, () => {
  console.log(`Netlink Server live at http://localhost:${PORT}`);
});
