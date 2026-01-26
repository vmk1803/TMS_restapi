import mongoose from 'mongoose';

const mongoConfig = {
  uri: process.env.MONGO_URI || 'mongodb://localhost:27017/tms',
  options: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferCommands: false,
  },
};

let isConnected = false;

export const connectMongoDB = async (): Promise<void> => {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(mongoConfig.uri, mongoConfig.options);

    isConnected = true;
    console.log('MongoDB connected successfully');
    console.log('Connected to database:', mongoose.connection.db?.databaseName);

    // Handle connection events
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
    });

    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
      isConnected = true;
    });

  } catch (error) {
    console.error('MongoDB connection error:', error);
    isConnected = false;
    throw error;
  }
};

export const ensureDBConnection = async (): Promise<void> => {
  console.log('Ensuring MongoDB connection...', isConnected);
  if (!isConnected) {
    await connectMongoDB();
  }
};

export const isDBConnected = (): boolean => isConnected;

export default mongoConfig;
