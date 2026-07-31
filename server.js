const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = require("./app.js");
const logger = require("./utils/logger.js");

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log("-------------------- UNCAUGHT EXCEPTION 💥 --------------------");
  console.log("Name:", err.name);
  console.log("Message:", err.message);
  console.log("Stack:", err.stack);
  console.log("----------------------------------------------------------------");
  logger.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  logger.error(err.name, err.message);
  process.exit(1);
});

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/portfolio";

// Connect to Database
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    logger.info("Connected to MongoDB successfully");
    
    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
    });

    // Handle unhandled rejections
    process.on("unhandledRejection", (err) => {
      console.log("-------------------- UNHANDLED REJECTION 💥 --------------------");
      console.log("Name:", err.name);
      console.log("Message:", err.message);
      console.log("Stack:", err.stack);
      console.log("----------------------------------------------------------------");
      logger.error("UNHANDLED REJECTION! 💥 Shutting down...");
      logger.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });
  })
  .catch((err) => {
    logger.error("MongoDB connection error:", err);
    process.exit(1);
  });
