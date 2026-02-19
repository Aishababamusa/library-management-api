// 1. Import libraries
const { Pool } = require('pg');
const mongoose = require('mongoose');
require('dotenv').config();

// 2. PostgreSQL Pool setup
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// 3. MongoDB connection function
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// 4. Export both
module.exports = {
  pgPool, connectMongoDB
};