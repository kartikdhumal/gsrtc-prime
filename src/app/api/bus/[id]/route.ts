import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Bus from "@/models/Bus";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB();
    const body = await req.json();
    const updatedBus = await Bus.findByIdAndUpdate(params.id, { $set: body }, { new: true });

    if (!updatedBus) return NextResponse.json({ success: false, message: "Bus not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: updatedBus });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}


export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectToDB();
        const { id } = params;

        const deletedBus = await Bus.findByIdAndDelete(id);

        if (!deletedBus) {
            return NextResponse.json(
                { success: false, message: "Bus not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, message: "Bus deleted successfully" });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
