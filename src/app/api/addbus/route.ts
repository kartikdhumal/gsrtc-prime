import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Bus from "@/models/Bus";

export async function POST(req: Request) {
  try {
    await connectToDB();
    const body = await req.json();

    const bus = new Bus({
      name: body.name,
      code: body.code,
      type: body.type,
      totalSeats: body.totalSeats,
      sleeperSeats: body.sleeperSeats,
      seatingSeats: body.seatingSeats,
      isAirconditioned: body.isAirconditioned,
      status: body.status,
    });

    await bus.save();

    return NextResponse.json({ success: true, data: bus });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
