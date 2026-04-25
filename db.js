const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error("MONGO_URI not found");
    }

    const conn = await mongoose.connect(mongoURI);

    console.log("✅ MongoDB Connected:", conn.connection.host);
    return conn;

  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    return null;
  }
};

module.exports = connectDB;