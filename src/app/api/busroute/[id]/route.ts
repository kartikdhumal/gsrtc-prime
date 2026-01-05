import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import BusRoute from "@/models/BusRoute";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB();
    const { id } = params;
    const data = await req.json();

    const updatedRoute = await BusRoute.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    )
      .populate("bus")
      .populate("conductor")
      .populate("stands.stand");

    if (!updatedRoute) return NextResponse.json({ message: "Route not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: updatedRoute });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
