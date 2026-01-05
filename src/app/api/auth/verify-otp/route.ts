import { NextResponse } from "next/server";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { Otp } from "@/models/Otp";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email and OTP are required." },
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

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      return NextResponse.json(
        { message: "OTP not requested for this user." },
        { status: 400 }
      );
    }

    if (otpRecord.otpExpiry < new Date()) {
      await Otp.deleteOne({ email });
      return NextResponse.json(
        { message: "OTP has expired." },
        { status: 410 }
      );
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid OTP." },
        { status: 400 }
      );
    }

    await Otp.deleteOne({ email });

    return NextResponse.json(
      { message: "OTP verified successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
