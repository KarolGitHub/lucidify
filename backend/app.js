const express = require("express");
const path = require("path");

const app = express();

// Serve uploaded avatars
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
