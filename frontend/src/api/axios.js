// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: false // Important: Don't send credentials with wildcard origins
});

export default api;