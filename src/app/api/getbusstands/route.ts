import { NextResponse, NextRequest } from "next/server";
import BusStand from "@/models/BusStand";
import { connectToDB } from "@/lib/mongodb";

export async function GET(req: NextRequest) { 
  try {
    await connectToDB();

    const { searchParams } = req.nextUrl;

    const page = parseInt(searchParams.get("page") || "1");
    const limitParam = searchParams.get("limit");
    const sort = searchParams.get("sort") || "name";
    const order = searchParams.get("order") || "asc";
    const search = searchParams.get("search") || "";
    const district = searchParams.get("district");

    const query: any = {};

    if (district && district !== "all") {
      query.district = new RegExp(district, 'i'); 
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { code: new RegExp(search, 'i') },
        { district: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') }
      ];
    }

    const sortQuery: any = {};
    sortQuery[sort] = order === "asc" ? 1 : -1;

    let data;
    const total = await BusStand.countDocuments(query);

    if (limitParam) {
      const limit = parseInt(limitParam);
      const skip = (page - 1) * limit;

      data = await BusStand.find(query) 
        .sort(sortQuery)
        .skip(skip)
        .limit(limit);

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
    } else {
      data = await BusStand.find(query) 
        .sort(sortQuery); 

      return NextResponse.json({
        success: true,
        data,
        pagination: null, 
      });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}