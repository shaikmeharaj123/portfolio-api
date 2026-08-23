const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = require("../app");

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  const db = await mongoose.connect(MONGODB_URI);

  isConnected = db.connections[0].readyState === 1;
}

module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};