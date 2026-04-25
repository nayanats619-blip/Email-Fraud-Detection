const mongoose = require("mongoose");
require("dotenv").config();

async function testConnection() {
  try {
    console.log("🔍 Testing MongoDB Connection...");
    console.log("📌 Using URI:", process.env.MONGO_URI);
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    
    console.log("✅ SUCCESS! MongoDB Connected!");
    console.log("🖥️ Host:", conn.connection.host);
    process.exit(0);
    
  } catch (error) {
    console.log("❌ FAILED! MongoDB Connection Error:");
    console.log("📍 Error Message:", error.message);
    console.log("\n💡 Solutions:");
    console.log("1. Go to https://cloud.mongodb.com");
    console.log("2. Click 'Network Access' in Security");
    console.log("3. Add your IP: 0.0.0.0/0");
    console.log("4. Wait 2-3 minutes and try again");
    process.exit(1);
  }
}

testConnection();
