import { connectToDB } from "@/lib/mongodb";
import BusRoute from "@/models/BusRoute";
import Bus from "@/models/Bus";
import BusStand from "@/models/BusStand";

const generateRouteCode = (
  departureTime: string,
  departureStandCode: string,
  arrivalStandCode: string,
  busType: string,
  totalSeats: number
) => {
  const timeCode = departureTime.replace(":", "");
  const typeCode = busType.slice(0, 3).toUpperCase();
  return `${timeCode}${departureStandCode}${arrivalStandCode}${typeCode}${totalSeats}`;
};

export async function POST(req: Request) {
  try {
    await connectToDB();
    const data = await req.json();

    const bus = await Bus.findById(data.bus);
    if (!bus) return new Response(JSON.stringify({ message: "Invalid bus ID" }), { status: 400 });

    const standIds = data.stands.map((s: any) => s.stand);
    const standsExist = await BusStand.find({ _id: { $in: standIds } });
    if (standsExist.length !== standIds.length)
      return new Response(JSON.stringify({ message: "One or more invalid bus stands" }), { status: 400 });

    const departureStand = standsExist.find(s => s._id.toString() === standIds[0].toString());
    const arrivalStand = standsExist.find(s => s._id.toString() === standIds[standIds.length - 1].toString());

    const routeCode = generateRouteCode(
      data.stands[0].departureTime || "0000",
      departureStand?.code || "XXX",
      arrivalStand?.code || "XXX",
      bus.type,
      bus.totalSeats
    );

    const standsWithLegs = data.stands.map((s: any, i: number) => ({
      ...s,
      distanceFromPrev: i === 0 ? 0 : s.distanceFromPrev || 0,
      fare: s.fare || { sleeper: 0, seating: 0 },
    }));

    const route = new BusRoute({
      ...data,
      stands: standsWithLegs,
      code: routeCode,
      distanceKm: Number(data.distanceKm) || 0,
      totalFare: {
        sleeper: data.totalFare?.sleeper ?? 0,
        seating: data.totalFare?.seating ?? 0,
      },
    });

    await route.save();

    return new Response(JSON.stringify({ message: "Route added successfully", data: route }), { status: 201 });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Something went wrong", error: err.message }), { status: 500 });
  }
}
