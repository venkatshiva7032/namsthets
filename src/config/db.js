const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const connectDB = async () => {
  let mongoUri = process.env.MONGO_URI;
  let memoryServer;

  const connect = async (uri) => {
    return mongoose.connect(uri, {
      // No need for deprecated options in Mongoose 7+
    });
  };

  try {
    if (mongoUri) {
      try {
        const conn = await connect(mongoUri);
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
        return conn;
      } catch (connectError) {
        console.warn(`⚠️ Failed to connect to MongoDB at ${mongoUri}: ${connectError.message}`);
      }
    }

    memoryServer = await MongoMemoryServer.create();
    mongoUri = memoryServer.getUri();
    const conn = await connect(mongoUri);
    console.log(`✅ MongoDB connected to in-memory server: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ DB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
