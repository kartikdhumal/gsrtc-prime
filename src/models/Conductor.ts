import mongoose, { Schema, Document } from "mongoose";

export interface IConductor extends Document {
  employeeId: string;
  name: string;
  address: string;
  phone: string;
  joiningDate: Date;
  totalTrips: number;
  status: "active" | "inactive" | "suspended";
}

const ConductorSchema: Schema<IConductor> = new Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    joiningDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    totalTrips: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive" , "suspended"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Conductor ||
  mongoose.model<IConductor>("Conductor", ConductorSchema);
