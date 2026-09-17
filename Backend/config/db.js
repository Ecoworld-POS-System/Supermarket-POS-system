import mongoose from 'mongoose';

/**
 * Connects to MongoDB using the MONGO_URI environment variable.
 * Logs a success message on connection or exits the process on failure.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host} — Database: "${conn.connection.name}"`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    process.exit(1); // Exit with failure code so the process can be restarted by a supervisor
  }
};

export default connectDB;
