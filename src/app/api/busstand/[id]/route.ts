import { NextResponse } from "next/server";
import BusStand from "@/models/BusStand";
import { connectToDB } from "@/lib/mongodb";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB();
    const body = await req.json();
    const { id } = params;

    const updatedBusStand = await BusStand.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    ).exec();


    if (!updatedBusStand) {
      return NextResponse.json({ success: false, message: "Bus Stand not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "BusStand updated", busStand: updatedBusStand });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Update failed", error: (error as Error).message }, { status: 500 });
  }
}


export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB();
    const { id } = params;

    const deleted = await BusStand.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: "Bus Stand not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Bus Stand deleted successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Delete failed", error: (error as Error).message }, { status: 500 });
  }
}
