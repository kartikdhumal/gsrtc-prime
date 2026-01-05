import { NextResponse } from "next/server";
import BusStand from "@/models/BusStand";
import { connectToDB } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    await connectToDB();

    const { name, location, code , district } = await req.json();

    if (!name || !location || !code || !district) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const existing = await BusStand.findOne({ code });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Bus stand with this code already exists" },
        { status: 400 }
      );
    }

    const stand = new BusStand({ name, location, code , district });
    await stand.save();

    return NextResponse.json(
      { success: true, message: "Bus stand added successfully", data: stand },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding bus stand:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
