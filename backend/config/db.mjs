import mongoose from 'mongoose';

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.warn('MONGO_URI is not set. Starting in degraded mode without MongoDB. Configure backend/.env to enable database-backed routes.');
    return false;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    console.warn('Continuing without MongoDB connectivity. Update MONGO_URI in backend/.env to restore database features.');
    return false;
  }
};

export default connectDB;
