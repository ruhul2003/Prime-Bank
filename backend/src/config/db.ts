import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/PrimeBankDB"
    );
    console.log(`[PrimeBank DB] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("[PrimeBank DB] Database connection error:", error);
    process.exit(1);
  }
};
