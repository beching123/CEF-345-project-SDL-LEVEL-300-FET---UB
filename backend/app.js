// app.js
const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/api/issues", (req, res) => {
  res.json([]); // placeholder
});

module.exports = app;
