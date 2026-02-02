// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000", // your backend server
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true // safe default (cookies, sessions)
});

export default api;