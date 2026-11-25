import mongoose from "mongoose";

let cachedConnectionPromise: Promise<typeof mongoose> | null = null;

export const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    if (!cachedConnectionPromise) {
      cachedConnectionPromise = mongoose.connect(
        process.env.MONGODB_URI || "mongodb://localhost:27017/PrimeBankDB"
      );
    }
    const conn = await cachedConnectionPromise;
    console.log(`[PrimeBank DB] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    cachedConnectionPromise = null;
    console.error("[PrimeBank DB] Database connection error:", error);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};
