const express = require("express");
const path = require("path");
const dataStore = require('./dataStore');

const app = express();
const PORT = 3000;

// 1. CORS Configuration - Fixed (no wildcard with credentials)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'false');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));
app.use(express.json());

// 2. Get total reports count
app.get("/api/reports/count", (req, res) => {
  try {
    const total = dataStore.getReportCount();
    res.json({ total });
  } catch (err) {
    console.error("Count Error:", err);
    res.status(500).json({ error: "Failed to get report count" });
  }
});

// 3. Get reports count by network type
app.get("/api/reports/count-by-network", (req, res) => {
  try {
    const counts = dataStore.getCountByNetwork();
    res.json(counts);
  } catch (err) {
    console.error("Network Count Error:", err);
    res.status(500).json({ error: "Failed to get network counts" });
  }
});

// 4. Get all locations for map visualization
app.get("/api/map/locations", (req, res) => {
  try {
    const locations = dataStore.getLocations();
    res.json(locations);
  } catch (err) {
    console.error("Map Error:", err);
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

// 5. Get all reports
app.get("/api/reports", (req, res) => {
  try {
    const reports = dataStore.getAllReports();
    res.json(reports);
  } catch (err) {
    console.error("Fetch Reports Error:", err);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// 6. Submit a new report
app.post("/api/reports", (req, res) => {
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

  try {
    const newReport = dataStore.addReport({
      networkType,
      phone: cleanPhone,
      issue,
      description,
      locationAllowed: locationAllowed ? true : false,
      issueScale: issueScale || 'Street',
      latitude,
      longitude,
      addressLandmark: addressLandmark || 'Unknown Location',
      deviceModel,
      osType,
      osVersion,
      signalStrength,
      connectionType,
      issueSeverity: issueSeverity || 'Warning',
      bandwidthMbps,
      latencyMs,
      isOffline: isOffline ? true : false
    });

    res.status(200).json({
      status: "success",
      message: "Report submitted successfully",
      reportId: newReport.id
    });
  } catch (err) {
    console.error("Report Submission Error:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to save report"
    });
  }
});

// 7. Legacy endpoint for backward compatibility
app.post("/report", (req, res) => {
  const { networkType, phone, issue, description, locationAllowed } = req.body;

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

  try {
    const newReport = dataStore.addReport({
      networkType,
      phone: cleanPhone,
      issue,
      description,
      locationAllowed: locationAllowed ? true : false
    });

    res.status(200).json({
      status: "success",
      message: "Success! Your report has been sent."
    });
  } catch (err) {
    console.error("Report Error:", err);
    res.status(500).json({ status: "error", message: "Failed to save report" });
  }
});

// 8. Serve React app
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
});


app.listen(PORT, () => {
  console.log(`✅ Netlink Server running at http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🗺️  Map: http://localhost:${PORT}/map`);
});

app.listen(PORT, () => {
  console.log(`Netlink Server live at http://localhost:${PORT}`);
});
