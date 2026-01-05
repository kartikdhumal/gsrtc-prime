import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb"; // Assuming this is your DB connection path
import User from "@/models/User"; // Assuming this is your User model path
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await connectToDB();
    const body = await req.json();
    const { name, email, password, role, coverImage } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user", 
      coverImage,
    });

    await newUser.save();

    return NextResponse.json(
      { success: true, data: newUser },
      { status: 201 } 
    );

  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
