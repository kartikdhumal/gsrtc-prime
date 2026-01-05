import mongoose, { Schema } from "mongoose";

const OtpSchema = new Schema({
  email: String,
  otp: String,
  otpExpiry: Date,
});

export const Otp = mongoose.models.Otp || mongoose.model("Otp", OtpSchema);
