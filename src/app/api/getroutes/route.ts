import { NextResponse, NextRequest } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import BusRoute from "@/models/BusRoute";

export async function GET(req: NextRequest) {
  try {
    await connectToDB();

    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") || "desc";
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const isSpecialRoute = searchParams.get("isSpecialRoute");

    const skip = (page - 1) * limit;

    const query: any = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (isSpecialRoute && isSpecialRoute !== "all") {
      query.isSpecialRoute = isSpecialRoute === "true";
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { code: new RegExp(search, 'i') }
      ];
    }
    
    const sortQuery: any = {};
    sortQuery[sort] = order === "asc" ? 1 : -1;

    const busRoutes = await BusRoute.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .populate("bus")
      .populate("conductor")
      .populate({
        path: "stands.stand",
      });

    const total = await BusRoute.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: busRoutes,
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