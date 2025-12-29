const express = require("express");
const bodyParser = require("body-parser");
const connect = require("./config/db/index.js");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const routes = require("./routes");
const path = require("path");

const app = express();
dotenv.config();

// * Connect to database
connect().catch(err => {
  console.error("Failed to connect to database:", err);
  process.exit(1);
});

// * CORS (deploy-safe)
app.use(cors({
  origin: true, // cho phép mọi origin (frontend + backend cùng domain)
  credentials: true
}));

// * Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("short"));

// * API routes
app.use("/api", routes);

// ================== SERVE FRONTEND ================== //
const buildPath = path.join(__dirname, "../frontend/build");
app.use(express.static(buildPath));

// React Router fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});
// ==================================================== //

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on PORT ${PORT}`);
});
