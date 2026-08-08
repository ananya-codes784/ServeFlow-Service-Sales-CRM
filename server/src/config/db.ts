import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

export const connectDB = async (): Promise<void> => {
  try {
    const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/servewell_crm';
    const isAtlas = connString.includes('mongodb+srv://');

    try {
      await mongoose.connect(connString, {
        serverSelectionTimeoutMS: isAtlas ? 5000 : 3000,
      });
      console.log(`[Database] MongoDB Connected (${isAtlas ? 'MongoDB Atlas' : 'Local Instance'}): ${mongoose.connection.host}`);
    } catch (localErr: any) {
      console.warn(`[Database] Atlas/Local connection failed (${localErr.message}). Starting Embedded MongoDB Server...`);
      
      const mongoServer = await MongoMemoryServer.create();
      const memUri = mongoServer.getUri();

      await mongoose.connect(memUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[Database] Embedded Real MongoDB Active at: ${memUri}`);
    }
  } catch (error: any) {
    console.error(`[Database] Critical Connection Error: ${error.message}`);
    process.exit(1);
  }
};

