import { NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";

if (mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGODB_URL as string, {
    dbName: "gsrtc",
  });
}

export async function POST(req: Request) {
  try {
    const { email, password, confirmPassword } = await req.json();

    if (!email || !password || !confirmPassword) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }
    
    if (password !== confirmPassword) {
        return NextResponse.json(
            { message: "Passwords do not match." },
            { status: 400 }
        );
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          message:
            "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.",
        },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    const hashedNewPassword = await bcrypt.hash(password, 10);

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedNewPassword,
        },
      }
    );

    return NextResponse.json(
      { message: "Password has been updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset Password error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}