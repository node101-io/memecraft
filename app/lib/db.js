import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) return;

    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/memecraft');
    console.log(`MongoDB connection successful: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  };
};

export default connectDB;
