import { NextResponse } from "next/server";
import Conductor from "@/models/Conductor";
import { connectToDB } from "@/lib/mongodb";
import { generateEmployeeId } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    await connectToDB();

    const { name, address, phone, joiningDate, status } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { message: "Invalid name. Must be at least 2 characters." },
        { status: 400 }
      );
    }

    if (!address || typeof address !== "string" || address.trim().length < 10) {
      return NextResponse.json(
        { message: "Invalid address. Must be at least 10 characters." },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { message: "Phone number is required." },
        { status: 400 }
      );
    }

    let normalizedPhone = phone.toString().trim().replace(/\s+/g, "");

    if (!normalizedPhone.startsWith("+91")) {
      normalizedPhone = "+91" + normalizedPhone;
    }

    if (!/^\+91[0-9]{10}$/.test(normalizedPhone)) {
      return NextResponse.json(
        { message: "Invalid phone number. Must be in +91XXXXXXXXXX format." },
        { status: 400 }
      );
    }

    if (!joiningDate || isNaN(new Date(joiningDate).getTime())) {
      return NextResponse.json(
        { message: "Invalid joining date." },
        { status: 400 }
      );
    }

    const validStatuses = ["active", "inactive", "suspended"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Invalid status. Must be active, inactive or suspended." },
        { status: 400 }
      );
    }

    const newConductor = new Conductor({
      employeeId: generateEmployeeId(),
      name: name.trim(),
      address: address.trim(),
      phone: normalizedPhone,
      joiningDate: new Date(joiningDate),
      status,
      totalTrips: 0,
    });

    const savedConductor = await newConductor.save();

    return NextResponse.json(savedConductor, { status: 201 });
  } catch (error: unknown) {
    let message = 'Unknown error';

    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json(
      { message: "Error creating conductor", error: message },
      { status: 500 }
    );
  }
}
