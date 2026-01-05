import mongoose from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL as string;

let isConnected = false;

export const connectToDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(MONGODB_URL);
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error(error);
    throw new Error("Failed to connect to MongoDB");
  }
};
