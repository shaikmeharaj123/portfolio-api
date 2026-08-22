const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const notFound = require("./middleware/notFound.js");
const errorHandler = require("./middleware/errorHandler.js");
const routes = require("./routes/index.js");

const app = express();

const getClientUrls = () => {
  const configuredUrls = [
    process.env.CLIENT_URL,
    process.env.PUBLIC_CLIENT_URL,
    process.env.FRONTEND_URL,
    process.env.WEBSITE_URL,
  ]
    .filter(Boolean)
    .flatMap((value) => value.split(","))
    .map((url) => url.trim())
    .filter(Boolean);

  const defaults = [
    "http://localhost:5173",
    "http://localhost:5175",
    "http://localhost:5174",
    "https://shaikadmin.netlify.app",
    "https://shaikmeharaj.netlify.app",
  ];
  return [...new Set([...configuredUrls, ...defaults])];
};

// Security Middlewares
app.use(helmet());
const clientUrls = getClientUrls();

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (clientUrls.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  }),
);
///  exposedHeaders: ['Set-Cookie']
/// ));
edHeaders: ["Set-Cookie"];
// }));

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static Files
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api", routes);

// 404 Middleware
app.use(notFound);

// Global Error Middleware
app.use(errorHandler);

module.exports = app;
