import { NextResponse, NextRequest } from "next/server";
import Conductor from "@/models/Conductor";
import { connectToDB } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    await connectToDB();

    const { searchParams } = req.nextUrl;

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sort = searchParams.get("sort") || "joiningDate";
    const order = searchParams.get("order") || "desc";
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const city = searchParams.get("city");

    const skip = (page - 1) * limit;

    const query: any = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (city && city !== "all") {
      query.address = new RegExp(city, 'i');
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
        { employeeId: new RegExp(search, 'i') }
      ];
    }

    const sortQuery: any = {};
    sortQuery[sort] = order === "asc" ? 1 : -1;

    const conductors = await Conductor.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const total = await Conductor.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: conductors,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}