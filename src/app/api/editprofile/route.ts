import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function PUT(req: NextRequest) {
  try {
    await connectToDB();

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    } catch {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, name, email, coverImage } = body;

    if (!userId || !name || !email) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    if (decoded.id !== userId) {
      return NextResponse.json({ message: "Forbidden: You can update only your own profile" }, { status: 403 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    user.name = name;
    user.email = email;
    if (coverImage) user.coverImage = coverImage;

    await user.save();

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          coverImage: user.coverImage,
        },
      },
      { status: 200 }
    );
  } catch (error) {
let message = 'Unknown error';

  if (error instanceof Error) {
    message = error.message;
  }

  return NextResponse.json(
    { message: "Error updating profile", error: message },
    { status: 500 }
  );
  }
}
