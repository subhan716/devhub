const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.log('ℹ️ MONGO_URI not provided. Skipping Mongoose connection (Prisma PostgreSQL is active).');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ MongoDB Connection Error: ${error.message} (Server running on Prisma PostgreSQL)`);
  }
};

module.exports = connectDB;
