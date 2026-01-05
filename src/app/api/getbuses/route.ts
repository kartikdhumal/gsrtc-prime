import { NextResponse, NextRequest } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Bus from "@/models/Bus";

export async function GET(req: NextRequest) {
  try {
    await connectToDB();

    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sort = searchParams.get("sort") || "name";
    const order = searchParams.get("order") || "asc";
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const isAirconditioned = searchParams.get("isAirconditioned");

    const skip = (page - 1) * limit;

    const query: any = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (isAirconditioned && isAirconditioned !== "all") {
      query.isAirconditioned = isAirconditioned === "true";
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { code: new RegExp(search, 'i') },
        { type: new RegExp(search, 'i') }
      ];
    }

    const sortQuery: any = {};
    sortQuery[sort] = order === "asc" ? 1 : -1;

    const buses = await Bus.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const total = await Bus.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: buses,
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