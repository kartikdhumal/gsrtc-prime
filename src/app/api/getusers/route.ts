import { NextResponse, NextRequest } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    await connectToDB();

    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") || "desc";
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role");

    const skip = (page - 1) * limit;

    const query: any = {};

    if (role && role !== "all") {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const sortQuery: any = {};
    sortQuery[sort] = order === "asc" ? 1 : -1;

    const data = await User.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}