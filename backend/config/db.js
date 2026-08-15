const mongoose = require('mongoose');

// Disable command buffering globally so queries fail fast or bypass when DB is not connected
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
      console.warn('⚠️ MONGODB_URI not found in environment variables.');
      return;
    }
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ MongoDB Connected to Cloud Cluster: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Cloud Database Connection Note: ${error.message}`);
  }
};

module.exports = connectDB;
