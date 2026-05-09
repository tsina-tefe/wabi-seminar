import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
  if (!env.mongoUri) return;

  try {
    await mongoose.connect(env.mongoUri);
    console.log("MongoDB connected");
  } catch (err) {
    console.warn("MongoDB connection failed. Continuing in memory mode.", err.message);
  }
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}
