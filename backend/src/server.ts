import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import { connectDB } from "./config/db";
import { errorHandler } from "./middlewares/errorHandler";

// Import Routes
import authRoutes from "./routes/authRoutes";
import accountRoutes from "./routes/accountRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import depositWithdrawRoutes from "./routes/depositWithdrawRoutes";
import loanRoutes from "./routes/loanRoutes";
import customerRoutes from "./routes/customerRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import notificationRoutes from "./routes/notificationRoutes";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Connect to Database (eagerly on local startup; awaited per request for serverless)
if (!process.env.VERCEL && process.env.NODE_ENV !== "test") {
  connectDB();
}

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  ...(process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean),
];

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Ensure MongoDB connection is ready for serverless requests
app.use("/api", async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "PrimeBank Core Banking API",
    version: "1.0.0",
  });
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/requests", depositWithdrawRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);

// 404 Route handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found on this server.`,
  });
});

// Centralized Error Middleware
app.use(errorHandler);

// Start Server (local / non-serverless)
if (!process.env.VERCEL && process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`[PrimeBank Core] Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode.`);
  });
}

export default app;
