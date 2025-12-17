const express = require("express");
const cors = require("cors");
const indexingRoutes = require("./src/routes/indexing.routes");
const contentRoutes = require("./src/routes/content.routes")
const { errorHandler } = require("./src/middlewares/error.middleware");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.use("/api/indexing", indexingRoutes);
app.use("/api/content", contentRoutes)

// error middleware LAST
app.use(errorHandler);

module.exports = app;
