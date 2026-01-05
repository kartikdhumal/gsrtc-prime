import mongoose, { Schema, Document, Types } from "mongoose";

export interface IBusRoute extends Document {
    name: string;
    code: string;
    bus: Types.ObjectId;
    conductor?: Types.ObjectId;
    stands: {
        stand: Types.ObjectId;
        sequence: number;
        arrivalTime?: string;
        departureTime?: string;
        distanceFromPrev?: number;
        fare?: {
            sleeper?: number;
            seating?: number;
        }
    }[];
    status: "Active" | "Inactive";
    isSpecialRoute: boolean;
    festivalName?: string;
    distanceKm: number,
    totalFare?: {
        sleeper?: number;
        seating?: number;
    }
    validFrom?: Date;
    validTo?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

const BusRouteSchema = new Schema<IBusRoute>(
    {
        name: { type: String, required: true },
        code: { type: String, required: true, unique: true },
        bus: { type: Schema.Types.ObjectId, ref: "Bus", required: true },
        conductor: { type: Schema.Types.ObjectId, ref: "Conductor" },
        stands: [
            {
                stand: { type: Schema.Types.ObjectId, ref: "BusStand", required: true },
                sequence: { type: Number, required: true },
                arrivalTime: { type: Number, min: 0, max: 1439 },
                departureTime: { type: Number, min: 0, max: 1439 },
                distanceFromPrev: { type: Number, default: 0 },
                fare: {
                    sleeper: { type: Number, default: 0, min: 0 },
                    seating: { type: Number, default: 0, min: 0 },
                },
            },
        ],
        status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
        isSpecialRoute: { type: Boolean, default: false },
        distanceKm: { type: Number, required: true },
        totalFare: {
            sleeper: { type: Number, default: 0, min: 0 },
            seating: { type: Number, default: 0, min: 0 },
        },
        festivalName: { type: String },
        validFrom: { type: Date },
        validTo: {
            type: Date,
            validate: {
                validator: function (this: IBusRoute, value: Date) {
                    return !this.validFrom || value >= this.validFrom;
                },
                message: "validTo must be after validFrom"
            }
        }
    },
    { timestamps: true }
);

export default mongoose.models.BusRoute || mongoose.model<IBusRoute>("BusRoute", BusRouteSchema);
