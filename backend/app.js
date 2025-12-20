const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("./src/utils/googleLoginAuth");

const indexingRoutes = require("./src/routes/indexing.routes");
const contentRoutes = require("./src/routes/content.routes")
const authRoutes = require("./src/routes/auth.routes");
const { errorHandler } = require("./src/middlewares/error.middleware");

const app = express();

app.set("trust proxy", 1); 

app.use(
  cors({
    origin: process.env.CLIENT_URL || "https://vigilant-journey-65q46wx54qhwpv-5173.app.github.dev", 
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'super_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());


app.get("/", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.use("/auth", authRoutes);
app.use("/api/indexing", indexingRoutes);
app.use("/api/content", contentRoutes)

app.use(errorHandler);

module.exports = app;
