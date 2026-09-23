import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const PRIMARY_MONGO_URI = process.env.MONGO_URI || "mongodb://posAdmin:PosAdmin2026@ac-chkag1m-shard-00-00.kozfnhi.mongodb.net:27017,ac-chkag1m-shard-00-01.kozfnhi.mongodb.net:27017,ac-chkag1m-shard-00-02.kozfnhi.mongodb.net:27017/supermarket_pos?ssl=true&replicaSet=atlas-14hzku-shard-0&authSource=admin&appName=Cluster0";
const LOCAL_MONGO_URI = "mongodb://127.0.0.1:27017/supermarket_pos";

/**
 * Connects to MongoDB Atlas with fallback to local MongoDB.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(PRIMARY_MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log(`✅ MongoDB Connected: ${conn.connection.host} — Database: "${conn.connection.name}"`);
  } catch (error) {
    console.error(`⚠️ MongoDB Connection Failed: ${error.message}`);
    console.log('🔄 Attempting connection to local MongoDB...');
    try {
      const conn = await mongoose.connect(LOCAL_MONGO_URI, { serverSelectionTimeoutMS: 5000 });
      console.log(`✅ Connected to local MongoDB: ${conn.connection.host}`);
    } catch (localErr) {
      console.error(`❌ Local MongoDB connection also failed: ${localErr.message}`);
    }
  }
};

export default connectDB;
