import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB();
    const { id } = params;
    const body = await req.json();
    const { name, email, role, coverImage, password } = body;

    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (email && email !== userToUpdate.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { message: "Email is already in use by another account" },
          { status: 409 }
        );
      }
    }

    const updateData: any = {
      name,
      email,
      role,
      coverImage,
    };

    if (password && password.length >= 6) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    return NextResponse.json({ success: true, data: updatedUser });

  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}


export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB();
    const { id } = params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "User deleted" });

  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}