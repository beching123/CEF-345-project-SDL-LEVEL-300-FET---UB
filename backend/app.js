// app.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const mysql = require("mysql2");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123Aaase@', 
  database: process.env.DB_NAME || 'netlink_db',
  waitForConnections: true,
  connectionLimit: 10
});

// Routes
app.get("/api/issues", (req, res) => {
  const sql = "SELECT * FROM general_reports";
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ status: "error", message: "Database error" });
    }
    res.json(results);
  });
});

// Receive report and AUTHENTICATE data before saving
app.post("/report", (req, res) => {
  const { networkType, phone, issue, description, locationAllowed } = req.body;

  // --- DATA-LEVEL AUTHENTICATION LOGIC ---
  const cleanPhone = String(phone).trim();
  
  // Check if the phone number follows Cameroon network formats
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

  // SQL Query (Only runs if data is 'authenticated' above)
  const sql = "INSERT INTO general_reports (network_type, phone, issue, description, location_allowed) VALUES (?, ?, ?, ?, ?)";
  const values = [networkType, cleanPhone, issue, description, locationAllowed ? 1 : 0];

  db.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({ status: "error", message: "Database Error: Could not save report." });
    }
    res.status(200).json({ 
      status: "success", 
      message: "Success! Your report has been sent." 
    });
  });
});

module.exports = app;
