import { NextResponse } from "next/server";
import Conductor from "@/models/Conductor";
import { connectToDB } from "@/lib/mongodb";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB();
    const body = await req.json();
    const { id } = params;

    const updatedConductor = await Conductor.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    );

    if (!updatedConductor) {
      return NextResponse.json({ success: false, message: "Conductor not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Conductor updated", conductor: updatedConductor });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Update failed", error: (error as Error).message }, { status: 500 });
  }
}
