const express = require("express");
const bodyParser = require("body-parser");
const connect = require("./config/db/index.js");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const routes = require("./routes");
const app = express();

dotenv.config();
// * Connect to database
connect().catch(err => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});

// * Cors
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// * Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("short"));

// * Api routes
app.use("/api", routes);

app.get("/", (req, res) => {
  console.log("Backend is running! Welcome to Task Manager API.");
  res.send("Backend is running! Welcome to Task Manager API.");
});

app.use("*", (req, res) => {
  res.send("Route not found");
});

let PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));