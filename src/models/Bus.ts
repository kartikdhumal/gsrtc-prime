import { Schema, model, models, Document } from "mongoose";

export interface IBus extends Document {
  name: string;
  code: string;
  type: string;
  totalSeats: number;
  sleeperSeats?: number;
  seatingSeats?: number;
  isAirconditioned: boolean;
  status: "Active" | "Inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

const BusSchema = new Schema<IBus>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    totalSeats: { type: Number, required: true },
    sleeperSeats: { type: Number, default: 0 },
    seatingSeats: { type: Number, default: 0 },
    isAirconditioned: { type: Boolean, default: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

const Bus = models.Bus || model<IBus>("Bus", BusSchema);
export default Bus;
