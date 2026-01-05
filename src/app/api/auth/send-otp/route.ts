import { NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { Otp } from "@/models/Otp";

if (mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGODB_URL as string, {
    dbName: "gsrtc",
  });
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.create({
      email: user.email,
      otp: hashedOtp,
      otpExpiry: otpExpiry,
    });


    return NextResponse.json(
      { message: "OTP generated successfully.", otp: otp },
      { status: 200 }
    );

  } catch (error) {
    console.error("Generate OTP error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}