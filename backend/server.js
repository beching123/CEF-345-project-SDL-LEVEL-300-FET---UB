const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const app = express();

const PORT = 3000;

// 1. Connection Pool to MySQL
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '123Aaase@', 
  database: 'netlink_db',
  waitForConnections: true,
  connectionLimit: 10
});

app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use(express.json());

// 3. Receive report and AUTHENTICATE data before saving
app.post("/report", (req, res) => {
  const {networkType, phone, issue, description, locationAllowed } = req.body;

  // --- DATA-LEVEL AUTHENTICATION LOGIC ---
  const cleanPhone = String(phone).trim();
  
  // 1. Check if the phone number follows Cameroon network formats
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

  // 2. SQL Query (Only runs if data is 'authenticated' above)
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

app.listen(PORT, () => {
  console.log(`Netlink Server live at http://localhost:${PORT}`);
});
